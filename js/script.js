/* ===== 0. 상품 데이터 [수정가이드] 상품 추가/수정은 이 배열만 편집 (HTML 수정 불필요)
   img: 공식 이미지로 교체 가능 / story: D.S.&DURGA처럼 향을 한 줄 이야기로 소개 ===== */
const PRODUCTS=[
 {id:'orpheon',cat:'perfume',name:'ORPHÉON',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600',story:'재즈바의 문이 열리면, 우드와 주니퍼가 먼저 인사합니다.'},
 {id:'philosykos',cat:'perfume',name:'PHILOSYKOS',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',story:'그리스 무화과나무 아래, 오후 세 시의 초록빛.'},
 {id:'doson',cat:'perfume',name:'DO SON',sub:'EAU DE PARFUM',price:215000,img:'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600',story:'베트남 항구에 번지던 하얀 꽃의 저녁.'},
 {id:'baies',cat:'candle',name:'BAIES',sub:'SCENTED CANDLE',price:98000,img:'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600',story:'블랙커런트와 장미, 오래된 편지에 번진 향.'},
 {id:'figuier',cat:'candle',name:'FIGUIER',sub:'SCENTED CANDLE',price:98000,img:'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=600',story:'무화과 잎을 비벼 만든 초록의 온기.'},
 {id:'lotion',cat:'body',name:'HAND & BODY',sub:'LOTION',price:62000,img:'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',story:'매일 아침, 기억을 피부 위에 얹는 일.'}
];
const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)],won=n=>n.toLocaleString('ko-KR')+'원';
const mqMobile=matchMedia('(max-width:768px)');   // CSS의 모바일 구간(768px 이하)과 동일하게 유지

/* 이미지 로딩 실패 시 플레이스홀더(SVG)로 자동 대체 → 이미지 주소만 바꾸면 됨 */
document.addEventListener('error',e=>{const i=e.target;if(i.tagName!=='IMG'||i.dataset.fail)return;i.dataset.fail=1;
 i.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#B5A58E"/><text x="50%" y="50%" fill="#252321" font-family="serif" font-size="28" text-anchor="middle">${i.dataset.ph||'IMAGE'}</text></svg>`)},true);

/* 터치 스와이프 공통 함수: 가로로 충분히 움직였고, 세로보다 가로 이동이 클 때만 인식
   → 세로 스크롤 중 손가락이 살짝 옆으로 흘러도 슬라이드가 넘어가지 않음 */
function swipe(el,cb){let x=0,y=0;
 el.addEventListener('touchstart',e=>{x=e.touches[0].clientX;y=e.touches[0].clientY},{passive:true});
 el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x,dy=e.changedTouches[0].clientY-y;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)cb(dx<0?1:-1)},{passive:true})}

/* ===== 1. 헤더: 햄버거 메뉴 / PC 메가메뉴 ===== */
const header=$('#header'),nav=$('#nav'),burger=$('#burger');
function setNav(on){nav.classList.toggle('open',on);header.classList.toggle('menu-open',on);
 burger.setAttribute('aria-expanded',on);burger.setAttribute('aria-label',on?'메뉴 닫기':'메뉴 열기')}
burger.addEventListener('click',()=>setNav(!nav.classList.contains('open')));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>setNav(false)));
$$('#nav .mega a').forEach(a=>a.addEventListener('click',()=>{setNav(false);closeMega()}));
/* 메뉴 바깥을 누르면 닫기 */
document.addEventListener('pointerdown',e=>{
 if(!e.target.closest('#header')&&nav.classList.contains('open'))setNav(false);
 if(!e.target.closest('.has-mega'))closeMega()});

const megaItems=$$('#nav .has-mega');let megaTimer;
function closeMega(){clearTimeout(megaTimer);megaItems.forEach(i=>i.classList.remove('mega-open'))}
megaItems.forEach(item=>{
 const show=e=>{if(e.pointerType==='touch'||mqMobile.matches)return;clearTimeout(megaTimer);
  megaItems.forEach(o=>o!==item&&o.classList.remove('mega-open'));item.classList.add('mega-open')};
 const hide=e=>{if(e.pointerType==='touch'||mqMobile.matches)return;clearTimeout(megaTimer);
  megaTimer=setTimeout(()=>item.classList.remove('mega-open'),300)};
 item.addEventListener('pointerenter',show);item.addEventListener('pointerleave',hide);   // 패널이 li 안에 있으므로 li 하나로 충분
 /* 터치 태블릿(iPad 등): 첫 번째 탭 = 하위 메뉴 열기, 두 번째 탭 = 이동 (hover가 없는 기기 대응) */
 $('a',item).addEventListener('click',e=>{if(mqMobile.matches)return;
  if(!item.classList.contains('mega-open')){e.preventDefault();megaItems.forEach(o=>o.classList.remove('mega-open'));item.classList.add('mega-open')}
  else closeMega()})});

