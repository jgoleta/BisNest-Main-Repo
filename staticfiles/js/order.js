// ================= Loading Overlay =================
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
    if (overlay) overlay.style.display = "none";
}

// ================= CSRF Token =================
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

// ================= DOMContentLoaded =================
document.addEventListener("DOMContentLoaded", () => {
    const formContainer = document.querySelector(".order-form-container");
    const modalOverlay = document.getElementById("modalOverlay");
    const orderForm = document.querySelector(".order-form");
    const closeBtn = document.getElementById("closeBtn");
    const newBtn = document.querySelector(".toggle-form-button");
    const orderTableBody = document.querySelector("#order-table tbody");
    const sortBtn = document.getElementById("orderIdSortBtn");
    const orderDateSortBtn = document.getElementById("orderDateSortBtn");

    let orderSortAscending = true;
    let orderDateAscending = null;

    // ================= Load Orders =================
    async function loadOrders() {
        const orders = await fetch("orders_json/").then(res => res.json());
        orderTableBody.innerHTML = "";
        orders.forEach(o => {
            orderTableBody.innerHTML += `
                <tr id="order-${o.id}">
                    <td>${o.order_id}</td>
                    <td>${o.customer.name}</td>
                    <td>${o.employee.name}</td>
                    <td>
                        ${o.items.map(i => `${i.product_name} (x${i.quantity})`).join("<br>")}
                    </td>
                    <td>₱${o.total_amount}</td>
                    <td>${o.date}</td>
                    <td>
                        <div class="action-buttons">
                            <button type="button" class="delete-button" data-id="${o.id}">
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
        showPage(1); // update pagination
    }

    // ================= Open / Close Modal =================
    function openModal() { formContainer.style.display = "block"; modalOverlay.style.display = "block"; }
    function closeModal() { formContainer.style.display = "none"; modalOverlay.style.display = "none"; resetOrderForm(); }

    function resetOrderForm() {
        if (!orderForm) return;
        orderForm.reset();
        const editIdInput = orderForm.querySelector('input[name="edit_id"]');
        if (editIdInput) editIdInput.remove();
        const cartDataInput = orderForm.querySelector('input[name="cart_data"]');
        if (cartDataInput) cartDataInput.remove();
        const title = document.getElementById("formTitle");
        if (title) title.textContent = "Order Information";
    }

    // ================= New Order Button =================
    if (newBtn) {
        newBtn.addEventListener("click", (e) => {
            e.preventDefault();
            resetOrderForm();
            openModal();
        });
    }

    // ================= Close Modal Button =================
    if (closeBtn) closeBtn.addEventListener("click", e => { e.preventDefault(); closeModal(); });

    // ================= Delete Button =================
    document.addEventListener("click", async (e) => {
        const btn = e.target.closest(".delete-button");
        if (!btn) return;
        const orderId = btn.dataset.id;
        if (!confirm("Delete this order?")) return;

        const response = await fetch(`delete-order/${orderId}/`, {
            method: "POST",
            headers: { "X-CSRFToken": csrfToken },
        });

        if (response.ok) {
            const row = document.getElementById(`order-${orderId}`);
            if (row) row.remove();
            loadOrders();
        } else {
            alert("Failed to delete order.");
        }
    });

    // ================= AJAX Form Submission =================
    if (orderForm) {
        orderForm.addEventListener("submit", async function(e) {
            e.preventDefault();
            showLoading();

            const cartDataInput = orderForm.querySelector('input[name="cart_data"]');
            let payload = {};
            if (cartDataInput && cartDataInput.value) {
                payload = { cart_items: JSON.parse(cartDataInput.value) };
            }

            const response = await fetch("/order/create_order/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": csrfToken,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            hideLoading();

            if (response.ok) {
                const data = await response.json();
                alert(`Order ${data.order_id} created. Total: ₱${data.total_amount}`);
                localStorage.removeItem("pendingOrderCart");
                resetOrderForm();
                closeModal();
                loadOrders();
            } else {
                alert("Failed to create order.");
            }
        });
    }

    // ================= Search / Filter =================
    window.searchCustomer = function() {
        const input = document.getElementById("searchInput");
        const productFilter = document.getElementById("productFilter");
        const customerFilter = (input.value || "").toLowerCase();
        const productValue = (productFilter && productFilter.value) || "";

        const rows = Array.from(document.querySelectorAll("#order-table tbody tr"));
        rows.forEach(row => {
            const customerText = (row.cells[1]?.textContent || "").toLowerCase();
            const productText = row.cells[3]?.innerHTML || "";

            const matchesCustomer = !customerFilter || customerText.includes(customerFilter);
            const matchesProduct = !productValue || productText.split("<br>").some(p => p.includes(productValue));

            row.style.display = (matchesCustomer && matchesProduct) ? "" : "none";
        });
        showPage(1);
    };

    // ================= Pagination =================
    const paginationContainer = document.getElementById("order-pagination");
    const rowsPerPage = 10;
    let currentPage = 1;

    function getFilteredRows() {
        const rows = Array.from(orderTableBody.querySelectorAll("tr"));
        return rows.filter(r => r.style.display !== "none");
    }

    function showPage(page) {
        const rows = getFilteredRows();
        const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;
        currentPage = page;

        rows.forEach((r, i) => r.style.display = (i >= (currentPage-1)*rowsPerPage && i < currentPage*rowsPerPage) ? "" : "none");

        // render controls
        if (!paginationContainer) return;
        paginationContainer.innerHTML = "";
        const pager = document.createElement("div");
        pager.className = "pagination";

        const prev = document.createElement("button");
        prev.textContent = "Prev";
        prev.disabled = currentPage === 1;
        prev.addEventListener("click", () => showPage(currentPage-1));
        pager.appendChild(prev);

        for (let p = 1; p <= totalPages; p++) {
            const btn = document.createElement("button");
            btn.textContent = p;
            if (p === currentPage) btn.setAttribute("aria-current", "page");
            btn.addEventListener("click", () => showPage(p));
            pager.appendChild(btn);
        }

        const next = document.createElement("button");
        next.textContent = "Next";
        next.disabled = currentPage === totalPages;
        next.addEventListener("click", () => showPage(currentPage+1));
        pager.appendChild(next);

        paginationContainer.appendChild(pager);
    }

    // ================= Initial Load =================
    loadOrders();
});