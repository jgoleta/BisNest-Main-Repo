function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          cookie = cookie.trim();
          if (cookie.startsWith(name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    const csrfToken = getCookie('csrftoken');

    function updateStatus(selectElement, deliveryId) {
      const newStatus = selectElement.value;
      selectElement.className = `status-select status-${newStatus.toLowerCase()}`;

      fetch(`/update_delivery_status/${deliveryId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ status: newStatus })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            showNotification('Status updated successfully!');
          } else {
            showNotification('Failed to update status', true);
            selectElement.value = data.previous_status;
            selectElement.className = `status-select status-${data.previous_status.toLowerCase()}`;
          }
        })
        .catch(error => {
          showNotification('Error updating status', true);
          console.error('Error:', error);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
      const addBtn = document.getElementById('addNewDeliveryBtn');
      const formContainer = document.getElementById('deliveryForm');
      const modalOverlay = document.getElementById('modalOverlay');
      const cancelBtn = document.getElementById('cancelBtn');

      function toggleForm() {
        const isHidden = formContainer.style.display === 'none' || formContainer.style.display === '';
        formContainer.style.display = isHidden ? 'block' : 'none';
        modalOverlay.style.display = isHidden ? 'block' : 'none';
      }
      addBtn.addEventListener('click', toggleForm);
      modalOverlay.addEventListener('click', toggleForm);
      cancelBtn.addEventListener('click', toggleForm);
    });


document.addEventListener('DOMContentLoaded', function () {
  const sortBtn = document.getElementById("deliveryNameSortBtn");
  const deliveryTable = document.querySelector("#deliveryTable");
  const deliveryTableBody = document.querySelector("#deliveryTableBody");
  if (!sortBtn || !deliveryTable || !deliveryTableBody) return;

  let deliverySortAscending = true;

  let customerColIndex = 2;
  const ths = Array.from(deliveryTable.querySelectorAll("thead th"));
  const idx = ths.findIndex(th => (th.textContent || "").trim().toLowerCase().includes("customer"));
  if (idx !== -1) customerColIndex = idx;

  sortBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const rows = Array.from(deliveryTableBody.querySelectorAll("tr"));
    deliverySortAscending = !deliverySortAscending; //toggle order

    rows.sort((a, b) => {
      const aText = (a.cells[customerColIndex]?.textContent || "").trim().toLowerCase();
      const bText = (b.cells[customerColIndex]?.textContent || "").trim().toLowerCase();
      return deliverySortAscending
        ? aText.localeCompare(bText, undefined, { sensitivity: "base", numeric: false })
        : bText.localeCompare(aText, undefined, { sensitivity: "base", numeric: false });
    });

    deliveryTableBody.innerHTML = "";
    rows.forEach(r => deliveryTableBody.appendChild(r));

    const icon = sortBtn.querySelector("i");
    if (icon) icon.className = deliverySortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
  });
});

//search by customer name
function searchCustomer() {
  const input = document.getElementById("searchInput");
  const filter = (input.value || "").toLowerCase();
  const tableBody =
    document.querySelector("#deliveryTableBody") ||
    document.querySelector(".table tbody") ||
    document.querySelector("table tbody");
  if (!tableBody) return;
  const rows = tableBody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const tds = rows[i].getElementsByTagName("td");
    const nameCell = tds[2] || tds[1];
    if (nameCell) {
      const nameText = nameCell.textContent || nameCell.innerText;
      rows[i].style.display = nameText.toLowerCase().includes(filter) ? "" : "none";
    }
  }
}

//sort by join date
(function() {
  const sortBtn = document.getElementById("employeeJoinDateSortBtn"); // add this id to your HTML button
  const table = document.querySelector(".table");
  if (!sortBtn || !table) return;

  let isAscending = null;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    isAscending = isAscending === null || isAscending === false ? true : false;

    const ths = Array.from(table.querySelectorAll("thead th"));
    let dateColIndex = ths.findIndex(th => {
      const txt = (th.textContent || "").trim().toLowerCase();
      return txt.includes("join") || txt.includes("joined") || txt.includes("join date") || txt.includes("date joined");
    });
    if (dateColIndex === -1) {
      dateColIndex = ths.findIndex(th => (th.textContent || "").trim().toLowerCase().includes("date"));
    }
    if (dateColIndex === -1) dateColIndex = 2;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
      const aText = (a.cells[dateColIndex]?.textContent || "").trim();
      const bText = (b.cells[dateColIndex]?.textContent || "").trim();

      const aDate = Date.parse(aText);
      const bDate = Date.parse(bText);

      if (!isNaN(aDate) && !isNaN(bDate)) {
        return isAscending ? aDate - bDate : bDate - aDate;
      }

      const aLower = aText.toLowerCase();
      const bLower = bText.toLowerCase();
      return isAscending ? aLower.localeCompare(bLower) : bLower.localeCompare(aLower);
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = isAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
})();
