/* app.js */
// --- Initial Data ---
const initialProducts = [
    { id: 1, name: 'Sándwich de Pollo', price: 4.50, icon: '🥪', active: true },
    { id: 2, name: 'Sándwich Mixto', price: 3.50, icon: '🥪', active: true },
    { id: 3, name: 'Empanada de Carne', price: 3.00, icon: '🥟', active: true },
    { id: 4, name: 'Café Americano', price: 2.00, icon: '☕', active: true },
    { id: 5, name: 'Jugo de Papaya', price: 3.50, icon: '🥤', active: true },
    { id: 6, name: 'Sándwich Triple', price: 5.00, icon: '🥪', active: true },
    { id: 7, name: 'Pan con Chicharrón', price: 6.00, icon: '🥖', active: true },
    { id: 8, name: 'Gaseosa Inka Cola', price: 2.50, icon: '🥤', active: true },
    { id: 9, name: 'Galletas Casino', price: 1.50, icon: '🍪', active: true },
    { id: 10, name: 'Chicha Morada', price: 2.00, icon: '🧃', active: true }
];

// --- State Management (LocalStorage) ---
function getProducts() {
    const prods = localStorage.getItem('ingenio_products');
    if (!prods) return initialProducts;
    
    // Merge new products if missing from local storage
    let parsed = JSON.parse(prods);
    let updated = false;
    initialProducts.forEach(ip => {
        if (!parsed.find(p => p.id === ip.id)) {
            parsed.push(ip);
            updated = true;
        }
    });
    
    if (updated) saveProducts(parsed);
    return parsed;
}

function saveProducts(products) {
    localStorage.setItem('ingenio_products', JSON.stringify(products));
}

function getOrders() {
    const orders = localStorage.getItem('ingenio_orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('ingenio_orders', JSON.stringify(orders));
}

function getStamps() {
    const stamps = localStorage.getItem('ingenio_stamps');
    return stamps ? JSON.parse(stamps) : {}; // { "studentCode": count }
}

function saveStamps(stamps) {
    localStorage.setItem('ingenio_stamps', JSON.stringify(stamps));
}

function getSession() {
    const session = localStorage.getItem('ingenio_session');
    return session ? JSON.parse(session) : null;
}

function saveSession(session) {
    localStorage.setItem('ingenio_session', JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem('ingenio_session');
}

function getUsers() {
    const users = localStorage.getItem('ingenio_users');
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem('ingenio_users', JSON.stringify(users));
}

function ensureDefaultAdmin() {
    const users = getUsers();
    if (!users.admin) {
        users.admin = {
            username: 'admin',
            password: 'julio123',
            role: 'admin',
            name: 'Sr. Julio'
        };
        saveUsers(users);
    }
}

// Initialize if empty
if (!localStorage.getItem('ingenio_products')) saveProducts(initialProducts);
ensureDefaultAdmin();

// --- Global Variables ---
let cart = [];
let ticketCounter = getOrders().length + 1;

// --- DOM Elements ---
const btnViewHome = document.getElementById('btn-view-home');
const btnViewClient = document.getElementById('btn-view-client');
const btnViewAdmin = document.getElementById('btn-view-admin');

const viewLogin = document.getElementById('view-login');
const viewHome = document.getElementById('view-home');
const viewClient = document.getElementById('view-client');
const viewAdmin = document.getElementById('view-admin');

const sessionBar = document.getElementById('session-bar');
const sessionUser = document.getElementById('session-user');
const btnLogout = document.getElementById('btn-logout');
const loginUser = document.getElementById('login-user');
const loginPassword = document.getElementById('login-password');
const btnLogin = document.getElementById('btn-login');
const loginMainError = document.getElementById('login-main-error');
const btnShowRegister = document.getElementById('btn-show-register');
const registerCard = document.getElementById('register-card');
const registerName = document.getElementById('register-name');
const registerCode = document.getElementById('register-code');
const registerPassword = document.getElementById('register-password');
const registerError = document.getElementById('register-error');
const btnRegister = document.getElementById('btn-register');
const btnBackLogin = document.getElementById('btn-back-login');

const studentMenuContainer = document.getElementById('student-menu');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const emptyCartMsg = document.getElementById('empty-cart-msg');
const studentCodeInput = document.getElementById('student-code');
const btnPlaceOrder = document.getElementById('btn-place-order');

const ticketModal = document.getElementById('ticket-modal');
const btnCloseTicket = document.getElementById('btn-close-ticket');

const adminMenuContainer = document.getElementById('admin-menu');
const adminOrdersContainer = document.getElementById('admin-orders');
const toastContainer = document.getElementById('toast-container');

// Modals y Sellos
const loginModal = document.getElementById('login-modal');
const btnLoginAdmin = document.getElementById('btn-login-admin');
const btnCancelLogin = document.getElementById('btn-cancel-login');
const adminPassword = document.getElementById('admin-password');
const loginError = document.getElementById('login-error');

const checkCodeInput = document.getElementById('check-code');
const btnCheckStatus = document.getElementById('btn-check-status');
const statusDisplay = document.getElementById('status-display');
const stampsCount = document.getElementById('stamps-count');
const stampsFill = document.getElementById('stamps-fill');
const stampsReward = document.getElementById('stamps-reward');
const btnClaimReward = document.getElementById('btn-claim-reward');
const clientOrdersList = document.getElementById('client-orders-list');
const clientHistoryList = document.getElementById('client-history-list');

const logoHome = document.getElementById('logo-home');

// --- Event Listeners ---
logoHome.addEventListener('click', () => goToDefaultView());
btnViewHome.addEventListener('click', () => switchView('home'));
btnViewClient.addEventListener('click', () => switchView('client'));

btnViewAdmin.addEventListener('click', () => {
    switchView('admin');
});

btnLogin.addEventListener('click', login);
btnShowRegister.addEventListener('click', showRegister);
btnBackLogin.addEventListener('click', showLogin);
btnRegister.addEventListener('click', registerStudent);
btnLogout.addEventListener('click', logout);
loginUser.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') login();
});
loginPassword.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') login();
});
registerPassword.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') registerStudent();
});
btnLoginAdmin.addEventListener('click', attemptLogin);
btnCancelLogin.addEventListener('click', () => loginModal.classList.remove('show'));
adminPassword.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') attemptLogin();
});

