#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, '_config', 'pages.json');
const TEMPLATE_PATH = path.join(ROOT, '_templates', 'content.html');

// ── 1. Read config ──────────────────────────────────────────────────────────

let rawConfig;
try {
  rawConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
} catch {
  console.error('Config not found: ' + CONFIG_PATH);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(rawConfig);
} catch (e) {
  console.error('Config parse error: ' + e.message);
  process.exit(1);
}

// ── 2. Validate config ─────────────────────────────────────────────────────

const errors = [];

if (config.version == null || !Number.isInteger(config.version) || config.version < 1) {
  errors.push('version: must be a positive integer');
}

if (config.year == null || !Number.isInteger(config.year) || config.year < 1000 || config.year > 9999) {
  errors.push('year: must be a 4-digit integer (1000-9999)');
}

if (typeof config.ga_id !== 'string' || !/^G-[A-Z0-9]+$/.test(config.ga_id)) {
  errors.push('ga_id: must match /^G-[A-Z0-9]+$/');
}

if (typeof config.domain !== 'string' || !config.domain.startsWith('https://') || config.domain.endsWith('/')) {
  errors.push('domain: must start with "https://" and have no trailing slash');
}

if (!Array.isArray(config.content) || config.content.length === 0) {
  errors.push('content: must be a non-empty array');
} else {
  const slugs = new Set();
  config.content.forEach((entry, i) => {
    if (typeof entry.slug !== 'string' || !/^[a-z0-9-]{1,30}$/.test(entry.slug)) {
      errors.push(`content[${i}].slug: must match /^[a-z0-9-]{1,30}$/`);
    } else if (slugs.has(entry.slug)) {
      errors.push(`content[${i}].slug: duplicate slug "${entry.slug}"`);
    } else {
      slugs.add(entry.slug);
    }
    if (typeof entry.title !== 'string' || entry.title.length === 0) {
      errors.push(`content[${i}].title: must be a non-empty string`);
    }
  });
}

if (!Array.isArray(config.sitemap_extra)) {
  errors.push('sitemap_extra: must be an array');
} else {
  config.sitemap_extra.forEach((p, i) => {
    if (typeof p !== 'string' || !p.startsWith('/')) {
      errors.push(`sitemap_extra[${i}]: must be a string starting with "/"`);
    }
  });
}

if (errors.length > 0) {
  console.error('Validation errors:');
  errors.forEach(e => console.error('  • ' + e));
  process.exit(1);
}

// ── 3. Read template ────────────────────────────────────────────────────────

