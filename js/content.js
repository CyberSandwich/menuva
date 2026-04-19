/**
 * Content page runtime. Bodies for both languages are prerendered by the
 * build step; this module only wires up the language toggle (instant swap
 * via data-lang visibility), the command palette, and keyboard shortcuts.
 */
import{initCommandPalette,initKeyboard,initLanguage,chrome}from'/js/shared.js?v=9';

function applyLangVisibility(lng){
  var els=document.querySelectorAll('[data-lang]');
  for(var i=0;i<els.length;i++){
    var el=els[i];
    el.hidden=el.getAttribute('data-lang')!==lng;
  }
}

export function initContentPage(cfg){
  applyLangVisibility(localStorage.getItem('lang')||'en');

  if(window.gtag)window.gtag('event','content_view',{
    transport_type:'beacon',page_kind:'content',content_slug:cfg.slug,
    page_path:location.pathname,page_location:location.href,
    referrer:document.referrer||''
  });

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

  initLanguage({onApply:applyLangVisibility});

  initKeyboard({
    CUR_TAB:2,
    searchInputId:null,
    cardSelector:null,
    modalGuards:function(){return false},
    onKey:function(){return false},
    onBack:function(){location.href='/more/'}
  });
}
