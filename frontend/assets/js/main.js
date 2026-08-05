document.addEventListener('DOMContentLoaded', () => {
    // Routing
    const views = document.querySelectorAll('.view');

    function renderWelcome() {
        const welcomeBanner = document.getElementById('welcome-banner');
        const welcomeName = document.getElementById('welcome-name');
        if (!welcomeBanner || !welcomeName) return;
        const user = JSON.parse(localStorage.getItem('hb_user') || 'null');
        if (!user) {
            welcomeBanner.classList.add('hidden');
            return;
        }
        welcomeName.textContent = user.fullName || user.email.split('@')[0];
        welcomeBanner.classList.remove('hidden');
    }

    function showView(id) {
        const protectedViews = ['checkout', 'orders'];
        if (protectedViews.includes(id) && !isLogged()) {
            location.hash = 'login';
            return;
        }
        views.forEach(v => v.classList.remove('active'));
        const el = document.getElementById(id) || document.getElementById('home');
        el.classList.add('active');
        if (id === 'checkout') renderCheckoutGuard();
        if (id === 'orders') renderOrders();
        renderWelcome();
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
        const slides = [...slideshowContainer.querySelectorAll('img,video')];
        const capTag = document.getElementById('cap-tag');
        const capTitle = document.getElementById('cap-title');
        const capText = document.getElementById('cap-text');
        const capPrimary = document.getElementById('cap-primary');
        const capSecondary = document.getElementById('cap-secondary');
        const CAPS = [{
            tag: 'Installations',
            title: 'Book Professional Installations',
            text: 'Secure installs and friendly service in George.',
            pHref: '#install',
            pText: 'Book Now',
            sHref: '#shop',
            sText: 'Buy Weave'
        }, {
            tag: 'Weaves',
            title: 'Luxury Weaves for Every Queen',
            text: 'Premium textures, natural look, and styles that move with you.',
            pHref: '#shop',
            pText: 'Shop Now',
            sHref: '#shop',
            sText: 'Explore'
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
        let slideshowTimer = null;
        let currentVideoElement = null;
        let currentVideoListener = null;

        function setActive(n) {
            slides.forEach(s => {
                s.classList.remove('active');
                if (s.tagName === 'VIDEO') {
                    try { s.pause(); s.currentTime = 0; } catch (e) {}
                }
            });
            i = (n + slides.length) % slides.length;
            const active = slides[i];
            active.classList.add('active');
            // Show or hide the Specials slide-card depending on slide type
            try {
                const slideCard = document.getElementById('slide-card');
                if (slideCard) {
                    if (active.tagName === 'IMG') {
                        slideCard.classList.add('visible');
                        slideCard.setAttribute('aria-hidden','false');
                    } else {
                        slideCard.classList.remove('visible');
                        slideCard.setAttribute('aria-hidden','true');
                    }
                }
            } catch (e) {}
            if (active.tagName === 'VIDEO') {
                try { active.play().catch(()=>{}); } catch (e) {}
                // if video, advance when it ends
                if (currentVideoElement && currentVideoListener) {
                    try { currentVideoElement.removeEventListener('ended', currentVideoListener); } catch (e) {}
                }
                currentVideoElement = active;
                currentVideoListener = () => setActive(i + 1);
                try { active.addEventListener('ended', currentVideoListener); } catch (e) {}
                stopSlideshow();
            } else {
                // non-video: ensure no lingering video listeners and start interval
                if (currentVideoElement && currentVideoListener) {
                    try { currentVideoElement.removeEventListener('ended', currentVideoListener); } catch (e) {}
                    currentVideoElement = null;
                    currentVideoListener = null;
                }
                // ensure slideshow runs for images
                startSlideshow();
            }
            const c = CAPS[i % CAPS.length] || CAPS[0];
            capTag.textContent = c.tag;
            capTitle.textContent = c.title;
            capText.textContent = c.text;
            capPrimary.textContent = c.pText;
            capPrimary.href = c.pHref;
            capSecondary.textContent = c.sText;
            capSecondary.href = c.sHref;
            // update progress dots if present
            try { updateDots(); } catch (e) {}
        }

        function startSlideshow() {
            stopSlideshow();
            slideshowTimer = setInterval(() => setActive(i + 1), 6000);
        }

        function stopSlideshow() {
            if (slideshowTimer) {
                clearInterval(slideshowTimer);
                slideshowTimer = null;
            }
        }


        // Do not stop slideshow on hover — keep autoplay consistent
        // Add explicit navigation controls (prev/next) and progress dots
        const prevBtn = slideshowContainer.querySelector('.slideshow-prev');
        const nextBtn = slideshowContainer.querySelector('.slideshow-next');
        const dotsWrap = slideshowContainer.querySelector('.slideshow-dots');

        function renderDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';
            slides.forEach((s, idx) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('aria-label', `Go to slide ${idx + 1}`);
                b.addEventListener('click', () => {
                    setActive(idx);
                });
                dotsWrap.appendChild(b);
            });
        }

        function updateDots() {
            if (!dotsWrap) return;
            const buttons = [...dotsWrap.querySelectorAll('button')];
            buttons.forEach((b, idx) => {
                b.classList.toggle('active', idx === i);
                if (idx === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', () => { setActive(i - 1); });
        if (nextBtn) nextBtn.addEventListener('click', () => { setActive(i + 1); });

        renderDots();
        setActive(0);
        updateDots();
        startSlideshow();
    }

    // Products
    const PRODUCTS = [{
        id: 'lux',
        name: 'Brazilian Straight 18"',
        price: 1899,
        category: 'weaves',
        newArrival: true,
        img: 'assets/Images/8.jpg'
    }, {
        id: 'wev1',
        name: 'Peruvian Natural 16"',
        price: 1599,
        category: 'weaves',
        newArrival: false,
        img: 'assets/Images/Isentle.jpg'
    }, {
        id: 'wev2',
        name: 'Malaysian Body Wave 18"',
        price: 1999,
        category: 'weaves',
        newArrival: false,
        img: 'assets/Images/Salee.jpg'
    }, {
        id: 'wev3',
        name: 'Deep Wave 20"',
        price: 1799,
        category: 'weaves',
        newArrival: true,
        img: 'assets/Images/saleee.jpg'
    }, {
        id: 'brz',
        name: 'Body Wave 20"',
        price: 2299,
        category: 'weaves',
        newArrival: false,
        img: 'assets/Images/Salee.jpg'
    }, {
        id: 'inch',
        name: 'Kinky Curly 16"',
        price: 1749,
        category: 'weaves',
        newArrival: false,
        img: 'assets/Images/saleee.jpg'
    }, {
        id: 'bon',
        name: 'Silk Hair Bonnet',
        price: 149,
        category: 'clothing',
        newArrival: true,
        img: 'assets/Images/saLE.jpg'
    }, {
        id: 'cl1',
        name: 'Logo Tee',
        price: 249,
        category: 'clothing',
        newArrival: false,
        img: 'assets/Images/Isentle2.jpg'
    }, {
        id: 'ins1',
        name: 'Installation - Basic',
        price: 450,
        category: 'installations',
        newArrival: false,
        img: 'assets/Images/8.jpg'
    }, {
        id: 'ins2',
        name: 'Installation - Premium',
        price: 800,
        category: 'installations',
        newArrival: false,
        img: 'assets/Images/Salee.jpg'
    }];

    // Add skincare placeholder products
    PRODUCTS.push({
        id: 'sk1',
        name: 'Gentle Cleanser',
        price: 129,
        category: 'skincare',
        newArrival: false,
        img: 'assets/Images/saLE.jpg'
    });
    PRODUCTS.push({
        id: 'sk2',
        name: 'Hydrating Serum',
        price: 249,
        category: 'skincare',
        newArrival: true,
        img: 'assets/Images/saleee.jpg'
    });
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

    // Shop state for pagination and filter
    const SHOP_STATE = { filter: 'all', page: 1, perPage: 8 };

    function renderPagination(totalItems) {
        const pager = document.getElementById('shop-pagination');
        if (!pager) return;
        pager.innerHTML = '';
        const totalPages = Math.max(1, Math.ceil(totalItems / SHOP_STATE.perPage));
        // previous
        const prev = document.createElement('button');
        prev.textContent = '‹';
        prev.disabled = SHOP_STATE.page <= 1;
        prev.addEventListener('click', () => { SHOP_STATE.page = Math.max(1, SHOP_STATE.page - 1); renderShop(SHOP_STATE.filter, SHOP_STATE.page); });
        pager.appendChild(prev);

        // page numbers (compact)
        const start = Math.max(1, SHOP_STATE.page - 2);
        const end = Math.min(totalPages, SHOP_STATE.page + 2);
        if (start > 1) {
            const b = document.createElement('button'); b.textContent = '1'; b.addEventListener('click', () => { SHOP_STATE.page = 1; renderShop(SHOP_STATE.filter, 1); }); pager.appendChild(b);
            if (start > 2) { const e = document.createElement('span'); e.className = 'ellipsis'; e.textContent = '…'; pager.appendChild(e); }
        }
        for (let p = start; p <= end; p++) {
            const b = document.createElement('button'); b.textContent = String(p);
            if (p === SHOP_STATE.page) b.classList.add('active');
            b.addEventListener('click', () => { SHOP_STATE.page = p; renderShop(SHOP_STATE.filter, p); });
            pager.appendChild(b);
        }
        if (end < totalPages) {
            if (end < totalPages - 1) { const e = document.createElement('span'); e.className = 'ellipsis'; e.textContent = '…'; pager.appendChild(e); }
            const b = document.createElement('button'); b.textContent = String(totalPages); b.addEventListener('click', () => { SHOP_STATE.page = totalPages; renderShop(SHOP_STATE.filter, totalPages); }); pager.appendChild(b);
        }

        // next
        const next = document.createElement('button');
        next.textContent = '›';
        next.disabled = SHOP_STATE.page >= totalPages;
        next.addEventListener('click', () => { SHOP_STATE.page = Math.min(totalPages, SHOP_STATE.page + 1); renderShop(SHOP_STATE.filter, SHOP_STATE.page); });
        pager.appendChild(next);
    }

    function renderShop(filter = 'all', page = 1) {
        SHOP_STATE.filter = filter;
        SHOP_STATE.page = page;
        const wrap = document.getElementById('shop-products');
        if (!wrap) return;
        wrap.innerHTML = '';
        const items = PRODUCTS.filter(p => {
            if (filter === 'all') return true;
            if (filter === 'new') return !!p.newArrival;
            return p.category === filter;
        });

        // Apply sorting
        const sortSel = document.getElementById('shop-sort');
        const sortVal = sortSel ? sortSel.value : 'default';
        if (sortVal === 'price-asc') items.sort((a, b) => a.price - b.price);
        else if (sortVal === 'price-desc') items.sort((a, b) => b.price - a.price);
        else if (sortVal === 'new') items.sort((a, b) => (b.newArrival?1:0) - (a.newArrival?1:0));

        const total = items.length;
        if (total === 0) {
            wrap.innerHTML = '<p style="grid-column:1/-1;color:#6a5b65">No items found in this category.</p>';
            renderPagination(0);
            return;
        }

        const start = (SHOP_STATE.page - 1) * SHOP_STATE.perPage;
        const pageItems = items.slice(start, start + SHOP_STATE.perPage);

        pageItems.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            const badge = p.newArrival ? '<div class="badge-new">New</div>' : '';
            card.innerHTML = `
            ${badge}
            <img loading="lazy" src="${p.img}" alt="${p.name}">
            <div class="card-body">
                <h3>${p.name}</h3>
                <div class="price">R${p.price}</div>
                <div class="card-actions">
                    <button class="btn add" data-id="${p.id}">Add to cart</button>
                    <button class="btn secondary quick-view" data-id="${p.id}">Quick view</button>
                </div>
            </div>
            <div class="truck-overlay"></div>`;
            wrap.appendChild(card);
        });

        renderPagination(total);
    }

    // Shop toolbar filtering
    const shopToolbar = document.getElementById('shop-toolbar');
    if (shopToolbar) {
        shopToolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-filter]');
            if (!btn) return;
            const filter = btn.getAttribute('data-filter');
            // update visual active state and aria-pressed for assistive tech
            shopToolbar.querySelectorAll('button[data-filter]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
            btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
            renderShop(filter);
        });
        // ensure initial aria-pressed state
        shopToolbar.querySelectorAll('button[data-filter]').forEach(b => {
            if (!b.hasAttribute('aria-pressed')) b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
        });
    }
    // sort change handler
    const sortSelect = document.getElementById('shop-sort');
    if (sortSelect) sortSelect.addEventListener('change', () => {
        const active = shopToolbar.querySelector('button.active');
        const filter = active ? active.getAttribute('data-filter') : 'all';
        renderShop(filter);
    });

    renderShop('all');

    // Quick view modal handler
    document.body.addEventListener('click', (e) => {
        const q = e.target.closest('.quick-view');
        if (!q) return;
        const id = q.getAttribute('data-id');
        const p = PRODUCTS.find(x => x.id === id);
        if (!p) return;
        openQuickView(p);
    });

    function openQuickView(p) {
        let modal = document.getElementById('quick-view-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quick-view-modal';
            modal.className = 'quick-view-modal';
            modal.setAttribute('role','dialog');
            modal.setAttribute('aria-modal','true');
            modal.tabIndex = -1;
            modal.innerHTML = `
                <div class="quick-view-inner">
                    <button class="close" aria-label="Close">×</button>
                    <img class="qimg" src="${p.img}" alt="${p.name}">
                    <h3>${p.name}</h3>
                    <div class="price">R${p.price}</div>
                    <p class="qdesc">Product details coming soon.</p>
                    <div class="row"><button class="btn add" data-id="${p.id}">Add to cart</button></div>
                </div>`;
            document.body.appendChild(modal);
            // lock scroll
            document.body.style.overflow = 'hidden';
            const closeHandler = (ev) => {
                if (ev.target === modal || ev.target.classList.contains('close')) closeModal();
            };
            const keyHandler = (ev) => { if (ev.key === 'Escape') closeModal(); };
            modal.addEventListener('click', closeHandler);
            document.addEventListener('keydown', keyHandler);
            function closeModal() {
                if (!modal) return;
                document.body.style.overflow = '';
                modal.remove();
                document.removeEventListener('keydown', keyHandler);
            }
            // focus the close button for accessibility
            const btnClose = modal.querySelector('.close');
            if (btnClose) btnClose.focus();
        } else {
            modal.querySelector('.qimg').src = p.img;
            modal.querySelector('h3').textContent = p.name;
            modal.querySelector('.price').textContent = `R${p.price}`;
        }
    }

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
        const showCreateAccount = document.getElementById('show-create-account');
        if (showCreateAccount) {
            showCreateAccount.addEventListener('click', () => {
                location.hash = 'create-account';
            });
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            loginError.textContent = '';
            if (password.value.length < 6) return loginError.textContent = 'Password must be at least 6 characters.';
            if (!email.checkValidity()) return loginError.textContent = 'Please enter a valid email address.';
            setUser({
                email: email.value
            });
            cart.length = 0;
            saveCart();
            updateCount();
            location.hash = 'home';
            renderWelcome();
            toast(`Welcome back, ${email.value}!`);
        });
        showPass.addEventListener('change', (e) => {
            password.type = e.target.checked ? 'text' : 'password';
            dollFace.classList.toggle('cover', !e.target.checked);
        });
    }

    const createForm = document.getElementById('create-account-form');
    if (createForm) {
        const fullName = document.getElementById('create-name');
        const surname = document.getElementById('create-surname');
        const email = document.getElementById('create-email');
        const phone = document.getElementById('create-phone');
        const contactMethod = document.getElementById('create-contact-method');
        const password = document.getElementById('create-password');
        const confirmPassword = document.getElementById('create-password-confirm');
        const createError = document.getElementById('create-error');
        const showLogin = document.getElementById('show-login');
        if (showLogin) {
            showLogin.addEventListener('click', () => {
                location.hash = 'login';
            });
        }
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createError.textContent = '';
            if (!fullName.value.trim()) return createError.textContent = 'Please enter your first name.';
            if (!surname.value.trim()) return createError.textContent = 'Please enter your surname.';
            if (password.value.length < 6) return createError.textContent = 'Password must be at least 6 characters.';
            if (password.value !== confirmPassword.value) return createError.textContent = 'Passwords do not match.';
            if (!email.checkValidity()) return createError.textContent = 'Please enter a valid email address.';
            setUser({
                email: email.value,
                fullName: `${fullName.value.trim()} ${surname.value.trim()}`,
                phone: phone.value.trim(),
                contactMethod: contactMethod.value
            });
            cart.length = 0;
            saveCart();
            updateCount();
            location.hash = 'home';
            renderWelcome();
            toast(`Welcome, ${fullName.value.trim()}! Your account is ready.`);
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