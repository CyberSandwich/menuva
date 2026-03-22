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
var _analyticsDialogOpen=false;

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

// ── Search scoring engine ──
// Tiers: exact(10) > prefix(8-9) > word-boundary(6-7) > substring(4-5)
//        > edit-distance-1(3-4) > edit-distance-2(1.5-2.5)
//        > fuzzy-subsequence(0.3-1.5) > no-match(0)

var _nCache={};
function _norm(s){
  if(_nCache[s]!==undefined)return _nCache[s];
  var r=s;
  // Strip diacritics: café → cafe, über → uber
  if(/[\u00C0-\u024F\u1E00-\u1EFF]/.test(r))r=r.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  _nCache[s]=r;return r;
}

// Bounded Damerau-Levenshtein with early exit
// Returns edit distance or Infinity if > maxDist
function _editDist(a,b,maxDist){
  var la=a.length,lb=b.length;
  if(Math.abs(la-lb)>maxDist)return maxDist+1;
  // Use two-row approach for memory efficiency
  var prev=new Array(lb+1),curr=new Array(lb+1),pprev;
  for(var j=0;j<=lb;j++)prev[j]=j;
  for(var i=1;i<=la;i++){
    curr[0]=i;
    var rowMin=i;
    for(var j=1;j<=lb;j++){
      var cost=a[i-1]===b[j-1]?0:1;
      curr[j]=prev[j]+1;                         // deletion
      if(curr[j-1]+1<curr[j])curr[j]=curr[j-1]+1; // insertion
      if(prev[j-1]+cost<curr[j])curr[j]=prev[j-1]+cost; // substitution
      // Transposition (Damerau)
      if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]){
        var trans=pprev[j-2]+cost;
        if(trans<curr[j])curr[j]=trans;
      }
      if(curr[j]<rowMin)rowMin=curr[j];
    }
    // Early exit: if minimum in this row exceeds maxDist, no point continuing
    if(rowMin>maxDist)return maxDist+1;
    pprev=prev;prev=curr;curr=new Array(lb+1);
  }
  return prev[lb];
}

// Best fuzzy subsequence score with consecutive-char bonuses and gap penalties
function _fuzzyScore(w,t){
  var wl=w.length,tl=t.length;
  if(wl===0)return 0;
  if(wl>tl)return 0;

  // Find best alignment using recursive search with memoization
  // Score components: +2 per matched char, +1.5 bonus per consecutive, -0.5 per gap
  var best=0;
  var stack=[[0,0,0,false]]; // [qi, ti, score, prevMatched]

  // Iterative DFS with pruning
  while(stack.length){
    var frame=stack.pop();
    var qi=frame[0],ti=frame[1],sc=frame[2],consec=frame[3];

    if(qi===wl){if(sc>best)best=sc;continue}
    if(ti>=tl)continue;

    // Remaining chars to match vs remaining positions
    if(wl-qi>tl-ti)continue;

    // Upper bound pruning: even if all remaining chars match consecutively
    var remaining=wl-qi;
    var maxPossible=sc+remaining*2+((remaining-1)*1.5)+(consec?1.5:0);
    if(maxPossible<=best)continue;

    // Try matching w[qi] at each position from ti onward
    for(var k=ti;k<=tl-(wl-qi);k++){
      if(t[k]===w[qi]){
        var bonus=2; // base match score
        var isConsec=(k===ti&&consec);
        if(isConsec)bonus+=1.5; // consecutive bonus
        else if(qi===0&&(k===0||t[k-1]===' '))bonus+=1; // word-boundary bonus
        else if(k>ti)bonus-=Math.min((k-ti)*0.3,1.5); // gap penalty (capped)
        stack.push([qi+1,k+1,sc+bonus,true]);
      }
    }
  }

  if(best<=0)return 0;
  // Normalize: perfect consecutive match = wl*2 + (wl-1)*1.5 + possible boundary bonus
  var maxScore=wl*2+(wl-1)*1.5;
  return 0.3+(best/maxScore)*1.2; // Map to 0.3-1.5 range
}

