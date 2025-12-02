document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.querySelector(".order-form-container");
  const modalOverlay = document.getElementById("modalOverlay");
  const orderForm = document.querySelector(".order-form");
  const closeBtn = document.getElementById("closeBtn");
  const newBtn = document.querySelector(".toggle-form-button");
  const sortBtn = document.getElementById("orderIdSortBtn");
  const orderTableBody = document.querySelector("#order-table tbody");

  // Check for cart data and auto-fill form when modal is opened
  function fillFormWithCartData() {
    const cartData = localStorage.getItem('pendingOrderCart');
    if (!cartData) return;
    
    try {
      const cart = JSON.parse(cartData);
      if (cart.length === 0) return;
      
      // Use the first item for form pre-fill
      const firstItem = cart[0];
      
      // Set customer, employee, and product
      const customerInput = document.querySelector('[name="customer"]');
      const employeeInput = document.querySelector('[name="employee"]');
      const productInput = document.querySelector('[name="product"]');
      const quantityInput = document.querySelector('[name="quantity"]');
      
      if (customerInput && firstItem.customerId) {
        customerInput.value = firstItem.customerId;
        // Trigger change event to ensure form validation
        customerInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (employeeInput && firstItem.employeeId) {
        employeeInput.value = firstItem.employeeId;
        employeeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (productInput && firstItem.productId) {
        productInput.value = firstItem.productId;
        productInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      if (quantityInput && firstItem.quantity) {
        quantityInput.value = firstItem.quantity;
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      // Store cart data for form submission (to create all orders)
      const cartDataInput = document.querySelector('input[name="cart_data"]');
      if (!cartDataInput) {
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'cart_data';
        hiddenInput.value = cartData;
        orderForm.appendChild(hiddenInput);
      } else {
        cartDataInput.value = cartData;
      }
      
      // Show notification
      if (window.showNotification) {
        showNotification(`Loaded ${cart.length} item(s) from cart. Form pre-filled with first item.`);
      }
    } catch (err) {
      console.error('Error loading cart data:', err);
    }
  }

  //reset form
  function resetOrderForm() {
    if (!orderForm) return;
    orderForm.reset();

    const editIdInput = document.querySelector('input[name="edit_id"]');
    if (editIdInput) editIdInput.remove();
    
    const cartDataInput = document.querySelector('input[name="cart_data"]');
    if (cartDataInput) cartDataInput.remove();

    const title = document.getElementById("formTitle");
    if (title) title.textContent = "Order Information";
  }
  
  // Cart data will be loaded when user opens the form manually

  //open modal
  function openModal() {
    window.openModal(formContainer, modalOverlay);
  }

  //close modal
  function closeModal() {
    window.closeModal(formContainer, modalOverlay);
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
          orderIdInput.value = `ORD${nextNum.toString().padStart(4, "0")}`;
        } else {
          orderIdInput.value = "ORD0001";
        }
      }

      openModal();
      // Auto-fill form with cart data if available
      fillFormWithCartData();
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

  //form submit
  if (orderForm) {
    orderForm.addEventListener("submit", function(e) {
      // Check if cart data exists - if so, the backend will handle multiple orders
      const cartDataInput = document.querySelector('input[name="cart_data"]');
      if (cartDataInput && cartDataInput.value) {
        // Cart data will be processed by backend
        // Clear cart after submission
        localStorage.removeItem('productCart');
        localStorage.removeItem('pendingOrderCart');
      }
      
      // prevent multiple clicks
      const btns = orderForm.querySelectorAll("button[type='submit']");
      btns.forEach((b) => (b.disabled = true));
      setTimeout(() => btns.forEach((b) => (b.disabled = false)), 2000);
    });
  }
});

function searchCustomer() {
  const input = document.getElementById("searchInput");
  const productFilter = document.getElementById("productFilter");
  const customerFilter = (input.value || "").toLowerCase();
  const productValue = (productFilter && productFilter.value) || "";
  const table = document.querySelector(".table tbody");
  if (!table) return;
  const rows = table.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const customerCell = rows[i].getElementsByTagName("td")[1];
    const productCell = rows[i].getElementsByTagName("td")[3];
    
    let matchesCustomer = true;
    let matchesProduct = true;
    
    if (customerCell && customerFilter) {
      const customerText = customerCell.textContent || customerCell.innerText;
      matchesCustomer = customerText.toLowerCase().indexOf(customerFilter) > -1;
    }
    
    if (productCell && productValue) {
      const productText = productCell.textContent || productCell.innerText;
      matchesProduct = productText.trim() === productValue;
    }
    
    rows[i].style.display = (matchesCustomer && matchesProduct) ? "" : "none";
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

  function getFilteredRows() {
    const input = document.getElementById('searchInput');
    const productFilter = document.getElementById('productFilter');
    const customerFilter = (input && input.value || '').toLowerCase().trim();
    const productValue = (productFilter && productFilter.value) || '';
    
    return getAllRows().filter(r => {
      const customerCell = r.querySelectorAll('td')[1];
      const productCell = r.querySelectorAll('td')[3];
      
      let matchesCustomer = true;
      let matchesProduct = true;
      
      if (customerCell && customerFilter) {
        const txt = (customerCell.textContent || customerCell.innerText || '').toLowerCase();
        matchesCustomer = txt.indexOf(customerFilter) > -1;
      }
      
      if (productCell && productValue) {
        const productText = (productCell.textContent || productCell.innerText || '').trim();
        matchesProduct = productText === productValue;
      }
      
      return matchesCustomer && matchesProduct;
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

  function recalcAndShowFirstOrCurrent() {
    const total = getFilteredRows().length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    showPage(currentPage);
  }

  // Hook to searchCustomer
  const originalSearch = window.searchCustomer;
  window.searchCustomer = function() {
    try { if (typeof originalSearch === 'function') originalSearch(); }
    finally { recalcAndShowFirstOrCurrent(); }
  };

  document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
  });

  setTimeout(() => {
    if (!document.readyState || document.readyState !== 'loading') showPage(1);
  }, 50);

})();

document.addEventListener("DOMContentLoaded", () => {
    fetch("orders_json/")
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById("orders-body");
            tbody.innerHTML = ""; // clear loading row

            orders.forEach(o => {
                tbody.innerHTML += `
                <tr id="order-${o.id}">
                    <td>${o.order_id}</td>
                    <td>${o.customer.name}</td>
                    <td>${o.employee.name}</td>
                    <td>${o.product.name}</td>
                    <td>₱${o.amount}</td>
                    <td>${o.date}</td>
                    <td>
                        <div class="action-buttons">
                            <button type="button" class="edit-button"
                                data-id="${o.id}"
                                data-order_id="${o.order_id}"
                                data-customer="${o.customer.id}"
                                data-employee="${o.employee.id}"
                                data-product="${o.product.id}"
                                data-quantity="${o.quantity}"
                                data-amount="${o.amount}">
                                 <svg xmlns="http://www.w3.org/2000/svg" height="16px"
                                    viewBox="0 -960 960 960" width="16px" fill="#FFFFFF">
                                    <path d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z" />
                                </svg>
                            </button>

                                <button type="submit" class="delete-button" data-id="${o.id}" aria-label="Delete order">
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px"
                                        viewBox="0 -960 960 960" width="20px" fill="#FFFFFF">
                                        <path
                                            d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm72-144h72v-336h-72v336Zm120 0h72v-336h-72v336Z" />
                                    </svg>
                                </button>
                            </form>
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
        const orderId = btn.dataset.id;

        if (!confirm("Delete this order?")) return;

        const response = await fetch(`/delete-order/${orderId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            }
        });

        if (response.ok) {
            // Remove row from table
            const row = document.getElementById(`order-${orderId}`);
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