function attemptLogin() {
    if (adminPassword.value === 'julio123') {
        loginModal.classList.remove('show');
        saveSession({ role: 'admin', name: 'Sr. Julio' });
        updateSessionUI();
        switchView('admin');
    } else {
        loginError.style.display = 'block';
    }
}

function login() {
    const username = loginUser.value.trim().toUpperCase();
    const password = loginPassword.value;
    const users = getUsers();
    const user = users[username.toLowerCase()] || users[username];

    loginMainError.style.display = 'none';

    if (!user || user.password !== password) {
        loginMainError.style.display = 'block';
        return;
    }

    loginPassword.value = '';

    if (user.role === 'admin') {
        saveSession({ role: 'admin', name: user.name });
        updateSessionUI();
        switchView('admin');
        showToast('Sesion iniciada');
        return;
    }

    saveSession({ role: 'student', code: user.code, name: user.name });
    updateSessionUI();
    switchView('home');
    showToast(`Bienvenido, ${user.name}`);
}

function registerStudent() {
    const name = registerName.value.trim();
    const code = registerCode.value.trim().toUpperCase();
    const password = registerPassword.value;
    const users = getUsers();

    registerError.style.display = 'none';

    if (!name || !isValidCode(code) || password.length < 4) {
        registerError.innerText = 'Completa nombre, codigo valido y una contrasena de minimo 4 caracteres.';
        registerError.style.display = 'block';
        return;
    }

    if (users[code]) {
        registerError.innerText = 'Ese codigo ya tiene una cuenta.';
        registerError.style.display = 'block';
        return;
    }

    users[code] = {
        username: code,
        password,
        role: 'student',
        code,
        name
    };
    saveUsers(users);

    loginUser.value = code;
    loginPassword.value = '';
    registerName.value = '';
    registerCode.value = '';
    registerPassword.value = '';
    showLogin();
    showToast('Cuenta creada. Ahora ingresa con tu contrasena.');
}