export function scoreWord(w,t){
  if(!w||!t)return 0;
  var wn=_norm(w),tn=_norm(t);
  var wl=wn.length,tl=tn.length;

  // ── Tier 1: Exact match ──
  if(tn===wn)return 10;

  // ── Tier 2: Prefix match ──
  if(tn.indexOf(wn)===0)return 8+Math.min(wl/tl,1);

  // ── Tier 3: Word-boundary prefix ──
  // Check if any word in target starts with query
  var words=tn.split(/[\s\-_\/\.]+/);
  for(var wi=0;wi<words.length;wi++){
    if(words[wi].indexOf(wn)===0)return 6+Math.min(wl/words[wi].length,1);
  }

  // ── Tier 4: Substring match ──
  var si=tn.indexOf(wn);
  if(si!==-1){
    var posBonus=1-Math.min(si/tl,0.8); // Earlier position = better
    return 4+posBonus;
  }

  // ── CJK shortcut: skip edit distance for CJK queries (char-level semantics) ──
  if(/[\u4e00-\u9fff\u3400-\u4dbf]/.test(wn))return 0;

  // ── Tier 5: Edit distance 1 (typo tolerance) ──
  // Try against each word in target and against full target (for short targets)
  if(wl>=2){
    for(var wi=0;wi<words.length;wi++){
      if(Math.abs(words[wi].length-wl)<=1){
        var d=_editDist(wn,words[wi],1);
        if(d<=1)return 3.5+0.5*(1-d);
      }
    }
    // Also try prefix edit distance: first wl chars of target words
    for(var wi=0;wi<words.length;wi++){
      if(words[wi].length>=wl-1){
        var sub=words[wi].substring(0,wl+1);
        var d=_editDist(wn,sub,1);
        if(d<=1)return 3+0.5*(1-d);
      }
    }
  }

  // ── Tier 6: Edit distance 2 (only for longer queries) ──
  if(wl>=4){
    for(var wi=0;wi<words.length;wi++){
      if(Math.abs(words[wi].length-wl)<=2){
        var d=_editDist(wn,words[wi],2);
        if(d<=2)return 1.5+1*(1-d/2);
      }
    }
  }

  // ── Tier 7: Fuzzy subsequence ──
  return _fuzzyScore(wn,tn);
}

// ── Global search item sources ──
// Reads localStorage caches written by other pages (zero-cost if cached).
// Lazy-fetches links.json on first open if not cached.

var _globalLinksReady=false;
var _globalLinksFetching=false;

function _readGlobalLinks(){
  try{var c=localStorage.getItem('swr_links');return c?JSON.parse(c).links:null}catch(_){return null}
}

function _readGlobalMenus(){
  try{
    var r=localStorage.getItem('mlist_raw');
    if(!r)return null;
    var docs=JSON.parse(r);
    return docs.filter(function(d){return d.slug}).map(function(d){
      var name=d.name;
      var en=(name&&(name['en-GB']||name['en']))||d.friendlyName||d.slug||'';
      var zh=(name&&(name['zh-Hans']||name['zh']))||'';
      var locs=d.locations||[];
      var locId=locs.length?locs[0].locId:'';
      return{slug:d.slug,locId:locId,en:en,zh:zh};
    });
  }catch(_){return null}
}

function _globalItems(lng){
  var items=[];
  var seen={};
  function add(title,sub,type,act){
    var k=title.toLowerCase();
    if(seen[k])return;seen[k]=1;
    items.push({q:(title+' '+(sub||'')).toLowerCase(),tl:k,title:title,type:type,act:act});
  }

  // Links from More page
  var links=_readGlobalLinks();
  if(links){
    links.forEach(function(x){
      var t=lng==='zh'&&x.titleZh?x.titleZh:x.title;
      add(t,x.url,'Link',function(){if(x.url.indexOf('http')===0)window.open(x.url,'_blank','noopener');else location.href=x.url});
    });
  }

  // Restaurants from Menus page
  var menus=_readGlobalMenus();
  if(menus){
    menus.forEach(function(m){
      var t=lng==='zh'&&m.zh?m.zh:m.en;
      if(!t)return;
      add(t,'','Menu',function(){location.href='/menus/'+m.slug+(m.locId?'/'+m.locId:'')});
    });
  }

  return{items:items,seen:seen};
}

function _ensureGlobalLinks(cb){
  if(_globalLinksReady||_readGlobalLinks())return;
  if(_globalLinksFetching)return;
  _globalLinksFetching=true;
  fetch('/more/links.json').then(function(r){return r.text()}).then(function(text){
    try{localStorage.setItem('swr_links',text)}catch(_){}
    _globalLinksReady=true;_globalLinksFetching=false;
    if(cb)cb();
  }).catch(function(){_globalLinksFetching=false});
}

