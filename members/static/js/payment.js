function openPaymentModal() {
    const formContainer = document.querySelector(".payment-form-container");
    const overlay = document.getElementById("paymentModalOverlay");
    if (!formContainer || !overlay) return;

    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closePaymentModal() {
    const formContainer = document.querySelector(".payment-form-container");
    const overlay = document.getElementById("paymentModalOverlay");
    if (!formContainer || !overlay) return;

    formContainer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";

    resetPaymentForm();
}

// Loading overlay - MUST be at module level
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

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("closeBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            closePaymentModal();
        });
    }

    // overlay click
    const overlay = document.getElementById("paymentModalOverlay");
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closePaymentModal();
            }
        });
    }
});

//reset form
function resetPaymentForm() {
  const form = document.querySelector(".payment-form");
  if (!form) return;

  //reset form fields
  form.reset();

  //clear
  const editId = form.querySelector('input[name="edit_id"]');
  if (editId) editId.value = "";

  //reset form title
  const title = document.querySelector(".form-title");
  if (title) title.textContent = "Add Payment";

  //restore order dropdown
  const orderSelect = document.querySelector('[name="order"]');
  if (orderSelect) {
    orderSelect.disabled = false;
    orderSelect.style.pointerEvents = "auto"; //pde n ulit i click
    orderSelect.style.color = "";
  }

  const paymentIdField = document.querySelector('[name="payment_id"]');
  if (paymentIdField) {
    paymentIdField.readOnly = false;
    paymentIdField.style.color = "";
  }
}

// Toggle Payment Form Modal
function togglePaymentForm(forceClose = false) {
    const formContainer = document.querySelector(".payment-form-container");

    if (forceClose || formContainer.classList.contains("active")) {
        closePaymentModal();
    } else {
        openPaymentModal();
    }
}


const params = new URLSearchParams(window.location.search);
if (params.get("open_form") === "true") {
  const formContainer = document.querySelector(".payment-form-container");
  const overlay = document.getElementById("paymentModalOverlay");
  if (formContainer && overlay) {
    formContainer.classList.add("active");
    overlay.classList.add("active");
    window.openModal(formContainer, overlay);
  }
}

//close modal on close button click
document.getElementById("paymentModalOverlay")
    ?.addEventListener("click", (e) => {
        if (e.target.id === "paymentModalOverlay") {
            closePaymentModal();
        }
    });
    
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closePaymentModal();
    }
});

//search payment by customer name
function searchPaymentByCustomer() {
  const input = document.getElementById("searchInput");
  const filter = (input.value || "").toLowerCase();
  const rows = document.querySelectorAll(".table-payment tbody tr");

  rows.forEach((row) => {
    const customerCell = row.cells[2]; //Customer Name column(3rd column)
    if (customerCell) {
      const customerText = customerCell.textContent || customerCell.innerText;
      row.style.display = customerText.toLowerCase().includes(filter)
        ? ""
        : "none";
    }
  });
}

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

document.addEventListener("click", (e) => {
    const btn = e.target.closest(".edit-button");
    if (!btn) return;

    e.preventDefault();

    const paymentId = btn.getAttribute("data-payment_id");
    const order = btn.getAttribute("data-order");
    const amount = btn.getAttribute("data-amount");
    const method = btn.getAttribute("data-method");
    const id = btn.getAttribute("data-id");

    // Form fields
    const paymentIdField = document.querySelector('[name="payment_id"]');
    const orderSelect = document.querySelector('[name="order"]');
    const amountField = document.querySelector('[name="amount"]');
    const methodField = document.querySelector('[name="method"]');

    if (paymentIdField) {
        paymentIdField.value = paymentId || "";
        paymentIdField.readOnly = true;
    }

    if (orderSelect) {
        orderSelect.value = order || "";
        orderSelect.disabled = true;
        orderSelect.style.pointerEvents = "none";
    }

    if (amountField) amountField.value = amount || "";
    if (methodField) methodField.value = method || "";

    // Hidden edit_id
    const paymentForm = document.querySelector(".payment-form");
    let editIdInput = document.querySelector('input[name="edit_id"]');

    if (!editIdInput) {
        editIdInput = document.createElement("input");
        editIdInput.type = "hidden";
        editIdInput.name = "edit_id";
        paymentForm.appendChild(editIdInput);
    }

    editIdInput.value = id || "";

    // Update title
    const title = document.querySelector(".form-title");
    if (title) title.textContent = "Edit Payment";

    // Open modal
    const formContainer = document.querySelector(".payment-form-container");
    const overlay = document.getElementById("paymentModalOverlay");

    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
});


