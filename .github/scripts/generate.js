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

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isDirectory()) continue;
  if (ent.name.startsWith('.') && ent.name !== '.github') continue;
  if (EXCLUDE.has(ent.name)) continue;
  if (configSlugs.has(ent.name)) continue;
  const idx = path.join(ROOT, ent.name, 'index.html');
  if (fs.existsSync(idx)) {
    console.log('  \u26a0 Orphan: ' + ent.name + '/ \u2014 exists but not in config');
    warnings++;
  }
}

// ── 8. Summary ──────────────────────────────────────────────────────────────

console.log('Generated ' + config.content.length + ' content pages + sitemap.xml');
if (warnings > 0) {
  console.log(warnings + ' warnings (see above)');
}
