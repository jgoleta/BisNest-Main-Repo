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

/* ==============================
   Buy Now Pay Later (frontend demo)
   ============================== */
(function initBnpl() {
  const BNPL_PLANS = [
    { id: "3mo", label: "3 months", months: 3, interest: 0 },
    { id: "6mo", label: "6 months", months: 6, interest: 2.5 },
    { id: "12mo", label: "12 months", months: 12, interest: 5 },
  ];

  const BNPL_DEMO_ORDERS = [
    { orderId: "ORD-1042", customer: "Juan Dela Cruz", amount: 8500 },
    { orderId: "ORD-1055", customer: "Ana Reyes", amount: 12300 },
    { orderId: "ORD-1061", customer: "Marco Lopez", amount: 24000 },
  ];

  let bnplAccounts = [
    {
      id: "BNPL-001",
      customer: "Maria Santos",
      orderId: "ORD-1024",
      total: 15000,
      planId: "6mo",
      paidInstallments: 2,
      nextDue: "2026-05-25",
      status: "active",
      startDate: "2026-01-25",
    },
    {
      id: "BNPL-002",
      customer: "Pedro Garcia",
      orderId: "ORD-1031",
      total: 9450,
      planId: "3mo",
      paidInstallments: 3,
      nextDue: "—",
      status: "completed",
      startDate: "2026-02-10",
    },
    {
      id: "BNPL-003",
      customer: "Lisa Fernandez",
      orderId: "ORD-1038",
      total: 22000,
      planId: "12mo",
      paidInstallments: 1,
      nextDue: "2026-05-18",
      status: "overdue",
      startDate: "2026-04-18",
    },
  ];

  let selectedPlanId = "6mo";
  let toastEl = null;

  function formatCurrency(n) {
    return "₱" + Number(n).toLocaleString("en-PH", { minimumFractionDigits: 0 });
  }

  function getPlan(planId) {
    return BNPL_PLANS.find((p) => p.id === planId) || BNPL_PLANS[1];
  }

  function calcInstallments(total, planId) {
    const plan = getPlan(planId);
    const withInterest = total * (1 + plan.interest / 100);
    const perMonth = Math.ceil(withInterest / plan.months);
    const schedule = [];
    const start = new Date();
    for (let i = 1; i <= plan.months; i++) {
      const due = new Date(start);
      due.setMonth(due.getMonth() + i);
      schedule.push({
        num: i,
        dueDate: due.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        amount: perMonth,
      });
    }
    return { perMonth, schedule, totalWithInterest: perMonth * plan.months };
  }

  function buildFullSchedule(account) {
    const plan = getPlan(account.planId);
    const { schedule } = calcInstallments(account.total, account.planId);
    return schedule.map((s, i) => ({
      ...s,
      status:
        i < account.paidInstallments
          ? "Paid"
          : i === account.paidInstallments && account.status !== "completed"
            ? account.status === "overdue"
              ? "Overdue"
              : "Due"
            : "Upcoming",
    }));
  }

  function updateSummaryStats() {
    const active = bnplAccounts.filter((a) => a.status === "active" || a.status === "overdue");
    let outstanding = 0;
    active.forEach((a) => {
      const plan = getPlan(a.planId);
      const { perMonth } = calcInstallments(a.total, a.planId);
      outstanding += perMonth * (plan.months - a.paidInstallments);
    });
    const dueThisMonth = active.reduce((sum, a) => {
      if (a.status === "overdue") {
        return sum + calcInstallments(a.total, a.planId).perMonth;
      }
      return sum + (a.status === "active" ? calcInstallments(a.total, a.planId).perMonth : 0);
    }, 0);

    const elActive = document.getElementById("bnplStatActive");
    const elOut = document.getElementById("bnplStatOutstanding");
    const elDue = document.getElementById("bnplStatDue");
    if (elActive) elActive.textContent = String(active.length);
    if (elOut) elOut.textContent = formatCurrency(outstanding);
    if (elDue) elDue.textContent = formatCurrency(dueThisMonth);
  }

  function renderActiveTable() {
    const tbody = document.getElementById("bnpl-active-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    bnplAccounts.forEach((acc) => {
      const plan = getPlan(acc.planId);
      const pct = Math.round((acc.paidInstallments / plan.months) * 100);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.customer}</td>
        <td>${acc.orderId}</td>
        <td>${formatCurrency(acc.total)}</td>
        <td>${plan.label}${plan.interest ? ` (${plan.interest}% APR)` : ""}</td>
        <td>
          <div class="bnpl-progress">
            <div class="bnpl-progress-bar"><div class="bnpl-progress-fill" style="width:${pct}%"></div></div>
            <span class="bnpl-progress-text">${acc.paidInstallments}/${plan.months}</span>
          </div>
        </td>
        <td>${acc.nextDue}</td>
        <td><span class="bnpl-status ${acc.status}">${acc.status}</span></td>
        <td><button type="button" class="bnpl-view-btn" data-bnpl-id="${acc.id}">View</button></td>
      `;
      tbody.appendChild(tr);
    });
    updateSummaryStats();
  }

  function renderPlanOptions() {
    const container = document.getElementById("bnplPlanOptions");
    if (!container) return;
    container.innerHTML = BNPL_PLANS.map(
      (p) => `
      <label class="bnpl-plan-card ${p.id === selectedPlanId ? "selected" : ""}" data-plan-id="${p.id}">
        <input type="radio" name="bnpl_plan" value="${p.id}" ${p.id === selectedPlanId ? "checked" : ""}>
        <div class="plan-months">${p.label}</div>
        <div class="plan-rate">${p.interest === 0 ? "0% interest" : p.interest + "% APR"}</div>
      </label>
    `
    ).join("");
  }

  function renderApplyPreview() {
    const orderSelect = document.getElementById("bnplOrderSelect");
    const amountDisplay = document.getElementById("bnplAmountDisplay");
    const list = document.getElementById("bnplScheduleList");
    if (!orderSelect || !amountDisplay || !list) return;

    const idx = orderSelect.selectedIndex;
    const order = BNPL_DEMO_ORDERS[idx] || BNPL_DEMO_ORDERS[0];
    amountDisplay.value = formatCurrency(order.amount);

    const { schedule, totalWithInterest, perMonth } = calcInstallments(
      order.amount,
      selectedPlanId
    );
    list.innerHTML = schedule
      .map(
        (s) =>
          `<li><span>Payment ${s.num} — ${s.dueDate}</span><strong>${formatCurrency(s.amount)}</strong></li>`
      )
      .join("");
    list.dataset.perMonth = String(perMonth);
    list.dataset.total = String(totalWithInterest);
  }

  function populateOrderSelect() {
    const sel = document.getElementById("bnplOrderSelect");
    if (!sel) return;
    sel.innerHTML = BNPL_DEMO_ORDERS.map(
      (o) =>
        `<option value="${o.orderId}">${o.orderId} — ${o.customer} (${formatCurrency(o.amount)})</option>`
      ).join("");
  }

  function switchBnplTab(tabName) {
    document.querySelectorAll(".bnpl-tab").forEach((btn) => {
      const isActive = btn.dataset.bnplTab === tabName;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    document.querySelectorAll(".bnpl-tab-panel").forEach((panel) => {
      const id = panel.id;
      const show =
        (tabName === "active" && id === "bnpl-panel-active") ||
        (tabName === "apply" && id === "bnpl-panel-apply");
      panel.classList.toggle("active", show);
      panel.hidden = !show;
    });
    const detail = document.getElementById("bnplDetailPanel");
    if (detail) detail.hidden = true;
    if (tabName === "active") {
      document.getElementById("bnpl-panel-active")?.classList.add("active");
    }
  }

  function showBnplDetail(accountId) {
    const acc = bnplAccounts.find((a) => a.id === accountId);
    if (!acc) return;
    const plan = getPlan(acc.planId);
    const schedule = buildFullSchedule(acc);

    const activePanel = document.getElementById("bnpl-panel-active");
    if (activePanel) {
      activePanel.classList.remove("active");
      activePanel.hidden = true;
    }
    const tabs = document.querySelector(".bnpl-tabs");
    if (tabs) tabs.style.display = "none";

    const panel = document.getElementById("bnplDetailPanel");
    panel.hidden = false;
    document.getElementById("bnplDetailTitle").textContent = `${acc.id} — ${acc.customer}`;
    document.getElementById("bnplDetailMeta").innerHTML = `
      <div><span>Order</span><strong>${acc.orderId}</strong></div>
      <div><span>Total</span><strong>${formatCurrency(acc.total)}</strong></div>
      <div><span>Plan</span><strong>${plan.label}</strong></div>
      <div><span>Started</span><strong>${acc.startDate}</strong></div>
    `;

    const tbody = document.getElementById("bnplDetailSchedule");
    tbody.innerHTML = schedule
      .map(
        (s) => `
      <tr>
        <td>${s.num}</td>
        <td>${s.dueDate}</td>
        <td>${formatCurrency(s.amount)}</td>
        <td><span class="bnpl-status ${s.status === "Paid" ? "completed" : s.status === "Overdue" ? "overdue" : "active"}">${s.status}</span></td>
      </tr>
    `
      )
      .join("");
  }

  function hideBnplDetail() {
    const detail = document.getElementById("bnplDetailPanel");
    if (detail) detail.hidden = true;
    const tabs = document.querySelector(".bnpl-tabs");
    if (tabs) tabs.style.display = "flex";
    switchBnplTab("active");
  }

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "bnpl-toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  function openBnplModal() {
    document.getElementById("bnplModal")?.classList.add("active");
    document.getElementById("bnplModalOverlay")?.classList.add("active");
    document.body.style.overflow = "hidden";
    hideBnplDetail();
    switchBnplTab("active");
    renderActiveTable();
    renderPlanOptions();
    renderApplyPreview();
  }

  function closeBnplModal() {
    document.getElementById("bnplModal")?.classList.remove("active");
    document.getElementById("bnplModalOverlay")?.classList.remove("active");
    document.body.style.overflow = "";
    hideBnplDetail();
  }

  function setupBnpl() {
    populateOrderSelect();
    renderPlanOptions();
    renderActiveTable();
    renderApplyPreview();

    document.getElementById("bnplOpenBtn")?.addEventListener("click", openBnplModal);
    document.getElementById("bnplCloseBtn")?.addEventListener("click", closeBnplModal);
    document.getElementById("bnplModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "bnplModalOverlay") closeBnplModal();
    });
    document.getElementById("bnplDetailBack")?.addEventListener("click", hideBnplDetail);

    document.querySelectorAll(".bnpl-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        hideBnplDetail();
        switchBnplTab(btn.dataset.bnplTab);
        if (btn.dataset.bnplTab === "apply") renderApplyPreview();
      });
    });

    document.getElementById("bnplPlanOptions")?.addEventListener("click", (e) => {
      const card = e.target.closest(".bnpl-plan-card");
      if (!card) return;
      selectedPlanId = card.dataset.planId;
      document.querySelectorAll(".bnpl-plan-card").forEach((c) => {
        c.classList.toggle("selected", c.dataset.planId === selectedPlanId);
      });
      renderApplyPreview();
    });

    document.getElementById("bnplOrderSelect")?.addEventListener("change", renderApplyPreview);

    document.getElementById("bnpl-active-body")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".bnpl-view-btn");
      if (btn) showBnplDetail(btn.dataset.bnplId);
    });

    document.getElementById("bnplApplyForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const orderSelect = document.getElementById("bnplOrderSelect");
      const idx = orderSelect?.selectedIndex ?? 0;
      const order = BNPL_DEMO_ORDERS[idx];
      const plan = getPlan(selectedPlanId);
      const newId = "BNPL-" + String(bnplAccounts.length + 1).padStart(3, "0");
      const start = new Date();
      const nextDue = new Date(start);
      nextDue.setMonth(nextDue.getMonth() + 1);

      bnplAccounts.unshift({
        id: newId,
        customer: order.customer,
        orderId: order.orderId,
        total: order.amount,
        planId: selectedPlanId,
        paidInstallments: 0,
        nextDue: nextDue.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        status: "active",
        startDate: start.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      });

      renderActiveTable();
      showToast(`BNPL plan applied to ${order.orderId} (${plan.label}) — demo only`);
      switchBnplTab("active");
      e.target.reset();
      selectedPlanId = "6mo";
      renderPlanOptions();
      renderApplyPreview();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("bnplModal")?.classList.contains("active")) {
        closeBnplModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupBnpl);
  } else {
    setupBnpl();
  }
})();
