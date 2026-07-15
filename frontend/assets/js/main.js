document.addEventListener('DOMContentLoaded', () => {
    // Routing
    const views = document.querySelectorAll('.view');

    function showView(id) {
        views.forEach(v => v.classList.remove('active'));
        const el = document.getElementById(id) || document.getElementById('home');
        el.classList.add('active');
        if (id === 'checkout') renderCheckoutGuard();
        if (id === 'orders') renderOrders();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    window.addEventListener('hashchange', () => showView(location.hash.replace('#', '') || 'home'));
    showView(location.hash.replace('#', '') || 'home');

    // Slideshow
    const slideshowContainer = document.getElementById('slideshow');
    if (slideshowContainer) {
        const slides = [...slideshowContainer.querySelectorAll('img')];
        const capTag = document.getElementById('cap-tag');
        const capTitle = document.getElementById('cap-title');
        const capText = document.getElementById('cap-text');
        const capPrimary = document.getElementById('cap-primary');
        const capSecondary = document.getElementById('cap-secondary');
        const CAPS = [{
            tag: 'Weaves',
            title: 'Luxury Weaves for Every Queen',
            text: 'Premium textures, natural look, and styles that move with you.',
            pHref: '#shop',
            pText: 'Shop Now',
            sHref: '#shop',
            sText: 'Explore'
        }, {
            tag: 'Installations',
            title: 'Book Professional Installations',
            text: 'Secure installs and friendly service in George.',
            pHref: '#install',
            pText: 'Book Now',
            sHref: '#shop',
            sText: 'Buy Weave'
        }, {
            tag: 'Bonnets',
            title: 'Protect Your Crown in Style',
            text: 'Silk and satin bonnets to keep your hair fresh overnight.',
            pHref: '#shop',
            pText: 'Shop Bonnets',
            sHref: '#shop',
            sText: 'All Products'
        }, {
            tag: 'Specials',
            title: 'Specials • Black Friday • Student Deals',
            text: 'Exclusive offers live now — limited time only.',
            pHref: '#shop',
            pText: 'See Deals',
            sHref: '#faq',
            sText: 'FAQ'
        }];
        let i = 0;

        function setActive(n) {
            slides.forEach(s => s.classList.remove('active'));
            i = (n + slides.length) % slides.length;
            slides[i].classList.add('active');
            const c = CAPS[i] || CAPS[0];
            capTag.textContent = c.tag;
            capTitle.textContent = c.title;
            capText.textContent = c.text;
            capPrimary.textContent = c.pText;
            capPrimary.href = c.pHref;
            capSecondary.textContent = c.sText;
            capSecondary.href = c.sHref;
        }
        setActive(0);
        setInterval(() => setActive(i + 1), 3500);
    }

    // Products
    const PRODUCTS = [{
        id: 'lux',
        name: 'Brazilian Straight 18"',
        price: 1899,
        img: 'images/8.jpg'
    }, {
        id: 'brz',
        name: 'Body Wave 20"',
        price: 2299,
        img: 'images/Salee.jpg'
    }, {
        id: 'inch',
        name: 'Kinky Curly 16"',
        price: 1749,
        img: 'images/saleee.jpg'
    }, {
        id: 'bon',
        name: 'Silk Hair Bonnet',
        price: 149,
        img: 'images/saLE.jpg'
    }];
    const cart = JSON.parse(localStorage.getItem('hb_cart') || '[]');

    function saveCart() {
        localStorage.setItem('hb_cart', JSON.stringify(cart));
    }

    function updateCount() {
        const count = cart.reduce((a, b) => a + b.qty, 0);
        const badge = document.getElementById('cart-count');
        if (badge) badge.textContent = count;
    }
    updateCount();

    function renderShop() {
        const wrap = document.getElementById('shop-products');
        if (!wrap) return;
        wrap.innerHTML = '';
        PRODUCTS.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <div class="card-body">
                <h3>${p.name}</h3>
                <div class="price">R${p.price}</div>
                <button class="btn add" data-id="${p.id}">Add to cart</button>
            </div>
            <div class="truck-overlay"></div>`;
            wrap.appendChild(card);
        });
    }
    renderShop();

    // Toast
    function toast(msg) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.remove('show');
        void t.offsetWidth;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2400);
    }

    // Truck animation
    function buildTruckScene(container) {
        const overlay = container.querySelector('.truck-overlay');
        if (!overlay) return null;
        overlay.innerHTML = `
        <div class="truck-scene">
            <div class="truck">
                <div class="cargo">
                    <div class="door left"></div>
                    <div class="door right"></div>
                </div>
                <div class="cabin"><div class="window"></div></div>
                <div class="wheel w1"></div><div class="wheel w2"></div>
            </div>
        </div>`;
        return overlay;
    }

    function cargoCenterViewport(overlay) {
        const cargo = overlay.querySelector('.cargo');
        const r = cargo.getBoundingClientRect();
        return {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2
        };
    }

    function addToCartAnim(card) {
        const overlay = buildTruckScene(card);
        if (!overlay) return;
        const sfxTruck = document.getElementById('sfx-truck');
        const sfxBeep = document.getElementById('sfx-beep');
        overlay.style.display = 'flex';
        overlay.classList.add('doors-open');
        if (sfxTruck && typeof sfxTruck.play === 'function') {
            sfxTruck.play().catch(() => {});
        }
        const img = card.querySelector('img');
        const imgRect = img.getBoundingClientRect();
        const fly = img.cloneNode(true);
        fly.className = 'fly-item';
        fly.style.left = imgRect.left + 'px';
        fly.style.top = imgRect.top + 'px';
        fly.style.width = Math.min(imgRect.width, 120) + 'px';
        fly.style.height = fly.style.width;
        document.body.appendChild(fly);
        const cargoCenter = cargoCenterViewport(overlay);
        setTimeout(() => {
            const fr = fly.getBoundingClientRect();
            const dx = cargoCenter.x - (fr.left + fr.width / 2);
            const dy = cargoCenter.y - (fr.top + fr.height / 2);
            fly.style.transform = `translate(${dx}px,${dy}px) scale(.85)`;
        }, 40);
        setTimeout(() => {
            overlay.classList.remove('doors-open');
            fly.style.opacity = '0.001';
        }, 900);
        setTimeout(() => {
            overlay.classList.add('drive-away');
        }, 1400);
        setTimeout(() => {
            overlay.style.display = 'none';
            overlay.classList.remove('drive-away');
            document.body.removeChild(fly);
            if (sfxBeep && typeof sfxBeep.play === 'function') {
                sfxBeep.play().catch(() => {});
            }
            toast('Added to the cart successfully');
        }, 2300);
    }

    // Add to cart
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const product = PRODUCTS.find(p => p.id === id);
        if (!product) return;
        const existing = cart.find(i => i.id === id);
        if (existing) existing.qty += 1;
        else cart.push({
            id,
            qty: 1
        });
        saveCart();
        updateCount();
        addToCartAnim(btn.closest('.card'));
    });

    // Auth
    function isLogged() {
        return !!JSON.parse(localStorage.getItem('hb_user') || 'null');
    }

    function setUser(u) {
        localStorage.setItem('hb_user', JSON.stringify(u));
    }

    // Checkout
    function calcTotals(area) {
        const items = cart.map(ci => {
            const p = PRODUCTS.find(x => x.id === ci.id);
            return {...p,
                qty: ci.qty,
                line: p.price * ci.qty
            };
        });
        const subtotal = items.reduce((a, b) => a + b.line, 0);
        const vat = Math.round(subtotal * 0.15);
        const delivery = area === 'george' ? 60 : 99;
        const total = subtotal + vat + delivery;
        return {
            items,
            subtotal,
            vat,
            delivery,
            total
        };
    }

    function renderCheckoutGuard() {
        const guard = document.getElementById('checkout-guard');
        const wrap = document.getElementById('checkout-wrap');
        if (!guard || !wrap) return;
        if (!isLogged()) {
            guard.classList.remove('hidden');
            wrap.classList.add('hidden');
        } else {
            guard.classList.add('hidden');
            wrap.classList.remove('hidden');
            renderCheckout();
        }
    }

    function renderCheckout() {
        const areaSel = document.getElementById('delivery-area');
        const codNote = document.getElementById('cod-note');
        const itemsWrap = document.getElementById('checkout-items');
        const totalsWrap = document.getElementById('totals');
        if (!areaSel || !itemsWrap || !totalsWrap || !codNote) return;

        function draw() {
            const {
                items,
                subtotal,
                vat,
                delivery,
                total
            } = calcTotals(areaSel.value);
            codNote.classList.toggle('hidden', areaSel.value !== 'george');
            const list = items.map(i => `<div class="summary-row"><span>${i.name} × ${i.qty}</span><strong>R${i.line}</strong></div>`).join('') || '<p>Your cart is empty.</p>';
            itemsWrap.innerHTML = list;
            totalsWrap.innerHTML = `
            <div class="summary-row"><span>Subtotal</span><span>R${subtotal}</span></div>
            <div class="summary-row"><span>VAT (15%)</span><span>R${vat}</span></div>
            <div class="summary-row"><span>Delivery fee</span><span>R${delivery}</span></div>
            <div class="summary-row total"><span>Total</span><span>R${total}</span></div>`;
        }
        draw();
        areaSel.onchange = draw;
    }

    // Checkout button
    const payBtn = document.getElementById('pay-btn');
    if (payBtn) {
        payBtn.addEventListener('click', () => {
            if (cart.length === 0) return toast('Your cart is empty');
            if (!isLogged()) return location.hash = 'login';
            const sfxPay = document.getElementById('sfx-pay');
            if (sfxPay && typeof sfxPay.play === 'function') {
                sfxPay.play().catch(() => {});
            }
            const id = 'HB' + Math.floor(Math.random() * 1e8).toString().padStart(8, '0');
            const {
                total
            } = calcTotals(document.getElementById('delivery-area').value);
            const orders = JSON.parse(localStorage.getItem('hb_orders') || '[]');
            orders.push({
                id,
                date: new Date().toISOString(),
                total,
                items: [...cart],
                status: 'Processing'
            });
            localStorage.setItem('hb_orders', JSON.stringify(orders));
            cart.length = 0;
            saveCart();
            updateCount();
            location.hash = 'track';
            setTimeout(() => {
                const inp = document.getElementById('track-id');
                const res = document.getElementById('track-result');
                if (inp) inp.value = id;
                if (res) res.textContent = `Order ${id} confirmed. Status: Processing → Preparing for shipment.`;
            }, 50);
        });
    }

    // Track orders
    const trackBtn = document.getElementById('track-btn');
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            const trackInput = document.getElementById('track-id');
            const id = trackInput ? trackInput.value.trim() : '';

            const orders = JSON.parse(localStorage.getItem('hb_orders') || '[]');
            const o = orders.find(x => x.id === id);
            const resultEl = document.getElementById('track-result');
            if (resultEl) {
                resultEl.textContent = o ? `Order ${o.id} is currently: ${o.status}` : 'Order not found.';
            }
        });
    }

    // FAQ accordion
    document.querySelectorAll('.faq-q').forEach(q => {
        q.addEventListener('click', () => {
            q.parentNode.classList.toggle('active');
        });
    });

    // Login
    const form = document.getElementById('login-form');
    if (form) {
        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const showPass = document.getElementById('show-pass');
        const dollFace = document.getElementById('doll-face');
        const loginError = document.getElementById('login-error');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            loginError.textContent = '';
            if (password.value.length < 6) return loginError.textContent = 'Password must be at least 6 characters.';
            if (!email.checkValidity()) return loginError.textContent = 'Please enter a valid email address.';
            setUser({
                email: email.value
            });
            location.hash = 'home';
            toast(`Welcome back, ${email.value}!`);
        });
        showPass.addEventListener('change', (e) => {
            password.type = e.target.checked ? 'text' : 'password';
            dollFace.classList.toggle('cover', !e.target.checked);
        });
    }

    // Render orders
    function renderOrders() {
        const listEl = document.getElementById('orders-list');
        if (!listEl) return;
        const orders = JSON.parse(localStorage.getItem('hb_orders') || '[]');
        if (orders.length === 0) {
            listEl.innerHTML = '<p>You have no past orders.</p>';
            return;
        }
        const html = orders.reverse().map(o => {
            const items = o.items.map(i => {
                const p = PRODUCTS.find(x => x.id === i.id);
                return `<div class="order-item">${i.qty} x ${p.name}</div>`;
            }).join('');
            return `
            <div class="order-card">
                <div class="summary-row">
                    <span>Order ID: <strong>${o.id}</strong></span>
                    <span>Total: <strong>R${o.total}</strong></span>
                </div>
                <div class="summary-row">
                    <span>Date: ${new Date(o.date).toLocaleDateString()}</span>
                    <span>Status: <strong>${o.status}</strong></span>
                </div>
                <div class="order-items-list">${items}</div>
                <a href="#track" onclick="document.getElementById('track-id').value='${o.id}'" class="pill">Track this order</a>
            </div>`;
        }).join('');
        listEl.innerHTML = html;
    }
});