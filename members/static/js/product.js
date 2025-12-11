const addProductBtn = document.getElementById("add-product-btn");
const addProductModal = document.getElementById("add-product-modal");
const closeAddModal = document.querySelector(".close-add-modal");
const addProductForm = document.getElementById("add-product-form");
const modalOverlay = document.querySelector(".modal-overlay");

// Loading overlay
function createLoadingOverlay() {
  let overlay = document.getElementById("loadingOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Processing...</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showLoading() {
  const overlay = createLoadingOverlay();
  overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

if (addProductBtn) {
  addProductBtn.addEventListener("click", () => {
    window.openModal(addProductModal, modalOverlay);
  });
}
if (closeAddModal) {
  closeAddModal.addEventListener("click", () => {
    window.closeModal(addProductModal, modalOverlay);
    if (addProductForm) addProductForm.reset();
  });
}
// Cart functionality
let cart = JSON.parse(localStorage.getItem('productCart')) || [];
let customers = [];
let employees = [];

// Initialize cart count
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

// Load customers and employees for dropdowns
function loadCustomersAndEmployees() {
  // Load customers
  fetch('/customer/customers_json/')
    .then(response => response.json())
    .then(data => {
      customers = data;
      const customerSelect = document.getElementById('cart-customer');
      if (customerSelect) {
        customerSelect.innerHTML = '<option value="">Select Customer</option>';
        data.forEach(customer => {
          const option = document.createElement('option');
          option.value = customer.id;
          option.textContent = `${customer.customer_id} - ${customer.name}`;
          customerSelect.appendChild(option);
        });
      }
    })
    .catch(err => console.error('Error loading customers:', err));

  // Load employees
  fetch('/employee/employees_json/')
    .then(response => response.json())
    .then(data => {
      employees = data;
      const employeeSelect = document.getElementById('cart-employee');
      if (employeeSelect) {
        employeeSelect.innerHTML = '<option value="">Select Employee</option>';
        data.forEach(employee => {
          const option = document.createElement('option');
          option.value = employee.id;
          option.textContent = `${employee.employee_id || ''} - ${employee.name}`;
          employeeSelect.appendChild(option);
});
      }
    })
    .catch(err => console.error('Error loading employees:', err));
}

// Open add to cart modal
function openAddToCartModal(product, btn) {
  const addToCartModal = document.getElementById('add-to-cart-modal');
  const productInput = document.getElementById('cart-product');
  const productIdInput = document.getElementById('cart-product-id');
  
  // Use database ID for ForeignKey
  const dbId = btn.dataset.dbId || product.id;
  
  if (productInput && productIdInput) {
    productInput.value = product.name;
    productIdInput.value = dbId;
  }
  
  // Reset form
  const form = document.getElementById('add-to-cart-form');
  if (form) {
    form.reset();
    productInput.value = product.name;
    productIdInput.value = dbId;
    document.getElementById('cart-quantity').value = 1;
  }
  
  window.openModal(addToCartModal, modalOverlay);
}

// Attach click handlers to server-rendered product buttons
document.querySelectorAll(".product-button-style").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    // Don't trigger if clicking on edit button
    if (e.target.closest('.product-edit-btn')) {
      return;
    }
    
    // Regular click for add to cart
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
      openAddToCartModal(product, btn);
    }
  });
});

// Attach click handlers to edit buttons
document.querySelectorAll(".product-edit-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent triggering product button click
    
    // Find the associated product button
    const productBtn = btn.closest('.product-card-wrapper')?.querySelector('.product-button-style');
    if (!productBtn) return;
    
    document
      .querySelectorAll(".product-button-style.selected")
      .forEach((el) => el.classList.remove("selected"));
    productBtn.classList.add("selected");
    
    const product = {
      id: productBtn.dataset.id,
      name: productBtn.dataset.name,
      price: productBtn.dataset.price,
      image: productBtn.dataset.image,
      stock: productBtn.dataset.stock,
      description: productBtn.dataset.description,
    };
    openEditModal(product, productBtn);
  });
});

const modal = document.getElementById("product-modal");
const productNameEl = document.getElementById("modal-product-name");
const productIdEl = document.getElementById("modal-product-id");
const productPriceEl = document.getElementById("modal-product-price");
const modalNameInput = document.getElementById("modal-product-name-input");
const modalStockInput = document.getElementById("modal-product-stock");
const modalDescriptionInput = document.getElementById("modal-product-description");
const closeEditModalBtn = document.getElementById("close-edit-modal");
let currentButton = null;

