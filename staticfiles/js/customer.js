const customerForm = document.querySelector(".customer-form");
const customerTableBody = document.querySelector("#customer-table tbody");
const deleteButton = document.querySelector(".delete-button");
const formContainer = document.querySelector(".customer-form-container");
const modalOverlay = document.getElementById("modalOverlay");

let customerData = [];
let freedIds = [];
let nextCustomerId = 1;

function toggleForm() {
  const isHidden =
    formContainer.style.display === "none" ||
    formContainer.style.display === "";
  formContainer.style.display = isHidden ? "block" : "none";
  modalOverlay.style.display = isHidden ? "block" : "none";
}

modalOverlay.addEventListener("click", () => {
  formContainer.style.display = "none";
  modalOverlay.style.display = "none";
});

function getNextCustomerId() {
  let idNumber;
  if (freedIds.length > 0) {
    idNumber = freedIds.sort((a, b) => a - b).shift();
  } else {
    idNumber = nextCustomerId++;
  }
  return `C${idNumber.toString().padStart(3, "0")}`;
}

function renderTable() {
  customerTableBody.innerHTML = "";
  customerData.forEach((cust, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${cust.id}</td>
          <td>${cust.name}</td>
          <td>${cust.phone}</td>
          <td>${cust.address}</td>
        `;
    row.setAttribute("data-index", index);
    row.addEventListener("click", () => {
      document
        .querySelectorAll("tr")
        .forEach((r) => r.classList.remove("selected"));
      row.classList.add("selected");
    });
    customerTableBody.appendChild(row);
  });
}

deleteButton.addEventListener("click", () => {
  const selectedRow = document.querySelector("tr.selected");
  if (selectedRow) {
    const index = selectedRow.getAttribute("data-index");
    const removed = customerData.splice(index, 1)[0];

    const idNumber = parseInt(removed.id.substring(1));
    freedIds.push(idNumber);

    renderTable();
  } else {
    alert("Please select a row to delete.");
  }
});

function searchCustomer() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const rows = document.querySelectorAll("#customer-table tbody tr");
  rows.forEach((row) => {
    const name = row.children[1].textContent.toLowerCase();
    row.style.display = name.includes(query) ? "" : "none";
  });
}

document.querySelectorAll("#customer-table th").forEach((header, colIndex) => {
  if (colIndex > 1) return;

  header.style.cursor = "pointer";
  header.addEventListener("click", () => {
    const isAscending = header.classList.contains("asc");
    document
      .querySelectorAll("#customer-table th")
      .forEach((th) => th.classList.remove("asc", "desc"));
    header.classList.add(isAscending ? "desc" : "asc");

    customerData.sort((a, b) => {
      const aValue = Object.values(a)[colIndex];
      const bValue = Object.values(b)[colIndex];
      return isAscending
        ? aValue
            .toString()
            .localeCompare(bValue.toString(), undefined, { numeric: true })
        : bValue
            .toString()
            .localeCompare(aValue.toString(), undefined, { numeric: true });
    });

    renderTable();
  });
});

function searchCustomer() {
  const input = document.getElementById("searchInput");
  const filter = (input.value || "").toLowerCase();
  const table = document.querySelector(".table tbody");
  if (!table) return;
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

// --- Edit customer functionality ---
document.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-button");
  if (!editBtn) return;
  // populate modal form with data attributes
  const id = editBtn.getAttribute("data-id");
  const name = editBtn.getAttribute("data-name");
  const phone = editBtn.getAttribute("data-phone");
  const address = editBtn.getAttribute("data-address");

  // show form modal
  formContainer.style.display = "block";
  modalOverlay.style.display = "block";

  // set form title and values
  document.getElementById("formTitle").textContent = "Edit Customer";
  // if the form fields have ids match the form, set them
  const nameInput = document.querySelector('.customer-form input[name="name"]');
  const phoneInput = document.querySelector(
    '.customer-form input[name="phone"]'
  );
  const addressInput = document.querySelector(
    '.customer-form input[name="address"]'
  );
  if (nameInput) nameInput.value = name || "";
  if (phoneInput) phoneInput.value = phone || "";
  if (addressInput) addressInput.value = address || "";

  // ensure a hidden input for edit id exists
  let editIdInput = document.querySelector(
    '.customer-form input[name="edit_id"]'
  );
  if (!editIdInput) {
    editIdInput = document.createElement("input");
    editIdInput.type = "hidden";
    editIdInput.name = "edit_id";
    document.querySelector(".customer-form").appendChild(editIdInput);
  }
  editIdInput.value = id;

  // scroll modal into view
  formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});
