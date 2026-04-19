#!/usr/bin/env node
'use strict';

/**
 * Build-time generator for menuva.co.uk.
 *
 * Reads _config/pages.json and content/*.md, prerenders content pages with
 * both EN and ZH bodies plus JSON-LD, generates redirect pages, and writes
 * sitemap.xml with per-page lastmod.
 */

const fs = require('fs');
const path = require('path');
const urlMod = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(ROOT, '_config', 'pages.json');
const TEMPLATE_PATH = path.join(ROOT, '_templates', 'content.html');
const CONTENT_DIR = path.join(ROOT, 'content');

const MONTHS_EN = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
};

function parseEnDate(s) {
  if (!s) return null;
  const m = String(s).trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const mo = MONTHS_EN[m[2].toLowerCase()];
  if (!mo) return null;
  return m[3] + '-' + String(mo).padStart(2, '0') + '-' + String(m[1]).padStart(2, '0');
}

function toIsoFull(iso) {
  return iso ? iso + 'T00:00:00+00:00' : '';
}

function escAttr(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

(async () => {

const mdUrl = urlMod.pathToFileURL(path.join(ROOT, 'js', 'md.js')).href;
const { parseMd, parseFrontmatter, buildLayout, metaDescription } = await import(mdUrl);

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

const errors = [];

if (config.version == null || !Number.isInteger(config.version) || config.version < 1) errors.push('version: must be a positive integer');
if (config.year == null || !Number.isInteger(config.year) || config.year < 1000 || config.year > 9999) errors.push('year: must be a 4-digit integer (1000-9999)');
if (typeof config.ga_id !== 'string' || !/^G-[A-Z0-9]+$/.test(config.ga_id)) errors.push('ga_id: must match /^G-[A-Z0-9]+$/');
if (typeof config.domain !== 'string' || !config.domain.startsWith('https://') || config.domain.endsWith('/')) errors.push('domain: must start with "https://" and have no trailing slash');
if (!Array.isArray(config.content) || config.content.length === 0) {
  errors.push('content: must be a non-empty array');
} else {
  const slugs = new Set();
  config.content.forEach((entry, i) => {
    if (typeof entry.slug !== 'string' || !/^[a-z0-9-]{1,30}$/.test(entry.slug)) errors.push('content[' + i + '].slug: must match /^[a-z0-9-]{1,30}$/');
    else if (slugs.has(entry.slug)) errors.push('content[' + i + '].slug: duplicate slug "' + entry.slug + '"');
    else slugs.add(entry.slug);
    if (typeof entry.title !== 'string' || entry.title.length === 0) errors.push('content[' + i + '].title: must be a non-empty string');
    if (typeof entry.description !== 'string' || entry.description.length === 0) errors.push('content[' + i + '].description: must be a non-empty string');
    if (entry.priority != null && (typeof entry.priority !== 'number' || entry.priority < 0 || entry.priority > 1)) errors.push('content[' + i + '].priority: must be a number between 0.0 and 1.0');
  });
}
if (!Array.isArray(config.sitemap_extra)) {
  errors.push('sitemap_extra: must be an array');
} else {
  config.sitemap_extra.forEach((p, i) => {
    if (typeof p === 'string') errors.push('sitemap_extra[' + i + ']: must be an object with "path"');
    else if (typeof p !== 'object' || typeof p.path !== 'string' || !p.path.startsWith('/')) errors.push('sitemap_extra[' + i + ']: must be an object with "path" starting with "/"');
  });
}

if (errors.length > 0) {
  console.error('Validation errors:');
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}

let template;
try {
  template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
} catch {
  console.error('Template not found: ' + TEMPLATE_PATH);
  process.exit(1);
}

let warnings = 0;
const contentMeta = {};

function readMarkdown(slug, lang) {
  const p = path.join(CONTENT_DIR, slug + '-' + lang + '.md');
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, 'utf8');
}

function renderBody(raw) {
  if (!raw) return { meta: {}, body: '', plain: '' };
  const fm = parseFrontmatter(raw);
  const html = parseMd(fm.body);
  const layout = buildLayout(html);
  return { meta: fm.meta, body: layout.body, title: layout.title, plain: html };
}

function buildContactBlock(meta, lang) {
  if (!meta.contact_questions && !meta.contact_support) return '';
  const strings = lang === 'zh' ? { questions: '\u54a8\u8be2', support: '\u652f\u6301' } : { questions: 'Questions', support: 'Support' };
  const parts = [];
  if (meta.contact_questions) parts.push(strings.questions + ': <a href="mailto:' + escAttr(meta.contact_questions) + '">' + escHtml(meta.contact_questions) + '</a>');
  if (meta.contact_support) parts.push(strings.support + ': <a href="mailto:' + escAttr(meta.contact_support) + '">' + escHtml(meta.contact_support) + '</a>');
  const hidden = lang === 'zh' ? ' hidden' : '';
  return '<div class="doc-contact" data-lang="' + lang + '"' + hidden + '>' + parts.join(' <span aria-hidden="true">&middot;</span> ') + '</div>';
}

function applyPlaceholders(html, map) {
  for (const key of Object.keys(map)) {
    html = html.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), map[key]);
  }
  return html;
}

