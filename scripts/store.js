import { products } from './data/products.js';

const Store = {
    state: {
        currentUser: null, // { id, name, role }
        cart: [],
        isAuthenticated: false,
        products: products // Initialize immediately
    },

    init() {
        // Expose globally for inline handlers
        window.Store = this;

        // Load from local storage if available
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.state.isAuthenticated = true;
        }

        // Load Cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
            // Notify immediately to update header on load
            setTimeout(() => this.notifyCartChange('init'), 100);
        }

        // Cart Event Listeners
        window.addEventListener('add-to-cart', (e) => {
            this.addToCart(e.detail);
        });
    },

    addToCart(productId) {
        console.log('Adding to cart:', productId);
        const product = this.state.products.find(p => p.id === productId);
        if (product) {
            const existingItem = this.state.cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.state.cart.push({ ...product, quantity: 1 });
            }
            this.saveCart();
            this.notifyCartChange('added', product);
        } else {
            console.error('Product not found:', productId);
        }
    },

    removeFromCart(productId) {
        console.log('Removing from cart:', productId);
        const existingItem = this.state.cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity -= 1;
            if (existingItem.quantity <= 0) {
                this.state.cart = this.state.cart.filter(item => item.id !== productId);
            }
            this.saveCart();
            this.notifyCartChange('removed');
        }
    },

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.state.cart));
    },

    // Helper to get count for UI
    getCartItemCount(productId) {
        const item = this.state.cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    },

    notifyCartChange(action, item) {
        // Dispatch global event for header and other components
        window.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { cart: this.state.cart, action, item }
        }));
    },

    getCart() {
        return this.state.cart;
    },

    getCartTotal() {
        return this.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    setUser(user) {
        this.state.currentUser = user;
        this.state.isAuthenticated = !!user;
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    },

    // Check specific permission or role
    hasPermission(permission) {
        const user = this.state.currentUser;
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin has all permissions
        return user.permissions && user.permissions.includes(permission);
    },

    getUser() {
        return this.state.currentUser;
    }
};

export default Store;