//sort by id
let paymentSortAscending = null;

function initPaymentSort() {
  const sortBtn = document.getElementById("paymentIdSortBtn");
  const table = document.getElementById("payment-table");
  if (!sortBtn || !table) return;

  sortBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    paymentSortAscending =
      paymentSortAscending === null || paymentSortAscending === false
        ? true
        : false;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aId = a.cells[0].textContent.trim();
      const bId = b.cells[0].textContent.trim();

      const aNum = parseInt(aId.replace(/^[A-Za-z]/, "")) || 0;
      const bNum = parseInt(bId.replace(/^[A-Za-z]/, "")) || 0;

      return paymentSortAscending ? aNum - bNum : bNum - aNum;
    });

    tbody.innerHTML = "";
    rows.forEach((row) => tbody.appendChild(row));

    //update icon
    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = paymentSortAscending
        ? "fas fa-sort-up"
        : "fas fa-sort-down";
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPaymentSort);
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
      icon.className = paymentDateSortAscending
        ? "fas fa-sort-up"
        : "fas fa-sort-down";
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
(function () {
  const table = document.getElementById("payment-table");
  const paginationContainer = document.getElementById("payment-pagination");
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10;

  function getAllRows() {
    return Array.from(table.querySelectorAll("tbody tr"));
  }

  function showPage(page) {
    const allRows = getAllRows();
    allRows.forEach((r) => (r.style.display = "none"));

    const total = allRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    allRows.slice(start, end).forEach((r) => (r.style.display = ""));

    renderPaginationControls(totalPages);
  }
  window.showEmployeePage = showPage;

  function renderPaginationControls(totalPages) {
    paginationContainer.innerHTML = "";
    const pager = document.createElement("div");
    pager.className = "pagination";

    const prev = document.createElement("button");
    prev.className = "page-prev";
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => showPage(currentPage - 1));
    pager.appendChild(prev);

    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      const btn = document.createElement("button");
      btn.textContent = "1";
      btn.addEventListener("click", () => showPage(1));
      pager.appendChild(btn);
      if (startPage > 2) {
        const ell = document.createElement("span");
        ell.className = "ellipsis";
        ell.textContent = "…";
        pager.appendChild(ell);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const btn = document.createElement("button");
      btn.textContent = String(p);
      if (p === currentPage) btn.setAttribute("aria-current", "page");
      btn.addEventListener("click", () => showPage(p));
      pager.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ell = document.createElement("span");
        ell.className = "ellipsis";
        ell.textContent = "…";
        pager.appendChild(ell);
      }
      const btn = document.createElement("button");
      btn.textContent = String(totalPages);
      btn.addEventListener("click", () => showPage(totalPages));
      pager.appendChild(btn);
    }

    const next = document.createElement("button");
    next.className = "page-next";
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => showPage(currentPage + 1));
    pager.appendChild(next);

    paginationContainer.appendChild(pager);
  }

  document.addEventListener("DOMContentLoaded", () => {
    showPage(1);
  });

  setTimeout(() => {
    if (!document.readyState || document.readyState !== "loading") showPage(1);
  }, 50);
})();

// AJAX FETCH

