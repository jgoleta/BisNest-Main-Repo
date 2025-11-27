document.addEventListener("DOMContentLoaded", () => {
    fetch("employees_json/")
        .then(response => response.json())
        .then(orders => {
            const tbody = document.getElementById("employees-body");
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

            orders.forEach(e => {
                tbody.innerHTML += `
                <tr id="employee-${e.id}">
                    <td>${ e.id }</td>
                    <td>${ e.name }</td>
                    <td>${ e.position }</td>
                    <td>${ e.schedule }</td>
                    <td>${ e.salary }</td>
                    <td>${ e.join_date }</td>
                    <td>
                        <button type="button" class="edit-button" data-id="${ e.id }" data-name="${ e.name }"
                        data-position="${ e.position }" data-schedule="${ e.schedule }" data-salary="${ e.salary }"
                        title="Edit employee" aria-label="Edit employee" style="margin-right:8px;">

                        <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"
                            fill="#FFFFFF">
                            <path
                            d="M120-120v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm584-528 56-56-56-56-56 56 56 56Z" />
                        </svg>
                        </button>

                        <button type="submit" class="delete-button" data-id="${e.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px"
                            fill="#FFFFFF">
                            <path
                                d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm72-144h72v-336h-72v336Zm120 0h72v-336h-72v336Z" />
                            </svg>
                        </button>
                    </td>
                </tr>`;
            });
        });
});

document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-button")) {
        const btn = e.target.closest(".delete-button");
        const employeeId = btn.dataset.id;

        if (!confirm("Delete this employee?")) return;

        const response = await fetch(`/delete-employee/${employeeId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": csrfToken,
            }
        });

        if (response.ok) {
            // Remove row from table
            const row = document.getElementById(`employee-${employeeId}`);
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
