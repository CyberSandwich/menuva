/**
 * Content page runtime. Bodies for both languages are prerendered by the
 * build step; this module only wires up the language toggle (instant swap
 * via data-lang visibility), the command palette, keyboard shortcuts, and
 * the optional QR overlay (for pages whose <main> has data-qr="{slug}").
 */
import{initCommandPalette,initKeyboard,initLanguage,chrome,registerStrings}from'/js/shared.js?v=18';

registerStrings({
  en:{showQR:'Show QR code'},
  zh:{showQR:'显示二维码'}
});

function applyLangVisibility(lng){
  var els=document.querySelectorAll('[data-lang]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    el.hidden=el.getAttribute('data-lang')!==lng;
  }
}

function initQR(slug,version){
  var overlay=document.createElement('div');
  overlay.className='qr-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','QR Code');
  overlay.tabIndex=-1;
  var card=document.createElement('div');card.className='qr-card';
  var img=document.createElement('img');
  img.alt='QR code for menuva.co.uk/'+slug+'/';
  card.appendChild(img);overlay.appendChild(card);document.body.appendChild(overlay);

  var open=false,prevFocus=null;
  function show(){
    if(open)return;
    if(!img.src)img.src='/qr-'+slug+'.png?v='+version;
    prevFocus=document.activeElement;
    open=true;
    document.body.style.overflow='hidden';
    overlay.classList.add('open');
    overlay.focus();
  }
  function hide(){
    if(!open)return;
    open=false;
    document.body.style.overflow='';
    overlay.classList.remove('open');
    if(prevFocus){try{prevFocus.focus()}catch(_){}prevFocus=null}
  }
  overlay.addEventListener('click',function(e){if(e.target===overlay)hide()});
  overlay.addEventListener('keydown',function(e){
    if(e.key==='Escape'){hide();return}
    if(e.key==='Tab'){e.preventDefault();overlay.focus()}
  });
  card.addEventListener('click',hide);

  var headings=document.querySelectorAll('.doc-heading');
  var label=chrome('showQR')||'Show QR code';
  for(var i=0;i<headings.length;i++){
    var h=headings[i];
    h.setAttribute('role','button');
    h.setAttribute('tabindex','0');
    h.setAttribute('aria-label',label);
    h.addEventListener('click',show);
    h.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){e.preventDefault();show()}
    });
  }
  return{isOpen:function(){return open},close:hide};
}

export function initContentPage(cfg){
  applyLangVisibility(localStorage.getItem('lang')||'en');

  if(window.gtag)window.gtag('event','content_view',{
    transport_type:'beacon',page_kind:'content',content_slug:cfg.slug,
    page_path:location.pathname,page_location:location.href,
    referrer:document.referrer||''
  });

  var main=document.getElementById('main');
  var qrSlug=main&&main.getAttribute('data-qr');
  var qr=qrSlug?initQR(qrSlug,cfg.version||'1'):null;

  var cmd=initCommandPalette({
    buildItems:function(){
      var items=[];
      function add(title,sub,type,act){items.push({q:(title+' '+(sub||'')).toLowerCase(),tl:title.toLowerCase(),title:title,type:type,act:act})}
      add(chrome('home'),'','Page',function(){location.href='/'});
      add(chrome('menus'),'','Page',function(){location.href='/menus/'});
      add(chrome('more'),'','Page',function(){location.href='/more/'});
      return items;
    },
    typePri:{Page:4},
    maxResults:8,
    onBeforeOpen:function(){if(qr&&qr.isOpen())qr.close()}
  });

  initLanguage({
    onApply:function(lng){
      applyLangVisibility(lng);
      if(qr){
        var label=chrome('showQR')||'Show QR code';
        var hs=document.querySelectorAll('.doc-heading');
        for(var i=0;i<hs.length;i++)hs[i].setAttribute('aria-label',label);
      }
    }
  });

  initKeyboard({
    CUR_TAB:2,
    searchInputId:null,
    cardSelector:null,
    modalGuards:function(){return qr?qr.isOpen():false},
    onKey:function(){return false},
    onBack:function(){if(qr&&qr.isOpen()){qr.close();return}location.href='/more/'}
  });
}
