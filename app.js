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

// New UI Elements
const currentMonthDisplay = document.getElementById('current-month-display');
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');

const expectedIncomeInput = document.getElementById('expected-income');
const savingsGoalInput = document.getElementById('savings-goal');
const currentSavingsEl = document.getElementById('current-savings');
const savingsStatusEl = document.getElementById('savings-status');
const savingsBarFill = document.getElementById('savings-bar-fill');

const pendingForm = document.getElementById('pending-form');
const pendingDescSelect = document.getElementById('pending-desc-select');
const pendingDescCustom = document.getElementById('pending-desc-custom');
const pendingAmountInput = document.getElementById('pending-amount');
const pendingDateInput = document.getElementById('pending-date');
const pendingListEl = document.getElementById('pending-list');

let expensesChart = null;

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
let categories = JSON.parse(localStorage.getItem('gastos_categories')) || ['Mercado', 'Arriendo', 'Cuota Carro', 'Cuota Apartamento'];
let pendingTransactions = JSON.parse(localStorage.getItem('gastos_pending')) || [];
let monthlyGoals = JSON.parse(localStorage.getItem('gastos_goals')) || {};

let currentDate = new Date();
let currentMonth = currentDate.getMonth(); // 0-11
let currentYear = currentDate.getFullYear();

const getMonthKey = () => `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;

const getFilteredTransactions = () => {
    return transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
};

const updateMonthDisplay = () => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    currentMonthDisplay.innerText = `${months[currentMonth]} ${currentYear}`;
};

const renderCategories = () => {
    descSelect.innerHTML = '';
    pendingDescSelect.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.innerText = cat;
        descSelect.appendChild(option);
        
        const option2 = document.createElement('option');
        option2.value = cat;
        option2.innerText = cat;
        pendingDescSelect.appendChild(option2);
    });
    const customOption = document.createElement('option');
    customOption.value = 'Otra';
    customOption.innerText = 'Otra...';
    descSelect.appendChild(customOption);
    
    const customOption2 = document.createElement('option');
    customOption2.value = 'Otra';
    customOption2.innerText = 'Otra...';
    pendingDescSelect.appendChild(customOption2);
};

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

pendingDescSelect.addEventListener('change', () => {
    if (pendingDescSelect.value === 'Otra') {
        pendingDescCustom.style.display = 'block';
        pendingDescCustom.required = true;
        pendingDescCustom.focus();
    } else {
        pendingDescCustom.style.display = 'none';
        pendingDescCustom.required = false;
        pendingDescCustom.value = '';
    }
});

const saveMonthlyGoals = () => {
    const key = getMonthKey();
    monthlyGoals[key] = {
        income: parseFloat(expectedIncomeInput.value) || 0,
        savings: parseFloat(savingsGoalInput.value) || 0
    };
    localStorage.setItem('gastos_goals', JSON.stringify(monthlyGoals));
    updateValues();
};

expectedIncomeInput.addEventListener('change', saveMonthlyGoals);
savingsGoalInput.addEventListener('change', saveMonthlyGoals);

const loadMonthlyGoals = () => {
    const key = getMonthKey();
    if (monthlyGoals[key]) {
        expectedIncomeInput.value = monthlyGoals[key].income > 0 ? monthlyGoals[key].income : '';
        savingsGoalInput.value = monthlyGoals[key].savings > 0 ? monthlyGoals[key].savings : '';
    } else {
        expectedIncomeInput.value = '';
        savingsGoalInput.value = '';
    }
};

const renderChart = () => {
    const ctx = document.getElementById('expenses-chart');
    const noDataText = document.getElementById('no-chart-data');
    
    const filtered = getFilteredTransactions();
    const currentMonthExpenses = filtered.filter(t => t.type === 'expense');
    
    if(currentMonthExpenses.length === 0) {
        ctx.style.display = 'none';
        noDataText.style.display = 'block';
        if(expensesChart) expensesChart.destroy();
        return;
    }
    
    ctx.style.display = 'block';
    noDataText.style.display = 'none';
    
    const expensesByCategory = {};
    currentMonthExpenses.forEach(t => {
        if(!expensesByCategory[t.desc]) {
            expensesByCategory[t.desc] = 0;
        }
        expensesByCategory[t.desc] += t.amount;
    });
    
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    
    const bgColors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#64748B'
    ];
    
    if(expensesChart) {
        expensesChart.destroy();
    }
    
    expensesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { family: "'Outfit', sans-serif" },
                        boxWidth: 12,
                        padding: 10
                    }
                }
            }
        }
    });
};

const init = () => {
    updateMonthDisplay();
    loadMonthlyGoals();
    
    transactionListEl.innerHTML = '';
    renderCategories();
    
    const filtered = getFilteredTransactions();
    
    if(filtered.length === 0) {
        transactionListEl.innerHTML = '<li class="empty-state">No hay movimientos en este mes.</li>';
    } else {
        filtered.forEach(addTransactionDOM);
    }
    
    renderPendingTransactions();
    updateValues();
    renderChart();
};

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

const renderPendingTransactions = () => {
    pendingListEl.innerHTML = '';
    if(pendingTransactions.length === 0) {
        pendingListEl.innerHTML = '<li class="empty-state" style="padding: 10px; text-align: center; font-size: 0.9em; color: var(--text-muted);">No hay pagos pendientes.</li>';
        return;
    }
    
    pendingTransactions.forEach(t => {
        const item = document.createElement('li');
        item.classList.add('transaction-item', 'pending');
        
        item.innerHTML = `
            <div class="transaction-info">
                <div class="transaction-icon">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <div class="transaction-details">
                    <p>${t.desc}</p>
                    <small>Programado: ${t.date ? formatDate(t.date) : 'Pendiente'}</small>
                </div>
            </div>
            <div class="transaction-action" style="display: flex; align-items: center;">
                <button class="btn-pay" onclick="payPending(${t.id})" title="Confirmar Pago">
                    <i class="fa-solid fa-check"></i> Pagar
                </button>
                <span class="transaction-amount" style="margin-right: 10px;">${formatMoney(t.amount)}</span>
                <button class="delete-btn" onclick="removePending(${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        pendingListEl.appendChild(item);
    });
};