function showRegister() {
    registerCard.style.display = 'block';
    btnShowRegister.style.display = 'none';
    registerName.focus();
}

function showLogin() {
    registerCard.style.display = 'none';
    btnShowRegister.style.display = '';
    loginMainError.style.display = 'none';
    registerError.style.display = 'none';
    loginUser.focus();
}

function logout() {
    clearSession();
    cart = [];
    studentCodeInput.value = '';
    checkCodeInput.value = '';
    renderCart();
    updateSessionUI();
    switchView('login');
    showToast('Sesion cerrada');
}

studentCodeInput.addEventListener('input', validateOrderBtn);
btnPlaceOrder.addEventListener('click', placeOrder);
btnCloseTicket.addEventListener('click', () => {
    ticketModal.classList.remove('show');
    cart = [];
    studentCodeInput.value = '';
    renderCart();
});

// Utilidad para validar código (10 números + 1 letra)
function isValidCode(code) {
    const regex = /^\d{10}[a-zA-Z]$/;
    return regex.test(code);
}

function isSandwich(item) {
    const name = item.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    return name.includes('sandwich') || name.includes('ndwich');
}

btnCheckStatus.addEventListener('click', () => {
    const session = getSession();
    if (!session || session.role !== 'student') {
        showToast("Inicia sesion como alumno para consultar tus datos.", "error");
        switchView('login');
        return;
    }

    const code = session.code;
    if (!isValidCode(code)) {
        showToast("Formato inválido. Ej: 2024101454E", "error");
        return;
    }
    
    statusDisplay.style.display = 'block';
    renderLoyaltyCard(code);

    // --- Render Orders ---
    const allOrders = getOrders();
    const myOrders = allOrders.filter(o => o.studentCode === code && o.status !== 'completed');
    
    clientOrdersList.innerHTML = '';
    
    if (myOrders.length === 0) {
        clientOrdersList.innerHTML = '<p class="empty-msg" style="text-align: left; margin: 0;">No tienes pedidos activos en curso.</p>';
    } else {
        myOrders.forEach(o => {
            const isReady = o.status === 'ready';
            const statusClass = isReady ? 'tracker-status-ready' : 'tracker-status-pending';
            const badgeClass = isReady ? 'bg-ready' : 'bg-pending';
            const statusText = isReady ? '¡Listo para Recoger!' : 'En Preparación';
            const icon = isReady ? '<i class="fa-solid fa-check-double"></i>' : '<i class="fa-solid fa-fire-burner"></i>';

            clientOrdersList.innerHTML += `
                <div class="tracker-card ${statusClass}">
                    <div style="display:flex; justify-content: space-between; font-weight: bold;">
                        <span>Turno #${o.id.toString().padStart(3, '0')}</span>
                        <span>S/ ${o.total.toFixed(2)}</span>
                    </div>
                    <div class="badge ${badgeClass}" style="margin-top: 0.5rem; display: inline-block;">${icon} ${statusText}</div>
                </div>
            `;
        });
    }

    // --- Render History ---
    const historyOrders = allOrders.filter(o => o.studentCode === code && o.status === 'completed');
    clientHistoryList.innerHTML = '';

    if (historyOrders.length === 0) {
        clientHistoryList.innerHTML = '<p class="empty-msg" style="text-align: left; margin: 0;">No tienes historial.</p>';
    } else {
        historyOrders.slice(-5).reverse().forEach(o => { // Show last 5
            clientHistoryList.innerHTML += `
                <div style="padding: 0.5rem; border-bottom: 1px solid #eee; font-size: 0.9rem;">
                    <div style="display:flex; justify-content: space-between; color: var(--gray);">
                        <span>Turno #${o.id.toString().padStart(3, '0')}</span>
                        <span><i class="fa-solid fa-check"></i> Entregado</span>
                    </div>
                </div>
            `;
        });
    }
});

