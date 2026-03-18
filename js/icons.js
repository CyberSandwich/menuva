// Centralized SVG icon paths (stroke-based, 24x24 viewBox)
// Import: import { ICONS, mkIcon, matchMenuIcon, matchLinkIcon } from '/js/icons.js?v=7';

export var ICONS={

  // ── Link page icons ──
  mail:'<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  'help-circle':'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  smartphone:'<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'message-square':'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  'book-open':'<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
  'plus-circle':'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
  sliders:'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  'trending-up':'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>',
  award:'<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  users:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'file-text':'<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  flask:'<path d="M9 3h6"/><path d="M10 3v6.5L3.3 19.4a1.5 1.5 0 001.3 2.1h14.8a1.5 1.5 0 001.3-2.1L14 9.5V3"/>',
  archive:'<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  user:'<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  keyboard:'<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01"/><line x1="8" y1="14" x2="16" y2="14"/>',

  // ── Menu / food icons ──
  cutlery:'<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3"/><path d="M18 15v7"/>',
  coffee:'<path d="M17 8h1a4 4 0 010 8h-1"/><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
  pizza:'<path d="M12 3L2 21h20z"/><path d="M2 21a10 4 0 0 1 20 0"/><circle cx="10" cy="14" r="1.5"/><circle cx="14" cy="10" r="1.5"/>',
  burger:'<path d="M5 11a7 5 0 0 1 14 0"/><line x1="3" y1="14" x2="21" y2="14"/><rect x="4" y="17" width="16" height="4" rx="2"/>',
  noodle:'<path d="M3 13h18c0 5-4 8-9 8s-9-3-9-8z"/><line x1="9" y1="2" x2="14" y2="12"/><line x1="15" y1="2" x2="10" y2="12"/>',
  taco:'<path d="M4 18c0-5.5 3.6-10 8-10s8 4.5 8 10"/><line x1="3" y1="18" x2="21" y2="18"/><path d="M7 14c1.5-2 3-3 5-3s3.5 1 5 3"/>',
  fish:'<path d="M6.5 12c3-6 13-6 16 0-3 6-13 6-16 0z"/><path d="M18 12h.01"/><path d="M2 9l4.5 3L2 15"/>',
steak:'<rect x="2" y="8" width="20" height="10" rx="2"/><line x1="11" y1="8" x2="5" y2="18"/><line x1="17" y1="8" x2="11" y2="18"/>',
  duck:'<circle cx="16" cy="8" r="4"/><path d="M2 18c0-6 4-10 10-10"/><path d="M20 8h3"/>',
  leaf:'<path d="M12 2c3 3 7 8 7 11a7 7 0 0 1-14 0C5 10 9 5 12 2z"/><line x1="12" y1="20" x2="12" y2="13"/><line x1="12" y1="20" x2="12" y2="24"/>',
  bread:'<path d="M4 14h16v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 14c0-5 16-5 16 0"/><line x1="9" y1="12" x2="9" y2="14"/><line x1="15" y1="12" x2="15" y2="14"/>',
  cake:'<rect x="2" y="14" width="20" height="8" rx="1"/><path d="M4 14v-2a2 2 0 012-2h12a2 2 0 012 2v2"/><path d="M12 4v6"/><circle cx="12" cy="3" r="1"/>',
  'ice-cream':'<circle cx="12" cy="8" r="5"/><path d="M8 13h8L12 22z"/><line x1="10" y1="16" x2="14" y2="16"/>',
  beer:'<path d="M17 8h3a2 2 0 012 2v2a2 2 0 01-2 2h-3"/><rect x="3" y="6" width="14" height="16" rx="1"/><path d="M3 10h14"/>',
  tea:'<path d="M17 10h2a2 2 0 0 1 0 4h-2"/><path d="M3 10h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-6z"/><line x1="7" y1="7" x2="8" y2="3"/><line x1="11" y1="7" x2="12" y2="3"/>',
  bowl:'<path d="M4 11h16c0 4.4-3.6 8-8 8s-8-3.6-8-8z"/><line x1="8" y1="8" x2="9" y2="3"/><line x1="12" y1="8" x2="13" y2="3"/><line x1="16" y1="8" x2="17" y2="3"/>',
  cookie:'<circle cx="12" cy="12" r="10"/><path d="M15 8h.01"/><path d="M10 7h.01"/><path d="M8 13h.01"/><path d="M13 13h.01"/><path d="M11 17h.01"/>',
  cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  wine:'<path d="M8 22h8"/><path d="M12 15v7"/><path d="M5 2h14l-1 8a6 6 0 01-12 0L5 2z"/>',
  egg:'<ellipse cx="12" cy="15" rx="9" ry="7"/><circle cx="12" cy="14" r="3"/>'
};

