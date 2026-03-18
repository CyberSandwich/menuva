/**
 * Shared content page renderer for legal/policy/FAQ pages.
 * Each page calls initContentPage({slug}) — this module handles
 * Markdown fetch, parsing, DOM rendering, command palette, language, and keyboard.
 *
 * innerHTML usage: Safe — content is first-party .md files committed to the repo,
 * not user-generated. Same pattern as saputra.co.uk. All dynamic text is escaped
 * via esc() before insertion.
 */
import{initCommandPalette,initKeyboard,initLanguage,registerStrings,chrome}from'/js/shared.js?v=9';

registerStrings({
  en:{effectiveDate:'Effective date',lastUpdated:'Last updated',contentNotAvailable:'Content not yet available in this language.',pleaseNotify:'Please notify',questions:'Questions',support:'Support'},
  zh:{effectiveDate:'生效日期',lastUpdated:'最后更新',contentNotAvailable:'此语言的内容尚未提供。',pleaseNotify:'请联系',questions:'咨询',support:'支持'}
});

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}

function il(t){
  return t
    .replace(/`([^`]+)`/g,function(_,c){return'<code>'+esc(c)+'</code>'})
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,function(_,alt,src){return'<img src="'+esc(src)+'" alt="'+esc(alt)+'" loading="lazy">'})
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(_,text,href){return'<a href="'+esc(href)+'" target="_blank" rel="noopener noreferrer">'+text+'</a>'});
}

function parseMd(md){
  var h='',code=false,ul=false,ol=false,tbl=false;
  var lines=md.split('\n');
  for(var i=0;i<lines.length;i++){
    var line=lines[i];
    if(line.startsWith('```')){
      if(code){h+='</code></pre>';code=false}
      else{cl();h+='<pre><code>';code=true}
      continue;
    }
    if(code){h+=esc(line)+'\n';continue}
    if(!line.trim()){cl();continue}
    if(line.startsWith('### ')){cl();h+='<h3>'+il(line.slice(4))+'</h3>';continue}
    if(line.startsWith('## ')){cl();h+='<h2>'+il(line.slice(3))+'</h2>';continue}
    if(line.startsWith('# ')){cl();h+='<h1>'+il(line.slice(2))+'</h1>';continue}
    if(line.startsWith('> ')){
      cl();
      var bq=[];
      while(i<lines.length&&lines[i].startsWith('> ')){bq.push(lines[i].slice(2));i++}
      i--;
      h+='<blockquote>'+parseMd(bq.join('\n'))+'</blockquote>';
      continue;
    }
    if(line.charAt(0)==='|'){
      if(!tbl){
        cl();h+='<table><thead><tr>';
        line.split('|').filter(function(c){return c.trim()}).forEach(function(c){h+='<th>'+il(c.trim())+'</th>'});
        h+='</tr></thead><tbody>';
        tbl=true;
        if(i+1<lines.length&&/^\|[\s\-:|]+\|$/.test(lines[i+1]))i++;
        continue;
      }
      h+='<tr>';
      line.split('|').filter(function(c){return c.trim()}).forEach(function(c){h+='<td>'+il(c.trim())+'</td>'});
      h+='</tr>';
      continue;
    }
    if(/^[-*] /.test(line)){
      if(!ul){cl();h+='<ul>';ul=true}
      h+='<li>'+il(line.replace(/^[-*] /,''))+'</li>';
      continue;
    }
    if(/^\d+\. /.test(line)){
      if(!ol){cl();h+='<ol>';ol=true}
      h+='<li>'+il(line.replace(/^\d+\. /,''))+'</li>';
      continue;
    }
    cl();h+='<p>'+il(line)+'</p>';
  }
  cl();if(code)h+='</code></pre>';
  return h;

  function cl(){
    if(ul){h+='</ul>';ul=false}
    if(ol){h+='</ol>';ol=false}
    if(tbl){h+='</tbody></table>';tbl=false}
  }
}

function parseFrontmatter(raw){
  var m=raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if(!m)return{meta:{},body:raw};
  var meta={};
  m[1].split('\n').forEach(function(line){
    var idx=line.indexOf(':');
    if(idx>0)meta[line.slice(0,idx).trim()]=line.slice(idx+1).trim();
  });
  return{meta:meta,body:m[2]};
}

