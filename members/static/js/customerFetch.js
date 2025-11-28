document.addEventListener("DOMContentLoaded", () => {
    fetch("/customer/customers_json/")
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById("customers-body");
            tbody.innerHTML = ""; // clear loading row
            
            if (orders.length === 0) {
                tbody.innerHTML += `
                    <tr>
                        <td colspan="6" style="text-align:center; padding:20px;">
                            No data available
                        </td>
                    </tr>
                `;
                return;
            }

            orders.forEach(c => {
                tbody.innerHTML += `
                <tr id="customer-${c.id}"
                    class="customer-row"
                    data-record-id="${c.id}"
                    data-customer-id="${c.customer_id}"
                    data-name="${c.name}"
                    data-phone="${c.phone}"
                    data-address="${c.address}"
                    data-date="${c.date_added}">
                    <td>${c.customer_id}</td>
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.address}</td>
                    <td>${c.date_added}</td>
                </tr>`;
            });
        });
});

document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-profile-button")) {
        const btn = e.target.closest(".delete-profile-button");
        const customerId = btn.dataset.id;

        if (!confirm("Delete this customer?")) return;

        const response = await fetch(`/delete-customer/${customerId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            }
        });

        if (response.ok) {
            const row = document.getElementById(`customer-${customerId}`);
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
