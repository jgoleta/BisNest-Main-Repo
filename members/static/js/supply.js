// ===== Supply Form Modal Toggle =====

// Elements
const addNewBtn = document.getElementById("addNewSupplyBtn");
const supplyFormContainer = document.querySelector(".supply-form-container");
const overlay = document.getElementById("supplyModalOverlay");
const cancelBtn = supplyFormContainer?.querySelector(".cancel-button");

// Open Modal
addNewBtn?.addEventListener("click", () => {
  supplyFormContainer.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden"; // prevent background scroll
});

// Close Modal (Cancel Button Only)
cancelBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  closeSupplyForm();
});

// Close Modal Function
function closeSupplyForm() {
  supplyFormContainer.classList.remove("active");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

/* ==============================
   Client-side Pagination for Supply Table
   =============================== */
(function() {
  const table = document.getElementById('supply-table');
  const paginationContainer = document.getElementById('supply-pagination');
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10;

  function getAllRows() {
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  function showPage(page) {
    const allRows = getAllRows();
    allRows.forEach(r => r.style.display = 'none');
    
    const total = allRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    allRows.slice(start, end).forEach(r => r.style.display = '');

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
      const btn = document.createElement('button');
      btn.textContent = '1';
      btn.addEventListener('click', () => showPage(1));
      pager.appendChild(btn);
      if (startPage > 2) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement('button');
      btn.textContent = String(p);
      if (p === currentPage) btn.setAttribute('aria-current', 'page');
      btn.addEventListener('click', () => showPage(p));
      pager.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ell = document.createElement('span');
        ell.className = 'ellipsis';
        ell.textContent = '…';
        pager.appendChild(ell);
      }
      const btn = document.createElement('button');
      btn.textContent = String(totalPages);
      btn.addEventListener('click', () => showPage(totalPages));
      pager.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-next';
    next.textContent = 'Next';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => showPage(currentPage + 1));
    pager.appendChild(next);

    paginationContainer.appendChild(pager);
  }

  document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
  });

  setTimeout(() => {
    if (!document.readyState || document.readyState !== 'loading') showPage(1);
  }, 50);

})();
