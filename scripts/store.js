import { products } from './data/products.js';

const Store = {
    state: {
        currentUser: null, // { id, name, role }
        cart: [],
        isAuthenticated: false,
        products: [],
        categories: ['Electronics', 'Audio', 'Furniture', 'Accessories'] // Default categories
    },

    init() {
        // Expose globally for inline handlers
        window.Store = this;

        // Load Products
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            this.state.products = JSON.parse(savedProducts);
        } else {
            this.state.products = products; // from data file
        }

        // Load Categories
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            this.state.categories = JSON.parse(savedCategories);
        }

        // Load Users from local storage or Default Mock
        // We persist the ENTIRE user database to allow admin updates to stick
        const savedUsers = localStorage.getItem('users_db');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }

        // Load from local storage if available
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.state.isAuthenticated = true;
            // Re-sync with DB to get latest permissions
            this.syncCurrentUser();
        }

        // Load Cart from local storage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
            // Notify immediately to update header on load
            setTimeout(() => this.notifyCartChange('init'), 100);
        }
        // ... existing code ...

        // Cart Event Listeners
        window.addEventListener('add-to-cart', (e) => {
            this.addToCart(e.detail);
        });
    },

    // --- Product Management ---

    getProductPrice(product) {
        if (this.state.currentUser && this.state.currentUser.role === 'franchisee' && product.franchisePrice) {
            return product.franchisePrice;
        }
        return product.price;
    },

    addProduct(productData) {
        const newProduct = {
            id: Date.now(), // Simple ID generation
            ...productData
        };
        this.state.products.push(newProduct);
        this.saveProducts();
        return true;
    },

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.state.products));
    },

    addCategory(category) {
        if (!this.state.categories.includes(category)) {
            this.state.categories.push(category);
            localStorage.setItem('categories', JSON.stringify(this.state.categories));
            return true;
        }
        return false;
    },

    // --- User Management Database ---
    users: [
        { id: 1, name: 'Admin Manager', email: 'admin@nutanaa.com', password: 'admin', role: 'admin', permissions: [] },
        { id: 2, name: 'Franchise Owner', email: 'franchisee@nutanaa.com', password: 'franchisee', role: 'franchisee', permissions: [] },
        { id: 3, name: 'Customer', email: 'user@nutanaa.com', password: 'user', role: 'user', permissions: [] },
        // Add a test user for demo
        { id: 4, name: 'Prospective Franchisee', email: 'prospect@nutanaa.com', password: 'user', role: 'user', permissions: [] }
    ],

    saveUsers() {
        localStorage.setItem('users_db', JSON.stringify(this.users));
    },

    authenticate(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.setUser(user);
            return true;
        }
        return false;
    },

    syncCurrentUser() {
        if (this.state.currentUser) {
            const dbUser = this.users.find(u => u.email === this.state.currentUser.email);
            if (dbUser) {
                this.state.currentUser = dbUser; // Update session with latest DB state
                localStorage.setItem('user', JSON.stringify(dbUser));
            }
        }
    },

    grantPermission(email, permission) {
        const user = this.users.find(u => u.email === email);
        if (user) {
            if (!user.permissions) user.permissions = [];
            if (!user.permissions.includes(permission)) {
                user.permissions.push(permission);
                this.saveUsers();
                // If it's the current user, update session immediately
                if (this.state.currentUser && this.state.currentUser.email === email) {
                    this.syncCurrentUser();
                }
                return true;
            }
        }
        return false;
    },

    revokePermission(email, permission) {
        const user = this.users.find(u => u.email === email);
        if (user && user.permissions) {
            user.permissions = user.permissions.filter(p => p !== permission);
            this.saveUsers();
            if (this.state.currentUser && this.state.currentUser.email === email) {
                this.syncCurrentUser();
            }
            return true;
        }
        return false;
    },

    getAllUsers() {
        return this.users;
    },

    // --- Cart Methods ---
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
        window.dispatchEvent(new CustomEvent('user-updated'));
    },

    // Check specific permission or role
    hasPermission(permission) {
        const user = this.state.currentUser;
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin has all permissions
        return user.permissions && user.permissions.includes(permission);
    },

    // Mock Orders Data
    orders: [
        { id: 'ORD-1001', userId: 'user@nutanaa.com', date: '2025-10-15', total: 299.99, status: 'Delivered', items: [{ id: 2, name: 'Quantum Noise-Canceling Headphones', price: 299.99 }] },
        { id: 'ORD-1002', userId: 'user@nutanaa.com', date: '2025-11-20', total: 899.50, status: 'Shipped', items: [{ id: 3, name: 'ErgoChair Elite', price: 450.00 }, { id: 2, name: 'Quantum Noise-Canceling Headphones', price: 199.50 }, { id: 6, name: 'SonicSound Bar', price: 150.00 }] },
        { id: 'ORD-1003', userId: 'user@nutanaa.com', date: '2025-12-10', total: 129.99, status: 'Processing', items: [{ id: 1, name: 'Nebula Smart Watch', price: 299.99 }] },
        { id: 'ORD-1004', userId: 'franchisee@nutanaa.com', date: '2025-12-05', total: 5000.00, status: 'Processing', items: [{ id: 4, name: 'Bulk Order: HoloLens Pro', price: 5000.00 }] }
    ],

    getUser() {
        return this.state.currentUser;
    },

    // --- Profile & Order Methods ---

    getOrders(email) {
        if (email === 'all') return this.orders;
        // Filter orders by user email (using email as ID for simplicity)
        return this.orders.filter(o => o.userId === email);
    },

    cancelOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.status === 'Processing') {
            order.status = 'Cancelled';
            this.notifyOrderChange(); // Notify listeners to re-render
            return true;
        }
        return false;
    },

    returnOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order && order.status === 'Delivered') {
            order.status = 'Returned';
            this.notifyOrderChange();
            return true;
        }
        return false;
    },

    updateProfile(data) {
        if (this.state.currentUser) {
            this.state.currentUser = { ...this.state.currentUser, ...data };
            this.setUser(this.state.currentUser); // Persist
            return true;
        }
        return false;
    },

    notifyOrderChange() {
        window.dispatchEvent(new CustomEvent('orders-updated'));
    },

    // --- Address Methods ---

    // Mock Addresses (loaded from local storage or defaults)
    addresses: JSON.parse(localStorage.getItem('addresses')) || [
        { id: 'ADDR-1', userId: 'user@nutanaa.com', type: 'Home', address: '123 Tech Boulevard, Silicon Valley, CA, 94000', lat: 37.7749, lng: -122.4194 },
        { id: 'ADDR-2', userId: 'user@nutanaa.com', type: 'Work', address: '456 Innovation Way, San Francisco, CA, 94016', lat: 37.7833, lng: -122.4167 }
    ],

    getAddresses(email) {
        return this.addresses.filter(a => a.userId === email);
    },

    addAddress(addressData) {
        const newAddress = {
            id: 'ADDR-' + Date.now(),
            ...addressData
        };
        this.addresses.push(newAddress);
        this.saveAddresses();
        this.notifyAddressChange();
        return true;
    },

    removeAddress(id) {
        this.addresses = this.addresses.filter(a => a.id !== id);
        this.saveAddresses();
        this.notifyAddressChange();
        return true;
    },

    saveAddresses() {
        localStorage.setItem('addresses', JSON.stringify(this.addresses));
    },

    notifyAddressChange() {
        window.dispatchEvent(new CustomEvent('addresses-updated'));
    },

    // --- Franchise Documents (Mock) ---
    franchiseDocuments: [
        { userId: 'franchisee@nutanaa.com', type: 'Aadhar Card', status: 'Verified', url: '#', uploadedAt: '2025-12-01' },
        { userId: 'franchisee@nutanaa.com', type: 'PAN Card', status: 'Verified', url: '#', uploadedAt: '2025-12-01' },
        { userId: 'franchisee@nutanaa.com', type: 'Store Photo (Exterior)', status: 'Pending', url: '#', uploadedAt: '2025-12-05' },
        { userId: 'franchisee@nutanaa.com', type: 'Store Photo (Interior)', status: 'Pending', url: '#', uploadedAt: '2025-12-05' }
    ],

    getFranchiseDocuments(email) {
        return this.franchiseDocuments.filter(d => d.userId === email);
    }
};

export default Store;