btnClaimReward.addEventListener('click', claimReward);

function renderLoyaltyCard(code) {
    const stampsData = getStamps();
    const count = stampsData[code] || 0;
    const visibleCount = Math.min(count, 10);
    
    stampsCount.innerText = visibleCount;
    stampsFill.style.width = `${(visibleCount / 10) * 100}%`;
    
    if (count >= 10) {
        stampsReward.style.display = 'block';
        btnClaimReward.style.display = 'flex';
        stampsFill.style.background = '#FF8E53'; 
    } else {
        stampsReward.style.display = 'none';
        btnClaimReward.style.display = 'none';
        stampsFill.style.background = 'var(--secondary)';
    }
}

function claimReward() {
    const session = getSession();
    if (!session || session.role !== 'student') {
        showToast("Inicia sesion como alumno para canjear tu recompensa.", "error");
        switchView('login');
        return;
    }

    const stampsData = getStamps();
    const currentCount = stampsData[session.code] || 0;

    if (currentCount < 10) {
        showToast("Aun necesitas 10 sellos para canjear el cafe.", "error");
        renderLoyaltyCard(session.code);
        return;
    }

    stampsData[session.code] = currentCount - 10;
    saveStamps(stampsData);

    const orders = getOrders();
    orders.push({
        id: ticketCounter++,
        studentCode: session.code,
        items: [{ id: 'reward-coffee', name: 'Cafe americano gratis', price: 0, icon: '☕' }],
        total: 0,
        status: 'completed',
        reward: true,
        date: new Date().toISOString()
    });
    saveOrders(orders);

    renderLoyaltyCard(session.code);
    btnCheckStatus.click();
    showToast("Recompensa canjeada: cafe americano gratis.");
}

// View Switcher
function switchView(view) {
    const session = getSession();
    
    if (view === 'home' || view === 'client') {
        if (!session || session.role !== 'student') {
            showToast("Inicia sesion como alumno para ver esta seccion.", "error");
            view = 'login';
        }
    }

    if (view === 'admin') {
        if (!session || session.role !== 'admin') {
            showToast("Solo el administrador puede ver esta seccion.", "error");
            view = 'login';
        }
    }

    btnViewHome.classList.remove('active');
    btnViewClient.classList.remove('active');
    btnViewAdmin.classList.remove('active');
    
    viewLogin.classList.remove('active');
    viewHome.classList.remove('active');
    viewClient.classList.remove('active');
    viewAdmin.classList.remove('active');

    if (view === 'login') {
        viewLogin.classList.add('active');
        loginUser.focus();
    } else if (view === 'home') {
        btnViewHome.classList.add('active');
        viewHome.classList.add('active');
        prepareStudentSessionFields();
        renderStudentMenu(); 
    } else if (view === 'client') {
        btnViewClient.classList.add('active');
        viewClient.classList.add('active');
        prepareStudentSessionFields();
        statusDisplay.style.display = 'none';
    } else if (view === 'admin') {
        btnViewAdmin.classList.add('active');
        viewAdmin.classList.add('active');
        renderAdminMenu();
        renderAdminOrders();
    }
}

function updateSessionUI() {
    const session = getSession();

    if (!session) {
        sessionBar.style.display = 'none';
        btnViewHome.style.display = 'none';
        btnViewClient.style.display = 'none';
        btnViewAdmin.style.display = 'none';
        return;
    }

    sessionBar.style.display = 'flex';

    if (session.role === 'student') {
        sessionUser.innerText = `${session.name || 'Alumno'}: ${session.code}`;
        btnViewHome.style.display = '';
        btnViewClient.style.display = '';
        btnViewAdmin.style.display = 'none';
        prepareStudentSessionFields();
    } else {
        sessionUser.innerText = session.name || 'Administrador';
        btnViewHome.style.display = 'none';
        btnViewClient.style.display = 'none';
        btnViewAdmin.style.display = '';
    }
}

function prepareStudentSessionFields() {
    const session = getSession();
    if (!session || session.role !== 'student') return;

    studentCodeInput.value = session.code;
    checkCodeInput.value = session.code;
    validateOrderBtn();
}

