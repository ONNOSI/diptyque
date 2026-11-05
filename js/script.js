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
/* 이미지 로딩 실패 시 플레이스홀더(SVG)로 자동 대체 → 이미지 주소만 바꾸면 됨 */
document.addEventListener('error',e=>{const i=e.target;if(i.tagName!=='IMG'||i.dataset.fail)return;i.dataset.fail=1;
 i.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#B5A58E"/><text x="50%" y="50%" fill="#252321" font-family="serif" font-size="28" text-anchor="middle">${i.dataset.ph||'IMAGE'}</text></svg>`)},true);

/* ===== 1. 헤더: 스크롤 시 배경 전환 / 모바일 햄버거 ===== */
addEventListener('scroll',()=>$('#header').classList.toggle('solid',scrollY>60));
$('#burger').onclick=()=>$('#nav').classList.toggle('open');
$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));


/* ===== MEGA MENU 마우스 이동 안정화 ===== */
let megaCloseTimer;

$$('#nav .has-mega').forEach(item => {
    const panel = $('.mega', item);

    const showMenu = () => {
        clearTimeout(megaCloseTimer);

        $$('#nav .has-mega').forEach(other => {
            if (other !== item) other.classList.remove('mega-open');
        });

        item.classList.add('mega-open');
    };

    const hideMenu = () => {
        clearTimeout(megaCloseTimer);

        megaCloseTimer = setTimeout(() => {
            item.classList.remove('mega-open');
        }, 300);
    };

    item.addEventListener('pointerenter', showMenu);
    item.addEventListener('pointerleave', hideMenu);

    panel.addEventListener('pointerenter', showMenu);
    panel.addEventListener('pointerleave', hideMenu);
});


/* ===== 2. 메인 슬라이드 [수정가이드] 전환 간격 DELAY(ms) / 화살표·터치 스와이프 지원 ===== */
const DELAY=6000,slides=$$('.slide');let cur=0,timer;
function go(n){cur=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('on',i===cur));
 $('#count').textContent=`0${cur+1} / 0${slides.length}`;clearInterval(timer);timer=setInterval(()=>go(cur+1),DELAY)}
$('.hero .prev').onclick=()=>go(cur-1);$('.hero .next').onclick=()=>go(cur+1);go(0);
function swipe(el,cb){let x=0;el.addEventListener('touchstart',e=>x=e.touches[0].clientX,{passive:true});
 el.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)cb(d<0?1:-1)})}
swipe($('.hero'),d=>go(cur+d));

