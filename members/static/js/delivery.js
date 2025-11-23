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
      const deliveryTableBody = document.getElementById('deliveryTableBody');

      function toggleForm() {
        const isHidden = formContainer.style.display === 'none' || formContainer.style.display === '';
        formContainer.style.display = isHidden ? 'block' : 'none';
        modalOverlay.style.display = isHidden ? 'block' : 'none';
      }
      addBtn.addEventListener('click', toggleForm);
      modalOverlay.addEventListener('click', toggleForm);
      cancelBtn.addEventListener('click', toggleForm);

      // sort by scheduled date
    let deliveryDateAscending = null;
    const deliveryDateSortBtn = document.getElementById('deliveryDateSortBtn');
    if (deliveryDateSortBtn && deliveryTableBody) {
      deliveryDateSortBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // toggle: start ascending on first click
        deliveryDateAscending =
          deliveryDateAscending === null || deliveryDateAscending === false
            ? true
            : false;

        const deliveryTable = document.getElementById('deliveryTable');
        let dateColIndex = 4; // fallback (Delivery ID=0, Order ID=1, Customer=2, Address=3, Scheduled Date=4)
        if (deliveryTable) {
          const ths = Array.from(deliveryTable.querySelectorAll('thead th'));
          const idx = ths.findIndex((th) =>
            (th.textContent || '').trim().toLowerCase().includes('date')
          );
          if (idx !== -1) dateColIndex = idx;
        }

        const rows = Array.from(deliveryTableBody.querySelectorAll('tr'));
        rows.sort((a, b) => {
          const aText = (a.cells[dateColIndex]?.textContent || '').trim();
          const bText = (b.cells[dateColIndex]?.textContent || '').trim();

          const aDate = Date.parse(aText);
          const bDate = Date.parse(bText);

          if (!isNaN(aDate) && !isNaN(bDate)) {
            return deliveryDateAscending ? aDate - bDate : bDate - aDate;
          }

          const aLower = aText.toLowerCase();
          const bLower = bText.toLowerCase();
          return deliveryDateAscending
            ? aLower.localeCompare(bLower)
            : bLower.localeCompare(aLower);
        });

        deliveryTableBody.innerHTML = '';
        rows.forEach((r) => deliveryTableBody.appendChild(r));

        const icon = deliveryDateSortBtn.querySelector('i');
        if (icon)
          icon.className = deliveryDateAscending ? 'fas fa-sort-up' : 'fas fa-sort-down';
      });
    }
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

/* ==============================
   Client-side Pagination for Delivery Table
   =============================== */
(function() {
  const table = document.getElementById('delivery-table');
  const paginationContainer = document.getElementById('delivery-pagination');
  if (!table || !paginationContainer) return;

  let currentPage = 1;
  const rowsPerPage = 10;

  function getAllRows() {
    return Array.from(table.querySelectorAll('tbody tr'));
  }

  function showPage(page) {
    const allRows = getAllRows();
    allRows.forEach(r => r.style.display = 'none');
    
    const total = allRows.length;
    const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    allRows.slice(start, end).forEach(r => r.style.display = '');

    renderPaginationControls(totalPages);
  }

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

  document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
  });

  setTimeout(() => {
    if (!document.readyState || document.readyState !== 'loading') showPage(1);
  }, 50);

})();