function goToDefaultView() {
    const session = getSession();

    if (!session) {
        switchView('login');
    } else if (session.role === 'admin') {
        switchView('admin');
    } else {
        switchView('home');
    }
}

// --- Student Functions ---
function renderStudentMenu() {
    const products = getProducts();
    studentMenuContainer.innerHTML = '';
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = `product-card ${!p.active ? 'disabled' : ''}`;
        card.innerHTML = `
            <div class="product-icon">${p.icon}</div>
            <div class="product-name">${p.name}</div>
            <div class="product-price">S/ ${p.price.toFixed(2)}</div>
            <button class="btn-add" onclick="addToCart(${p.id})" ${!p.active ? 'disabled' : ''}>
                <i class="fa-solid fa-plus"></i> Agregar
            </button>
        `;
        
        // HU-06: Check if a product in cart was disabled
        if (!p.active && cart.some(item => item.id === p.id)) {
            cart = cart.filter(item => item.id !== p.id);
            renderCart();
            showToast(`¡Uy! ${p.name} acaba de agotarse. Se removió de tu pedido.`, 'error');
        }
        
        studentMenuContainer.appendChild(card);
    });
}

window.addToCart = function(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    
    if (!product.active) {
        showToast(`Ingredientes agotados por el momento. ¡Elige otra opción!`, 'error'); // HU-06
        renderStudentMenu();
        return;
    }
    
    cart.push(product);
    renderCart();
    showToast(`Agregado: ${product.name}`);
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        emptyCartMsg.style.display = 'block';
    } else {
        emptyCartMsg.style.display = 'none';
        cart.forEach((item, index) => {
            total += item.price;
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">S/ ${item.price.toFixed(2)}</span>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash-can"></i></button>
            `;
            cartItemsContainer.appendChild(el);
        });
    }
    
    cartTotalEl.innerText = total.toFixed(2);
    validateOrderBtn();
}

function validateOrderBtn() {
    const code = studentCodeInput.value.trim().toUpperCase();
    btnPlaceOrder.disabled = cart.length === 0 || !isValidCode(code);
    
    // Feedback visual
    if (code.length > 0 && !isValidCode(code)) {
        studentCodeInput.style.borderColor = 'var(--primary)';
    } else if (isValidCode(code)) {
        studentCodeInput.style.borderColor = 'var(--secondary)';
    } else {
        studentCodeInput.style.borderColor = 'var(--gray-light)';
    }
}

function placeOrder() {
    if (cart.length === 0) return;
    const session = getSession();

    if (!session || session.role !== 'student') {
        showToast("Inicia sesion como alumno para hacer pedidos.", "error");
        switchView('login');
        return;
    }
    
    // Check if any product became inactive right before ordering (HU-06)
    const currentProducts = getProducts();
    const invalidItems = cart.filter(cItem => {
        const p = currentProducts.find(p => p.id === cItem.id);
        return !p || !p.active;
    });
    
    if (invalidItems.length > 0) {
        showToast("Algunos productos se agotaron recién. Tu carrito ha sido actualizado.", "error");
        renderStudentMenu();
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const code = session.code;
    const orderNumber = ticketCounter++;
    
    const newOrder = {
        id: orderNumber,
        studentCode: code,
        items: [...cart],
        total: total,
        status: 'pending', // HU-04: pending physical payment
        date: new Date().toISOString()
    };
    
    const orders = getOrders();
    orders.push(newOrder);
    saveOrders(orders);
    
    // Show Ticket
    document.getElementById('ticket-num').innerText = `#${orderNumber.toString().padStart(3, '0')}`;
    document.getElementById('ticket-total-val').innerText = total.toFixed(2);
    document.getElementById('ticket-code-val').innerText = code;
    
    const ul = document.getElementById('ticket-items-list');
    ul.innerHTML = '';
    cart.forEach(item => {
        ul.innerHTML += `<li><span>${item.name}</span> <span>S/ ${item.price.toFixed(2)}</span></li>`;
    });
    
    ticketModal.classList.add('show');
}

// --- Admin Functions ---
function renderAdminMenu() {
    const products = getProducts();
    adminMenuContainer.innerHTML = '';
    
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'admin-product-item';
        div.innerHTML = `
            <div class="admin-product-info">
                <span class="product-icon" style="font-size: 1.5rem; margin:0;">${p.icon}</span>
                <div>
                    <strong>${p.name}</strong><br>
                    <span class="status-badge ${p.active ? 'status-active' : 'status-inactive'}">
                        ${p.active ? 'Disponible' : 'Agotado'}
                    </span>
                </div>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${p.active ? 'checked' : ''} onchange="toggleProductStatus(${p.id})">
                <span class="slider"></span>
            </label>
        `;
        adminMenuContainer.appendChild(div);
    });
}

