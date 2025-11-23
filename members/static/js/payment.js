// Toggle Payment Form Modal
function togglePaymentForm() {
  const formContainer = document.querySelector(".payment-form-container");
  const overlay = document.getElementById("paymentModalOverlay");

  // If form is visible, close it
  if (formContainer.classList.contains("active")) {
    formContainer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto"; // Allow scrolling again
  } else {
    // Open form modal
    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }
}

const params = new URLSearchParams(window.location.search); 
if (params.get("open_form") === "true") { 
  const formContainer = document.querySelector(".payment-form-container"); 
  const overlay = document.getElementById("paymentModalOverlay"); 
  if (formContainer && overlay) { 
    formContainer.classList.add("active"); 
    overlay.classList.add("active"); 
    document.body.style.overflow = "hidden"; 
  } 
}

// Close modal when overlay is clicked
document.getElementById("paymentModalOverlay").addEventListener("click", () => {
  togglePaymentForm();
});

// Live search for Payment Table
function searchPayment() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll(".table-payment tbody tr");

  rows.forEach((row) => {
    const orderCell = row.cells[1]; // Order ID column
    if (orderCell) {
      const textValue = orderCell.textContent || orderCell.innerText;
      row.style.display = textValue.toLowerCase().includes(filter)
        ? ""
        : "none";
    }
  });
}

// Handle Edit Button Click
document.querySelectorAll(".edit-button").forEach((button) => {
  button.addEventListener("click", () => {
    const paymentId = button.getAttribute("data-payment_id");
    const order = button.getAttribute("data-order");
    const amount = button.getAttribute("data-amount");
    const date = button.getAttribute("data-date");
    const method = button.getAttribute("data-method");

    // Fill form fields with existing data
    document.querySelector('[name="payment_id"]').value = paymentId;
    document.querySelector('[name="order"]').value = order;
    document.querySelector('[name="amount"]').value = amount;
    document.querySelector('[name="date"]').value = date;
    document.querySelector('[name="method"]').value = method;

    // Open modal for editing
    const formContainer = document.querySelector(".payment-form-container");
    const overlay = document.getElementById("paymentModalOverlay");
    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});

//sort by id
let paymentSortAscending = null;

function initPaymentSort() {
  const sortBtn = document.getElementById("paymentIdSortBtn");
  const table = document.getElementById("payment-table");
  if (!sortBtn || !table) return;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    e.preventDefault();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    paymentSortAscending = paymentSortAscending === null || paymentSortAscending === false ? true : false;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    rows.sort((a, b) => {
      const aId = a.cells[0].textContent.trim();
      const bId = b.cells[0].textContent.trim();
      
      const aNum = parseInt(aId.replace(/^[A-Za-z]/, "")) || 0;
      const bNum = parseInt(bId.replace(/^[A-Za-z]/, "")) || 0;
      
      return paymentSortAscending ? aNum - bNum : bNum - aNum;
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    //update icon
    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = paymentSortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPaymentSort);
} else {
  initPaymentSort();
}

let paymentDateSortAscending = null;

function initPaymentDateSort() {
  const sortBtn = document.getElementById("paymentDateSortBtn");
  const table = document.getElementById("payment-table");
  if (!sortBtn || !table) return;
  const tbody = table.querySelector("tbody");
  if (!tbody) return;

  sortBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    paymentDateSortAscending =
      paymentDateSortAscending === null || paymentDateSortAscending === false
        ? true
        : false;

    const rows = Array.from(tbody.querySelectorAll("tr"));

    const ths = Array.from(table.querySelectorAll("thead th"));
    let dateColIndex = ths.findIndex((th) =>
      (th.textContent || "").trim().toLowerCase().includes("date")
    );
    if (dateColIndex === -1) dateColIndex = 3;

    rows.sort((a, b) => {
      const aText = (a.cells[dateColIndex]?.textContent || "").trim();
      const bText = (b.cells[dateColIndex]?.textContent || "").trim();

      const aTime = Date.parse(aText);
      const bTime = Date.parse(bText);

      if (!isNaN(aTime) && !isNaN(bTime)) {
        return paymentDateSortAscending ? aTime - bTime : bTime - aTime;
      }


      return paymentDateSortAscending
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });

    tbody.innerHTML = "";
    rows.forEach((row) => tbody.appendChild(row));

    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = paymentDateSortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPaymentDateSort);
} else {
  initPaymentDateSort();
}

/* ==============================
   Client-side Pagination for Payment Table
   =============================== */
(function() {
  const table = document.getElementById('payment-table');
  const paginationContainer = document.getElementById('payment-pagination');
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