/* ===== 2. 메인 슬라이드 [수정가이드] 전환 간격 DELAY(ms) / 화살표·터치 스와이프 지원 ===== */
const DELAY=6000,slides=$$('.slide');let cur=0,timer;
function go(n){cur=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('on',i===cur));
 $('#count').textContent=`0${cur+1} / 0${slides.length}`;clearInterval(timer);timer=setInterval(()=>go(cur+1),DELAY)}
$('.hero .prev').onclick=()=>go(cur-1);$('.hero .next').onclick=()=>go(cur+1);go(0);
swipe($('.hero'),d=>go(cur+d));

/* ===== 3. SHOP 캐러셀: 가운데 상품 확대, 좌우는 축소·반투명 / 카테고리 탭 필터 ===== */
let list=[...PRODUCTS],idx=0,qty=1,mul=1;
const stage=$('#stage');
function build(filter='all'){list=PRODUCTS.filter(p=>filter==='all'||p.cat===filter);idx=0;qty=1;mul=1;
 stage.innerHTML=list.map((p,i)=>`<div class="item" data-i="${i}"><div class="arch"><img src="${p.img}" alt="${p.name}" data-ph="${p.name}" loading="lazy" decoding="async"></div><h4>${p.name}</h4></div>`).join('');
 $$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.filter===filter));layout();detail()}
/* 배치만 담당(상세 패널은 건드리지 않음) → 주소창이 접히며 resize가 발생해도 선택창/수량 UI가 다시 그려지지 않음 */
function layout(direction=0,previousIdx=idx){
 const w=stage.clientWidth,mobile=mqMobile.matches,vis=mobile?1:2;         // 모바일은 좌우 1개씩만 보이게
 const gap=mobile?w*.3:Math.max(40,Math.min(250,(w/2-130)/2));
 const total=list.length;
 const getOffset=(i,center)=>{let o=i-center;if(o>total/2)o-=total;if(o<-total/2)o+=total;return o};
 $$('.item',stage).forEach((el,i)=>{
  const o=getOffset(i,idx),oldO=getOffset(i,previousIdx),dist=Math.abs(o);
  const scale=dist===0?1.1:dist===1?.88:.72;
  const opacity=dist>vis?0:dist===0?1:dist===1?.65:.45;
  const pos=Math.max(-(vis+1),Math.min(vis+1,o));                          // 화면 밖 상품은 한 칸 바깥에 대기
  const transform=`translateX(calc(-50% + ${pos*gap}px)) scale(${scale})`;
  if(direction!==0&&Math.abs(o-oldO)>1){                                   // 순환하며 크게 이동하는 상품은 애니메이션 생략
   el.style.transition='none';el.style.opacity=0;el.style.transform=transform;void el.offsetWidth;
   el.style.transition='';el.style.opacity=opacity;
  }else{el.style.transform=transform;el.style.opacity=opacity}
  el.style.pointerEvents=dist>vis?'none':'auto';el.style.zIndex=10-dist});
}
function select(i,d=0){const prev=idx;idx=i;qty=1;mul=1;layout(d,prev);detail()}
const move=d=>select((idx+d+list.length)%list.length,d);
$('.c-prev').onclick=()=>move(-1);$('.c-next').onclick=()=>move(1);swipe(stage,move);
stage.onclick=e=>{const it=e.target.closest('.item');if(it)select(+it.dataset.i)};
$$('.tabs button').forEach(b=>b.onclick=()=>build(b.dataset.filter));
$$('.mega [data-filter]').forEach(a=>a.addEventListener('click',()=>build(a.dataset.filter)));
/* 상세 패널(퀵뷰 역할): 용량 옵션 + 수량 변경 + BUY NOW */
function detail(){const p=list[idx];if(!p)return;
 $('#detail').innerHTML=`<h3>${p.name}</h3><p class="sub">${p.sub}</p><p class="story-line">${p.story}</p>
 <div class="opts"><select id="opt" aria-label="용량"><option value="1" ${mul==1?'selected':''}>50ml</option><option value="1.45" ${mul==1.45?'selected':''}>100ml</option></select>
 <span class="qty"><button type="button" id="m" aria-label="수량 감소">−</button><span>${qty}</span><button type="button" id="pl" aria-label="수량 증가">+</button></span><b>${won(Math.round(p.price*mul*qty))}</b></div>
 <button type="button" class="btn" id="buy">BUY NOW</button>`;
 $('#opt').onchange=e=>{mul=+e.target.value;detail()};$('#m').onclick=()=>{qty=Math.max(1,qty-1);detail()};$('#pl').onclick=()=>{qty++;detail()};
 $('#buy').onclick=()=>addCart(p.id,qty,mul==1?'50ml':'100ml',mul)}