const updateValues = () => {
    const filtered = getFilteredTransactions();
    const amounts = filtered.map(t => t.type === 'income' ? t.amount : -t.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = filtered.filter(t => t.type === 'income').reduce((acc, t) => (acc += t.amount), 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((acc, t) => (acc += t.amount), 0);
        
    balanceEl.innerText = formatMoney(total);
    incomeTotalEl.innerText = formatMoney(income);
    expenseTotalEl.innerText = formatMoney(expense);
    
    // Update Goals Progress
    const key = getMonthKey();
    const expectedIncome = monthlyGoals[key] ? monthlyGoals[key].income : 0;
    const savingsGoal = monthlyGoals[key] ? monthlyGoals[key].savings : 0;
    
    let currentSavings = total; 
    
    if (savingsGoal > 0) {
        let percent = (currentSavings / savingsGoal) * 100;
        if (currentSavings <= 0) percent = 0;
        if (percent > 100) percent = 100;
        
        currentSavingsEl.innerText = formatMoney(currentSavings);
        savingsStatusEl.innerText = `${percent.toFixed(0)}%`;
        savingsBarFill.style.width = `${percent}%`;
        
        if (percent >= 100) {
            savingsBarFill.style.backgroundColor = '#10B981'; // Green
        } else if (percent > 50) {
            savingsBarFill.style.backgroundColor = '#3B82F6'; // Blue
        } else {
            savingsBarFill.style.backgroundColor = 'var(--income)'; // Default
        }
    } else {
        currentSavingsEl.innerText = formatMoney(currentSavings);
        savingsStatusEl.innerText = '-';
        savingsBarFill.style.width = '0%';
    }
};

const removeTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
};

const removePending = (id) => {
    pendingTransactions = pendingTransactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
};

window.payPending = (id) => {
    const pendingItem = pendingTransactions.find(t => t.id === id);
    if(pendingItem) {
        if(!confirm(`¿Confirmas que ya realizaste el pago de "${pendingItem.desc}"?`)) return;
        
        pendingTransactions = pendingTransactions.filter(t => t.id !== id);
        
        const newTransaction = {
            id: generateID(),
            desc: pendingItem.desc,
            amount: pendingItem.amount,
            type: 'expense',
            date: new Date().toISOString() // La fecha de pago real (hoy)
        };
        
        transactions.push(newTransaction);
        updateLocalStorage();
        init();
    }
};

const updateLocalStorage = () => {
    localStorage.setItem('gastos_transactions', JSON.stringify(transactions));
    localStorage.setItem('gastos_pending', JSON.stringify(pendingTransactions));
};

const generateID = () => {
    return Math.floor(Math.random() * 100000000);
};

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let finalDesc = descSelect.value;
    if (descSelect.value === 'Otra') {
        finalDesc = descInput.value.trim();
        if (finalDesc && !categories.includes(finalDesc)) {
            categories.push(finalDesc);
            localStorage.setItem('gastos_categories', JSON.stringify(categories));
        }
    }
    
    if (finalDesc === '' || amountInput.value.trim() === '') {
        alert('Por favor añade una descripción y un monto');
        return;
    }
    
    // Assign a date within the currently selected month so it appears immediately
    // Or if looking at a past/future month, maybe place it there? Let's just use current real date.
    // Wait, if they are viewing July and it's July, new Date() is fine.
    // If they are viewing August and add a transaction, it'll go to current date. That's standard.
    const transaction = {
        id: generateID(),
        desc: finalDesc,
        amount: +amountInput.value,
        type: typeInput.value,
        date: new Date().toISOString()
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    init();
    
    descSelect.value = categories[0];
    descInput.style.display = 'none';
    descInput.required = false;
    descInput.value = '';
    amountInput.value = '';
});

pendingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let finalDesc = pendingDescSelect.value;
    if (pendingDescSelect.value === 'Otra') {
        finalDesc = pendingDescCustom.value.trim();
        if (finalDesc && !categories.includes(finalDesc)) {
            categories.push(finalDesc);
            localStorage.setItem('gastos_categories', JSON.stringify(categories));
            renderCategories();
        }
    }
    
    const amount = +pendingAmountInput.value;
    const date = pendingDateInput.value;
    
    if(!finalDesc || !amount || !date) return;
    
    const p = {
        id: generateID(),
        desc: finalDesc,
        amount: amount,
        date: date
    };
    
    pendingTransactions.push(p);
    updateLocalStorage();
    init();
    
    pendingDescSelect.value = categories[0];
    pendingDescCustom.style.display = 'none';
    pendingDescCustom.required = false;
    pendingDescCustom.value = '';
    
    pendingAmountInput.value = '';
    pendingDateInput.value = '';
});

clearAllBtn.addEventListener('click', () => {
    if(confirm('¿Estás seguro de que quieres borrar todos los movimientos de ESTE MES?')) {
        const filteredIds = getFilteredTransactions().map(t => t.id);
        transactions = transactions.filter(t => !filteredIds.includes(t.id));
        updateLocalStorage();
        init();
    }
});

// Month Navigation
prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if(currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    init();
});

nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if(currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    init();
});

init();

// Profile Modal Elements
const avatarBtn = document.getElementById('avatar-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfileBtn = document.getElementById('close-profile-btn');
const profileNameInput = document.getElementById('profile-name');
const profilePasswordInput = document.getElementById('profile-password');
const changePasswordBtn = document.getElementById('change-password-btn');
const logoutBtn = document.getElementById('logout-btn');

let userName = localStorage.getItem('gastos_user_name') || 'Usuario';
profileNameInput.value = userName;

avatarBtn.addEventListener('click', () => {
    profileModal.classList.add('active');
});

closeProfileBtn.addEventListener('click', () => {
    profileModal.classList.remove('active');
});

profileNameInput.addEventListener('change', (e) => {
    userName = e.target.value;
    localStorage.setItem('gastos_user_name', userName);
});

let isEditingPassword = false;
changePasswordBtn.addEventListener('click', () => {
    if (!isEditingPassword) {
        isEditingPassword = true;
        profilePasswordInput.removeAttribute('readonly');
        profilePasswordInput.value = '';
        profilePasswordInput.focus();
        changePasswordBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Contraseña';
        changePasswordBtn.style.backgroundColor = '#10B981';
        changePasswordBtn.style.color = 'white';
        changePasswordBtn.style.borderColor = '#059669';
    } else {
        if (profilePasswordInput.value.trim() === '') {
            alert('La contraseña no puede estar vacía');
            return;
        }
        isEditingPassword = false;
        profilePasswordInput.setAttribute('readonly', true);
        profilePasswordInput.value = '********';
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
        document.getElementById('login-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
        document.getElementById('login-form').reset();
    }
});

// Login Logic
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

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = loginUserInput.value.trim();
    if (user) {
        loginUser(user);
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = registerUserInput.value.trim();
    if (user) {
        loginUser(user);
        alert(`¡Bienvenida, ${user}! Tu cuenta ha sido creada exitosamente (simulación).`);
    }
});

const loginUser = (user) => {
    localStorage.setItem('gastos_logged_in', 'true');
    localStorage.setItem('gastos_user_name', user);
    profileNameInput.value = user;
    userName = user;
    
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
};

checkLoginState();

// Theming Logic
const colorOptions = document.querySelectorAll('.color-option');
const body = document.body;

const savedTheme = localStorage.getItem('gastos_theme') || '';
if (savedTheme) {
    body.className = savedTheme;
}

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

window.toggleSection = (headerElement) => {
    headerElement.classList.toggle("active");
    const content = headerElement.nextElementSibling;
    if (content.style.display === "none") {
        content.style.display = "block";
    } else {
        content.style.display = "none";
    }
}

