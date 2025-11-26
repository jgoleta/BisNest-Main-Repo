document.addEventListener("DOMContentLoaded", () => {
    fetch("{% url 'orders_json' %}")
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById("orders-body");
            tbody.innerHTML = ""; // clear loading row

            orders.forEach(o => {
                tbody.innerHTML += `
                <tr>
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
                                <!-- edit icon SVG here -->
                            </button>

                            <form method="POST" action="/delete-order/${o.id}/">
                                {% csrf_token %}
                                <button type="submit" class="delete-button">
                                    <!-- delete icon SVG -->
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>`;
            });
        });
});