for (const entry of config.content) {
  const rawEn = readMarkdown(entry.slug, 'en');
  const rawZh = readMarkdown(entry.slug, 'zh');

  if (!rawEn) { console.log('  ! Missing: content/' + entry.slug + '-en.md'); warnings++; }
  if (!rawZh) { console.log('  ! Missing: content/' + entry.slug + '-zh.md'); warnings++; }

  const en = renderBody(rawEn);
  const zh = renderBody(rawZh);

  const heading = en.meta.heading || en.meta.title || entry.title;
  const headingZh = zh.meta.heading || zh.meta.title || heading;
  const effectiveEn = en.meta.effective || '';
  const effectiveZh = zh.meta.effective || effectiveEn;
  const updatedEn = en.meta.updated || effectiveEn;
  const updatedZh = zh.meta.updated || updatedEn;

  const datePublishedIso = parseEnDate(effectiveEn) || '';
  const dateModifiedIso = parseEnDate(updatedEn) || datePublishedIso;

  contentMeta[entry.slug] = { lastmod: dateModifiedIso || new Date().toISOString().slice(0, 10) };

  const desc = en.body ? metaDescription(en.body) : entry.description;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': heading,
    'description': desc,
    'datePublished': toIsoFull(datePublishedIso),
    'dateModified': toIsoFull(dateModifiedIso),
    'inLanguage': 'en-GB',
    'url': config.domain + '/' + entry.slug + '/',
    'author': { '@type': 'Person', 'name': 'Duke DJ Saputra', 'url': config.domain },
    'publisher': { '@type': 'Organization', 'name': 'Menuva', 'url': config.domain }
  }, null, 2);

  const html = applyPlaceholders(template, {
    TITLE: escHtml(entry.title),
    SLUG: entry.slug,
    DOMAIN: config.domain,
    V: String(config.version),
    GA_ID: config.ga_id,
    YEAR: String(config.year),
    META_DESCRIPTION: escAttr(desc),
    JSON_LD: jsonLd,
    HEADING_EN: escHtml(heading),
    HEADING_ZH: escHtml(headingZh),
    EFFECTIVE_EN: escHtml(effectiveEn),
    EFFECTIVE_ZH: escHtml(effectiveZh),
    UPDATED_EN: escHtml(updatedEn),
    UPDATED_ZH: escHtml(updatedZh),
    DATE_PUBLISHED_ISO: toIsoFull(datePublishedIso),
    DATE_MODIFIED_ISO: toIsoFull(dateModifiedIso),
    BODY_EN: en.body,
    BODY_ZH: zh.body,
    CONTACT_EN: buildContactBlock(en.meta, 'en'),
    CONTACT_ZH: buildContactBlock(zh.meta, 'zh')
  });

  const dir = path.join(ROOT, entry.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('  + ' + entry.slug + '/index.html');

  if (rawEn && rawZh) {
    const enH2 = (en.body.match(/<div class="link-sec">/g) || []).length;
    const zhH2 = (zh.body.match(/<div class="link-sec">/g) || []).length;
    const enH3 = (en.body.match(/<div class="pcontent">/g) || []).length;
    const zhH3 = (zh.body.match(/<div class="pcontent">/g) || []).length;
    if (enH2 !== zhH2 || enH3 !== zhH3) {
      console.log('  ! ' + entry.slug + ': EN/ZH structural mismatch (sections ' + enH2 + '/' + zhH2 + ', cards ' + enH3 + '/' + zhH3 + ')');
      warnings++;
    }
  }
}

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
  console.log('  + ' + slug + '/index.html (redirect)');
}

