document.addEventListener("DOMContentLoaded", () => {
    fetch("/employees_json/")
        .then(response => response.json())
        .then(employees => {
            const tbody = document.getElementById("employees-body");
            tbody.innerHTML = ""; // clear loading row

            if (employees.length === 0) {
                tbody.innerHTML += `
                    <tr>
                        <td colspan="6" style="text-align:center; padding:20px;">
                            No data available
                        </td>
                    </tr>
                `;
                return;
            }

            employees.forEach(e => {
                tbody.innerHTML += `
                <tr id="employee-${e.id}"
                    class="employee-row"
                    data-id="${ e.id }"
                    data-employee-id="${ e.employee_id || "" }"
                    data-name="${ e.name }"
                    data-position="${ e.position }"
                    data-schedule="${ e.schedule }"
                    data-salary="${ e.salary }"
                    data-join-date="${ e.join_date }">
                    <td>${ e.employee_id || "N/A" }</td>   
                    <td>${ e.name }</td>
                    <td>${ e.position }</td>
                    <td>${ e.schedule }</td>
                    <td>${ e.salary }</td>
                    <td>${ e.join_date }</td>
                </tr>`;
            });
        
            if (window.showEmployeePage) {
                window.showEmployeePage(1);
            }
          });
});

document.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-profile-button");

    if (!deleteBtn) return;   // CLICK NOT ON DELETE BUTTON — EXIT

    const employeeId = deleteBtn.dataset.id;

    if (!employeeId) {
        console.error("No data-id found on delete button.");
        return;
    }

    if (!confirm("Delete this employee?")) return;

    const csrfToken = getCookie("csrftoken");

    const response = await fetch(`/delete-employee/${employeeId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": csrfToken
        }
    });

    if (response.ok) {
        const row = document.getElementById(`employee-${employeeId}`);
        if (row) row.remove();
        closeProfilePopup();
    } else {
        alert("Failed to delete.");
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