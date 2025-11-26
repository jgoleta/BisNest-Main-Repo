document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.querySelector(".order-form-container");
  const modalOverlay = document.getElementById("modalOverlay");
  const orderForm = document.querySelector(".order-form");
  const closeBtn = document.getElementById("closeBtn");
  const newBtn = document.querySelector(".toggle-form-button");
  const sortBtn = document.getElementById("orderIdSortBtn");
  const orderTableBody = document.querySelector("#order-table tbody");

  //reset form
  function resetOrderForm() {
    if (!orderForm) return;
    orderForm.reset();

    const editIdInput = document.querySelector('input[name="edit_id"]');
    if (editIdInput) editIdInput.remove();

    const title = document.getElementById("formTitle");
    if (title) title.textContent = "Order Information";
  }

  //open modal
  function openModal() {
    formContainer.style.display = "block";
    modalOverlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  //close modal
  function closeModal() {
    formContainer.style.display = "none";
    modalOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (newBtn) {
    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetOrderForm(); // clear previous state

      const orderIdInput = document.querySelector('[name="order_id"]');
      if (orderIdInput) {
        const rows = document.querySelectorAll("#order-table tbody tr");

        if (rows.length > 0) {
          // Find the *highest* existing numeric part among all IDs
          let maxNum = 0;
          rows.forEach((row) => {
            const idText = row.cells[0].textContent.trim();
            const num = parseInt(idText.replace(/\D/g, "")) || 0;
            if (num > maxNum) maxNum = num;
          });
          const nextNum = maxNum + 1;
          orderIdInput.value = `O${nextNum.toString().padStart(4, "0")}`;
        } else {
          orderIdInput.value = "O0001";
        }
      }

      openModal();
    });
  }

  //cancel button
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
      resetOrderForm();
    });
  }

  //edit button
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".edit-button");
    if (!btn) return;

    e.preventDefault();

    const id = btn.getAttribute("data-id");
    const order_id = btn.getAttribute("data-order_id");
    const customer = btn.getAttribute("data-customer");
    const employee = btn.getAttribute("data-employee");
    const product = btn.getAttribute("data-product");
    const quantity = btn.getAttribute("data-quantity");
    const amount = btn.getAttribute("data-amount");

    //form
    const orderIdInput = document.querySelector('[name="order_id"]');
    const customerInput = document.querySelector('[name="customer"]');
    const employeeInput = document.querySelector('[name="employee"]');
    const productInput = document.querySelector('[name="product"]');
    const quantityInput = document.querySelector('[name="quantity"]');
    const amountInput = document.querySelector('[name="amount"]');

    if (orderIdInput) orderIdInput.value = order_id || "";
    if (customerInput) customerInput.value = customer || "";
    if (employeeInput) employeeInput.value = employee || "";
    if (productInput) productInput.value = product || "";
    if (quantityInput) quantityInput.value = quantity || "";
    if (amountInput) amountInput.value = amount || "";

    let editIdInput = document.querySelector('input[name="edit_id"]');
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.name = "edit_id";
      orderForm.appendChild(editIdInput);
    }
    editIdInput.value = id || "";

    const formTitle = document.getElementById("formTitle");
    if (formTitle) formTitle.textContent = "Edit Order";

    openModal();
  });

  //sort
  let orderSortAscending = true;
  if (sortBtn && orderTableBody) {
    // detect customer column index from the table header (robust if columns moved)
    const orderTable = document.querySelector("#order-table");
    let customerColIndex = 1; // fallback
    if (orderTable) {
      const ths = Array.from(orderTable.querySelectorAll("thead th"));
      const idx = ths.findIndex((th) =>
        (th.textContent || "").trim().toLowerCase().includes("customer")
      );
      if (idx !== -1) customerColIndex = idx;
    }

    sortBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const rows = Array.from(orderTableBody.querySelectorAll("tr"));
      orderSortAscending = !orderSortAscending; // toggle
      rows.sort((a, b) => {
        const aText = (a.cells[customerColIndex]?.textContent || "")
          .trim()
          .toLowerCase();
        const bText = (b.cells[customerColIndex]?.textContent || "")
          .trim()
          .toLowerCase();
        return orderSortAscending
          ? aText.localeCompare(bText, undefined, {
              sensitivity: "base",
              numeric: false,
            })
          : bText.localeCompare(aText, undefined, {
              sensitivity: "base",
              numeric: false,
            });
      });
      orderTableBody.innerHTML = "";
      rows.forEach((r) => orderTableBody.appendChild(r));
      const icon = sortBtn.querySelector("i");
      if (icon)
        icon.className = orderSortAscending
          ? "fas fa-sort-up"
          : "fas fa-sort-down";
    });
  }

  let orderDateAscending = null;
  const orderDateSortBtn = document.getElementById("orderDateSortBtn");
  if (orderDateSortBtn && orderTableBody) {
    orderDateSortBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const tbody = orderTableBody;
      if (!tbody) return;

      //ascend on 1st click
      orderDateAscending =
        orderDateAscending === null || orderDateAscending === false
          ? true
          : false;

      const orderTable = document.querySelector("#order-table");
      let dateColIndex = 5;
      if (orderTable) {
        const ths = Array.from(orderTable.querySelectorAll("thead th"));
        const idx = ths.findIndex((th) =>
          (th.textContent || "").trim().toLowerCase().includes("date")
        );
        if (idx !== -1) dateColIndex = idx;
      }

      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.sort((a, b) => {
        const aText = (a.cells[dateColIndex]?.textContent || "").trim();
        const bText = (b.cells[dateColIndex]?.textContent || "").trim();

        const aDate = Date.parse(aText);
        const bDate = Date.parse(bText);

        if (!isNaN(aDate) && !isNaN(bDate)) {
          return orderDateAscending ? aDate - bDate : bDate - aDate;
        }

        const aLower = aText.toLowerCase();
        const bLower = bText.toLowerCase();
        return orderDateAscending
          ? aLower.localeCompare(bLower)
          : bLower.localeCompare(aLower);
      });

      tbody.innerHTML = "";
      rows.forEach((r) => tbody.appendChild(r));

      const icon = orderDateSortBtn.querySelector("i");
      if (icon)
        icon.className = orderDateAscending
          ? "fas fa-sort-up"
          : "fas fa-sort-down";
    });
  }

  //form submut
  if (orderForm) {
    orderForm.addEventListener("submit", () => {
      // prevent multiple clicks
      const btns = orderForm.querySelectorAll("button[type='submit']");
      btns.forEach((b) => (b.disabled = true));
      setTimeout(() => btns.forEach((b) => (b.disabled = false)), 2000);
    });
  }
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

/* Pagination */
(function() {
  const table = document.getElementById('order-table');
  const paginationContainer = document.getElementById('order-pagination');
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
