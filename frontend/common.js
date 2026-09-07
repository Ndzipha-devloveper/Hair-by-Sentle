const PRODUCTS=[
{id:1,name:'Brazilian Body Wave',meta:'18 inch · 3 bundles',price:1450,img:'assets/Images/18 inch.jpg',tag:'Bestseller',cat:'weave'},
{id:2,name:'Straight Bundle Deal',meta:'20 inch · combo',price:1890,img:'assets/Images/For Sale 2.jpg',tag:'Popular',cat:'bundle'},
{id:3,name:'Luxury Body Wave',meta:'22 inch · single bundle',price:890,img:'assets/Images/For Sale 3.jpg',tag:'New',cat:'weave'},
{id:4,name:'Hair Care Essentials',meta:'Care kit · everyday',price:220,img:'assets/Images/saLE.jpg',tag:'Care',cat:'care'},
{id:5,name:'Premium Curly',meta:'18 inch · 3 bundles',price:1650,img:'assets/Images/For sale.jpg',tag:'Bestseller',cat:'weave'},
{id:6,name:'Silky Straight',meta:'24 inch · 2 bundles',price:1750,img:'assets/Images/Salee.jpg',tag:'New',cat:'bundle'},
{id:7,name:'Everyday Install Kit',meta:'Beauty essentials',price:320,img:'assets/Images/1.jpg',tag:'Care',cat:'care'},
{id:8,name:'Signature Look',meta:'20 inch · 3 bundles',price:1990,img:'assets/Images/2.jpg',tag:'Featured',cat:'weave'}
];

function readCart(){
  try{
    const raw=localStorage.getItem('hbs_cart');
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed.filter(x=>x&&Number(x.id)&&Number(x.price)>=0&&Number(x.qty)>0):[];
  }catch(e){ localStorage.removeItem('hbs_cart'); return []; }
}
let cart=readCart();
const money=n=>'R'+Number(n||0).toLocaleString('en-ZA');
function saveCart(){try{localStorage.setItem('hbs_cart',JSON.stringify(cart));}catch(e){} updateCartBadge();}
function checkoutUrl(){return 'checkout.html?cart='+encodeURIComponent(JSON.stringify(cart));}
function updateCartBadge(){document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=cart.reduce((a,b)=>a+Number(b.qty||0),0));}

function burst(el){
  if(!el)return;
  const holder=document.createElement('span'); holder.className='plus-burst';
  const dirs=[[-34,-18],[30,-20],[-25,28],[27,26],[0,-35],[38,8]];
  dirs.forEach(([x,y],idx)=>{const p=document.createElement('i');p.className='particle';p.style.setProperty('--x',x+'px');p.style.setProperty('--y',y+'px');p.style.setProperty('--d',idx*35+'ms');holder.appendChild(p);});
  el.appendChild(holder); setTimeout(()=>holder.remove(),800);
}

function trolleyAnimation(button){
  const cartButton=document.querySelector('[data-cart-open]');
  if(!button||!cartButton)return;
  const a=button.getBoundingClientRect(), b=cartButton.getBoundingClientRect();
  const trolley=document.createElement('div');
  trolley.className='flying-trolley';
  trolley.setAttribute('aria-hidden','true');
  trolley.innerHTML='<span class="trolley-wheel trolley-wheel-a"></span><span class="trolley-wheel trolley-wheel-b"></span><svg viewBox="0 0 24 24"><path d="M3 4h2l1.1 9.2a2 2 0 0 0 2 1.8h8.8a2 2 0 0 0 1.9-1.4L21 7H6.2M9 19.5a1 1 0 1 0 0 .01M18 19.5a1 1 0 1 0 0 .01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 9h10M9 11h8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  trolley.style.setProperty('--sx',(a.left+a.width/2)+'px'); trolley.style.setProperty('--sy',(a.top+a.height/2)+'px');
  trolley.style.setProperty('--ex',(b.left+b.width/2)+'px'); trolley.style.setProperty('--ey',(b.top+b.height/2)+'px');
  document.body.appendChild(trolley);
  setTimeout(()=>{trolley.remove(); cartButton.classList.remove('cart-bounce'); void cartButton.offsetWidth; cartButton.classList.add('cart-bounce'); setTimeout(()=>cartButton.classList.remove('cart-bounce'),650)},820);
}

