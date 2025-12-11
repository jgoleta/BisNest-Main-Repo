const customerForm = document.querySelector(".customer-form");
const customerTableBody = document.querySelector("#customer-table tbody");
const deleteButton = document.querySelector(".delete-button");
const formContainer = document.querySelector(".customer-form-container");
const modalOverlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeBtn");
const profileContainer = document.getElementById("profileContainer");
const profileModalOverlay = document.getElementById("profileModalOverlay");
const profileCloseBtn = document.getElementById("profileCloseBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const deleteProfileForm = document.getElementById("deleteProfileForm");

let customerData = [];
let freedIds = [];
let nextCustomerId = 1;

// Loading overlay
function createLoadingOverlay() {
  let overlay = document.getElementById("loadingOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showLoading() {
  const overlay = createLoadingOverlay();
  overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

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
  if (isHidden) {
    window.openModal(formContainer, modalOverlay);
  } else {
    window.closeModal(formContainer, modalOverlay);
  }
}

if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    window.closeModal(formContainer, modalOverlay);
    resetCustomerForm();
  });
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

      showNotification("Customer Successfully Removed"); // NOTIFICATION

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

function openProfilePopup(customerRow) {
  if (!customerRow || !profileContainer) return;

  const recordId = customerRow.getAttribute("data-record-id");
  const customerId = customerRow.getAttribute("data-customer-id") || recordId;
  const name = customerRow.getAttribute("data-name");
  const phone = customerRow.getAttribute("data-phone");
  const address = customerRow.getAttribute("data-address");
  const date = customerRow.getAttribute("data-date");

  const profileId = document.getElementById("profile-id");
  if (profileId) profileId.textContent = customerId || "";
  document.getElementById("profile-name").textContent = name || "";
  document.getElementById("profile-phone").textContent = phone || "";
  document.getElementById("profile-address").textContent = address || "";
  document.getElementById("profile-date").textContent = date || "";

  profileContainer.dataset.recordId = recordId || "";
  profileContainer.dataset.customerId = customerId || "";

  if (deleteProfileForm && recordId) {
    deleteProfileForm.dataset.recordId = recordId;
    deleteProfileForm.action = `customer/delete/${recordId}/`;
  }

  if (profileContainer && profileModalOverlay) {
    window.openModal(profileContainer, profileModalOverlay);
  }
}

function closeProfilePopup() {
  if (profileContainer && profileModalOverlay) {
    window.closeModal(profileContainer, profileModalOverlay);
  }
}

// Handle row clicks to open profile
document.addEventListener("click", function (e) {
  const customerRow = e.target.closest(".customer-row");
  if (customerRow && !e.target.closest("button") && !e.target.closest("form")) {
    openProfilePopup(customerRow);
  }
});

// Close profile popup
if (profileCloseBtn) {
  profileCloseBtn.addEventListener("click", closeProfilePopup);
}

if (profileModalOverlay) {
  profileModalOverlay.addEventListener("click", closeProfilePopup);
}

// Handle edit button in profile
if (editProfileBtn) {
  editProfileBtn.addEventListener("click", function() {
    const recordId = profileContainer?.dataset?.recordId;
    const name = document.getElementById("profile-name").textContent;
    const phone = document.getElementById("profile-phone").textContent;
    const address = document.getElementById("profile-address").textContent;

    closeProfilePopup();

    window.openModal(formContainer, modalOverlay);

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
    editIdInput.value = recordId || "";

    formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

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

function getCsrfToken(form) {
  const tokenInput = form?.querySelector('input[name="csrfmiddlewaretoken"]');
  if (tokenInput) {
    return tokenInput.value;
  }
  return getCookie("csrftoken");
}

if (customerForm) {
  customerForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    showLoading();
    
    const formData = new FormData(customerForm);
    const actionUrl = customerForm.action || window.location.href;
    
    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Form submission failed");
      }
      
      // Close modal and hide loading
      setTimeout(() => {
        hideLoading();
        window.closeModal(formContainer, modalOverlay);
        resetCustomerForm();
        
        showNotification("Customer Successfully Added"); // NOTIFICATION

        setTimeout(() => window.location.reload(), 600);
      }, 800);
    } catch (error) {
      hideLoading();
      alert("Error submitting form. Please try again.");
      console.error("Form submission error:", error);
    }
  });
}

if (deleteProfileForm) {
  deleteProfileForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const customerName = document.getElementById("profile-name").textContent;
    if (!confirm(`Are you sure you want to delete customer "${customerName}"? This action cannot be undone.`)) {
      return false;
    }

    showLoading();

    const actionUrl = deleteProfileForm.action;
    const csrfToken = getCsrfToken(deleteProfileForm);

    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      const recordId = profileContainer?.dataset?.recordId;
      if (recordId) {
        const row = document.getElementById(`customer-${recordId}`);
        if (row) row.remove();
      }

      setTimeout(() => {
        hideLoading();
        closeProfilePopup();

        showNotification("Customer Successfully Removed"); // NOTIFICATION

        setTimeout(() => window.location.reload(), 600);
      }, 800);
    } catch (error) {
      hideLoading();
      alert("Failed to delete customer. Please try again.");
      console.error("Delete error:", error);
    }
  });
}

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
  const rowsPerPage = 12; 

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

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); 
}

// Ajax for customer fetch and delete