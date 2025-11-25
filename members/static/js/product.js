const addProductBtn = document.getElementById("add-product-btn");
const addProductModal = document.getElementById("add-product-modal");
const closeAddModal = document.querySelector(".close-add-modal");
const addProductForm = document.getElementById("add-product-form");

addProductBtn.addEventListener("click", () => {
  addProductModal.style.display = "block";
});
closeAddModal.addEventListener("click", () => {
  addProductModal.style.display = "none";
  addProductForm.reset();
});
window.addEventListener("click", (event) => {
  if (event.target === addProductModal) {
    addProductModal.style.display = "none";
    addProductForm.reset();
  }
});
// Attach click handlers to server-rendered product buttons
document.querySelectorAll(".product-button-style").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    document
      .querySelectorAll(".product-button-style.selected")
      .forEach((el) => el.classList.remove("selected"));
    btn.classList.add("selected");
    if (!e.target.classList.contains("delete-product-btn")) {
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: btn.dataset.price,
        image: btn.dataset.image,
        stock: btn.dataset.stock,
      };
      openEditModal(product, btn);
    }
  });
});

const modal = document.getElementById("product-modal");
const productNameEl = document.getElementById("modal-product-name");
const productIdEl = document.getElementById("modal-product-id");
const productPriceEl = document.getElementById("modal-product-price");
const closeEditModalBtn = document.getElementById("close-edit-modal");
let currentButton = null;
function openEditModal(product, btn) {
  productNameEl.textContent = product.name;
  modalNameInput.value = product.name;
  productIdEl.textContent = product.id;
  modalStockInput.value = btn.dataset.stock || "0";
  productPriceEl.value = product.price;
  modal.style.display = "block";
  currentButton = btn;
}
closeEditModalBtn.addEventListener("click", () => {
  modal.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});
productPriceEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveBtn.click();
  }
});
const saveBtn = document.getElementById("save-price-btn");
const modalNameInput = document.getElementById("modal-product-name-input");
const modalStockInput = document.getElementById("modal-product-stock");

// Read CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie("csrftoken");

// Save/update via AJAX to server endpoint
saveBtn.addEventListener("click", () => {
  const newName = modalNameInput.value.trim();
  const newStock = modalStockInput.value.trim();
  const newPrice = productPriceEl.value.trim();

  if (!newName) {
    alert("Product name is required.");
    return;
  }
  if (!newStock || isNaN(newStock) || parseInt(newStock) < 0) {
    alert("Please enter a valid stock number (0 or greater).");
    return;
  }
  if (!newPrice || isNaN(newPrice) || parseFloat(newPrice) < 0) {
    alert("Please enter a valid price (0 or greater).");
    return;
  }

  const payload = {
    product_id: productIdEl.textContent,
    name: newName,
    stock: parseInt(newStock),
    price: parseFloat(newPrice).toFixed(2),
  };

  fetch("/product/update/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // update DOM: price label and name inside the selected button
        if (currentButton) {
          const priceLabel = currentButton.querySelector(
            ".product-price-label"
          );
          const nameLabel = currentButton.querySelector(".product-price-name");
          if (priceLabel)
            priceLabel.textContent = "₱" + parseFloat(data.price).toFixed(2);
          if (nameLabel) nameLabel.textContent = data.name;
          // Update button's data attributes
          currentButton.dataset.price = data.price;
          currentButton.dataset.name = data.name;
          currentButton.dataset.stock = data.stock;
        }
        showNotification("Product updated successfully!");
      } else {
        showNotification("Update failed: " + (data.error || "Unknown"), true);
      }
      modal.style.display = "none";
    })
    .catch((err) => {
      showNotification("Update failed: " + err.message, true);
      modal.style.display = "none";
    });
});

const deleteModalBtn = document.getElementById("delete-modal-btn");
deleteModalBtn.addEventListener("click", () => {
  const productName = modalNameInput.value;
  if (
    !confirm(
      `Are you sure you want to delete "${productName}"? This cannot be undone.`
    )
  ) {
    return;
  }

  const payload = { product_id: productIdEl.textContent };
  fetch("/product/delete/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrftoken,
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // remove from DOM - handle both button and its row wrapper if empty
        if (currentButton) {
          const row = currentButton.parentElement;
          currentButton.remove();
          // If this was the last product in the row, remove the row too
          if (row && row.children.length === 0) {
            row.remove();
          }
          // If no more products, show the "No products" message
          const productList = document.getElementById("product-list");
          if (
            productList &&
            productList.querySelectorAll(".product-button-style").length === 0
          ) {
            productList.innerHTML = "<p>No products available.</p>";
          }
        }
        showNotification("Product deleted successfully!");
      } else {
        showNotification("Delete failed: " + (data.error || "Unknown"), true);
      }
      modal.style.display = "none";
    })
    .catch((err) => {
      showNotification("Delete failed: " + err.message, true);
      modal.style.display = "none";
    });
});

// Notification helper is provided globally by `notify.js` (window.showNotification)
