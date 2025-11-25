function enableInlineEditing() {
  document.querySelectorAll('.editable').forEach((element) => {
    element.addEventListener('click', function () {

      let oldValue = this.innerText.replace(/[^0-9]/g, ""); // remove ₹ symbol
      
      let input = document.createElement('input');
      input.type = 'number';
      input.value = oldValue;
      input.className = "form-control text-center";
      input.style.fontSize = "2rem";

      this.replaceWith(input);
      input.focus();

      const save = () => {
        let newValue = Number(input.value) || 0;

        let p = document.createElement('p');
        p.className = this.className.replace("form-control", "").trim();
        p.id = this.id;
        p.innerText = newValue;

        input.replaceWith(p);

        // Reapply listener for future edits
        enableInlineEditing();

        // Recalculate Budget Left
        updateBudgetLeft();
      };

      input.addEventListener('blur', save);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') save();
      });
    });
  });
}

function updateBudgetLeft() {
  let totalExpenses = Number(document.getElementById("totalExpenses").innerText);
  let thisMonth = Number(document.getElementById("thisMonth").innerText);

  let left = totalExpenses - thisMonth;

  document.getElementById("budgetLeft").innerText = left;
}

// Activate inline editing
enableInlineEditing();

let expenses = [];

// click-to-edit for Total Budget
document.getElementById("totalBudget").addEventListener("click", function () {

  let oldValue = this.innerText;
  let input = document.createElement("input");
  input.type = "number";
  input.value = oldValue;
  input.className = "form-control text-center";
  input.style.fontSize = "2rem";

  this.replaceWith(input);
  input.focus();

  input.addEventListener("blur", save);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") save();
  });

  function save() {
    let newValue = Number(input.value) || 0;

    let p = document.createElement("p");
    p.id = "totalBudget";
    p.className = "display-6 editable";
    p.innerText = newValue;

    input.replaceWith(p);

    p.addEventListener("click", arguments.callee);

    updateDashboard();
  }
});


// ADD EXPENSE
const form = document.querySelector("#add form");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  let amount = Number(form.querySelector("input[type='number']").value);

  expenses.push(amount);

  updateDashboard();
  form.reset();
});


// UPDATE DASHBOARD
function updateDashboard() {
  let totalBudget = Number(document.getElementById("totalBudget").innerText);
  let totalExpenses = expenses.reduce((a, b) => a + b, 0);

  document.getElementById("totalExpenses").innerText = totalExpenses;

  document.getElementById("budgetLeft").innerText = totalBudget - totalExpenses;
}
