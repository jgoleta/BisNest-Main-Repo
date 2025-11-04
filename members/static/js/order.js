document.addEventListener("DOMContentLoaded", () => {
  const formContainer = document.querySelector(".order-form-container");
  const modalOverlay = document.getElementById("modalOverlay");
  const orderForm = document.querySelector(".order-form");
  const cancelBtn = document.querySelector(".cancel-button");
  const newBtn = document.querySelector(".toggle-form-button");
  const sortBtn = document.getElementById("orderIdSortBtn");
  const orderTableBody = document.querySelector("#order-table tbody");

  //reset form
  function resetOrderForm() {
    if (!orderForm) return;
    orderForm.reset();

    const editIdInput = document.querySelector('input[name="edit_id"]');
    if (editIdInput) editIdInput.remove();

    const title = document.getElementById("formTitle");
    if (title) title.textContent = "Order Information";
  }

  //open modal
  function openModal() {
    formContainer.style.display = "block";
    modalOverlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  //close modal
  function closeModal() {
    formContainer.style.display = "none";
    modalOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (newBtn) {
  newBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetOrderForm(); // clear previous state

    const orderIdInput = document.querySelector('[name="order_id"]');
    if (orderIdInput) {
      const rows = document.querySelectorAll("#order-table tbody tr");

      if (rows.length > 0) {
        // Find the *highest* existing numeric part among all IDs
        let maxNum = 0;
        rows.forEach((row) => {
          const idText = row.cells[0].textContent.trim();
          const num = parseInt(idText.replace(/\D/g, "")) || 0;
          if (num > maxNum) maxNum = num;
        });
        const nextNum = maxNum + 1;
        orderIdInput.value = `O${nextNum.toString().padStart(4, "0")}`;
      } else {
        orderIdInput.value = "O0001";
      }
    }

    openModal();
  });
}


  //cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
      resetOrderForm();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", () => {
      closeModal();
      resetOrderForm();
    });
  }

  //edit button 
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".edit-button");
    if (!btn) return;

    e.preventDefault();

    const id = btn.getAttribute("data-id"); // actual DB id
    const order_id = btn.getAttribute("data-order_id"); // visible order id
    const customer = btn.getAttribute("data-customer");
    const employee = btn.getAttribute("data-employee");
    const product = btn.getAttribute("data-product");
    const quantity = btn.getAttribute("data-quantity");
    const amount = btn.getAttribute("data-amount");

    //form
    const orderIdInput = document.querySelector('[name="order_id"]');
    const customerInput = document.querySelector('[name="customer"]');
    const employeeInput = document.querySelector('[name="employee"]');
    const productInput = document.querySelector('[name="product"]');
    const quantityInput = document.querySelector('[name="quantity"]');
    const amountInput = document.querySelector('[name="amount"]');

    if (orderIdInput) orderIdInput.value = order_id || "";
    if (customerInput) customerInput.value = customer || "";
    if (employeeInput) employeeInput.value = employee || "";
    if (productInput) productInput.value = product || "";
    if (quantityInput) quantityInput.value = quantity || "";
    if (amountInput) amountInput.value = amount || "";

    let editIdInput = document.querySelector('input[name="edit_id"]');
    if (!editIdInput) {
      editIdInput = document.createElement("input");
      editIdInput.type = "hidden";
      editIdInput.name = "edit_id";
      orderForm.appendChild(editIdInput);
    }
    editIdInput.value = id || "";

    const formTitle = document.getElementById("formTitle");
    if (formTitle) formTitle.textContent = "Edit Order";

    openModal();
  });

  //sort
  let orderSortAscending = true;
  if (sortBtn) {
    sortBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const rows = Array.from(orderTableBody.querySelectorAll("tr"));
      orderSortAscending = !orderSortAscending;

      rows.sort((a, b) => {
        const aId = parseInt(a.cells[0].textContent.replace(/\D/g, "")) || 0;
        const bId = parseInt(b.cells[0].textContent.replace(/\D/g, "")) || 0;
        return orderSortAscending ? aId - bId : bId - aId;
      });

      orderTableBody.innerHTML = "";
      rows.forEach((r) => orderTableBody.appendChild(r));

      const icon = sortBtn.querySelector("i");
      if (icon)
        icon.className = orderSortAscending
          ? "fas fa-sort-up"
          : "fas fa-sort-down";
    });
  }

  //form submut
  if (orderForm) {
    orderForm.addEventListener("submit", () => {
      // prevent multiple clicks
      const btns = orderForm.querySelectorAll("button[type='submit']");
      btns.forEach((b) => (b.disabled = true));
      setTimeout(() => btns.forEach((b) => (b.disabled = false)), 2000);
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
