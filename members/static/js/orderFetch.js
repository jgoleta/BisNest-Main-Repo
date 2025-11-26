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