function addToCart(id,button,quantity=1){
  const p=PRODUCTS.find(x=>x.id===Number(id)); if(!p)return;
  quantity=Math.max(1,Number(quantity)||1);
  const item=cart.find(x=>x.id===p.id);
  if(item)item.qty+=quantity; else cart.push({...p,qty:quantity});
  saveCart();
  if(button){burst(button);button.classList.add('add-pop');setTimeout(()=>button.classList.remove('add-pop'),550);trolleyAnimation(button);}
  toast(quantity>1?`${quantity} added to cart`:'Added to cart');
  renderCart();
}
function changeQty(id,d){const i=cart.find(x=>x.id===Number(id));if(!i)return;i.qty+=Number(d);if(i.qty<=0)cart=cart.filter(x=>x.id!==Number(id));saveCart();renderCart();}
function toast(t){
  let e=document.getElementById('toast');
  if(!e){e=document.createElement('div');e.id='toast';e.className='fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#5b1735] px-5 py-3 text-xs font-bold text-white shadow-2xl';document.body.appendChild(e);}
  e.innerHTML='<span class="toast-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg></span><span>'+t+'</span>';
  e.classList.remove('hidden'); clearTimeout(window.__toast); window.__toast=setTimeout(()=>e.classList.add('hidden'),1900);
}
function openCart(){document.getElementById('cartDrawer')?.classList.remove('hidden');document.body.classList.add('no-scroll');renderCart();if(window.lucide)window.lucide.createIcons();}
function closeCart(){document.getElementById('cartDrawer')?.classList.add('hidden');document.body.classList.remove('no-scroll');}
function renderCart(){
  const wrap=document.getElementById('cartItems'), totalEl=document.getElementById('cartTotal'); if(!wrap)return;
  const total=cart.reduce((a,b)=>a+b.price*b.qty,0); if(totalEl)totalEl.textContent=money(total); const checkoutLink=document.getElementById('checkoutLink'); if(checkoutLink) checkoutLink.href=checkoutUrl();
  wrap.innerHTML=cart.length?cart.map(i=>`<div class="flex gap-3 py-4 border-b border-rose"><img src="${i.img}" class="size-20 rounded-xl object-cover" alt="${i.name}"><div class="min-w-0 flex-1"><p class="text-sm font-bold truncate">${i.name}</p><p class="text-[11px] text-ink/45">${i.meta}</p><div class="mt-3 flex items-center justify-between"><div class="flex items-center gap-2"><button onclick="changeQty(${i.id},-1)" class="size-8 rounded-full bg-blush grid place-items-center hover:bg-rose transition" aria-label="Decrease quantity"><i data-lucide="minus" class="size-3.5"></i></button><span class="text-xs font-bold min-w-4 text-center">${i.qty}</span><button onclick="changeQty(${i.id},1)" class="size-8 rounded-full bg-blush grid place-items-center hover:bg-rose transition" aria-label="Increase quantity"><i data-lucide="plus" class="size-3.5"></i></button></div><b class="text-sm">${money(i.price*i.qty)}</b></div></div></div>`).join(''):`<div class="h-full grid place-items-center text-center p-8"><div><div class="mx-auto size-16 rounded-full bg-blush text-berry grid place-items-center"><i data-lucide="shopping-bag" class="size-7"></i></div><p class="mt-4 font-bold">Your bag is empty</p><p class="mt-1 text-xs text-ink/45">Add something beautiful to get started.</p></div></div>`;
  if(window.lucide)lucide.createIcons();
}
function initHeader(){
  updateCartBadge();
  document.querySelectorAll('[data-cart-open]').forEach(b=>b.addEventListener('click',openCart));
  document.querySelectorAll('[data-cart-close]').forEach(b=>b.addEventListener('click',closeCart));
  document.querySelectorAll('[data-menu-open]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('mobileMenu')?.classList.remove('hidden');document.body.classList.add('no-scroll');if(window.lucide)window.lucide.createIcons();}));
  document.querySelectorAll('[data-menu-close]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('mobileMenu')?.classList.add('hidden');document.body.classList.remove('no-scroll');}));
  document.querySelectorAll('[data-menu-link]').forEach(a=>a.addEventListener('click',()=>{document.getElementById('mobileMenu')?.classList.add('hidden');document.body.classList.remove('no-scroll');}));
}
function productCard(p){return `<article class="group"><div class="img-hover relative aspect-[.84] rounded-[24px] overflow-hidden bg-rose"><img src="${p.img}" alt="${p.name}" class="w-full h-full object-cover"><span class="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-berry">${p.tag}</span><button onclick="addToCart(${p.id},this)" aria-label="Add ${p.name} to cart" class="add-to-cart absolute right-3 bottom-3 size-11 rounded-full bg-white text-berry shadow-lg grid place-items-center transition sm:opacity-0 sm:group-hover:opacity-100 hover:bg-berry hover:text-white"><i data-lucide="plus" class="size-5"></i></button></div><a href="product.html?id=${p.id}" class="block pt-3"><p class="text-sm font-bold">${p.name}</p><p class="mt-1 text-[11px] text-ink/45">${p.meta}</p><div class="mt-2 flex items-center justify-between"><span class="font-extrabold text-pink">${money(p.price)}</span><span class="text-[10px] text-ink/35">★★★★★</span></div></a></article>`}
function mountProducts(targetId,filter='all'){const target=document.getElementById(targetId);if(!target)return;let list=filter==='all'?PRODUCTS:PRODUCTS.filter(p=>p.cat===filter);target.innerHTML=list.map(productCard).join('');if(window.lucide)lucide.createIcons();}
function initReveal(){if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('show'));return;}const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');obs.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>obs.observe(e));}
function initLoader(){
  const loader=document.getElementById('loader');if(!loader)return;
  const fill=loader.querySelector('.loader-fill'), percent=loader.querySelector('[data-loader-percent]');
  const duration=20000, start=performance.now();
  function tick(now){const p=Math.min(1,(now-start)/duration);if(fill)fill.style.width=(p*100).toFixed(1)+'%';if(percent)percent.textContent=Math.round(p*100)+'%';if(p<1){requestAnimationFrame(tick);}else{setTimeout(()=>loader.classList.add('done'),250);}}
  requestAnimationFrame(tick);
}
document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('cartMount')&&typeof cartMarkup==='function')document.getElementById('cartMount').innerHTML=cartMarkup();if(window.lucide)window.lucide.createIcons();initHeader();initReveal();initLoader();});
