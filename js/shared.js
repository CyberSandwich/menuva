/* ── Shared JS — menuva.co.uk ── */

var $=function(s){return document.querySelector(s)};
var LANGS=['en','zh'];
var LANG_LABELS={en:'中文',zh:'EN'};
var TAB_URLS=['/','/menus/','/more/'];

var CHROME_STRINGS={
  en:{home:'Home',menus:'Menus',more:'More',search:'Search',nothingFound:'Nothing Found'},
  zh:{home:'首页',menus:'菜单',more:'更多',search:'搜索',nothingFound:'未找到'}
};

// Module-scoped handles for cross-module access (initKeyboard reads these)
var _cmdHandle=null;
var _langHandle=null;

export function chrome(key){return(CHROME_STRINGS[curLang()]||{})[key]||CHROME_STRINGS.en[key]||key}

export function curLang(){return localStorage.getItem('lang')||'en'}

export function registerStrings(langStrings){
  for(var lang in langStrings){
    if(!CHROME_STRINGS[lang])CHROME_STRINGS[lang]={};
    Object.assign(CHROME_STRINGS[lang],langStrings[lang]);
  }
}

export function swrFetch(key,url,onData){
  var k='swr_'+key,cached;
  try{cached=localStorage.getItem(k)}catch(e){}
  if(cached)try{onData(JSON.parse(cached),true)}catch(e){}
  return fetch(url).then(function(r){
    if(!r.ok)throw new Error(r.status);return r.text();
  }).then(function(text){
    if(text!==cached){
      try{localStorage.setItem(k,text)}catch(e){}
      onData(JSON.parse(text),false);
    }
  }).catch(function(err){if(!cached)throw err});
}

export function scoreWord(w,t){
  var i=t.indexOf(w);
  if(i!==-1){
    if(i===0&&t.length===w.length)return 5;
    if(i===0)return 4;
    if(t[i-1]===' ')return 3;
    return 2;
  }
  for(var qi=0,ti=0,first=-1,last=0;ti<t.length&&qi<w.length;ti++){
    if(t[ti]===w[qi]){if(first<0)first=ti;last=ti;qi++}
  }
  if(qi<w.length)return 0;
  return 0.5+w.length/(last-first+1)*0.5;
}

