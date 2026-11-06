/* =====================================================================
   DIPTYQUE — script.js (v5)
   0 데이터/유틸 · 1 헤더·메뉴 · 2 메인 슬라이드 · 3 SHOP 캐러셀·상세 · 4 장바구니·팝업 · 5 스크롤 효과
   ===================================================================== */

/* ===== 0. 상품 데이터 [수정가이드] 상품 추가/수정은 이 배열만 편집 (HTML 수정 불필요) ===== */
const PRODUCTS=[
 {id:'orpheon',cat:'perfume',name:'ORPHÉON',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',story:'재즈바의 문이 열리면, 우드와 주니퍼가 먼저 인사합니다.'},
 {id:'philosykos',cat:'perfume',name:'PHILOSYKOS',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',story:'그리스 무화과나무 아래, 오후 세 시의 초록빛.'},
 {id:'doson',cat:'perfume',name:'DO SON',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600',story:'베트남 항구에 번지던 하얀 꽃의 저녁.'},
 {id:'baies',cat:'candle',name:'BAIES',sub:'SCENTED CANDLE',price:98000,img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600',story:'블랙커런트와 장미, 오래된 편지에 번진 향.'},
 {id:'figuier',cat:'candle',name:'FIGUIER',sub:'SCENTED CANDLE',price:98000,img:'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600',story:'무화과 잎을 비벼 만든 초록의 온기.'},
 {id:'lotion',cat:'body',name:'HAND & BODY',sub:'LOTION',price:62000,img:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',story:'매일 아침, 기억을 피부 위에 얹는 일.'}
];
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)],won=n=>n.toLocaleString('ko-KR')+'원';
const wide=matchMedia('(min-width:768px)');                         // CSS의 PC 구간(768px 이상)과 동일
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;  // 접근성: 모션 줄이기

/* 이미지 로딩 실패 시 플레이스홀더(SVG)로 자동 대체 → 이미지 주소만 바꾸면 됨 */
document.addEventListener('error',e=>{const i=e.target;if(!i||i.tagName!=='IMG'||i.dataset.fail)return;i.dataset.fail=1;
 i.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#B5A58E"/><text x="50%" y="50%" fill="#252321" font-family="serif" font-size="28" text-anchor="middle">${i.dataset.ph||i.alt||'IMAGE'}</text></svg>`)},true);

/* 터치 스와이프: 가로 이동이 세로보다 충분히 클 때만 인식 (세로 스크롤과 충돌 방지) */
function swipe(el,cb){let x=0,y=0;
 el.addEventListener('touchstart',e=>{x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});
 el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)cb(dx<0?1:-1)},{passive:true})}

/* ===== 1. 헤더: 모바일 햄버거 / PC 메가메뉴 ===== */
const header=$('#header'),nav=$('#nav'),burger=$('#burger');
function setNav(on){header.classList.toggle('menu-open',on);burger.setAttribute('aria-expanded',on);burger.setAttribute('aria-label',on?'메뉴 닫기':'메뉴 열기')}
burger.addEventListener('click',()=>setNav(!header.classList.contains('menu-open')));
$$('#nav a').forEach(a=>a.addEventListener('click',e=>{
 if(wide.matches&&a.parentElement.classList.contains('has-mega'))return;   // PC 상위메뉴: 아래 터치 처리에서 담당
 setNav(false);closeMega()}));
document.addEventListener('pointerdown',e=>{
 if(!e.target.closest('#header'))setNav(false);
 if(!e.target.closest('.has-mega'))closeMega()});
wide.addEventListener('change',()=>{setNav(false);closeMega()});

const megaItems=$$('#nav .has-mega');let megaTimer;
function closeMega(){clearTimeout(megaTimer);megaItems.forEach(i=>i.classList.remove('mega-open'))}
megaItems.forEach(item=>{
 const show=e=>{if(e.pointerType==='touch'||!wide.matches)return;clearTimeout(megaTimer);megaItems.forEach(o=>o!==item&&o.classList.remove('mega-open'));item.classList.add('mega-open')};
 const hide=e=>{if(e.pointerType==='touch'||!wide.matches)return;clearTimeout(megaTimer);megaTimer=setTimeout(()=>item.classList.remove('mega-open'),300)};
 item.addEventListener('pointerenter',show);item.addEventListener('pointerleave',hide);
 /* 터치 태블릿(hover 없음): 첫 탭 = 하위메뉴 열기, 두 번째 탭 = 이동 */
 $('a',item).addEventListener('click',e=>{if(!wide.matches)return;
  if(!item.classList.contains('mega-open')){e.preventDefault();megaItems.forEach(o=>o.classList.remove('mega-open'));item.classList.add('mega-open')}
  else{closeMega();setNav(false)}})});

/* ===== 2. 메인 슬라이드 [수정가이드] 전환 간격 DELAY(ms) / 화살표·터치 스와이프 ===== */
const DELAY=6000,slides=$$('.slide');let cur=0,timer;
function go(n){cur=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('on',i===cur));
 $('#count').textContent=`0${cur+1} / 0${slides.length}`;clearInterval(timer);timer=setInterval(()=>go(cur+1),DELAY)}
$('.hero .prev').onclick=()=>go(cur-1);$('.hero .next').onclick=()=>go(cur+1);go(0);
swipe($('.hero'),d=>go(cur+d));

/* ===== 3. SHOP 캐러셀 (가로 스냅 스크롤) + 카테고리 탭 + 상세 ===== */
const track=$('#track');let list=[...PRODUCTS],idx=0,qty=1,mul=1,scrollTick=false,progTimer;
function build(filter='all'){
 list=PRODUCTS.filter(p=>filter==='all'||p.cat===filter);idx=0;qty=1;mul=1;
 track.innerHTML=list.map((p,i)=>`<div class="item${i?'':' on'}" data-i="${i}"><div class="arch"><img src="${p.img}" alt="${p.name}" data-ph="${p.name}" loading="lazy" decoding="async"></div><h4>${p.name}<span class="pr">${won(p.price)}</span></h4></div>`).join('');
 track.scrollLeft=0;
 $$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.filter===filter));detail()}
