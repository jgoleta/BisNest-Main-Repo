const employeeForm = document.querySelector(".employee-form");
const formContainer = document.getElementById("formContainer");
const modalOverlay = document.getElementById("modalOverlay");


function resetEmployeeForm() {
  const nameInput = document.querySelector('.employee-form input[name="name"]');
  const positionInput = document.querySelector('.employee-form input[name="position"]');
  const scheduleInput = document.querySelector('.employee-form input[name="schedule"]');
  const salaryInput = document.querySelector('.employee-form input[name="salary"]');
  const editIdInput = document.querySelector('.employee-form input[name="edit_id"]');
  const formTitle = document.getElementById("formTitle");

  if (nameInput) nameInput.value = "";

  if (positionInput) positionInput.value = "Staff";
  if (scheduleInput) scheduleInput.value = "9AM-5PM";
  if (salaryInput) salaryInput.value = "500.0";

  if (editIdInput) editIdInput.remove();


  if (formTitle) formTitle.textContent = "Employee Information";
}



function toggleForm() {
  const isHidden =
    formContainer.style.display === "none" ||
    formContainer.style.display === "";

  if (isHidden) {
    resetEmployeeForm();//clear
  }
  formContainer.style.display = isHidden ? "block" : "none";
  modalOverlay.style.display = isHidden ? "block" : "none";
}



const cancelButton = document.querySelector(".cancel-button");
if (cancelButton) {
  cancelButton.addEventListener("click", () => {
    formContainer.style.display = "none";
    modalOverlay.style.display = "none";
    resetEmployeeForm();
  });
}


document.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-button");
  if (!editBtn) return;

  const id = editBtn.getAttribute("data-id");
  const name = editBtn.getAttribute("data-name");
  const position = editBtn.getAttribute("data-position");
  const schedule = editBtn.getAttribute("data-schedule");
  const salary = editBtn.getAttribute("data-salary");


  formContainer.style.display = "block";
  modalOverlay.style.display = "block";

  
  const nameInput = document.querySelector('.employee-form input[name="name"]');
  const positionInput = document.querySelector('.employee-form input[name="position"]');
  const scheduleInput = document.querySelector('.employee-form input[name="schedule"]');
  const salaryInput = document.querySelector('.employee-form input[name="salary"]');

  if (nameInput) nameInput.value = name || "";
  if (positionInput) positionInput.value = position || "";
  if (scheduleInput) scheduleInput.value = schedule || "";
  if (salaryInput) salaryInput.value = salary || "";

  
  let editIdInput = document.querySelector('.employee-form input[name="edit_id"]');
  if (!editIdInput) {
    editIdInput = document.createElement("input");
    editIdInput.type = "hidden";
    editIdInput.name = "edit_id";
    employeeForm.appendChild(editIdInput);
  }
  editIdInput.value = id;

 
  const formTitle = document.getElementById("formTitle");
  if (formTitle) formTitle.textContent = "Edit Employee";


  formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});


function searchEmployee() {
  const input = document.getElementById("searchInput");
  const filter = (input.value || "").toLowerCase();
  const table = document.querySelector(".table tbody");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[1];
    if (nameCell) {
      const nameText = nameCell.textContent || nameCell.innerText;
      rows[i].style.display = nameText.toLowerCase().includes(filter)
        ? ""
        : "none";
    }
  }
}

//sort by name
(function() {
  const sortBtn = document.getElementById("employeeNameSortBtn"); // id in HTML
  const table = document.querySelector(".table");
  if (!sortBtn || !table) return;

  let isAscending = null;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    isAscending = isAscending === null || isAscending === false ? true : false;

    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aName = (a.cells[1].textContent || "").trim().toLowerCase();
      const bName = (b.cells[1].textContent || "").trim().toLowerCase();
      return isAscending
        ? aName.localeCompare(bName, undefined, { sensitivity: "base", numeric: false })
        : bName.localeCompare(aName, undefined, { sensitivity: "base", numeric: false });
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = isAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
})();

//sort by join date
(function() {
  const sortBtn = document.getElementById("employeeJoinDateSortBtn"); // add this id to your HTML button
  const table = document.querySelector(".table");
  if (!sortBtn || !table) return;

  let isAscending = null;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    isAscending = isAscending === null || isAscending === false ? true : false;

    const ths = Array.from(table.querySelectorAll("thead th"));
    let dateColIndex = ths.findIndex(th => {
      const txt = (th.textContent || "").trim().toLowerCase();
      return txt.includes("join") || txt.includes("joined") || txt.includes("join date") || txt.includes("date joined");
    });
    if (dateColIndex === -1) {
      dateColIndex = ths.findIndex(th => (th.textContent || "").trim().toLowerCase().includes("date"));
    }
    if (dateColIndex === -1) dateColIndex = 2;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aText = (a.cells[dateColIndex]?.textContent || "").trim();
      const bText = (b.cells[dateColIndex]?.textContent || "").trim();

      const aDate = Date.parse(aText);
      const bDate = Date.parse(bText);

      if (!isNaN(aDate) && !isNaN(bDate)) {
        return isAscending ? aDate - bDate : bDate - aDate;
      }

      const aLower = aText.toLowerCase();
      const bLower = bText.toLowerCase();
      return isAscending ? aLower.localeCompare(bLower) : bLower.localeCompare(aLower);
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = isAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
})();