if (redirectTpl) {
  if (Array.isArray(config.redirects_menus)) {
    for (const slug of config.redirects_menus) {
      generateRedirect(redirectTpl, slug, { SLUG: slug, TITLE: slug, GA_ID: config.ga_id, DEST_PATH: '/menus/', TO_PATH: '/menus', META_DESC: 'Redirecting to menus\u2026', BODY_TEXT: 'Opening menus\u2026', FALLBACK_HREF: '/menus/', COMMENT: '' });
    }
  }
  if (Array.isArray(config.redirects_home)) {
    for (const slug of config.redirects_home) {
      generateRedirect(redirectTpl, slug, { SLUG: slug, TITLE: slug, GA_ID: config.ga_id, DEST_PATH: '/', TO_PATH: '/', META_DESC: 'Redirecting\u2026', BODY_TEXT: 'Redirecting\u2026', FALLBACK_HREF: '/', COMMENT: '' });
    }
  }
  if (Array.isArray(config.redirects_accommodation)) {
    for (const hub of config.redirects_accommodation) {
      const comment = '<!--\n  Redirect: /' + hub.slug + '\n  Hub: ' + hub.name + '\n  Blocks covered: ' + hub.blocks + '\n  Kitchens: ' + hub.kitchens + '\n-->\n  ';
      generateRedirect(redirectTpl, hub.slug, { SLUG: hub.slug, TITLE: hub.name, GA_ID: config.ga_id, DEST_PATH: '/', TO_PATH: '/', META_DESC: 'Redirecting\u2026', BODY_TEXT: 'Redirecting\u2026', FALLBACK_HREF: '/', COMMENT: comment });
    }
  }
}

if (redirectExtTpl && Array.isArray(config.redirects_external)) {
  for (const ext of config.redirects_external) {
    generateRedirect(redirectExtTpl, ext.slug, { SLUG: ext.slug, TITLE: ext.title, GA_ID: config.ga_id, DEST_URL: ext.dest, META_DESC: ext.body, BODY_TEXT: ext.body });
  }
}

const today = new Date().toISOString().slice(0, 10);
const sitemapLines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];

for (const extra of config.sitemap_extra) {
  const pri = extra.priority != null ? extra.priority : 0.5;
  sitemapLines.push('  <url>', '    <loc>' + config.domain + extra.path + '</loc>', '    <lastmod>' + today + '</lastmod>', '    <priority>' + pri.toFixed(1) + '</priority>', '  </url>');
}
for (const entry of config.content) {
  const pri = entry.priority != null ? entry.priority : 0.5;
  const lastmod = (contentMeta[entry.slug] && contentMeta[entry.slug].lastmod) || today;
  sitemapLines.push('  <url>', '    <loc>' + config.domain + '/' + entry.slug + '/</loc>', '    <lastmod>' + lastmod + '</lastmod>', '    <priority>' + pri.toFixed(1) + '</priority>', '  </url>');
}
sitemapLines.push('</urlset>');

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapLines.join('\n'));
console.log('  + sitemap.xml');

const EXCLUDE = new Set(['css', 'js', 'menus', 'more', 'content', '_config', '_templates', '.github', 'tasks', 'internal-governance', 'archive']);
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
    console.log('  ! Orphan: ' + ent.name + '/');
    warnings++;
  }
}

const rCount = (config.redirects_menus || []).length + (config.redirects_home || []).length + (config.redirects_accommodation || []).length + (config.redirects_external || []).length;
console.log('Generated ' + config.content.length + ' content pages + ' + rCount + ' redirects + sitemap.xml');
if (warnings > 0) console.log(warnings + ' warnings (see above)');

})().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
