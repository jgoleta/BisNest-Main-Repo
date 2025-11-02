// Toggle Payment Form Modal
function togglePaymentForm() {
  const formContainer = document.querySelector(".payment-form-container");
  const overlay = document.getElementById("paymentModalOverlay");

  // If form is visible, close it
  if (formContainer.classList.contains("active")) {
    formContainer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto"; // Allow scrolling again
  } else {
    // Open form modal
    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
  }
}

const params = new URLSearchParams(window.location.search); 
if (params.get("open_form") === "true") { 
  const formContainer = document.querySelector(".payment-form-container"); 
  const overlay = document.getElementById("paymentModalOverlay"); 
  if (formContainer && overlay) { 
    formContainer.classList.add("active"); 
    overlay.classList.add("active"); 
    document.body.style.overflow = "hidden"; 
  } 
}

// Close modal when overlay is clicked
document.getElementById("paymentModalOverlay").addEventListener("click", () => {
  togglePaymentForm();
});

// Live search for Payment Table
function searchPayment() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const rows = document.querySelectorAll(".table-payment tbody tr");

  rows.forEach((row) => {
    const orderCell = row.cells[1]; // Order ID column
    if (orderCell) {
      const textValue = orderCell.textContent || orderCell.innerText;
      row.style.display = textValue.toLowerCase().includes(filter)
        ? ""
        : "none";
    }
  });
}

// Handle Edit Button Click
document.querySelectorAll(".edit-button").forEach((button) => {
  button.addEventListener("click", () => {
    const paymentId = button.getAttribute("data-payment_id");
    const order = button.getAttribute("data-order");
    const amount = button.getAttribute("data-amount");
    const date = button.getAttribute("data-date");
    const method = button.getAttribute("data-method");

    // Fill form fields with existing data
    document.querySelector('[name="payment_id"]').value = paymentId;
    document.querySelector('[name="order"]').value = order;
    document.querySelector('[name="amount"]').value = amount;
    document.querySelector('[name="date"]').value = date;
    document.querySelector('[name="method"]').value = method;

    // Open modal for editing
    const formContainer = document.querySelector(".payment-form-container");
    const overlay = document.getElementById("paymentModalOverlay");
    formContainer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});

//sort by id
let paymentSortAscending = null;

function initPaymentSort() {
  const sortBtn = document.getElementById("paymentIdSortBtn");
  const table = document.getElementById("payment-table");
  if (!sortBtn || !table) return;

  sortBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    e.preventDefault();
    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    paymentSortAscending = paymentSortAscending === null || paymentSortAscending === false ? true : false;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    
    rows.sort((a, b) => {
      const aId = a.cells[0].textContent.trim();
      const bId = b.cells[0].textContent.trim();
      
      const aNum = parseInt(aId.replace(/^[A-Za-z]/, "")) || 0;
      const bNum = parseInt(bId.replace(/^[A-Za-z]/, "")) || 0;
      
      return paymentSortAscending ? aNum - bNum : bNum - aNum;
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));

    //update icon
    const icon = sortBtn.querySelector("i");
    if (icon) {
      icon.className = paymentSortAscending ? "fas fa-sort-up" : "fas fa-sort-down";
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPaymentSort);
} else {
  initPaymentSort();
}