function centerOf(i,smooth=true){const el=$$('.item',track)[i];if(!el)return;
 track.scrollTo({left:el.offsetLeft-(track.clientWidth-el.offsetWidth)/2,behavior:smooth&&!calm?'smooth':'auto'})}
function setActive(i){if(i===idx)return;idx=i;qty=1;mul=1;$$('.item',track).forEach((el,k)=>el.classList.toggle('on',k===i));detail()}
/* 스크롤 중: 가운데에 가장 가까운 상품을 선택 상태로 (프레임당 1회) */
function onTrackScroll(){if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{scrollTick=false;
 const mid=track.scrollLeft+track.clientWidth/2;let best=0,bd=Infinity;
 $$('.item',track).forEach((el,k)=>{const d=Math.abs(el.offsetLeft+el.offsetWidth/2-mid);if(d<bd){bd=d;best=k}});setActive(best)})}
track.addEventListener('scroll',onTrackScroll,{passive:true});
const move=d=>centerOf((idx+d+list.length)%list.length);                  // 끝에서 다음 = 처음으로
$('.c-prev').onclick=()=>move(-1);$('.c-next').onclick=()=>move(1);
track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1)}if(e.key==='ArrowLeft'){e.preventDefault();move(-1)}});
track.addEventListener('click',e=>{const it=e.target.closest('.item');if(it)centerOf(+it.dataset.i)});
$$('.tabs button').forEach(b=>b.onclick=()=>build(b.dataset.filter));
$$('.mega [data-filter]').forEach(a=>a.addEventListener('click',()=>build(a.dataset.filter)));
/* 상세 패널: 용량 옵션 + 수량 + BUY NOW */
function detail(){const p=list[idx];if(!p)return;
 $('#detail').innerHTML=`<h3>${p.name}</h3><p class="sub">${p.sub}</p><p class="story-line">${p.story}</p>
 <div class="opts"><b>${won(Math.round(p.price*mul*qty))}</b><select id="opt" aria-label="용량"><option value="1" ${mul==1?'selected':''}>50ml</option><option value="1.45" ${mul==1.45?'selected':''}>100ml</option></select>
 <span class="qty"><button type="button" id="m" aria-label="수량 감소">−</button><span>${qty}</span><button type="button" id="pl" aria-label="수량 증가">+</button></span></div>
 <button type="button" class="btn" id="buy">BUY NOW</button>`;
 $('#opt').onchange=e=>{mul=+e.target.value;detail()};$('#m').onclick=()=>{qty=Math.max(1,qty-1);detail()};$('#pl').onclick=()=>{qty++;detail()};
 $('#buy').onclick=()=>addCart(p.id,qty,mul==1?'50ml':'100ml',mul)}