/* ===== 3. SHOP 캐러셀: 가운데 상품 확대, 좌우는 축소·반투명 / 카테고리 탭 필터 ===== */
let list=[...PRODUCTS],idx=0,qty=1,mul=1;
function build(filter='all'){list=PRODUCTS.filter(p=>filter==='all'||p.cat===filter);idx=0;
 $('#stage').innerHTML=list.map((p,i)=>`<div class="item" data-i="${i}"><div class="arch"><img src="${p.img}" alt="${p.name}" data-ph="${p.name}" loading="lazy"></div><h4>${p.name}</h4></div>`).join('');
 $$('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.filter===filter));place()}
function place(direction = 0, previousIdx = idx) {
    const gap = innerWidth < 768
        ? innerWidth * .3
        : Math.max(40, Math.min(250, ($('#stage').clientWidth / 2 - 130) / 2));

    const total = list.length;

    function getOffset(i, center) {
        let o = i - center;

        if (o > total / 2) o -= total;
        if (o < -total / 2) o += total;

        return o;
    }

    $$('.item').forEach((el, i) => {
        const o = getOffset(i, idx);
        const oldO = getOffset(i, previousIdx);
        const distance = Math.abs(o);

        const scale = distance === 0 ? 1.1
                    : distance === 1 ? 0.88
                    : 0.72;

        const opacity = distance > 2 ? 0
                      : distance === 0 ? 1
                      : distance === 1 ? 0.65 : 0.45;

        const transform =
            `translateX(calc(-50% + ${o * gap}px)) scale(${scale})`;

        // 순환하면서 위치가 크게 바뀌는 상품은 애니메이션에서 제외
        if (direction !== 0 && Math.abs(o - oldO) > 1) {
            el.style.transition = 'none';
            el.style.opacity = 0;
            el.style.transform = transform;

            // 위치를 즉시 변경한 뒤 애니메이션을 복구
            void el.offsetWidth;

            el.style.transition = '';
            el.style.opacity = opacity;
        } else {
            el.style.transform = transform;
            el.style.opacity = opacity;
        }

        el.style.pointerEvents = distance > 2 ? 'none' : 'auto';
        el.style.zIndex = 10 - distance;
    });

detail()
}
const move = d => {
    const previousIdx = idx;

    idx = (idx + d + list.length) % list.length;

    qty = 1;
    mul = 1;

    place(d, previousIdx);
};
$('.c-prev').onclick=()=>move(-1);$('.c-next').onclick=()=>move(1);swipe($('#stage'),move);
$('#stage').onclick=e=>{const it=e.target.closest('.item');if(it){idx=+it.dataset.i;qty=1;mul=1;place()}};
$$('.tabs button').forEach(b=>b.onclick=()=>build(b.dataset.filter));
$$('.mega [data-filter]').forEach(a=>a.addEventListener('click',()=>build(a.dataset.filter)));
/* 상세 패널(퀵뷰 역할): 용량 옵션 + 수량 변경 + BUY NOW */
function detail(){const p=list[idx];if(!p)return;
 $('#detail').innerHTML=`<h3>${p.name}</h3><p class="sub">${p.sub}</p><p class="story-line">${p.story}</p>
 <div class="opts"><select id="opt"><option value="1" ${mul==1?'selected':''}>50ml</option><option value="1.45" ${mul==1.45?'selected':''}>100ml</option></select>
 <span class="qty"><button id="m">−</button><span>${qty}</span><button id="pl">+</button></span><b>${won(Math.round(p.price*mul*qty))}</b></div>
 <button class="btn" id="buy">BUY NOW</button>`;
 $('#opt').onchange=e=>{mul=+e.target.value;detail()};$('#m').onclick=()=>{qty=Math.max(1,qty-1);detail()};$('#pl').onclick=()=>{qty++;detail()};
 $('#buy').onclick=()=>addCart(p.id,qty,mul==1?'50ml':'100ml',mul)}
build();addEventListener('resize',place);

/* ===== 4. 팝업(공통) + 장바구니 (localStorage 저장 → 새로고침해도 유지) ===== */
const overlay=$('#overlay');
const open=el=>{el.classList.add('on');overlay.classList.add('on')};
const closeAll=()=>{$$('.on.modal,.on.drawer').forEach(e=>e.classList.remove('on'));overlay.classList.remove('on')};
overlay.onclick=closeAll;addEventListener('keydown',e=>e.key==='Escape'&&closeAll());
document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a)addCart(a.dataset.add,1);if(e.target.closest('[data-close]'))closeAll()});
let cart=JSON.parse(localStorage.getItem('dq-cart')||'[]');
function addCart(id,q,opt='50ml',m=1){const k=cart.find(c=>c.id===id&&c.opt===opt);k?k.qty+=q:cart.push({id,qty:q,opt,mul:m});drawCart();open($('#cart'))}
function drawCart(){localStorage.setItem('dq-cart',JSON.stringify(cart));let t=0,c=0;
 $('#cartList').innerHTML=cart.map((x,i)=>{const p=PRODUCTS.find(q=>q.id===x.id)||PRODUCTS[0],s=Math.round(p.price*x.mul)*x.qty;t+=s;c+=x.qty;
 return`<div class="row"><span>${p.name}<br><small>${x.opt}</small></span><span><button data-q="${i}" data-d="-1">−</button> ${x.qty} <button data-q="${i}" data-d="1">+</button></span><span>${won(s)}</span></div>`}).join('')||'<p>장바구니가 비어 있습니다.</p>';
 $('#total').textContent=won(t);$('#cartCount').textContent=c}
$('#cartList').onclick=e=>{const b=e.target.closest('[data-q]');if(!b)return;const x=cart[b.dataset.q];x.qty+=+b.dataset.d;if(x.qty<1)cart.splice(b.dataset.q,1);drawCart()};
$('#cartBtn').onclick=()=>open($('#cart'));$('#closeCart').onclick=closeAll;drawCart();
$('#mypageBtn').onclick=e=>{e.preventDefault();open($('#mypage'))};

/* ===== 5. 스크롤 효과: 페이드인 / 스토리 연도 전환 / 패럴랙스 / 이미지 확대 ===== */
const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('show')),{threshold:.15});
$$('.reveal').forEach(el=>io.observe(el));
const yio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$('#year').textContent=e.target.dataset.year}),{rootMargin:'-45% 0px -45% 0px'});
$$('.letter').forEach(el=>yio.observe(el));
const px=$('.parallax');px.style.backgroundImage=`url(${px.dataset.bg})`;
const calm=matchMedia('(prefers-reduced-motion: reduce)').matches; // 접근성: 모션 줄이기 설정 시 효과 해제
addEventListener('scroll',()=>{if(calm)return;
 const r=px.parentElement.getBoundingClientRect();px.style.transform=`translateY(${r.top*-.2}px)`;
 $$('[data-zoom]').forEach(im=>{const b=im.getBoundingClientRect(),p=1-Math.min(Math.max(b.top/innerHeight,0),1);im.style.transform=`scale(${1+p*.18})`})}); /* 확대 강도: .18 조절 */