var CV=9;
var _fetched={};
function fetchMd(key,url,onData){
  var ck='md'+CV+'_'+key;
  var cached=localStorage.getItem(ck);
  if(cached){onData(cached);if(_fetched[ck])return;_fetched[ck]=1}
  fetch(url).then(function(r){if(!r.ok)throw r;return r.text()}).then(function(text){
    if(text!==cached){localStorage.setItem(ck,text);onData(text)}
    _fetched[ck]=1;
  }).catch(function(){});
}

function render(raw,el){
  var parsed=parseFrontmatter(raw);
  var meta=parsed.meta;
  var html=parseMd(parsed.body);

  if(!html.trim()){
    el.textContent='';
    var d=document.createElement('div');d.className='empty';
    d.appendChild(document.createTextNode(chrome('contentNotAvailable')+' '+chrome('pleaseNotify')+' '));
    var a=document.createElement('a');a.href='mailto:support@menuva.co.uk';a.textContent='support@menuva.co.uk';d.appendChild(a);
    el.appendChild(d);
    return meta;
  }

  var frag=document.createDocumentFragment();
  var doc=document.createElement('div');doc.className='doc';

  var heading=document.createElement('div');heading.className='doc-heading';
  heading.textContent=meta.heading||meta.title||'';doc.appendChild(heading);

  var metaDiv=document.createElement('div');metaDiv.className='doc-meta';
  metaDiv.textContent=chrome('effectiveDate')+': '+(meta.effective||'')+' \u00B7 '+chrome('lastUpdated')+': '+(meta.updated||'');
  doc.appendChild(metaDiv);

  // Safe: content is first-party .md files committed to repo, not user input
  var body=document.createElement('div');body.className='doc-body';
  body.innerHTML=html;
  doc.appendChild(body);

  if(meta.contact_questions||meta.contact_support){
    var contact=document.createElement('div');contact.className='doc-contact';
    if(meta.contact_questions){
      contact.appendChild(document.createTextNode(chrome('questions')+': '));
      var qa=document.createElement('a');qa.href='mailto:'+meta.contact_questions;qa.textContent=meta.contact_questions;
      contact.appendChild(qa);
    }
    if(meta.contact_support){
      if(meta.contact_questions)contact.appendChild(document.createTextNode(' \u00B7 '));
      contact.appendChild(document.createTextNode(chrome('support')+': '));
      var sa=document.createElement('a');sa.href='mailto:'+meta.contact_support;sa.textContent=meta.contact_support;
      contact.appendChild(sa);
    }
    doc.appendChild(contact);
  }

  frag.appendChild(doc);
  el.textContent='';el.appendChild(frag);
  return meta;
}

export function initContentPage(cfg){
  if(cfg.strings)registerStrings(cfg.strings);
  var el=document.getElementById('content');

  function loadContent(lng){
    var suffix=lng==='zh'?'zh':'en';
    fetchMd(cfg.slug+'-'+suffix,'/content/'+cfg.slug+'-'+suffix+'.md',function(raw){
      var meta=render(raw,el);
      if(meta.title)document.title='menuva | '+meta.title;
    });
  }

  if(window.gtag)window.gtag('event','content_view',{transport_type:'beacon',page_kind:'content',content_slug:cfg.slug,page_path:location.pathname,page_location:location.href,referrer:document.referrer||''});

  initCommandPalette({
    buildItems:function(){
      var items=[];
      function add(title,sub,type,act){items.push({q:(title+' '+(sub||'')).toLowerCase(),tl:title.toLowerCase(),title:title,type:type,act:act})}
      add(chrome('home'),'','Page',function(){location.href='/'});
      add(chrome('menus'),'','Page',function(){location.href='/menus/'});
      add(chrome('more'),'','Page',function(){location.href='/more/'});
      return items;
    },
    typePri:{Page:4},
    maxResults:8
  });

  initLanguage({onApply:loadContent});

  initKeyboard({
    CUR_TAB:2,
    searchInputId:null,
    cardSelector:null,
    modalGuards:function(){return false},
    onKey:function(){return false}
  });
}
