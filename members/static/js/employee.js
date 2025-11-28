const employeeForm = document.querySelector(".employee-form");
const formContainer = document.getElementById("formContainer");
const modalOverlay = document.getElementById("modalOverlay");
const closeBtn = document.getElementById("closeBtn");


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



if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    formContainer.style.display = "none";
    modalOverlay.style.display = "none";
    resetEmployeeForm();
  });
}


// Employee Profile Popup
const profileContainer = document.getElementById("profileContainer");
const profileModalOverlay = document.getElementById("profileModalOverlay");
const profileCloseBtn = document.getElementById("profileCloseBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const deleteProfileForm = document.getElementById("deleteProfileForm");

function openProfilePopup(employeeRow) {
  const id = employeeRow.getAttribute("data-id");
  const name = employeeRow.getAttribute("data-name");
  const position = employeeRow.getAttribute("data-position");
  const schedule = employeeRow.getAttribute("data-schedule");
  const salary = employeeRow.getAttribute("data-salary");
  const joinDate = employeeRow.getAttribute("data-join-date");

  // Populate profile fields
  document.getElementById("profile-id").textContent = id;
  document.getElementById("profile-name").textContent = name;
  document.getElementById("profile-position").textContent = position;
  document.getElementById("profile-schedule").textContent = schedule;
  document.getElementById("profile-salary").textContent = salary;
  document.getElementById("profile-join-date").textContent = joinDate;

  // Set delete form action
  deleteProfileForm.action = `/employee-info/delete/${id}/`;

  // Show popup
  profileContainer.style.display = "block";
  profileModalOverlay.style.display = "block";
}

function closeProfilePopup() {
  profileContainer.style.display = "none";
  profileModalOverlay.style.display = "none";
}

// Handle row clicks to open profile
document.addEventListener("click", function (e) {
  const employeeRow = e.target.closest(".employee-row");
  if (employeeRow && !e.target.closest("button") && !e.target.closest("form")) {
    openProfilePopup(employeeRow);
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
    const id = document.getElementById("profile-id").textContent;
    const name = document.getElementById("profile-name").textContent;
    const position = document.getElementById("profile-position").textContent;
    const schedule = document.getElementById("profile-schedule").textContent;
    const salary = document.getElementById("profile-salary").textContent;

    // Close profile popup
    closeProfilePopup();

    // Open edit form
    formContainer.style.display = "block";
    modalOverlay.style.display = "block";

    const formTitle = document.getElementById("formTitle");
    if (formTitle) formTitle.textContent = "Edit Employee";

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

    formContainer.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

// Handle delete button in profile with confirmation
if (deleteProfileForm) {
  deleteProfileForm.addEventListener("submit", function(e) {
    const employeeName = document.getElementById("profile-name").textContent;
    if (!confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`)) {
      e.preventDefault();
      return false;
    }
  });
}


function searchEmployee() {
  const input = document.getElementById("searchInput");
  const positionFilter = document.getElementById("positionFilter");
  const nameFilter = (input.value || "").toLowerCase();
  const positionValue = (positionFilter && positionFilter.value) || "";
  const table = document.querySelector(".table tbody");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const nameCell = rows[i].getElementsByTagName("td")[1];
    const positionCell = rows[i].getElementsByTagName("td")[2];
    
    let matchesName = true;
    let matchesPosition = true;
    
    if (nameCell && nameFilter) {
      const nameText = nameCell.textContent || nameCell.innerText;
      matchesName = nameText.toLowerCase().includes(nameFilter);
    }
    
    if (positionCell && positionValue) {
      const positionText = positionCell.textContent || positionCell.innerText;
      matchesPosition = positionText.trim() === positionValue;
    }
    
    rows[i].style.display = (matchesName && matchesPosition) ? "" : "none";
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

/* -------------------------
   Client-side Pagination (employees)
   ------------------------- */
(function() {
  const table = document.getElementById('employee-table');
  const paginationContainer = document.getElementById('employee-pagination');
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10;

  function getAllRows() {
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  function getFilteredRows() {
    const input = document.getElementById('searchInput');
    const positionFilter = document.getElementById('positionFilter');
    const nameFilter = (input && input.value || '').toLowerCase().trim();
    const positionValue = (positionFilter && positionFilter.value) || '';
    
    return getAllRows().filter(r => {
      const nameCell = r.querySelectorAll('td')[1];
      const positionCell = r.querySelectorAll('td')[2];
      
      let matchesName = true;
      let matchesPosition = true;
      
      if (nameCell && nameFilter) {
        const txt = (nameCell.textContent || nameCell.innerText || '').toLowerCase();
        matchesName = txt.indexOf(nameFilter) > -1;
      }
      
      if (positionCell && positionValue) {
        const positionText = (positionCell.textContent || positionCell.innerText || '').trim();
        matchesPosition = positionText === positionValue;
      }
      
      return matchesName && matchesPosition;
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

  // Hook to searchEmployee
  const originalSearch = window.searchEmployee;
  window.searchEmployee = function() {
    try { if (typeof originalSearch === 'function') originalSearch(); }
    finally { recalcAndShowFirstOrCurrent(); }
  };

  // Re-run pagination after sorting
  const nameSortBtn = document.getElementById('employeeNameSortBtn');
  const dateSortBtn = document.getElementById('employeeJoinDateSortBtn');
  if (nameSortBtn) nameSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));
  if (dateSortBtn) dateSortBtn.addEventListener('click', () => setTimeout(recalcAndShowFirstOrCurrent, 50));

  document.addEventListener('DOMContentLoaded', () => { showPage(1); });
  setTimeout(() => { if (!document.readyState || document.readyState !== 'loading') showPage(1); }, 50);

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
