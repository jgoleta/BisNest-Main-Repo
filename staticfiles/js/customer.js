const customerForm = document.querySelector(".customer-form");
const customerTableBody = document.querySelector("#customer-table tbody");
const deleteButton = document.querySelector(".delete-button");
const formContainer = document.querySelector(".customer-form-container");
const modalOverlay = document.getElementById("modalOverlay");

let customerData = [];
let freedIds = [];
let nextCustomerId = 1;

function resetCustomerForm() {
  const nameInput = document.querySelector('.customer-form input[name="name"]');
  const phoneInput = document.querySelector('.customer-form input[name="phone"]');
  const addressInput = document.querySelector('.customer-form input[name="address"]');
  const editIdInput = document.querySelector('.customer-form input[name="edit_id"]');
  const formTitle = document.getElementById("formTitle");

  if (nameInput) nameInput.value = "";
  if (phoneInput) phoneInput.value = "";
  if (addressInput) addressInput.value = "";
  if (editIdInput) editIdInput.remove(); //remove inputs from edit
  if (formTitle) formTitle.textContent = "Add Customer"; //reset
}

function toggleForm() {
  const isHidden =
    formContainer.style.display === "none" ||
    formContainer.style.display === "";

   if (isHidden) {
    resetCustomerForm();
  }
  formContainer.style.display = isHidden ? "block" : "none";
  modalOverlay.style.display = isHidden ? "block" : "none";
}

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


document.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-button");
  if (!editBtn) return;
  const id = editBtn.getAttribute("data-id");
  const name = editBtn.getAttribute("data-name");
  const phone = editBtn.getAttribute("data-phone");
  const address = editBtn.getAttribute("data-address");

  formContainer.style.display = "block";
  modalOverlay.style.display = "block";


  document.getElementById("formTitle").textContent = "Edit Customer";
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

  formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});

//sort by id
let customerSortAscending = null;

function initCustomerSort() {
  const sortBtn = document.getElementById("customerIdSortBtn");
  const table = document.getElementById("customer-table");
  if (!sortBtn || !table) return;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    e.preventDefault();
    
    const tbody = table.querySelector("tbody");
    if (!tbody) {
      console.error("Customer table tbody not found");
      return;
    }

    // Get all rows, including hidden ones
    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    if (rows.length === 0) {
      console.warn("No rows found in customer table");
      return;
    }

    // Preserve display state for each row BEFORE sorting
    const rowsWithState = rows.map(row => {
      const display = row.style.display || "";
      return {
        element: row,
        display: display
      };
    });

    // Toggle sort direction
    customerSortAscending = customerSortAscending === null || customerSortAscending === false ? true : false;

    // Sort rows by Customer ID (numerically, ignoring prefix)
    rowsWithState.sort((a, b) => {
      const aIdCell = a.element.cells[0];
      const bIdCell = b.element.cells[0];
      
      if (!aIdCell || !bIdCell) return 0;
      
      const aId = aIdCell.textContent.trim();
      const bId = bIdCell.textContent.trim();
      
      if (!aId || !bId) return 0;
      
      const aNum = parseInt(aId.replace(/^[A-Za-z]/, "")) || 0;
      const bNum = parseInt(bId.replace(/^[A-Za-z]/, "")) || 0;
      
      return customerSortAscending ? aNum - bNum : bNum - aNum;
    });

    // Clear and re-append sorted rows
    tbody.innerHTML = "";
    rowsWithState.forEach(({ element, display }) => {
      tbody.appendChild(element);
      // Restore display state (empty string means visible, "none" means hidden)
      if (display === "none") {
        element.style.display = "none";
      } else {
        element.style.display = "";
      }
    });

    //update icon
    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = customerSortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomerSort);
} else {
  initCustomerSort();
}