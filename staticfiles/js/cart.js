// Cart Management System
const CART_STORAGE_KEY = 'sbms_cart';

class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    loadCart() {
        try {
            const cartData = localStorage.getItem(CART_STORAGE_KEY);
            return cartData ? JSON.parse(cartData) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
            this.updateCartBadge();
            return true;
        } catch (e) {
            console.error('Error saving cart:', e);
            return false;
        }
    }

    addItem(product, customer, quantity = 1) {
        if (!product || !customer) {
            return { success: false, error: 'Product and customer are required' };
        }

        // Check if item already exists (same product + customer)
        const existingIndex = this.cart.findIndex(
            item => item.product.id === product.id && item.customer.id === customer.id
        );

        if (existingIndex >= 0) {
            // Update quantity
            this.cart[existingIndex].quantity += quantity;
        } else {
            // Add new item
            this.cart.push({
                id: Date.now(), // temporary ID
                product: {
                    id: product.id,
                    product_id: product.product_id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock
                },
                customer: {
                    id: customer.id,
                    customer_id: customer.customer_id,
                    name: customer.name
                },
                quantity: quantity
            });
        }

        this.saveCart();
        return { success: true, cart: this.cart };
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        return { success: true, cart: this.cart };
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            return { success: true, cart: this.cart };
        }
        return { success: false, error: 'Item not found' };
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        return { success: true };
    }

    getCart() {
        return this.cart;
    }

    getCartCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getCartTotal() {
        return this.cart.reduce((sum, item) => {
            return sum + (parseFloat(item.product.price) * item.quantity);
        }, 0);
    }

    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        if (badge) {
            const count = this.getCartCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    }

    // Check if cart has items
    hasItems() {
        return this.cart.length > 0;
    }
}

// Global cart instance
const cartManager = new CartManager();
window.cartManager = cartManager; // Make it globally accessible

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', () => {
    cartManager.updateCartBadge();
});

