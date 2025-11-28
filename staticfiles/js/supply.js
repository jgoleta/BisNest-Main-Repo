const supplyForm = document.querySelector(".supply-form");
const supplyTableBody = document.querySelector("#supply-table tbody");
const deleteButton = document.querySelector(".delete-button");
const formContainer = document.querySelector(".supply-form-container");
const modalOverlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeBtn");

let supplyData = [];
let freedIds = [];
let nextSupplyId = 1;

function resetSupplyForm() {
  const supplyIdInput = document.querySelector('.supply-form input[name="supply_id"]');
  const supplierInput = document.querySelector('.supply-form input[name="supplier"]');
  const productInput = document.querySelector('.supply-form select[name="product"]');
  const quantityInput = document.querySelector('.supply-form input[name="quantity"]');
  const dateInput = document.querySelector('.supply-form input[name="date"]');
  const priceInput = document.querySelector('.supply-form input[name="price"]');
  const editIdInput = document.querySelector('.supply-form input[name="edit_id"]');
  const formTitle = document.getElementById("formTitle");

  if (supplyIdInput) supplyIdInput.value = "";
  if (supplierInput) supplierInput.value = "";
  if (productInput) productInput.value = "";
  if (quantityInput) quantityInput.value = "";
  if (dateInput) dateInput.value = "";
  if (priceInput) priceInput.value = "";
  if (editIdInput) editIdInput.remove();
  if (formTitle) formTitle.textContent = "Supply Details";
}

function toggleForm() {
  const isHidden = formContainer.style.display === "none" || formContainer.style.display === "";
  if (isHidden) resetSupplyForm();
  formContainer.style.display = isHidden ? "block" : "none";
  modalOverlay.style.display = isHidden ? "block" : "none";
}

if (closeBtn) {
  closeBtn.addEventListener("click", toggleForm);
}

function openSupplyForm() {
  resetSupplyForm();
  formContainer.style.display = "block";
  modalOverlay.style.display = "block";
  document.getElementById("formTitle").textContent = "Supply Details";
  // Force animation replay
  void modalOverlay.offsetWidth;
}

function closeSupplyForm() {
  formContainer.style.display = "none";
  modalOverlay.style.display = "none";
}

function getNextSupplyId() {
  let idNumber;
  if (freedIds.length > 0) {
    idNumber = freedIds.sort((a, b) => a - b).shift();
  } else {
    idNumber = nextSupplyId++;
  }
  return `S${idNumber.toString().padStart(3, "0")}`;
}

