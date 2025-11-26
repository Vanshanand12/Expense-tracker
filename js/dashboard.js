// js/dashboard.js

// --- STATE & SELECTORS ---
const totalBudgetEl = document.getElementById('totalBudget');
const totalExpensesEl = document.getElementById('totalExpenses');
const budgetLeftEl = document.getElementById('budgetLeft');

const expenseForm = document.getElementById('expenseForm');
const categoryInput = document.getElementById('category');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const descInput = document.getElementById('description');
const historyList = document.getElementById('historyList');

let state = {
  budget: 20000,
  expenses: [] // {id, category, amount, date, desc}
};

// --- LOCAL STORAGE KEYS ---
const LS_KEY = 'pet_state_v1';

// --- UTIL ---
function formatMoney(num) {
  if (typeof num !== 'number') num = Number(num) || 0;
  // simple formatting without currency symbol so editing stays numeric
  return Math.round(num);
}

function saveState() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        state = Object.assign(state, parsed);
      }
    }
  } catch (e) {
    console.warn('localStorage load failed', e);
  }
}

// --- RENDER ---
function renderDashboard() {
  totalBudgetEl.innerText = formatMoney(state.budget);
  const totalExpenses = state.expenses.reduce((s, it) => s + Number(it.amount || 0), 0);
  totalExpensesEl.innerText = formatMoney(totalExpenses);
  budgetLeftEl.innerText = formatMoney(state.budget - totalExpenses);
}

function renderHistory() {
  historyList.innerHTML = '';
  // newest first
  [...state.expenses].reverse().forEach(item => {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    li.innerHTML = `
      <span>${item.category} • ${item.date || ''} <small class="text-muted">- ${item.desc || ''}</small></span>
      <span>
        <strong>₹ ${formatMoney(item.amount)}</strong>
        <button class="btn btn-sm btn-outline-danger ms-2 remove-btn">Delete</button>
      </span>
    `;
    historyList.appendChild(li);
  });
}

// --- ACTIONS ---
function addExpense(payload) {
  const id = Date.now().toString();
  state.expenses.push({ id, ...payload });
  saveState();
  renderDashboard();
  renderHistory();
}

function removeExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  saveState();
  renderDashboard();
  renderHistory();
}

// --- INLINE EDITING FOR TOTAL BUDGET ---
function enableBudgetInlineEdit() {
  totalBudgetEl.style.cursor = 'pointer';
  
  totalBudgetEl.addEventListener('click', function onClick() {
    // prevent multiple inputs
    const current = Number(this.innerText.replace(/[^0-9.-]+/g,"")) || 0;
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control editable-input';
    input.value = current;
    input.min = 0;
    
    this.replaceWith(input);
    input.focus();
    input.select();

    function save() {
      const newVal = Number(input.value) || 0;
      state.budget = newVal;
      saveState();
      input.replaceWith(totalBudgetEl);
      renderDashboard();
      enableBudgetInlineEdit(); // rebind
    }

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') {
        // cancel
        input.replaceWith(totalBudgetEl);
        enableBudgetInlineEdit();
      }
    });
  }, { once: true });
}

// --- FORM HANDLERS ---
expenseForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const amount = Number(amountInput.value);
  if (!amount || amount <= 0) {
    alert('Enter a valid amount');
    return;
  }
  const payload = {
    category: categoryInput.value,
    amount: amount,
    date: dateInput.value || new Date().toISOString().slice(0,10),
    desc: descInput.value || ''
  };
  addExpense(payload);
  expenseForm.reset();
});

// delete from history (event delegation)
historyList.addEventListener('click', function (e) {
  if (e.target.classList.contains('remove-btn')) {
    const li = e.target.closest('li');
    const id = li?.dataset?.id;
    if (id && confirm('Delete this expense?')) {
      removeExpense(id);
    }
  }
});

// --- INITIALIZE ---
(function init() {
  loadState();
  renderDashboard();
  renderHistory();
  enableBudgetInlineEdit();
})();
 
