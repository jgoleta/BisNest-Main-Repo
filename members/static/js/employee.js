document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.getElementById("formContainer");
  const toggleBtn = document.querySelector(".toggle-form-button");
  const modalOverlay = document.getElementById("modalOverlay");

  function toggleForm() {
    const isHidden =
      formContainer.style.display === "none" ||
      formContainer.style.display === "";
    formContainer.style.display = isHidden ? "block" : "none";
    modalOverlay.style.display = isHidden ? "block" : "none";
  }

  toggleBtn.addEventListener("click", toggleForm);

  modalOverlay.addEventListener("click", () => {
    formContainer.style.display = "none";
    modalOverlay.style.display = "none";
  });
});

function searchEmployee() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const table = document.querySelector(".table tbody");
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[1];
    if (nameCell) {
      const nameText = nameCell.textContent || nameCell.innerText;
      if (nameText.toLowerCase().indexOf(filter) > -1) {
        rows[i].style.display = "";
      } else {
        rows[i].style.display = "none";
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const editButtons = document.querySelectorAll(".edit-button");
  const form = document.querySelector(".employee-form");
  const editIdInput = document.getElementById("edit_id");
  const formTitle = document.getElementById("formTitle");
  const toggleForm = () => {
    document.getElementById("formContainer").style.display = "block";
    document.getElementById("modalOverlay").style.display = "block";
  };

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-id");
      const name = button.getAttribute("data-name");
      const position = button.getAttribute("data-position");
      const schedule = button.getAttribute("data-schedule");
      const salary = button.getAttribute("data-salary");

      form.querySelector("[name='name']").value = name;
      form.querySelector("[name='position']").value = position;
      form.querySelector("[name='schedule']").value = schedule;
      form.querySelector("[name='salary']").value = salary;
      editIdInput.value = id;

      formTitle.textContent = "Edit Employee";
      toggleForm();
    });
  });
});
