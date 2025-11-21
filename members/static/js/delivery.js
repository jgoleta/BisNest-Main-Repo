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

// search deliveries by delivery ID, order ID, or customer name
function searchCustomer() {
  const input = document.getElementById("searchInput");
  const filter = (input.value || "").toLowerCase().trim();
  const tableBody =
    document.querySelector("#deliveryTableBody") ||
    document.querySelector(".table tbody") ||
    document.querySelector("table tbody");

  if (!tableBody) return;

  const rows = tableBody.getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
    const tds = rows[i].getElementsByTagName("td");
    if (!tds.length) {
      rows[i].style.display = filter ? "none" : "";
      continue;
    }

    const deliveryIdText = tds[0] ? (tds[0].textContent || "").toLowerCase() : "";
    const orderIdText = tds[1] ? (tds[1].textContent || "").toLowerCase() : "";
    const customerNameText = tds[2]
      ? (tds[2].textContent || "").toLowerCase()
      : tds[1]
      ? (tds[1].textContent || "").toLowerCase()
      : "";

    if (!filter) {
      rows[i].style.display = "";
      continue;
    }

    const matches =
      deliveryIdText.includes(filter) ||
      orderIdText.includes(filter) ||
      customerNameText.includes(filter);

    rows[i].style.display = matches ? "" : "none";
  }
}