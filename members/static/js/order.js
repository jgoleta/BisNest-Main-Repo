document.addEventListener("DOMContentLoaded", () => {
      const formContainer = document.querySelector('.order-form-container');
      const searchOrderId = document.getElementById('search-order-id');
      const searchProduct = document.getElementById('search-product');
      const searchDate = document.getElementById('search-date');
      const orderTableBody = document.querySelector('#order-table tbody');
      const modalOverlay = document.getElementById('modalOverlay');

      function toggleForm() {
        const isHidden = formContainer.style.display === 'none' || formContainer.style.display === '';
        formContainer.style.display = isHidden ? 'block' : 'none';
        modalOverlay.style.display = isHidden ? 'block' : 'none';
      }

      window.toggleForm = toggleForm;

      function filterTable() {
        const idQuery = searchOrderId.value.trim().toUpperCase();
        const productQuery = searchProduct.value.trim().toLowerCase();
        const dateQuery = searchDate.value;
        const rows = orderTableBody.querySelectorAll('tr');

        rows.forEach(row => {
          const orderId = row.cells[0].textContent.toUpperCase();
          const productName = row.cells[4].textContent.toLowerCase();
          const date = row.cells[6].textContent;
          const matchId = !idQuery || orderId.includes(idQuery);
          const matchProduct = !productQuery || productName.includes(productQuery);
          const matchDate = !dateQuery || date === dateQuery;
          row.style.display = matchId && matchProduct && matchDate ? '' : 'none';
        });
      }

      window.filterTable = filterTable;

      function resetFilters() {
        searchOrderId.value = '';
        searchProduct.value = '';
        searchDate.value = '';
        const rows = orderTableBody.querySelectorAll('tr');
        rows.forEach(row => row.style.display = '');
      }

      window.resetFilters = resetFilters;

      document.querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', () => {
          document.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
          row.classList.add('selected');
        });
      });

      document.querySelectorAll('th').forEach(th => {
        th.addEventListener('click', () => {
          const index = Array.from(th.parentElement.children).indexOf(th);
          const rows = Array.from(orderTableBody.querySelectorAll('tr'));
          const isAsc = th.classList.contains('asc');
          document.querySelectorAll('th').forEach(header => header.classList.remove('asc', 'desc'));
          th.classList.add(isAsc ? 'desc' : 'asc');
          rows.sort((a, b) => {
            const aValue = a.cells[index].textContent;
            const bValue = b.cells[index].textContent;
            return isAsc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
          });
          rows.forEach(row => orderTableBody.appendChild(row));
        });
      });

      modalOverlay.addEventListener('click', () => {
        formContainer.style.display = 'none';
        modalOverlay.style.display = 'none';
      });

      //sort by id
      let orderSortAscending = null;
      const sortBtn = document.getElementById("orderIdSortBtn");
      if (sortBtn) {
        sortBtn.addEventListener("click", function(e) {
          e.stopPropagation();
          e.preventDefault();
          const tbody = orderTableBody;
          if (!tbody) return;

          orderSortAscending = orderSortAscending === null || orderSortAscending === false ? true : false;
          const rows = Array.from(tbody.querySelectorAll("tr"));
          
          rows.sort((a, b) => {
            const aId = a.cells[0].textContent.trim();
            const bId = b.cells[0].textContent.trim();
            
            const aNum = parseInt(aId.replace(/^[A-Za-z]/, "")) || 0;
            const bNum = parseInt(bId.replace(/^[A-Za-z]/, "")) || 0;
            
            return orderSortAscending ? aNum - bNum : bNum - aNum;
          });

          tbody.innerHTML = "";
          rows.forEach(row => tbody.appendChild(row));

          //update icon
          const icon = sortBtn.querySelector("i");
          if (icon) {
            icon.className = orderSortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
          }
        });
      }
    });

    function searchCustomer() {
      const input = document.getElementById("searchInput");
      const filter = (input.value || "").toLowerCase();
      const table = document.querySelector(".table tbody");
      if (!table) return;
      const rows = table.getElementsByTagName("tr");

      for (let i = 0; i < rows.length; i++) {
        const nameCell = rows[i].getElementsByTagName("td")[1];
        if (nameCell) {
          const nameText = nameCell.textContent || nameCell.innerText;
          if (nameText.toLowerCase().indexOf(filter) > -1) {
            rows[i].style.display = "";
          } else {
            rows[i].style.display = "none";
          }
        }
      }
    }