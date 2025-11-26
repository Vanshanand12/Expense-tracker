// js/dashboard.js
// ----------------------------
// --- STATE & SELECTORS ---
// ----------------------------

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

const LS_KEY = 'pet_state_v1';

// ----------------------------
// --- UTIL ---
// ----------------------------
function formatMoney(num) {
  if (typeof num !== "number") num = Number(num) || 0;
  return Math.round(num);
}

function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) state = Object.assign(state, JSON.parse(raw));
}

// ----------------------------
// --- CHARTS VARIABLES ---
// ----------------------------
let pieChart = null;
let barChart = null;

// ----------------------------
// --- RENDER CHARTS ---
// ----------------------------
function renderCharts() {
  const ctxPie = document.getElementById("pieChart").getContext("2d");
  const ctxBar = document.getElementById("barChart").getContext("2d");

  // Category totals
  const categoryTotals = {};
  state.expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
  });

  const pieLabels = Object.keys(categoryTotals);
  const pieData = Object.values(categoryTotals);

  // Destroy old chart before rebuild
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieData
      }]
    },
    options: {
      responsive: true
    }
  });

  // Monthly totals
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyTotals = new Array(12).fill(0);

  state.expenses.forEach(exp => {
    const m = new Date(exp.date).getMonth();
    monthlyTotals[m] += Number(exp.amount);
  });

  if (barChart) barChart.destroy();
  barChart = new Chart(ctxBar, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Monthly Expenses",
        data: monthlyTotals
      }]
    },
    options: {
      responsive: true
    }
  });
}

// ----------------------------
// --- RENDER DASHBOARD ---
// ----------------------------
function renderDashboard() {
  const totalExpenses = state.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  totalBudgetEl.innerText = formatMoney(state.budget);
  totalExpensesEl.innerText = formatMoney(totalExpenses);
  budgetLeftEl.innerText = formatMoney(state.budget - totalExpenses);

  renderCharts(); // 🔥 chart update
}

// ----------------------------
// --- RENDER HISTORY ---
// ----------------------------
function renderHistory() {
  historyList.innerHTML = "";

  [...state.expenses].reverse().forEach(item => {
    const li = document.createElement("li");
    li.dataset.id = item.id;

    li.innerHTML = `
      <span>${item.category} • ${item.date} 
        <small class="text-muted"> - ${item.desc}</small>
      </span>
      <span>
        <strong>₹ ${formatMoney(item.amount)}</strong>
        <button class="btn btn-sm btn-outline-danger ms-2 remove-btn">Delete</button>
      </span>
    `;

    historyList.appendChild(li);
  });
}

// ----------------------------
// --- ADD & REMOVE EXPENSE ---
// ----------------------------
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

// ----------------------------
// --- INLINE EDIT BUDGET ---
// ----------------------------
function enableBudgetInlineEdit() {
  totalBudgetEl.style.cursor = "pointer";

  totalBudgetEl.addEventListener(
    "click",
    function () {
      const current = Number(this.innerText.replace(/\D+/g, "")) || 0;
      const input = document.createElement("input");
      input.type = "number";
      input.className = "form-control editable-input";
      input.value = current;

      this.replaceWith(input);
      input.focus();

      const save = () => {
        state.budget = Number(input.value) || 0;
        saveState();
        input.replaceWith(totalBudgetEl);
        renderDashboard();
        enableBudgetInlineEdit();
      };

      input.addEventListener("blur", save);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") input.replaceWith(totalBudgetEl);
      });
    },
    { once: true }
  );
}

// ----------------------------
// --- FORM SUBMIT ---
// ----------------------------
expenseForm.addEventListener("submit", e => {
  e.preventDefault();

  const amount = Number(amountInput.value);
  if (!amount || amount <= 0) return alert("Enter a valid amount");

  addExpense({
    category: categoryInput.value,
    amount,
    date: dateInput.value || new Date().toISOString().slice(0, 10),
    desc: descInput.value
  });

  expenseForm.reset();
});

// delete expense
historyList.addEventListener("click", e => {
  if (e.target.classList.contains("remove-btn")) {
    const id = e.target.closest("li").dataset.id;
    if (confirm("Delete this expense?")) removeExpense(id);
  }
});

// ----------------------------
// --- INITIALIZE ---
// ----------------------------
(function init() {
  loadState();
  renderDashboard();
  renderHistory();
  enableBudgetInlineEdit();
})();