function renderTable() {
  if (!supplyTableBody) return;
  supplyTableBody.innerHTML = "";
  supplyData.forEach((s, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
          <td>${s.supply_id}</td>
          <td>${s.supplier}</td>
          <td>${s.product}</td>
          <td>${s.quantity}</td>
          <td>${s.date}</td>
          <td>${s.price}</td>
        `;
    row.setAttribute("data-index", index);
    row.addEventListener("click", () => {
      document.querySelectorAll("tr").forEach((r) => r.classList.remove("selected"));
      row.classList.add("selected");
    });
    supplyTableBody.appendChild(row);
  });
}

if (deleteButton) {
  deleteButton.addEventListener("click", () => {
    const selectedRow = document.querySelector("tr.selected");
    if (selectedRow) {
      const index = selectedRow.getAttribute("data-index");
      const removed = supplyData.splice(index, 1)[0];
      const idNumber = parseInt(removed.id.substring(1));
      freedIds.push(idNumber);
      renderTable();
    } else {
      alert("Please select a row to delete.");
    }
  });
}

function searchSupply() {
  // Pagination module will handle row visibility
  // Just dispatch a custom event for pagination to recalculate
  const event = new CustomEvent('searchUpdated');
  document.dispatchEvent(event);
}

document.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-button");
  if (!editBtn) return;
  const supply_id = editBtn.getAttribute("data-supply_id");
  const supplier = editBtn.getAttribute("data-supplier");
  const product = editBtn.getAttribute("data-product");
  const quantity = editBtn.getAttribute("data-quantity");
  const date = editBtn.getAttribute("data-date");
  const price = editBtn.getAttribute("data-price");

  // Open the form
  openSupplyForm();
  
  document.getElementById("formTitle").textContent = "Edit Supply";
  const supplyIdInput = document.querySelector('.supply-form input[name="supply_id"]');
  const supplierInput = document.querySelector('.supply-form input[name="supplier"]');
  const productInput = document.querySelector('.supply-form select[name="product"]');
  const quantityInput = document.querySelector('.supply-form input[name="quantity"]');
  const dateInput = document.querySelector('.supply-form input[name="date"]');
  const priceInput = document.querySelector('.supply-form input[name="price"]');
  let editIdInput = document.querySelector('.supply-form input[name="edit_id"]');

  if (supplyIdInput) supplyIdInput.value = supply_id || "";
  if (supplierInput) supplierInput.value = supplier || "";
  if (productInput) productInput.value = product || "";
  if (quantityInput) quantityInput.value = quantity || "";
  if (dateInput) dateInput.value = date || "";
  if (priceInput) priceInput.value = price || "";

  if (!editIdInput) {
    editIdInput = document.createElement("input");
    editIdInput.type = "hidden";
    editIdInput.name = "edit_id";
    document.querySelector(".supply-form").appendChild(editIdInput);
  }
  editIdInput.value = supply_id;

  formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});

// Sort supply by name
(function() {
  const sortBtn = document.getElementById("supplyNameSortBtn"); // id in HTML
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
  const sortBtn = document.getElementById("supplyDateSortBtn");
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
  const table = document.getElementById('supply-table');
  const paginationContainer = document.getElementById('supply-pagination');
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10; 

  function getAllRows() {
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  function getFilteredRows() {
    const input = document.getElementById('searchInput');
    const supplierFilter = document.getElementById('supplierFilter');
    const productFilter = document.getElementById('productFilter');
    const searchFilter = (input && input.value || '').toLowerCase().trim();
    const supplierValue = (supplierFilter && supplierFilter.value) || '';
    const productValue = (productFilter && productFilter.value) || '';
    
    return getAllRows().filter(r => {
      const supplierCell = r.querySelectorAll('td')[1];
      const productCell = r.querySelectorAll('td')[2];
      
      let matchesSearch = true;
      let matchesSupplier = true;
      let matchesProduct = true;
      
      // Search filter (searches in supplier column by default)
      if (supplierCell && searchFilter) {
        const txt = (supplierCell.textContent || supplierCell.innerText || '').toLowerCase();
        matchesSearch = txt.indexOf(searchFilter) > -1;
      }
      
      // Supplier filter
      if (supplierCell && supplierValue) {
        const supplierText = (supplierCell.textContent || supplierCell.innerText || '').trim();
        matchesSupplier = supplierText === supplierValue;
      }
      
      // Product filter
      if (productCell && productValue) {
        const productText = (productCell.textContent || productCell.innerText || '').trim();
        matchesProduct = productText === productValue;
      }
      
      return matchesSearch && matchesSupplier && matchesProduct;
    });
  }

  function showPage(page) {
    const allRows = getAllRows();
    const visibleRows = getFilteredRows();
    const total = visibleRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rowsToShow = visibleRows.slice(start, end);

    allRows.forEach(r => {
      r.style.display = rowsToShow.includes(r) ? '' : 'none';
    });

    renderPaginationControls(totalPages);
  }

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

  const originalSearch = window.searchSupply;
  window.searchSupply = function() {
    try { if (typeof originalSearch === 'function') originalSearch(); }
    finally { recalcAndShowFirstOrCurrent(); }
  };

  document.addEventListener('searchUpdated', () => { recalcAndShowFirstOrCurrent(); });

  const nameSortBtn = document.getElementById('supplyNameSortBtn');
  const dateSortBtn = document.getElementById('supplyDateSortBtn');
  if (nameSortBtn) nameSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));
  if (dateSortBtn) dateSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));

  function initPagination() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => showPage(1));
    } else {
      showPage(1);
    }
  }
  initPagination();

})();