function _mergeGlobal(pageItems,lng){
  var seen={};
  pageItems.forEach(function(p){seen[p.tl]=1});
  var g=_globalItems(lng);
  var merged=pageItems.slice();
  g.items.forEach(function(gi){if(!seen[gi.tl])merged.push(gi)});
  return merged;
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

    // Merge page-specific items with global items (deduped by title)
    var pageItems=config.buildItems();
    var lng=curLang();
    cmdItems=_mergeGlobal(pageItems,lng);

    // Lazy-fetch links.json if not cached, then refresh items if palette still open
    _ensureGlobalLinks(function(){
      if(cmdOpen)cmdItems=_mergeGlobal(config.buildItems(),curLang());
    });

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

/* ── Analytics preferences dialog ── */
(function initAnalyticsOpt(){
  var btn=$('#analytics-opt');
  if(!btn)return;

  var overlay=document.createElement('div');
  overlay.className='analytics-dialog-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.tabIndex=-1;

  var dialog=document.createElement('div');
  dialog.className='analytics-dialog';

  var h2=document.createElement('h2');
  h2.id='adlg-title';
  var desc=document.createElement('p');
  desc.id='adlg-desc';
  var toggle=document.createElement('button');
  toggle.className='analytics-toggle';
  var tLabel=document.createElement('span');tLabel.className='atog-label';
  var track=document.createElement('span');track.className='atog-track';
  var thumb=document.createElement('span');thumb.className='atog-thumb';
  track.appendChild(thumb);
  toggle.appendChild(tLabel);toggle.appendChild(track);
  var closeBtn=document.createElement('button');
  closeBtn.className='analytics-dialog-close';

  overlay.setAttribute('aria-labelledby','adlg-title');
  overlay.setAttribute('aria-describedby','adlg-desc');

  dialog.appendChild(h2);dialog.appendChild(desc);dialog.appendChild(toggle);dialog.appendChild(closeBtn);
  overlay.appendChild(dialog);document.body.appendChild(overlay);

  var isOpen=false;
  var prevFocus=null;

  function getState(){
    try{return localStorage.getItem('analytics_consent')==='denied'?'off':'on'}catch(_){return 'on'}
  }

  function applyText(){
    var lng=curLang();
    h2.textContent=chrome('analyticsTitle');
    desc.textContent=chrome('analyticsDesc');
    var state=getState();
    toggle.setAttribute('data-state',state);
    tLabel.textContent=chrome(state==='on'?'analyticsOn':'analyticsOff');
    closeBtn.textContent=chrome('analyticsClose');
    btn.textContent=chrome('manageAnalytics');
  }

  function openDialog(){
    if(isOpen)return;
    if(_cmdHandle&&_cmdHandle.isOpen())_cmdHandle.close();
    isOpen=true;_analyticsDialogOpen=true;
    prevFocus=document.activeElement;
    applyText();
    document.body.style.overflow='hidden';
    overlay.classList.add('open');
    toggle.focus();
  }

  function closeDialog(){
    if(!isOpen)return;
    isOpen=false;_analyticsDialogOpen=false;
    document.body.style.overflow='';
    overlay.classList.remove('open');
    if(prevFocus)prevFocus.focus();
  }

  btn.addEventListener('click',openDialog);

  overlay.addEventListener('click',function(e){
    if(e.target===overlay)closeDialog();
  });

  overlay.addEventListener('keydown',function(e){
    if(e.key==='Escape'){e.preventDefault();closeDialog();return}
    // Focus trap
    if(e.key==='Tab'){
      var focusable=[toggle,closeBtn];
      var first=focusable[0],last=focusable[focusable.length-1];
      if(e.shiftKey){
        if(document.activeElement===first){e.preventDefault();last.focus()}
      }else{
        if(document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
  });

  toggle.addEventListener('click',function(){
    var cur=getState();
    try{localStorage.setItem('analytics_consent',cur==='on'?'denied':'granted')}catch(_){}
    location.reload();
  });

  closeBtn.addEventListener('click',closeDialog);

  // Register strings for the dialog
  registerStrings({
    en:{analyticsTitle:'Analytics Preferences',analyticsDesc:'We use Google Analytics to understand how menuva is used and improve the service. No personal data is collected. You can opt out at any time.',analyticsOn:'Analytics: On',analyticsOff:'Analytics: Off',analyticsClose:'Close',manageAnalytics:'Manage Analytics'},
    zh:{analyticsTitle:'\u5206\u6790\u8bbe\u7f6e',analyticsDesc:'\u6211\u4eec\u4f7f\u7528 Google Analytics \u4e86\u89e3 menuva \u7684\u4f7f\u7528\u60c5\u51b5\u5e76\u6539\u8fdb\u670d\u52a1\u3002\u4e0d\u4f1a\u6536\u96c6\u4e2a\u4eba\u6570\u636e\u3002\u60a8\u53ef\u4ee5\u968f\u65f6\u9009\u62e9\u9000\u51fa\u3002',analyticsOn:'\u5206\u6790\uff1a\u5df2\u5f00\u542f',analyticsOff:'\u5206\u6790\uff1a\u5df2\u5173\u95ed',analyticsClose:'\u5173\u95ed',manageAnalytics:'\u7ba1\u7406\u5206\u6790'}
  });

  // Update button text when language changes
  new MutationObserver(function(){applyText()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-lang']});

  // Apply initial text
  applyText();
})();

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
    if(_analyticsDialogOpen)return;
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
