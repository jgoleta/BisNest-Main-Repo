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
