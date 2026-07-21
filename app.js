// UI Elements
const balanceEl = document.getElementById('balance');
const incomeTotalEl = document.getElementById('income-total');
const expenseTotalEl = document.getElementById('expense-total');
const transactionListEl = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');
const descSelect = document.getElementById('desc-select');
const descInput = document.getElementById('desc');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const clearAllBtn = document.getElementById('clear-all');

// Formatting utilities
const formatMoney = (amount) => {
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Application State
let transactions = JSON.parse(localStorage.getItem('gastos_transactions')) || [];

// Categorías
let categories = JSON.parse(localStorage.getItem('gastos_categories')) || ['Mercado', 'Arriendo', 'Cuota Carro', 'Cuota Apartamento'];

const renderCategories = () => {
    descSelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
        descSelect.appendChild(option);
    });
    const customOption = document.createElement('option');
    customOption.value = 'Otra';
    customOption.innerText = 'Otra...';
    descSelect.appendChild(customOption);
};

// Handle category select change
descSelect.addEventListener('change', () => {
    if (descSelect.value === 'Otra') {
        descInput.style.display = 'block';
        descInput.required = true;
        descInput.focus();
    } else {
        descInput.style.display = 'none';
        descInput.required = false;
        descInput.value = '';
    }
});

// Init App
const init = () => {
    transactionListEl.innerHTML = '';
    renderCategories();
    
    if(transactions.length === 0) {
        transactionListEl.innerHTML = '<li class="empty-state">No hay movimientos aún. ¡Añade uno!</li>';
    } else {
        transactions.forEach(addTransactionDOM);
    }
    
    updateValues();
};