window.toggleProductStatus = function(id) {
    const products = getProducts();
    const p = products.find(prod => prod.id === id);
    if(p) {
        p.active = !p.active;
        saveProducts(products);
        renderAdminMenu();
        showToast(p.active ? `${p.name} activado` : `${p.name} desactivado`);
    }
}

function renderAdminOrders() {
    const orders = getOrders().filter(o => o.status === 'pending' || o.status === 'ready');
    adminOrdersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        adminOrdersContainer.innerHTML = '<p class="empty-msg">No hay pedidos pendientes.</p>';
        return;
    }
    
    orders.forEach(o => {
        const div = document.createElement('div');
        div.className = 'order-card';
        // highlight ready orders
        if (o.status === 'ready') {
            div.style.borderLeftColor = 'var(--primary)';
            div.style.backgroundColor = '#FFF0F0';
        }
        
        let itemsHtml = '';
        o.items.forEach(item => {
            itemsHtml += `<li>${item.name}</li>`;
        });
        
        let actionsHtml = '';
        if (o.status === 'pending') {
            actionsHtml = `
                <button class="btn-secondary" style="font-size: 0.8rem; padding: 0.5rem;" onclick="markOrderReady(${o.id})">
                    <i class="fa-solid fa-bell-concierge"></i> Marcar Listo
                </button>
            `;
        } else if (o.status === 'ready') {
            actionsHtml = `
                <button class="btn-complete" onclick="completeOrder(${o.id})">
                    <i class="fa-solid fa-check"></i> Cobrar y Entregar
                </button>
            `;
        }

        div.innerHTML = `
            <div class="order-header">
                <span>Turno #${o.id.toString().padStart(3, '0')}</span>
                <span>S/ ${o.total.toFixed(2)}</span>
            </div>
            <div class="order-student"><i class="fa-solid fa-id-card"></i> Código: ${o.studentCode}</div>
            <ul class="order-items">
                ${itemsHtml}
            </ul>
            <div class="order-footer">
                <span style="font-size: 0.8rem; color: #a9a9a9;">${o.status === 'ready' ? 'Esperando al alumno...' : 'En preparación'}</span>
                ${actionsHtml}
            </div>
        `;
        adminOrdersContainer.appendChild(div);
    });
}

window.markOrderReady = function(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = 'ready'; 
        saveOrders(orders);
        renderAdminOrders();
        showToast(`Pedido #${id.toString().padStart(3, '0')} marcado como listo.`);
    }
}

window.completeOrder = function(id) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if(order) {
        order.status = 'completed'; // HU-04: Pago completado en físico
        
        // HU-05: Sumar sellos por cada sándwich entregado
        let sandwichesCount = 0;
        order.items.forEach(item => {
            if (isSandwich(item)) {
                sandwichesCount++;
            }
        });
        
        if (sandwichesCount > 0) {
            const stampsData = getStamps();
            const code = order.studentCode;
            if (!stampsData[code]) stampsData[code] = 0;
            
            stampsData[code] += sandwichesCount;
            saveStamps(stampsData);
        }
        
        saveOrders(orders);
        renderAdminOrders();
        showToast(`Pedido #${id.toString().padStart(3, '0')} completado.`);
    }
}

// --- Utils ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Init
updateSessionUI();
goToDefaultView();
renderCart();