function openEditModal(product, btn) {
  if (!productNameEl || !modalNameInput || !productIdEl || !modalStockInput || !productPriceEl || !modalDescriptionInput) {
    console.error("Modal elements not found");
    return;
  }
  productNameEl.textContent = product.name;
  modalNameInput.value = product.name;
  productIdEl.textContent = product.id; // This is the product_id (e.g., "P001")
  modalStockInput.value = btn.dataset.stock || "0";
  productPriceEl.value = product.price;
  modalDescriptionInput.value = product.description || "";
  window.openModal(modal, modalOverlay);
  currentButton = btn;
}

if (closeEditModalBtn) {
closeEditModalBtn.addEventListener("click", () => {
    window.closeModal(modal, modalOverlay);
});
}

// Modal overlay click handled by centralized modal.js
const saveBtn = document.getElementById("save-price-btn");

if (productPriceEl && saveBtn) {
productPriceEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveBtn.click();
  }
});
}

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
if (saveBtn) {
saveBtn.addEventListener("click", () => {
    if (!modalNameInput || !modalStockInput || !productPriceEl || !productIdEl || !modalDescriptionInput) {
      showNotification("Error: Form elements not found", true);
      return;
    }

  const newName = modalNameInput.value.trim();
  const newStock = modalStockInput.value.trim();
  const newPrice = productPriceEl.value.trim();
  const newDescription = modalDescriptionInput.value.trim();

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

  showLoading();

  const payload = {
    product_id: productIdEl.textContent,
    name: newName,
    stock: parseInt(newStock),
    price: parseFloat(newPrice),
    description: newDescription,
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
            const stockLabel = currentButton.querySelector(".product-stock-label");
          if (priceLabel)
              priceLabel.textContent = "₱" + parseFloat(data.price || payload.price).toFixed(2);
            if (nameLabel) nameLabel.textContent = data.name || payload.name;
            if (stockLabel) stockLabel.textContent = `Stock: ${data.stock || payload.stock}`;
          // Update button's data attributes
            currentButton.dataset.price = data.price || payload.price;
            currentButton.dataset.name = data.name || payload.name;
            currentButton.dataset.stock = data.stock || payload.stock;
            currentButton.dataset.description = data.description || payload.description;
        }
        showNotification("Product updated successfully!");
      } else {
        showNotification("Update failed: " + (data.error || "Unknown"), true);
      }
        setTimeout(() => {
          hideLoading();
          window.closeModal(modal, modalOverlay);
        }, 800);
    })
    .catch((err) => {
      showNotification("Update failed: " + err.message, true);
        setTimeout(() => {
          hideLoading();
          window.closeModal(modal, modalOverlay);
        }, 800);
    });
});
}

const deleteModalBtn = document.getElementById("delete-modal-btn");
if (deleteModalBtn) {
deleteModalBtn.addEventListener("click", () => {
    if (!modalNameInput || !productIdEl) {
      showNotification("Error: Form elements not found", true);
      return;
    }

  const productName = modalNameInput.value;
  if (
    !confirm(
      `Are you sure you want to delete "${productName}"? This cannot be undone.`
    )
  ) {
    return;
  }

  showLoading();

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
            const wrapper = currentButton.closest('.product-card-wrapper');
            const productDisplay = wrapper?.closest('.product-display');
            
            if (wrapper) {
              wrapper.remove();
            }
            
          // If this was the last product in the row, remove the row too
            if (productDisplay && productDisplay.querySelectorAll('.product-card-wrapper').length === 0) {
              productDisplay.remove();
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
        setTimeout(() => {
          hideLoading();
          window.closeModal(modal, modalOverlay);
        }, 800);
    })
    .catch((err) => {
      showNotification("Delete failed: " + err.message, true);
        setTimeout(() => {
          hideLoading();
          window.closeModal(modal, modalOverlay);
        }, 800);
      });
  });
}

// Add to cart form submission
const addToCartForm = document.getElementById('add-to-cart-form');
if (addToCartForm) {
  addToCartForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('cart-product-id').value;
    const productName = document.getElementById('cart-product').value;
    const customerId = document.getElementById('cart-customer').value;
    const employeeId = document.getElementById('cart-employee').value;
    const quantity = parseFloat(document.getElementById('cart-quantity').value);
    
    if (!customerId || !employeeId) {
      alert('Please select both customer and employee');
      return;
    }
    
    // Find product price - search by db-id first, then fallback to product_id
    let productBtn = document.querySelector(`[data-db-id="${productId}"]`);
    if (!productBtn) {
      productBtn = document.querySelector(`[data-id="${productId}"]`);
    }
    const price = parseFloat(productBtn ? productBtn.dataset.price : 0);
    
    // Find customer and employee names
    const customer = customers.find(c => c.id == customerId);
    const employee = employees.find(e => e.id == employeeId);
    
    const cartItem = {
      productId: productId,
      productName: productName,
      customerId: customerId,
      customerName: customer ? customer.name : '',
      employeeId: employeeId,
      employeeName: employee ? employee.name : '',
      quantity: quantity,
      price: price,
      amount: price * quantity
    };
    
    cart.push(cartItem);
    localStorage.setItem('productCart', JSON.stringify(cart));
    updateCartCount();
    
    const addToCartModal = document.getElementById('add-to-cart-modal');
    if (addToCartModal) window.closeModal(addToCartModal, modalOverlay);
    showNotification(`${productName} added to cart!`);
  });
}