document.addEventListener("DOMContentLoaded", () => {
  const paymentForm = document.querySelector(".payment-form");
  if (paymentForm) {
    
    paymentForm.addEventListener("submit", async function(e) {
      e.preventDefault();

      showLoading();

      // If some fields were disabled for editing (e.g. order select),
      // disabled fields are not included in FormData. Temporarily enable
      // them so their values are sent.
      const disabledElems = Array.from(paymentForm.querySelectorAll('[disabled]'));
      disabledElems.forEach(el => el.disabled = false);

      // Fallback: if order select is missing inside the form, try to
      // add a hidden input with the current order value (if available).
      let orderSelect = paymentForm.querySelector('[name="order"]');
      if (!orderSelect) {
        const editOrderId = document.querySelector('[name="edit_id"]')?.value || null;
        // If the form is in edit mode we may obtain the order id from the
        // currently visible disabled select elsewhere; attempt to grab it.
        const externalOrder = document.querySelector('[data-order]')?.getAttribute('data-order') || null;
        const orderVal = externalOrder || editOrderId;
        if (orderVal) {
          const hiddenOrder = document.createElement('input');
          hiddenOrder.type = 'hidden';
          hiddenOrder.name = 'order';
          hiddenOrder.value = orderVal;
          paymentForm.appendChild(hiddenOrder);
        }
      }

      const formData = new FormData(paymentForm);
      const actionUrl = paymentForm.getAttribute("action") || window.location.href;

      try {
        const response = await fetch(actionUrl, {
          method: "POST",
          body: formData,
          redirect: "follow"
        });

        if (!response.ok) {
          throw new Error("Form submission failed");
        }

        setTimeout(() => {
          hideLoading();
          closePaymentModal();
          resetPaymentForm();
          // Re-disable previously disabled elements for consistent UI state
          disabledElems.forEach(el => el.disabled = true);
          window.location.reload();
        }, 800);
      } catch (error) {
        hideLoading();
        alert("Error submitting form. Please try again.");
        console.error("Form submission error:", error);
      }
    });
  }

  // Load payments table data
  fetch("payments_json/")
    .then(response => response.json())
    .then(orders => {
      const tbody = document.getElementById("payments-body");
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
      
      orders.forEach(p => {
        tbody.innerHTML += `
        <tr id="payment-${p.id}">
          <td>${p.payment_id}</td>
          <td>${p.order.order_id}</td>
          <td>${p.customer.name}</td>
          <td>₱${p.amount}</td>
          <td>${p.date}</td>
          <td>${p.method}</td>
          <td>
            <div class="action-buttons">
              <button type="button" class="edit-button"
                data-id="${p.id}"
                data-payment_id="${p.payment_id}"
                data-order="${p.order.id}"
                data-amount="${p.amount}"
                data-date="${p.date}"
                data-method="${p.method}" 
                title="Edit Payment" aria-label="Edit Payment" style="margin-right:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px"
                  fill="#FFFFFF">
                  <path
                  d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z" />
              </svg>
              </button>

              <button type="button" class="delete-button" data-id="${p.id}" aria-label="Delete Payment">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"
                  fill="#FFFFFF">
                  <path
                      d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm72-144h72v-336h-72v336Zm120 0h72v-336h-72v336Z" />
                  </svg>
              </button>
            </div>
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
        const paymentId = btn.dataset.id;

        if (!confirm("Delete this payment?")) return;

        showLoading();

        try {
            const response = await fetch(`delete-payment/${paymentId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                }
            });

            if (response.ok) {
                // Remove row from table
                const row = document.getElementById(`payment-${paymentId}`);
                if (row) row.remove();
                
                setTimeout(() => {
                  hideLoading();
                  window.location.reload();
                }, 800);
            } else {
                hideLoading();
                alert("Failed to delete.");
            }
        } catch (error) {
            hideLoading();
            alert("Error deleting payment. Please try again.");
            console.error("Delete error:", error);
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