// Add Transaction to DOM
const addTransactionDOM = (transaction) => {
    const isIncome = transaction.type === 'income';
    const sign = isIncome ? '+' : '-';
    const icon = isIncome ? '<i class="fa-solid fa-arrow-trend-up"></i>' : '<i class="fa-solid fa-bag-shopping"></i>';
    
    const item = document.createElement('li');
    item.classList.add('transaction-item');
    item.classList.add(transaction.type);
    
    item.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-icon">
                ${icon}
            </div>
            <div class="transaction-details">
                <p>${transaction.desc}</p>
                <small>${formatDate(transaction.date)}</small>
            </div>
        </div>
        <div class="transaction-action">
            <span class="transaction-amount">${sign}${formatMoney(transaction.amount)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `;
    
    transactionListEl.appendChild(item);
};

// Update Balance, Income and Expense
const updateValues = () => {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => (acc += t.amount), 0)
        .toFixed(2);
        
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => (acc += t.amount), 0)
        .toFixed(2);
        
    balanceEl.innerText = formatMoney(total);
    incomeTotalEl.innerText = formatMoney(income);
    expenseTotalEl.innerText = formatMoney(expense);
};

// Remove Transaction
const removeTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
};

// Update Local Storage
const updateLocalStorage = () => {
    localStorage.setItem('gastos_transactions', JSON.stringify(transactions));
};

// Generate Random ID
const generateID = () => {
    return Math.floor(Math.random() * 100000000);
};

// Add New Transaction
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let finalDesc = descSelect.value;
    if (descSelect.value === 'Otra') {
        finalDesc = descInput.value.trim();
        // Guardar nueva categoría si no existe
        if (finalDesc && !categories.includes(finalDesc)) {
            categories.push(finalDesc);
            localStorage.setItem('gastos_categories', JSON.stringify(categories));
            renderCategories();
        }
    }
    
    if (finalDesc === '' || amountInput.value.trim() === '') {
        alert('Por favor añade una descripción y un monto');
        return;
    }
    
    const transaction = {
        id: generateID(),
        desc: finalDesc,
        amount: +amountInput.value,
        type: typeInput.value,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    
    addTransactionDOM(transaction);
    updateValues();
    updateLocalStorage();
    
    // Clear inputs
    descSelect.value = categories[0];
    descInput.style.display = 'none';
    descInput.required = false;
    descInput.value = '';
    amountInput.value = '';
    
    // Remove empty state if present
    const emptyState = document.querySelector('.empty-state');
    if(emptyState) {
        init();
    }
});

// Clear All Transactions
clearAllBtn.addEventListener('click', () => {
    if(confirm('¿Estás seguro de que quieres borrar todos los movimientos?')) {
        transactions = [];
        updateLocalStorage();
        init();
    }
});

// Run init
init();

// Profile Modal Elements
const avatarBtn = document.getElementById('avatar-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileNameInput = document.getElementById('profile-name');
const profilePasswordInput = document.getElementById('profile-password');
const changePasswordBtn = document.getElementById('change-password-btn');
const logoutBtn = document.getElementById('logout-btn');

// Load profile data
let userName = localStorage.getItem('gastos_user_name') || 'Usuario';
profileNameInput.value = userName;

avatarBtn.addEventListener('click', () => {
    profileModal.classList.add('active');
});

closeProfileBtn.addEventListener('click', () => {
    profileModal.classList.remove('active');
});

// Update name on change
profileNameInput.addEventListener('change', (e) => {
    userName = e.target.value;
    localStorage.setItem('gastos_user_name', userName);
});

let isEditingPassword = false;

changePasswordBtn.addEventListener('click', () => {
    if (!isEditingPassword) {
        // Modo edición
        isEditingPassword = true;
        profilePasswordInput.removeAttribute('readonly');
        profilePasswordInput.value = '';
        profilePasswordInput.focus();
        changePasswordBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Contraseña';
        changePasswordBtn.style.backgroundColor = '#10B981'; // Color verde
        changePasswordBtn.style.color = 'white';
        changePasswordBtn.style.borderColor = '#059669';
    } else {
        // Guardar contraseña
        if (profilePasswordInput.value.trim() === '') {
            alert('La contraseña no puede estar vacía');
            return;
        }
        
        isEditingPassword = false;
        profilePasswordInput.setAttribute('readonly', true);
        profilePasswordInput.value = '********';
        
        // Restaurar botón
        changePasswordBtn.innerHTML = '<i class="fa-solid fa-key"></i> Cambiar Contraseña';
        changePasswordBtn.style.backgroundColor = ''; 
        changePasswordBtn.style.color = '';
        changePasswordBtn.style.borderColor = '';
        
        alert('¡Contraseña actualizada con éxito!');
    }
});

logoutBtn.addEventListener('click', () => {
    if(confirm('¿Estás seguro que deseas cerrar sesión?')) {
        profileModal.classList.remove('active');
        localStorage.setItem('gastos_logged_in', 'false');
        
        // Mostrar pantalla de login
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        
        // Limpiar formulario de login
        document.getElementById('login-form').reset();
    }
});

// --- Lógica de Inicio de Sesión ---
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginUserInput = document.getElementById('login-user');
const registerUserInput = document.getElementById('register-user');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const goToRegisterBtn = document.getElementById('go-to-register');
const goToLoginBtn = document.getElementById('go-to-login');

const checkLoginState = () => {
    const isLoggedIn = localStorage.getItem('gastos_logged_in') === 'true';
    if (isLoggedIn) {
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
    } else {
        loginScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
};

// Navegación entre formularios
goToRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authTitle.innerText = 'Crear Cuenta';
    authSubtitle.innerText = 'Regístrate para empezar a controlar tus gastos';
});

goToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    authTitle.innerText = 'CONTROL DE FINANZAS';
    authSubtitle.innerText = 'Inicia sesión para controlar tus gastos';
});

// Submit Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = loginUserInput.value.trim();
    if (user) {
        loginUser(user);
    }
});

// Submit Registro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = registerUserInput.value.trim();
    if (user) {
        loginUser(user);
        alert(`¡Bienvenida, ${user}! Tu cuenta ha sido creada exitosamente (simulación).`);
    }
});

// Función compartida para iniciar sesión
const loginUser = (user) => {
    localStorage.setItem('gastos_logged_in', 'true');
    localStorage.setItem('gastos_user_name', user);
    profileNameInput.value = user;
    userName = user;
    
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
};

// Validar al iniciar
checkLoginState();

// --- Lógica de Temas ---
const colorOptions = document.querySelectorAll('.color-option');
const body = document.body;

const savedTheme = localStorage.getItem('gastos_theme') || '';
if (savedTheme) {
    body.className = savedTheme;
}
// Marcar la opción correcta como activa
colorOptions.forEach(opt => {
    opt.classList.remove('active');
    if (opt.dataset.theme === savedTheme) {
        opt.classList.add('active');
    }
});

colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        
        const theme = option.dataset.theme;
        body.className = theme;
        
        localStorage.setItem('gastos_theme', theme);
    });
});