// ── Menu keyword matching ──

var MENU_KEYWORDS=[
  {i:'coffee',w:['coffee','cafe','café','espresso','latte','cappuccino','mocha','roast']},
  {i:'tea',w:['tea','boba','bubble','chai','matcha']},
  {i:'pizza',w:['pizza','pizzeria']},
  {i:'burger',w:['burger','smash']},
  {i:'noodle',w:['noodle','ramen','pho','udon','soba','pasta','spaghetti','sushi','japanese','maki']},
  {i:'taco',w:['taco','mexican','burrito','nacho','quesadilla']},
  {i:'fish',w:['fish','seafood','poke','prawn','shrimp','lobster','crab']},
{i:'steak',w:['steak','beef','bbq','grill','smokehouse','meat']},
  {i:'duck',w:['duck','peking']},
{i:'leaf',w:['salad','vegan','vegetarian','veggie','plant','green','organic']},
  {i:'bread',w:['bakery','bread','pastry','bake','croissant','boulangerie','patisserie']},
  {i:'cake',w:['cake','dessert','sweet','cupcake']},
  {i:'cookie',w:['cookie','biscuit','cookies']},
  {i:'ice-cream',w:['ice cream','gelato','frozen','yogurt','froyo']},
  {i:'beer',w:['bar','pub','beer','ale','brewery','tavern']},
  {i:'wine',w:['wine','vineyard','winery','vino']},
  {i:'bowl',w:['bowl','curry','rice','thai','indian','chinese','asian','wok','acai']},
  {i:'egg',w:['breakfast','brunch','egg','pancake','waffle','diner']},
  {i:'cart',w:['street','truck','cart','vendor','stall','market']}
];

export function matchMenuIcon(name){
  var n=name.toLowerCase();
  for(var k=0;k<MENU_KEYWORDS.length;k++){
    var kw=MENU_KEYWORDS[k];
    for(var j=0;j<kw.w.length;j++){
      if(n.indexOf(kw.w[j])!==-1)return kw.i;
    }
  }
  return'cutlery';
}

// ── Link keyword matching ──

var LINK_KEYWORDS=[
  {i:'mail',w:['contact','email','mail']},
  {i:'help-circle',w:['faq','help','question']},
  {i:'smartphone',w:['app store','download','phone']},
  {i:'message-square',w:['feedback','message']},
  {i:'book-open',w:['tutorial','guide','book']},
  {i:'plus-circle',w:['add your']},
  {i:'sliders',w:['admin','portal','settings','dashboard']},
  {i:'trending-up',w:['investor']},
  {i:'user',w:['founder','meet the']},
  {i:'globe',w:['my.wbs']},
  {i:'award',w:['university','warwick']},
  {i:'edit',w:['wbs']},
  {i:'users',w:['team','career','join our']},
  {i:'shield',w:['privacy']},
  {i:'file-text',w:['terms','condition']},
  {i:'list',w:['feature']},
  {i:'keyboard',w:['shortcut','keyboard']},
  {i:'flask',w:['beta','test']},
  {i:'archive',w:['promotion','promo','archive','january']}
];

export function matchLinkIcon(title){
  var n=title.toLowerCase();
  for(var k=0;k<LINK_KEYWORDS.length;k++){
    var kw=LINK_KEYWORDS[k];
    for(var j=0;j<kw.w.length;j++){
      if(n.indexOf(kw.w[j])!==-1)return kw.i;
    }
  }
  return null;
}

// ── Renderer ──

var DEFAULT='<path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>';
var SVG_WRAP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">';

export function mkIcon(key,status){
  var d=document.createElement('div');
  d.className='picon'+(status==='open'?' picon-open':status==='closed'?' picon-closed':'');
  d.insertAdjacentHTML('afterbegin',SVG_WRAP+(key&&ICONS[key]||DEFAULT)+'</svg>');
  return d;
}