build();
/* 스테이지 너비가 실제로 바뀔 때만 재배치 (iOS 주소창 높이 변화로 생기는 resize는 무시) */
let lastW=stage.clientWidth;
const relayout=()=>{const w=stage.clientWidth;if(w!==lastW){lastW=w;layout()}};
if('ResizeObserver' in window)new ResizeObserver(relayout).observe(stage);else addEventListener('resize',relayout);
addEventListener('orientationchange',()=>setTimeout(()=>{lastW=-1;relayout()},250));
addEventListener('load',()=>{lastW=-1;relayout()});
addEventListener('resize',()=>{if(!mqMobile.matches)setNav(false)});

/* ===== 4. 팝업(공통) + 장바구니 (localStorage 저장 → 새로고침해도 유지) ===== */
const overlay=$('#overlay');
const openPanel=el=>{el.classList.add('on');overlay.classList.add('on')};
const closeAll=()=>{$$('.on.modal,.on.drawer').forEach(e=>e.classList.remove('on'));overlay.classList.remove('on')};
overlay.onclick=closeAll;
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
$('#cartBtn').onclick=()=>openPanel($('#cart'));$('#closeCart').onclick=closeAll;drawCart();
$('#mypageBtn').onclick=e=>{e.preventDefault();setNav(false);openPanel($('#mypage'))};

/* ===== 5. 스크롤 효과: 페이드인 / 스토리 연도 전환 / 패럴랙스 / 이미지 확대 ===== */
/* 페이드인: 한 번 보이면 관찰 해제 */
if('IntersectionObserver' in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');io.unobserve(e.target)}}),{threshold:.15});
 $$('.reveal').forEach(el=>io.observe(el));
}else $$('.reveal').forEach(el=>el.classList.add('show'));

const story=$('#story'),px=$('.parallax'),yearEl=$('#year'),letters=$$('.letter'),zooms=$$('[data-zoom]');
px.style.backgroundImage=`url(${px.dataset.bg})`;
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches; // 접근성: 모션 줄이기 설정 시 효과 해제

/* 스크롤 이벤트는 프레임당 1회(requestAnimationFrame)만 처리 + passive → 실제 폰에서 버벅임·흔들림 방지 */
let ticking=false;
function update(){ticking=false;const vh=innerHeight;
 header.classList.toggle('solid',scrollY>20);
 const sr=story.getBoundingClientRect();
 if(sr.bottom>-100&&sr.top<vh+100){
  /* 연도: 화면 세로 중앙에 가장 가까운 카드의 연도 (PC/모바일 공통, 순서가 뒤바뀌지 않음) */
  let best=letters[0],bd=Infinity;
  letters.forEach(l=>{const r=l.getBoundingClientRect(),d=Math.abs(r.top+r.height/2-vh/2);if(d<bd){bd=d;best=l}});
  if(yearEl.textContent!==best.dataset.year)yearEl.textContent=best.dataset.year;
  /* 패럴랙스: 이동량을 배경이 남는 범위(섹션 높이의 15%) 안으로 제한 → 배경 가장자리가 비어 보이지 않음 */
  if(!calm){const lim=sr.height*.15,off=(sr.top+sr.height/2-vh/2)*-.2;
   px.style.transform=`translate3d(0,${Math.max(-lim,Math.min(lim,off))}px,0)`}
 }
 if(!calm)zooms.forEach(im=>{const b=im.getBoundingClientRect();if(b.bottom<0||b.top>vh)return;
  const p=1-Math.min(Math.max(b.top/vh,0),1);im.style.transform=`scale(${1+p*.18})`}); /* 확대 강도: .18 조절 */
}
const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}};
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);update();