build();
/* 폰트/이미지 로딩 후 레이아웃이 바뀌어도 선택된 상품을 가운데로 유지 */
addEventListener('load',()=>centerOf(idx,false));
if('ResizeObserver' in window){let w=track.clientWidth;new ResizeObserver(()=>{if(track.clientWidth!==w){w=track.clientWidth;centerOf(idx,false)}}).observe(track)}

/* ===== 4. 팝업(공통) + 장바구니 (localStorage 저장) ===== */
const panels=$('#panels');
const openPanel=el=>{el.classList.add('on');panels.classList.add('open')};
const closeAll=()=>{$$('.on.modal,.on.drawer').forEach(e=>e.classList.remove('on'));panels.classList.remove('open')};
$('#overlay').onclick=closeAll;
addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();setNav(false);closeMega()}});
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a)addCart(a.dataset.add,1);if(e.target.closest('[data-close]'))closeAll()});
/* iOS 사생활 보호 모드 등 localStorage가 막힌 환경에서도 오류 없이 동작 */
const store={get(){try{return JSON.parse(localStorage.getItem('dq-cart')||'[]')}catch(e){return[]}},set(v){try{localStorage.setItem('dq-cart',JSON.stringify(v))}catch(e){}}};
let cart=store.get();
function addCart(id,q,opt='50ml',m=1){const k=cart.find(c=>c.id===id&&c.opt===opt);k?k.qty+=q:cart.push({id,qty:q,opt,mul:m});drawCart();openPanel($('#cart'))}
function drawCart(){store.set(cart);let t=0,c=0;
 $('#cartList').innerHTML=cart.map((x,i)=>{const p=PRODUCTS.find(q=>q.id===x.id)||PRODUCTS[0],s=Math.round(p.price*x.mul)*x.qty;t+=s;c+=x.qty;
 return`<div class="row"><span>${p.name}<br><small>${x.opt}</small></span><span><button type="button" data-q="${i}" data-d="-1" aria-label="감소">−</button> ${x.qty} <button type="button" data-q="${i}" data-d="1" aria-label="증가">+</button></span><span>${won(s)}</span></div>`}).join('')||'<p>장바구니가 비어 있습니다.</p>';
 $('#total').textContent=won(t);$('#cartCount').textContent=c}
$('#cartList').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;const x=cart[b.dataset.q];x.qty+=+b.dataset.d;if(x.qty<1)cart.splice(b.dataset.q,1);drawCart()};
$('#cartBtn').onclick=()=>{setNav(false);openPanel($('#cart'))};$('#closeCart').onclick=closeAll;drawCart();
$('#mypageBtn').onclick=e=>{e.preventDefault();setNav(false);openPanel($('#mypage'))};

/* ===== 5. 스크롤 효과: 페이드인(전 기기) / 스토리 연도·패럴랙스·이미지 확대(PC 전용) ===== */
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.12});
 $$('.reveal').forEach(el=>io.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('show'));

const story=$('#story'),px=$('.parallax'),yearEl=$('#year'),letters=$$('.letter'),zooms=$$('[data-zoom]');
px.style.backgroundImage=`url(${px.dataset.bg})`;
let ticking=false;
function update(){ticking=false;if(!wide.matches){yearEl.textContent=letters[0].dataset.year;return}   // 모바일: 가벼운 일반 스크롤(효과 없음), 연도는 카드마다 표시
 const vh=innerHeight,sr=story.getBoundingClientRect();
 if(sr.bottom>-100&&sr.top<vh+100){
  let best=letters[0],bd=Infinity;                                         // 화면 중앙에 가장 가까운 카드의 연도
  letters.forEach(l=>{const r=l.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=l}});
  if(yearEl.textContent!==best.dataset.year)yearEl.textContent=best.dataset.year;
  if(!calm){const lim=sr.height*.15,off=(sr.top+sr.height/2-vh/2)*-.2;px.style.transform=`translate3d(0,${Math.max(-lim,Math.min(lim,off))}px,0)`}}
 if(!calm)zooms.forEach(im=>{const b=im.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;const p=1-Math.min(Math.max(b.top/vh,0),1);im.style.transform=`scale(${1+p*.18})`}) /* 확대 강도 .18 */
}
const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);
wide.addEventListener('change',()=>{px.style.transform='';zooms.forEach(im=>im.style.transform='');update()});
update();