let template;
try {
  template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch {
  console.error('Template not found: ' + TEMPLATE_PATH);
  process.exit(1);
}

// ── 4. Generate content pages ───────────────────────────────────────────────

let warnings = 0;

for (const entry of config.content) {
  let html = template;
  html = html.replace(/\{\{TITLE\}\}/g, entry.title);
  html = html.replace(/\{\{SLUG\}\}/g, entry.slug);
  html = html.replace(/\{\{DOMAIN\}\}/g, config.domain);
  html = html.replace(/\{\{V\}\}/g, String(config.version));
  html = html.replace(/\{\{GA_ID\}\}/g, config.ga_id);
  html = html.replace(/\{\{YEAR\}\}/g, String(config.year));

  const dir = path.join(ROOT, entry.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('  \u2713 ' + entry.slug + '/index.html');
}

// ── 4b. Generate redirect pages ───────────────────────────────────────────

const REDIRECT_TEMPLATE_PATH = path.join(ROOT, '_templates', 'redirect.html');
const REDIRECT_EXT_TEMPLATE_PATH = path.join(ROOT, '_templates', 'redirect-ext.html');

let redirectTpl, redirectExtTpl;
try { redirectTpl = fs.readFileSync(REDIRECT_TEMPLATE_PATH, 'utf8'); } catch { redirectTpl = null; }
try { redirectExtTpl = fs.readFileSync(REDIRECT_EXT_TEMPLATE_PATH, 'utf8'); } catch { redirectExtTpl = null; }

function generateRedirect(tpl, slug, replacements) {
  let html = tpl;
  for (const [key, val] of Object.entries(replacements)) {
    html = html.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
  }
  const dir = path.join(ROOT, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('  \u2713 ' + slug + '/index.html (redirect)');
}

if (redirectTpl) {
  // Redirects to /menus/
  if (Array.isArray(config.redirects_menus)) {
    for (const slug of config.redirects_menus) {
      generateRedirect(redirectTpl, slug, {
        SLUG: slug, TITLE: slug, GA_ID: config.ga_id,
        DEST_PATH: '/menus/', TO_PATH: '/menus',
        META_DESC: 'Redirecting to menus\u2026',
        BODY_TEXT: 'Opening menus\u2026',
        FALLBACK_HREF: '/menus/',
        COMMENT: ''
      });
    }
  }

  // Redirects to /
  if (Array.isArray(config.redirects_home)) {
    for (const slug of config.redirects_home) {
      generateRedirect(redirectTpl, slug, {
        SLUG: slug, TITLE: slug, GA_ID: config.ga_id,
        DEST_PATH: '/', TO_PATH: '/',
        META_DESC: 'Redirecting\u2026',
        BODY_TEXT: 'Redirecting\u2026',
        FALLBACK_HREF: '/',
        COMMENT: ''
      });
    }
  }

  // Accommodation hubs (redirect to /)
  if (Array.isArray(config.redirects_accommodation)) {
    for (const hub of config.redirects_accommodation) {
      const comment = '<!--\n  Redirect: /' + hub.slug + '\n  Hub: ' + hub.name + '\n  Blocks covered: ' + hub.blocks + '\n  Kitchens: ' + hub.kitchens + '\n-->\n  ';
      generateRedirect(redirectTpl, hub.slug, {
        SLUG: hub.slug, TITLE: hub.name, GA_ID: config.ga_id,
        DEST_PATH: '/', TO_PATH: '/',
        META_DESC: 'Redirecting\u2026',
        BODY_TEXT: 'Redirecting\u2026',
        FALLBACK_HREF: '/',
        COMMENT: comment
      });
    }
  }
}

// External redirects
if (redirectExtTpl && Array.isArray(config.redirects_external)) {
  for (const ext of config.redirects_external) {
    generateRedirect(redirectExtTpl, ext.slug, {
      SLUG: ext.slug, TITLE: ext.title, GA_ID: config.ga_id,
      DEST_URL: ext.dest,
      META_DESC: ext.body,
      BODY_TEXT: ext.body
    });
  }
}

// ── 5. Generate sitemap.xml ─────────────────────────────────────────────────

const sitemapLines = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

for (const extra of config.sitemap_extra) {
  sitemapLines.push('  <url><loc>' + config.domain + extra + '</loc></url>');
}
for (const entry of config.content) {
  sitemapLines.push('  <url><loc>' + config.domain + '/' + entry.slug + '/</loc></url>');
}
sitemapLines.push('</urlset>');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapLines.join('\n'));
console.log('  \u2713 sitemap.xml');

// ── 6. Warn about missing Markdown ──────────────────────────────────────────

for (const entry of config.content) {
  const enPath = path.join(ROOT, 'content', entry.slug + '-en.md');
  const zhPath = path.join(ROOT, 'content', entry.slug + '-zh.md');
  if (!fs.existsSync(enPath)) {
    console.log('  \u26a0 Missing: content/' + entry.slug + '-en.md');
    warnings++;
  }
  if (!fs.existsSync(zhPath)) {
    console.log('  \u26a0 Missing: content/' + entry.slug + '-zh.md');
    warnings++;
  }
}

// ── 7. Detect orphan directories ────────────────────────────────────────────

const EXCLUDE = new Set(['css', 'js', 'menus', 'more', 'content', '_config', '_templates', '.github', 'tasks']);
const configSlugs = new Set(config.content.map(e => e.slug));
const redirectSlugs = new Set([
  ...(config.redirects_menus || []),
  ...(config.redirects_home || []),
  ...(config.redirects_accommodation || []).map(h => h.slug),
  ...(config.redirects_external || []).map(e => e.slug)
]);

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isDirectory()) continue;
  if (ent.name.startsWith('.') && ent.name !== '.github') continue;
  if (EXCLUDE.has(ent.name)) continue;
  if (configSlugs.has(ent.name)) continue;
  if (redirectSlugs.has(ent.name)) continue;
  const idx = path.join(ROOT, ent.name, 'index.html');
  if (fs.existsSync(idx)) {
    console.log('  \u26a0 Orphan: ' + ent.name + '/ \u2014 exists but not in config');
    warnings++;
  }
}

// ── 8. Summary ──────────────────────────────────────────────────────────────

const rCount = (config.redirects_menus || []).length + (config.redirects_home || []).length + (config.redirects_accommodation || []).length + (config.redirects_external || []).length;
console.log('Generated ' + config.content.length + ' content pages + ' + rCount + ' redirects + sitemap.xml');
if (warnings > 0) {
  console.log(warnings + ' warnings (see above)');
}
