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