// Cart modal handlers
const viewCartBtn = document.getElementById('view-cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartViewModal = document.getElementById('close-cart-view-modal');
const closeCartBtn = document.getElementById('close-cart-btn');
const cancelCartBtn = document.getElementById('cancel-cart-btn');
const placeOrderBtn = document.getElementById('place-order-btn');

if (viewCartBtn) {
  viewCartBtn.addEventListener('click', function() {
    displayCart();
    window.openModal(cartModal, modalOverlay);
    });
}

if (closeCartViewModal) {
  closeCartViewModal.addEventListener('click', function() {
    window.closeModal(cartModal, modalOverlay);
  });
}

if (closeCartBtn) {
  closeCartBtn.addEventListener('click', function() {
    window.closeModal(cartModal, modalOverlay);
  });
}

if (cancelCartBtn) {
  cancelCartBtn.addEventListener('click', function() {
    const addToCartModal = document.getElementById('add-to-cart-modal');
    if (addToCartModal) window.closeModal(addToCartModal, modalOverlay);
  });
}

const closeCartModalBtn = document.getElementById('close-cart-modal');
if (closeCartModalBtn) {
  closeCartModalBtn.addEventListener('click', function() {
    const addToCartModal = document.getElementById('add-to-cart-modal');
    if (addToCartModal) window.closeModal(addToCartModal, modalOverlay);
  });
}

// Display cart items
function displayCart() {
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: rgba(0,0,0,0.5);">Cart is empty</p>';
    if (placeOrderBtn) placeOrderBtn.style.display = 'none';
    return;
  }
  
  let html = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">';
  html += '<thead><tr style="background: rgba(0,0,0,0.05); border-bottom: 2px solid rgba(0,0,0,0.1);">';
  html += '<th style="padding: 12px; text-align: left;">Product</th>';
  html += '<th style="padding: 12px; text-align: left;">Customer</th>';
  html += '<th style="padding: 12px; text-align: left;">Employee</th>';
  html += '<th style="padding: 12px; text-align: right;">Qty</th>';
  html += '<th style="padding: 12px; text-align: right;">Amount</th>';
  html += '<th style="padding: 12px; text-align: center;">Action</th>';
  html += '</tr></thead><tbody>';
  
  let total = 0;
  cart.forEach((item, index) => {
    total += item.amount;
    html += `<tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">`;
    html += `<td style="padding: 12px;">${item.productName}</td>`;
    html += `<td style="padding: 12px;">${item.customerName}</td>`;
    html += `<td style="padding: 12px;">${item.employeeName}</td>`;
    html += `<td style="padding: 12px; text-align: right;">${item.quantity}</td>`;
    html += `<td style="padding: 12px; text-align: right;">₱${item.amount.toFixed(2)}</td>`;
    html += `<td style="padding: 12px; text-align: center;">`;
    html += `<button class="remove-cart-item" data-index="${index}" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Remove</button>`;
    html += `</td></tr>`;
  });
  
  html += '</tbody></table>';
  html += `<div style="text-align: right; padding: 12px; border-top: 2px solid rgba(0,0,0,0.1);">`;
  html += `<strong>Total: ₱${total.toFixed(2)}</strong>`;
  html += `</div>`;
  
  container.innerHTML = html;
  
  // Add remove handlers
  container.querySelectorAll('.remove-cart-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      cart.splice(index, 1);
      localStorage.setItem('productCart', JSON.stringify(cart));
      updateCartCount();
      displayCart();
      showNotification('Item removed from cart');
    });
  });
  
  if (placeOrderBtn) placeOrderBtn.style.display = 'block';
}

// Place order - redirect to order page with cart data
if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        showLoading();

            fetch("/order/create/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({
                    customer_id: document.getElementById('cart-customer').value,
                    employee_id: document.getElementById('cart-employee').value,
                    cart_items: cart
                })
            })
            .then(res => res.json())
            .then(data => {
                hideLoading();
                if (data.error) {
                    alert(data.error);
                    return;
                }

                showNotification(`Order with ID ${data.order_id} created successfully!`);
                // clear cart
                cart.length = 0;
                localStorage.removeItem("productCart");

                // close modal
                window.closeModal(cartModal, modalOverlay);
            })
            .catch(err => {
                hideLoading();
                console.error("Order creation error:", err);
                alert("Failed to submit order.");
            });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  loadCustomersAndEmployees();
});

// Notification helper is provided globally by `notify.js` (window.showNotification)