export function initCommandPalette(config){
  config=config||{};
  var typePri=config.typePri||{};
  var maxResults=config.maxResults||8;
  var onBeforeOpen=config.onBeforeOpen||function(){};

  var cmdOverlay=document.createElement('div');cmdOverlay.className='cmd-overlay';cmdOverlay.setAttribute('aria-hidden','true');
  var cmdPalette=document.createElement('div');cmdPalette.className='cmd-palette';cmdPalette.setAttribute('role','dialog');cmdPalette.setAttribute('aria-modal','true');cmdPalette.setAttribute('aria-label','Search');
  var cmdInput=document.createElement('input');cmdInput.className='cmd-input';cmdInput.type='text';cmdInput.placeholder=chrome('search');cmdInput.autocomplete='off';cmdInput.spellcheck=false;
  var cmdX=document.createElement('button');cmdX.className='cmd-x';cmdX.setAttribute('aria-label','Clear search');
  var cmdResults=document.createElement('div');cmdResults.className='cmd-results';
  var cmdInputWrap=document.createElement('div');cmdInputWrap.className='cmd-input-wrap';
  cmdInputWrap.appendChild(cmdInput);cmdInputWrap.appendChild(cmdX);
  cmdPalette.appendChild(cmdInputWrap);cmdPalette.appendChild(cmdResults);cmdOverlay.appendChild(cmdPalette);
  document.body.appendChild(cmdOverlay);

  var cmdOpen=false;
  var cmdIdx=-1;
  var cmdItems=null;

  function openCmd(){
    if(cmdOpen)return;
    onBeforeOpen();
    cmdOpen=true;
    cmdInput.value='';
    cmdX.style.display='none';
    cmdResults.textContent='';
    cmdIdx=-1;
    cmdItems=config.buildItems();
    document.body.style.overflow='hidden';
    cmdOverlay.removeAttribute('aria-hidden');
    cmdOverlay.classList.add('open');
    cmdInput.focus();
    cmdInput.select();
  }

  function closeCmd(){
    if(!cmdOpen)return;
    cmdOpen=false;
    cmdItems=null;
    document.body.style.overflow='';
    cmdOverlay.setAttribute('aria-hidden','true');
    cmdOverlay.classList.remove('open');
    cmdInput.blur();
  }

  cmdOverlay.addEventListener('click',function(e){
    if(e.target===cmdOverlay)closeCmd();
  });

  function cmdSearch(q){
    var words=q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if(!words.length)return [];
    var items=cmdItems||[];
    var scored=[];
    items.forEach(function(it){
      var total=0;
      var ok=words.every(function(w){
        var ts=scoreWord(w,it.tl)*1.5;
        var fs=scoreWord(w,it.q);
        var s=ts>fs?ts:fs;
        total+=s;return s>0;
      });
      if(ok)scored.push({item:it,score:total+(typePri[it.type]||0)*0.1});
    });
    scored.sort(function(a,b){return b.score-a.score||a.item.title.localeCompare(b.item.title)});
    return scored.slice(0,maxResults).map(function(s){return s.item});
  }

  function cmdRender(){
    var results=cmdSearch(cmdInput.value);
    cmdResults.textContent='';
    cmdIdx=-1;
    if(!cmdInput.value.trim())return;
    if(!results.length){
      var empty=document.createElement('div');empty.className='cmd-empty';empty.textContent=chrome('nothingFound');
      cmdResults.appendChild(empty);return;
    }
    results.forEach(function(r){
      var row=document.createElement('button');row.className='cmd-row';
      var t=document.createElement('span');t.className='cmd-row-title';t.textContent=r.title;
      var tag=document.createElement('span');tag.className='cmd-row-type';tag.textContent=r.type;
      row.appendChild(t);row.appendChild(tag);
      row.addEventListener('click',function(){r.act();closeCmd()});
      cmdResults.appendChild(row);
    });
  }

  function cmdNav(dir){
    var rows=cmdResults.querySelectorAll('.cmd-row');
    if(!rows.length)return;
    if(cmdIdx>=0&&rows[cmdIdx])rows[cmdIdx].classList.remove('cmd-active');
    cmdIdx+=dir;
    if(cmdIdx<0)cmdIdx=rows.length-1;
    if(cmdIdx>=rows.length)cmdIdx=0;
    rows[cmdIdx].classList.add('cmd-active');
    rows[cmdIdx].scrollIntoView({block:'nearest'});
  }

  var cmdTimer;
  cmdInput.addEventListener('input',function(){
    clearTimeout(cmdTimer);
    cmdX.style.display=cmdInput.value?'flex':'none';
    cmdTimer=setTimeout(cmdRender,80);
  });
  cmdX.addEventListener('click',function(){clearTimeout(cmdTimer);cmdInput.value='';cmdX.style.display='none';cmdRender();cmdInput.focus()});

  cmdInput.addEventListener('keydown',function(e){
    if(e.key==='ArrowDown'||(!e.shiftKey&&e.key==='Tab')){e.preventDefault();cmdNav(1)}
    else if(e.key==='ArrowUp'||(e.shiftKey&&e.key==='Tab')){e.preventDefault();cmdNav(-1)}
    else if(e.key==='Enter'){
      e.preventDefault();
      var rows=cmdResults.querySelectorAll('.cmd-row');
      if(cmdIdx>=0&&rows[cmdIdx])rows[cmdIdx].click();
      else if(rows.length)rows[0].click();
    }
    else if(e.key==='Escape'){e.preventDefault();closeCmd()}
  });

  var handle={open:openCmd,close:closeCmd,isOpen:function(){return cmdOpen}};
  _cmdHandle=handle;
  return handle;
}

export function initLanguage(config){
  config=config||{};
  var onApply=config.onApply||function(){};
  var analytics=config.analytics||function(){};
  var langTimer;

  function applyLanguage(lng){
    document.documentElement.setAttribute('data-lang',lng);
    document.documentElement.lang=lng==='zh'?'zh-Hans':'en-GB';
    var btn=document.getElementById('lang-btn');
    if(btn)btn.textContent=LANG_LABELS[lng];
    var tabs=document.querySelectorAll('nav .tabs:first-child a');
    var labels=[chrome('home'),chrome('menus'),chrome('more')];
    tabs.forEach(function(a,i){if(labels[i])a.textContent=labels[i]});
    onApply(lng);
  }

  function toggle(){
    var prev=curLang();
    var next=LANGS[(LANGS.indexOf(prev)+1)%LANGS.length];
    analytics(next,prev);
    try{localStorage.setItem('lang',next)}catch(_){}
    clearTimeout(langTimer);
    langTimer=setTimeout(function(){applyLanguage(next)},100);
  }

  document.getElementById('lang-btn').addEventListener('click',toggle);

  document.addEventListener('visibilitychange',function(){
    if(document.hidden)return;
    var n=document.querySelector('nav');
    if(n){n.style.display='none';n.offsetHeight;n.style.display=''}
    var stored=curLang();
    if(stored!==(document.documentElement.getAttribute('data-lang')||'en'))applyLanguage(stored);
  },{passive:true});

  applyLanguage(curLang());

  var handle={apply:applyLanguage,toggle:toggle};
  _langHandle=handle;
  return handle;
}

/* Outbound link click tracking — fires GA4 event for external link clicks */
document.addEventListener('click',function(e){
  var a=e.target.closest('a');
  if(!a||!a.href||a.href.indexOf('http')!==0||a.hostname===location.hostname)return;
  if(window.gtag)gtag('event','outbound_click',{
    transport_type:'beacon',
    link_url:a.href,
    link_text:(a.textContent||'').trim().slice(0,100),
    page_path:location.pathname
  });
});

