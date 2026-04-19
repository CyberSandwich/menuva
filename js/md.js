/**
 * Shared Markdown parser used by both Node (build-time prerender in
 * .github/scripts/generate.js) and the browser (fallback if ever needed).
 *
 * Zero DOM, zero dependencies. Pure string operations so it runs anywhere.
 *
 * Supported syntax:
 *   - Headings h1-h6
 *   - Paragraphs with `  ` trailing soft line-breaks
 *   - Lists: unordered, ordered, task (- [ ] / - [x])
 *   - Code blocks (``` or ~~~) and inline `code`
 *   - Bold **x**, italic *x*, bold-italic ***x***, strikethrough ~~x~~, highlight ==x==
 *   - Blockquotes (recursive, depth-capped at 5)
 *   - Tables (pipe-delimited, auto-detects separator row)
 *   - Horizontal rules (---, ***, ___)
 *   - Links (external auto-get target="_blank" rel="noopener noreferrer")
 *   - Images (lazy-loaded)
 *   - Wiki-style [[Key]] for keyboard keys (menuva-specific)
 *   - Backslash escape sequences
 *   - Frontmatter (YAML between --- markers)
 */

const EXTERNAL_HOST = /^https?:\/\/(www\.)?menuva\.co\.uk(\/|$)/i;

export function esc(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Inline formatter. Order matters: escape placeholders, then esc(), then overlapping patterns.
 */
export function il(t) {
  if (!t) return '';
  // Backslash escaping: \X -> PUA placeholder, restored at the end
  const slots = [];
  t = t.replace(/\\([\\*_#~`|=\[\]()>!-])/g, function (_, c) {
    slots.push(c);
    return '\uE000' + (slots.length - 1) + '\uE001';
  });
  t = esc(t);
  return t
    .replace(/\[\[([^\]]+)\]\]/g, function (_, c) { return '<kbd>' + c + '</kbd>'; })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function (_, alt, src) {
      return '<img src="' + src + '" alt="' + alt + '" loading="lazy" decoding="async">';
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, text, href) {
      const ext = /^https?:\/\//i.test(href) && !EXTERNAL_HOST.test(href);
      if (ext) return '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
      return '<a href="' + href + '">' + text + '</a>';
    })
    .replace(/\uE000(\d+)\uE001/g, function (_, idx) {
      const c = slots[+idx];
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : c;
    });
}

