(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const content=$('checkoutContent'), empty=$('emptyCheckout'), summaryEl=$('summary'), form=$('checkoutForm');
  if(!content||!empty||!summaryEl||!form)return;

  // Prefer the cart snapshot carried from the cart drawer; fall back to localStorage.
  const cartParam=new URLSearchParams(location.search).get('cart');
  if(cartParam){
    try{
      const incoming=JSON.parse(cartParam);
      if(Array.isArray(incoming)){
        cart=incoming.filter(x=>x&&Number(x.id)&&Number(x.price)>=0&&Number(x.qty)>0);
        saveCart();
      }
    }catch(err){ console.warn('Could not restore checkout cart snapshot',err); }
  }

  function refreshIcons(){ if(window.lucide) lucide.createIcons(); }
  function cartSubtotal(){return cart.reduce((sum,item)=>sum+(Number(item.price)||0)*(Number(item.qty)||0),0);}
  function cartCount(){return cart.reduce((sum,item)=>sum+(Number(item.qty)||0),0);}
  function deliveryCost(){return Number(document.querySelector('input[name="delivery"]:checked')?.value||0);}
  function total(){return cartSubtotal()+deliveryCost();}

  function updateVisibility(){
    const hasItems=cart.length>0;
    content.classList.toggle('hidden',!hasItems);
    empty.classList.toggle('hidden',hasItems);
    if(!hasItems) $('successModal')?.classList.add('hidden');
  }

  function updateSummary(){
    updateVisibility();
    const subtotal=cartSubtotal(), count=cartCount(), shipping=deliveryCost(), grand=subtotal+shipping;
    $('summaryCount').textContent=`${count} item${count===1?'':'s'}`;
    $('sub').textContent=money(subtotal);
    $('ship').textContent=shipping?money(shipping):'Free';
    $('grand').textContent=money(grand);
    summaryEl.innerHTML=cart.length?cart.map(i=>`
      <div class="flex gap-3 py-4 border-b border-rose last:border-0">
        <img src="${i.img}" class="size-16 rounded-2xl object-cover" alt="${i.name}">
        <div class="min-w-0 flex-1">
          <p class="font-bold text-sm truncate">${i.name}</p>
          <p class="text-xs text-ink/45 mt-1">${i.meta}</p>
          <div class="mt-2 flex items-center justify-between text-xs">
            <span class="rounded-full bg-blush px-2 py-1">Qty ${i.qty}</span>
            <b>${money(i.price*i.qty)}</b>
          </div>
        </div>
      </div>`).join(''):'<div class="rounded-2xl bg-blush p-5 text-sm text-ink/50">Your order summary will appear here.</div>';
    refreshIcons();
    return grand;
  }

  function setChoice(selector, activeClass){
    document.querySelectorAll(selector).forEach(x=>{
      x.classList.remove('border-2','border-pink','bg-blush');
      x.classList.add('border','border-rose');
    });
    const radio=document.querySelector(`${selector.replace('.delivery-option','.delivery-option input').replace('.payment-option','.payment-option input')}:checked`);
    if(radio){const card=radio.closest(selector);card?.classList.remove('border','border-rose');card?.classList.add('border-2','border-pink','bg-blush');}
  }

  document.querySelectorAll('input[name="delivery"]').forEach(r=>r.addEventListener('change',()=>{
    setChoice('.delivery-option'); updateSummary();
  }));

  const cardFields=$('cardFields');
  function syncPayment(){
    setChoice('.payment-option');
    const method=document.querySelector('input[name="payment"]:checked')?.value||'card';
    const card=method==='card';
    cardFields.classList.toggle('hidden',!card);
    cardFields.querySelectorAll('input').forEach(i=>i.required=card);
  }
  document.querySelectorAll('input[name="payment"]').forEach(r=>r.addEventListener('change',syncPayment));

  $('cardNumber')?.addEventListener('input',e=>{
    e.target.value=e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  });
  $('expiry')?.addEventListener('input',e=>{
    let v=e.target.value.replace(/\D/g,'').slice(0,4);
    if(v.length>2)v=v.slice(0,2)+' / '+v.slice(2);
    e.target.value=v;
  });
  $('cvv')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,4);});
  $('phone')?.addEventListener('input',e=>{e.target.value=e.target.value.replace(/[^0-9+ ()-]/g,'').slice(0,20);});

  $('demoFill')?.addEventListener('click',()=>{
    const values={first:'Sentle',last:'Customer',email:'customer@example.com',phone:'+27 82 000 0000',address:'12 Main Street',city:'George',postal:'6529',cardName:'Sentle Customer',cardNumber:'4242424242424242',expiry:'12 / 29',cvv:'123'};
    Object.entries(values).forEach(([id,val])=>{const el=$(id);if(el)el.value=val;});
    syncPayment();
    toast('Demo checkout details filled');
  });

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!cart.length){toast('Your cart is empty');updateVisibility();return;}
    syncPayment();
    if(!form.checkValidity()){
      form.reportValidity();
      toast('Please complete the required details');
      return;
    }
    const method=document.querySelector('input[name="payment"]:checked')?.value||'card';
    if(method==='card'){
      const digits=$('cardNumber').value.replace(/\D/g,'');
      if(digits.length!==16){$('cardNumber').setCustomValidity('Enter a 16-digit demo card number.');form.reportValidity();$('cardNumber').setCustomValidity('');return;}
      if($('expiry').value.replace(/\D/g,'').length!==4){$('expiry').setCustomValidity('Enter expiry as MM / YY.');form.reportValidity();$('expiry').setCustomValidity('');return;}
      if($('cvv').value.length<3){$('cvv').setCustomValidity('Enter a 3 or 4 digit CVV.');form.reportValidity();$('cvv').setCustomValidity('');return;}
    }
    const btn=$('placeOrder');
    btn.disabled=true; btn.classList.add('opacity-80','cursor-wait');
    btn.innerHTML='<i data-lucide="loader-circle" class="size-4 animate-spin"></i><span>Preparing your order…</span>';
    refreshIcons();
    await new Promise(resolve=>setTimeout(resolve,1200));
    const finalTotal=total();
    const order='HBS-'+Date.now().toString().slice(-6);
    $('orderNumber').textContent=order;
    $('successTotal').textContent=money(finalTotal);
    $('successModal').classList.remove('hidden');
    $('successModal').classList.add('flex');
    cart=[];saveCart();updateSummary();
    btn.disabled=false;btn.classList.remove('opacity-80','cursor-wait');
    btn.innerHTML='<i data-lucide="lock-keyhole" class="size-4"></i> Place order';
    refreshIcons();
  });

  // Close confirmation with Escape and keep page usable.
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$('successModal')?.classList.add('hidden');});
  updateVisibility(); updateSummary(); syncPayment(); refreshIcons();
})();