export function initKeyboard(config){
  config=config||{};
  var CUR_TAB=config.CUR_TAB||0;
  var cardSelector=config.cardSelector||null;
  var modalGuards=config.modalGuards||function(){return false};
  var onKey=config.onKey||function(){return false};
  var onBack=config.onBack||null;

  var kbIdx=-1,kbCards=[],kbPrev=-1;
  var pendingG=false,gTimer;

  function resolveSearchInputId(){
    var sid=config.searchInputId;
    if(typeof sid==='function')sid=sid();
    return sid;
  }

  function kbGetCards(){
    if(!cardSelector)return [];
    return [].slice.call(document.querySelectorAll(cardSelector));
  }

  function kbClear(remember){
    if(kbIdx>=0&&kbCards[kbIdx])kbCards[kbIdx].classList.remove('kb-focus');
    kbPrev=remember?kbIdx:-1;
    kbIdx=-1;kbCards=[];
  }

  function kbMove(dir){
    kbCards=kbGetCards();
    if(!kbCards.length)return;
    if(kbIdx>=0&&kbCards[kbIdx])kbCards[kbIdx].classList.remove('kb-focus');
    if(kbIdx<0){
      if(kbPrev>=0&&kbPrev<kbCards.length){
        kbIdx=kbPrev;
      }else{
        var vh=window.innerHeight;
        kbIdx=dir>0?0:kbCards.length-1;
        for(var i=dir>0?0:kbCards.length-1;dir>0?i<kbCards.length:i>=0;i+=dir){
          var r=kbCards[i].getBoundingClientRect();
          if(r.bottom>0&&r.top<vh){kbIdx=i;break}
        }
      }
      kbPrev=-1;
    }else{
      kbIdx+=dir;
      if(kbIdx<0)kbIdx=kbCards.length-1;
      if(kbIdx>=kbCards.length)kbIdx=0;
    }
    kbCards[kbIdx].classList.add('kb-focus');
    kbCards[kbIdx].scrollIntoView({block:'nearest'});
  }

  if(cardSelector){
    document.addEventListener('mousemove',function(){if(kbIdx>=0)kbClear(true)},{passive:true});
  }

  document.addEventListener('keydown',function(e){
    if(modalGuards(e))return;

    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
      e.preventDefault();
      if(_cmdHandle){
        if(_cmdHandle.isOpen())_cmdHandle.close();else _cmdHandle.open();
      }
      return;
    }

    if(_cmdHandle&&_cmdHandle.isOpen()){if(e.key==='Escape')_cmdHandle.close();return}

    var tag=document.activeElement&&document.activeElement.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'){
      if(e.key==='Escape'){document.activeElement.blur();kbClear()}
      return;
    }

    if(e.metaKey||e.ctrlKey||e.altKey)return;

    var key=e.key;

    if(key==='g'&&!pendingG){
      pendingG=true;clearTimeout(gTimer);
      gTimer=setTimeout(function(){pendingG=false},500);
      return;
    }
    if(pendingG){
      pendingG=false;clearTimeout(gTimer);
      if(key==='h'){location.href='/';return}
      if(key==='m'){location.href='/menus/';return}
      if(key==='o'){location.href='/more/';return}
    }

    if(key==='?'){location.href='/shortcuts/';return}
    if(key==='Backspace'&&onBack){onBack();return}

    if(key>='1'&&key<='3'){
      var idx=+key-1;
      if(idx!==CUR_TAB)location.href=TAB_URLS[idx];
      return;
    }

    if(key==='l'){
      if(_langHandle)_langHandle.toggle();
      return;
    }

    if(key==='/'){
      var sid=resolveSearchInputId();
      if(sid){
        var si=$(typeof sid==='string'?'#'+sid:sid);
        if(si){e.preventDefault();si.focus()}
      }
      return;
    }

    if(cardSelector){
      if(key==='j'||key==='ArrowDown'){e.preventDefault();kbMove(1);return}
      if(key==='k'||key==='ArrowUp'){e.preventDefault();kbMove(-1);return}
    }

    if(key==='ArrowRight'||key==='ArrowLeft'){
      var next=CUR_TAB+(key==='ArrowRight'?1:-1);
      if(next<0)next=TAB_URLS.length-1;
      if(next>=TAB_URLS.length)next=0;
      if(next!==CUR_TAB)location.href=TAB_URLS[next];
      return;
    }

    if(cardSelector){
      if(key==='Enter'&&kbIdx>=0&&kbCards[kbIdx]){
        kbCards[kbIdx].click();
        kbClear();return;
      }
      if(key==='Escape'&&kbIdx>=0){kbClear();return}
    }

    onKey(key,e);
  });
}
