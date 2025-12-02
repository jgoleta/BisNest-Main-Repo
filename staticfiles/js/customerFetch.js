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

            if (window.showEmployeePage) {
                window.showEmployeePage(1);
            }
          });
});