export function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  m[1].split('\n').forEach(function (line) {
    const idx = line.indexOf(':');
    if (idx > 0) meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return { meta: meta, body: m[2] };
}

export function parseMd(md, _depth) {
  if (!md || typeof md !== 'string') return '';
  if ((_depth || 0) > 4) return '<p>' + esc(md) + '</p>';
  let h = '', code = false, ul = false, ol = false, tbl = false;
  let para = [];
  const lines = md.split('\n');

  function cl() {
    if (para.length) { h += '<p>' + para.join('\n') + '</p>'; para = []; }
    if (ul) { h += '</ul>'; ul = false; }
    if (ol) { h += '</ol>'; ol = false; }
    if (tbl) { h += '</tbody></table>'; tbl = false; }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(`{3,}|~{3,})/.test(line)) {
      if (code) { h += '</code></pre>'; code = false; }
      else { cl(); h += '<pre><code>'; code = true; }
      continue;
    }
    if (code) { h += esc(line) + '\n'; continue; }
    if (!line.trim()) { cl(); continue; }
    if (/^([-*_])(\s*\1){2,}\s*$/.test(line.trim())) { cl(); h += '<hr>'; continue; }
    const hm = line.match(/^(#{1,6}) (.+)/);
    if (hm) { cl(); h += '<h' + hm[1].length + '>' + il(hm[2]) + '</h' + hm[1].length + '>'; continue; }
    if (line.startsWith('> ') || line === '>') {
      cl();
      const bq = [];
      while (i < lines.length && (lines[i].startsWith('> ') || lines[i] === '>')) {
        bq.push(lines[i] === '>' ? '' : lines[i].slice(2));
        i++;
      }
      i--;
      h += '<blockquote>' + parseMd(bq.join('\n'), (_depth || 0) + 1) + '</blockquote>';
      continue;
    }
    if (line.charAt(0) === '|') {
      if (!tbl) {
        cl();
        h += '<table><thead><tr>';
        line.split('|').filter(function (c) { return c.trim(); }).forEach(function (c) {
          h += '<th scope="col">' + il(c.trim()) + '</th>';
        });
        h += '</tr></thead><tbody>';
        tbl = true;
        if (i + 1 < lines.length && /^[\s|:\-]+$/.test(lines[i + 1])) i++;
        continue;
      }
      h += '<tr>';
      line.split('|').filter(function (c) { return c.trim(); }).forEach(function (c) {
        h += '<td>' + il(c.trim()) + '</td>';
      });
      h += '</tr>';
      continue;
    }
    const tm = line.match(/^(\s*)([-*+]) \[([ xX])\] (.*)$/);
    if (tm) {
      const checked = tm[3] !== ' ';
      if (!ul) { cl(); h += '<ul class="task-list">'; ul = true; }
      h += '<li class="task-item' + (checked ? ' checked' : '') +
        '"><input type="checkbox" disabled' + (checked ? ' checked' : '') + '>' +
        il(tm[4]) + '</li>';
      continue;
    }
    const ulm = line.match(/^(\s*)([-*+]) (.*)$/);
    if (ulm && !/^[-*_]{3,}$/.test(line.trim())) {
      if (!ul) { cl(); h += '<ul>'; ul = true; }
      h += '<li>' + il(ulm[3]) + '</li>';
      continue;
    }
    const olm = line.match(/^(\s*)\d+[.)]\s(.*)$/);
    if (olm) {
      if (!ol) { cl(); h += '<ol>'; ol = true; }
      h += '<li>' + il(olm[2]) + '</li>';
      continue;
    }
    // Paragraph: consecutive text lines join (standard markdown soft wraps)
    para.push(line.endsWith('  ') ? il(line.slice(0, -2)) + '<br>' : il(line));
  }
  cl();
  if (code) h += '</code></pre>';
  return h;
}

// ─── Card layout builder ────────────────────────────────────────────────
// Mirrors saputra.co.uk convention: H2 => uppercase section label,
// H3 => rounded card. Accumulates paragraphs/lists/tables/etc. into the
// currently-open card. <hr> flushes.

function findClosingTag(html, tagName) {
  const openTag = '<' + tagName;
  const closeTag = '</' + tagName + '>';
  let depth = 0, pos = 0;
  while (pos < html.length) {
    const nextOpen = html.indexOf(openTag, pos);
    const nextClose = html.indexOf(closeTag, pos);
    if (nextClose === -1) return -1;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      const charAfter = html.charAt(nextOpen + openTag.length);
      if (charAfter === ' ' || charAfter === '>' || charAfter === '/') {
        depth++;
        pos = nextOpen + openTag.length;
      } else {
        pos = nextOpen + 1;
      }
    } else {
      depth--;
      if (depth === 0) return nextClose;
      pos = nextClose + closeTag.length;
    }
  }
  return -1;
}

function tokenize(html) {
  const tokens = [];
  let remaining = html.trim();
  while (remaining.length > 0) {
    const ws = remaining.match(/^\s+/);
    if (ws) {
      remaining = remaining.slice(ws[0].length);
      if (!remaining.length) break;
    }
    const h2 = remaining.match(/^<h2>([\s\S]*?)<\/h2>/);
    if (h2) {
      tokens.push({ type: 'h2', text: h2[1] });
      remaining = remaining.slice(h2[0].length);
      continue;
    }
    const hr = remaining.match(/^<hr\s*\/?>/);
    if (hr) {
      tokens.push({ type: 'hr' });
      remaining = remaining.slice(hr[0].length);
      continue;
    }
    const tag = remaining.match(/^<(\w+)[\s>]/);
    if (tag) {
      const tagName = tag[1];
      if (/^(br|hr|img|input)$/i.test(tagName)) {
        const selfClose = remaining.match(/^<\w+[^>]*\/?>/);
        if (selfClose) {
          tokens.push({ type: 'content', html: selfClose[0] });
          remaining = remaining.slice(selfClose[0].length);
          continue;
        }
      }
      const closeTag = '</' + tagName + '>';
      const closeIdx = findClosingTag(remaining, tagName);
      if (closeIdx !== -1) {
        const chunk = remaining.slice(0, closeIdx + closeTag.length);
        tokens.push({ type: 'content', html: chunk });
        remaining = remaining.slice(chunk.length);
        continue;
      }
    }
    let next = remaining.indexOf('<', 1);
    if (next === -1) next = remaining.length;
    tokens.push({ type: 'content', html: remaining.slice(0, next) });
    remaining = remaining.slice(next);
  }
  return tokens;
}

/**
 * Takes the HTML output of parseMd() and wraps it in the Saputra-style
 * section-divider + card layout.
 *
 * <h1>   => extracted as page title (removed from body)
 * <h2>   => <div class="link-sec"><h3>text</h3></div> (flushes current card)
 * <hr>   => flushes current card
 * other  => accumulated into <div class="pcontent">...</div>
 *
 * Returns { title, body }.
 */
export function buildLayout(html) {
  let title = '';
  const h1Match = html.match(/<h1>([\s\S]*?)<\/h1>/);
  if (h1Match) {
    title = h1Match[1];
    html = html.replace(/<h1>[\s\S]*?<\/h1>/, '');
  }

  const tokens = tokenize(html);
  let body = '', card = '';

  function flush() {
    if (card) {
      body += '<div class="pcontent">' + card + '</div>\n';
      card = '';
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok.type === 'h2') {
      flush();
      body += '<div class="link-sec"><h3>' + tok.text + '</h3></div>\n';
    } else if (tok.type === 'hr') {
      flush();
    } else {
      card += tok.html;
    }
  }
  flush();

  return { title: title, body: body };
}

export function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Derive a ~160-char description from rendered HTML, truncating at a word boundary.
 */
export function metaDescription(html) {
  const text = stripHtml(html);
  if (text.length <= 160) return text;
  let truncated = text.slice(0, 160);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 120) truncated = truncated.slice(0, lastSpace);
  return truncated + '...';
}
