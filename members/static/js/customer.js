const customerForm = document.querySelector(".customer-form");
const customerTableBody = document.querySelector("#customer-table tbody");
const deleteButton = document.querySelector(".delete-button");
const formContainer = document.querySelector(".customer-form-container");
const modalOverlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeBtn");

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
  if (editIdInput) editIdInput.remove();
  if (formTitle) formTitle.textContent = "Add Customer";
}

function toggleForm() {
  const isHidden = formContainer.style.display === "none" || formContainer.style.display === "";
  if (isHidden) resetCustomerForm();
  formContainer.style.display = isHidden ? "block" : "none";
  modalOverlay.style.display = isHidden ? "block" : "none";
}

if (closeBtn) {
  closeBtn.addEventListener("click", toggleForm);
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
  if (!customerTableBody) return;
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
      document.querySelectorAll("tr").forEach((r) => r.classList.remove("selected"));
      row.classList.add("selected");
    });
    customerTableBody.appendChild(row);
  });
}

if (deleteButton) {
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
}

function searchCustomer() {
  const input = document.getElementById("searchInput");
  const filter = (input && input.value || "").toLowerCase();
  const tableBody = document.querySelector(".table tbody");
  if (!tableBody) return;
  const rows = tableBody.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[1];
    if (nameCell) {
      const nameText = nameCell.textContent || nameCell.innerText;
      rows[i].style.display = nameText.toLowerCase().indexOf(filter) > -1 ? "" : "none";
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
  const phoneInput = document.querySelector('.customer-form input[name="phone"]');
  const addressInput = document.querySelector('.customer-form input[name="address"]');
  if (nameInput) nameInput.value = name || "";
  if (phoneInput) phoneInput.value = phone || "";
  if (addressInput) addressInput.value = address || "";

  let editIdInput = document.querySelector('.customer-form input[name="edit_id"]');
  if (!editIdInput) {
    editIdInput = document.createElement("input");
    editIdInput.type = "hidden";
    editIdInput.name = "edit_id";
    document.querySelector(".customer-form").appendChild(editIdInput);
  }
  editIdInput.value = id;

  formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Sort customer by name
(function() {
  const sortBtn = document.getElementById("customerNameSortBtn"); // id in HTML
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

//sort by date added
(function() {
  const sortBtn = document.getElementById("customerDateSortBtn");
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
      return txt.includes("date added") || txt.includes("date") || txt.includes("added");
    });
    if (dateColIndex === -1) dateColIndex = 4; // fallback column index

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

/* Pagination*/
(function() {
  const table = document.getElementById('customer-table');
  const paginationContainer = document.getElementById('customer-pagination');
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10; 

  function getAllRows() {
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  function getFilteredRows() {

    const input = document.getElementById('searchInput');
    const filter = (input && input.value || '').toLowerCase().trim();
    if (!filter) return getAllRows();
    return getAllRows().filter(r => {
      const nameCell = r.querySelectorAll('td')[1];
      if (!nameCell) return false;
      const txt = (nameCell.textContent || nameCell.innerText || '').toLowerCase();
      return txt.indexOf(filter) > -1;
    });
  }

  function showPage(page) {
    const allRows = getAllRows();
    const visibleRows = getFilteredRows();
    allRows.forEach(r => r.style.display = 'none');
    const total = visibleRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    visibleRows.slice(start, end).forEach(r => r.style.display = '');

    renderPaginationControls(totalPages);
  }
  
  window.showEmployeePage = showPage;

  function renderPaginationControls(totalPages) {
    paginationContainer.innerHTML = '';
    const pager = document.createElement('div');
    pager.className = 'pagination';

    const prev = document.createElement('button');
    prev.className = 'page-prev';
    prev.textContent = 'Prev';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => showPage(currentPage - 1));
    pager.appendChild(prev);

    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const btn = document.createElement('button'); btn.textContent = '1'; btn.addEventListener('click', () => showPage(1)); pager.appendChild(btn);
      if (startPage > 2) { const ell = document.createElement('span'); ell.className = 'ellipsis'; ell.textContent = '…'; pager.appendChild(ell); }
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.textContent = String(p);
      if (p === currentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => showPage(p));
      pager.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) { const ell = document.createElement('span'); ell.className = 'ellipsis'; ell.textContent = '…'; pager.appendChild(ell); }
      const btn = document.createElement('button'); btn.textContent = String(totalPages); btn.addEventListener('click', () => showPage(totalPages)); pager.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-next';
    next.textContent = 'Next';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => showPage(currentPage + 1));
    pager.appendChild(next);

    paginationContainer.appendChild(pager);
  }

  function recalcAndShowFirstOrCurrent() {
    const total = getFilteredRows().length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    showPage(currentPage);
  }

  const originalSearch = window.searchCustomer;
  window.searchCustomer = function() {
    try { if (typeof originalSearch === 'function') originalSearch(); }
    finally { recalcAndShowFirstOrCurrent(); }
  };

  const nameSortBtn = document.getElementById('customerNameSortBtn');
  const dateSortBtn = document.getElementById('customerDateSortBtn');
  if (nameSortBtn) nameSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));
  if (dateSortBtn) dateSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));

  document.addEventListener('DOMContentLoaded', () => { showPage(1); });
  setTimeout(() => { if (!document.readyState || document.readyState !== 'loading') showPage(1); }, 50);

})();

document.addEventListener("DOMContentLoaded", () => {
    fetch("/customer/customers_json/")
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById("customers-body");
            tbody.innerHTML = ""; // clear loading row
            
            if (orders.length === 0) {
                tbody.innerHTML += `
                    <tr>
                        <td colspan="10" style="text-align:center; padding:20px;">
                            No data available
                        </td>
                    </tr>
                `;
                return;
            }

            orders.forEach(c => {
                tbody.innerHTML += `
                <tr id="customer-${c.id}">
                    <td>${c.customer_id}</td>
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.address}</td>
                    <td>${c.date_added}</td>
                    <td>
                        <button type="button" class="edit-button" 
                            data-id="${ c.customer_id }"
                            data-name="${ c.name }" 
                            data-phone="${ c.phone }"
                            data-address="${ c.address }" 
                            title="Edit customer"
                            aria-label="Edit customer" style="margin-right:8px;">
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960"
                                    width="20px" fill="#FFFFFF">
                                        <path
                                            d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z" />
                                </svg>
                            </button>

                                <button type="submit" class="delete-button" title="Delete customer" data-id="${c.id}">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px"
                                        viewBox="0 -960 960 960" width="20px" fill="#FFFFFF">
                                        <path
                                            d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm72-144h72v-336h-72v336Zm120 0h72v-336h-72v336Z" />
                                    </svg>
                                </button>
                        </td>
                </tr>`;
            });

            if (window.showEmployeePage) {
                window.showEmployeePage(1);
            }
          });
});

document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-button")) {
        const btn = e.target.closest(".delete-button");
        const customerId = btn.dataset.id;

        if (!confirm("Delete this customer?")) return;

        const response = await fetch(`/delete-customer/${customerId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            }
        });

        if (response.ok) {
            // Remove row from table
            const row = document.getElementById(`customer-${customerId}`);
            if (row) row.remove();
        } else {
            alert("Failed to delete.");
        }
    }
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrfToken = getCookie("csrftoken");
