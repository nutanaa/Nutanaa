import { products } from './data/products.js';

const Store = {
    state: {
        currentUser: null, // { id, name, role }
        cart: [],
        isAuthenticated: false,
        products: [],
        categories: ['Electronics', 'Audio', 'Furniture', 'Accessories'], // Default categories
        brands: ['Nutanaa', 'Samsung', 'Apple', 'Sony', 'Herman Miller', 'Generic'], // Brands
        logs: [] // Activity Logs
    },

    init() {
        // Expose globally for inline handlers
        window.Store = this;

        // Load Logs
        const savedLogs = localStorage.getItem('admin_logs');
        if (savedLogs) {
            this.state.logs = JSON.parse(savedLogs);
        }

        // Load Products
        const savedProducts = localStorage.getItem('products');
        if (savedProducts) {
            this.state.products = JSON.parse(savedProducts);
        } else {
            this.state.products = products.map(p => ({
                ...p,
                status: p.status || 'Active', // Default existing to Active
                brand: p.brand || 'Generic',
                seo: p.seo || { title: p.name, description: p.description, tags: [] },
                attributes: p.attributes || []
            }));
        }

        // Load Categories
        const savedCategories = localStorage.getItem('categories');
        if (savedCategories) {
            this.state.categories = JSON.parse(savedCategories);
        }

        // Load Brands
        const savedBrands = localStorage.getItem('brands');
        if (savedBrands) {
            this.state.brands = JSON.parse(savedBrands);
        }

        // ... Load Users and Cart (existing) ...
        const savedUsers = localStorage.getItem('users_db');
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }

        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.state.currentUser = JSON.parse(savedUser);
            this.state.isAuthenticated = true;
            this.syncCurrentUser();
        }

        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.state.cart = JSON.parse(savedCart);
            setTimeout(() => this.notifyCartChange('init'), 100);
        }

        window.addEventListener('add-to-cart', (e) => this.addToCart(e.detail));
    },

    // --- Order Management ---

    getOrders(filter = 'all') {
        let orders = this.state.orders || []; // Fallback if mock not loaded yet
        // In a real app, we'd fetch from server. Here we assume this.orders or State.orders
        // Let's assume they are in this.state.orders if synced, or we mock them.
        if (!this.state.orders || this.state.orders.length === 0) {
            this.state.orders = this.mockOrders();
        }

        if (filter === 'all') return this.state.orders;
        if (filter === 'pending') return this.state.orders.filter(o => ['Processing', 'Pending'].includes(o.status));
        if (filter === 'returns') return this.state.orders.filter(o => ['Returned', 'Refunded', 'Disputed'].includes(o.status));

        return this.state.orders;
    },

    mockOrders() {
        return [
            { id: 'ORD-001', userId: 'user@nutanaa.com', date: '2025-12-14', total: 120.50, status: 'Processing', items: [{ name: 'Vendor Mouse', vendor: 'vendor@nutanaa.com' }] },
            { id: 'ORD-002', userId: 'user@nutanaa.com', date: '2025-12-13', total: 450.00, status: 'Delivered', items: [] },
            { id: 'ORD-003', userId: 'guest@nutanaa.com', date: '2025-12-12', total: 89.99, status: 'Cancelled', items: [] },
            { id: 'ORD-004', userId: 'user@nutanaa.com', date: '2025-12-10', total: 299.00, status: 'Returned', items: [] }
        ];
    },

    updateOrderStatus(id, status, details = null) {
        const order = this.state.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            if (details) {
                order.shipping = details; // { carrier, tracking }
            }
            // Log for Split Orders / Tracking would go here
            this.logActivity('ORDER_UPDATE', this.state.currentUser ? this.state.currentUser.email : 'system', `Order ${id} marked as ${status}`);
            return true;
        }
        return false;
    },

    cancelOrder(id) {
        const order = this.state.orders.find(o => o.id === id);
        if (order && ['Processing', 'Pending'].includes(order.status)) {
            order.status = 'Cancelled';
            this.logActivity('ORDER_CANCEL', this.state.currentUser ? this.state.currentUser.email : 'system', `Order ${id} cancelled`);
            return true;
        }
        return false;
    },

    // Returns & Disputes (Point 10)
    requestReturn(id, reason) {
        const order = this.state.orders.find(o => o.id === id);
        if (order && ['Delivered'].includes(order.status)) {
            order.status = 'Return Requested';
            order.returnReason = reason || 'No reason provided';
            this.logActivity('ORDER_RETURN_REQUEST', order.userId, `Return requested for ${id}: ${reason}`);
            return true;
        }
        return false;
    },

    processReturn(id, action) { // action: Approve, Reject, Refund
        const order = this.state.orders.find(o => o.id === id);
        if (order) {
            // State Machine
            if (action === 'Approve' && order.status === 'Return Requested') {
                order.status = 'Return Approved';
            } else if (action === 'Reject' && order.status === 'Return Requested') {
                order.status = 'Return Rejected';
            } else if (action === 'Refund' && order.status === 'Return Approved') {
                order.status = 'Refunded';
                // Trigger Finance Refund Logic here
            } else {
                return false;
            }
            this.logActivity('ORDER_RETURN_PROCESS', this.state.currentUser.email, `Order ${id} return ${action}`);
            return true;
        }
        return false;
    },

    processRefund(id) {
        // Legacy helper alias
        return this.processReturn(id, 'Refund');
    },

    // --- Product Management ---

    getProductPrice(product) {
        if (this.state.currentUser && this.state.currentUser.role === 'franchisee' && product.franchisePrice) {
            return product.franchisePrice;
        }
        return product.price;
    },

    addProduct(productData) {
        const currentUser = this.state.currentUser;
        const isVendor = currentUser && currentUser.role === 'vendor';

        const newProduct = {
            id: Date.now(),
            status: isVendor ? 'Pending' : (productData.status || 'Draft'), // Vendors enforce Pending
            brand: isVendor ? (this.getVendorShopName(currentUser.email) || 'Generic') : (productData.brand || 'Generic'),
            vendorEmail: isVendor ? currentUser.email : null,
            seo: { title: productData.name, description: '', tags: [] },
            attributes: [],
            ...productData
        };
        // Force status override again just in case ... is spread after
        if (isVendor) newProduct.status = 'Pending';
        if (isVendor) newProduct.brand = this.getVendorShopName(currentUser.email) || 'Generic';

        this.state.products.push(newProduct);
        this.saveProducts();
        this.logActivity('PRODUCT_ADD', currentUser ? currentUser.email : 'system', `Added product ${newProduct.name}`);
        return true;
    },

    getVendorShopName(email) {
        const vendor = this.vendors.find(v => v.email === email);
        return vendor ? vendor.shopName : null;
    },

    updateProduct(id, updates) {
        const index = this.state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.products[index] = { ...this.state.products[index], ...updates };
            this.saveProducts();
            this.logActivity('PRODUCT_UPDATE', this.state.currentUser ? this.state.currentUser.email : 'system', `Updated product ${id}`);
            return true;
        }
        return false;
    },

    updateProductStatus(id, status) {
        return this.updateProduct(id, { status });
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

    addBrand(brand) {
        if (!this.state.brands.includes(brand)) {
            this.state.brands.push(brand);
            localStorage.setItem('brands', JSON.stringify(this.state.brands));
            return true;
        }
        return false;
    },

    removeBrand(brand) {
        this.state.brands = this.state.brands.filter(b => b !== brand);
        localStorage.setItem('brands', JSON.stringify(this.state.brands));
        return true;
    },

    // --- User Management Database ---
    users: [
        { id: 1, name: 'Nutanaa', email: 'admin@nutanaa.com', password: 'nutanaa', role: 'admin', permissions: ['all'], is2FAEnabled: true }, // Super Admin
        { id: 2, name: 'Franchise Owner', email: 'franchisee@nutanaa.com', password: 'franchisee', role: 'franchisee', permissions: [], is2FAEnabled: false },
        { id: 3, name: 'Customer', email: 'user@nutanaa.com', password: 'user', role: 'user', permissions: [], is2FAEnabled: false },
        // RBAC Test Users
        { id: 5, name: 'Sub Admin', email: 'subadmin@nutanaa.com', password: 'sub', role: 'sub-admin', permissions: ['read_products', 'write_products', 'read_orders', 'write_orders', 'read_users'], is2FAEnabled: true },
        { id: 6, name: 'Support Staff', email: 'support@nutanaa.com', password: 'supp', role: 'support', permissions: ['read_orders', 'read_users', 'read_tickets'], is2FAEnabled: false },
        { id: 7, name: 'Finance Manager', email: 'finance@nutanaa.com', password: 'fin', role: 'finance', permissions: ['read_orders', 'read_reports'], is2FAEnabled: true },

        { id: 4, name: 'Prospective Franchisee', email: 'prospect@nutanaa.com', password: 'user', role: 'user', permissions: [], is2FAEnabled: false },
        { id: 8, name: 'Best Electronics', email: 'vendor@nutanaa.com', password: 'vendor', role: 'vendor', permissions: [], is2FAEnabled: false }
    ],

    saveUsers() {
        localStorage.setItem('users_db', JSON.stringify(this.users));
    },

    authenticate(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            if (user.is2FAEnabled) {
                return { status: '2FA_REQUIRED', user: { email: user.email } }; // Don't return full user yet
            }
            this.setUser(user);
            this.logActivity('LOGIN', user.email, 'User logged in successfully');
            return { status: 'SUCCESS', user };
        }
        this.logActivity('LOGIN_FAILED', email, 'Invalid credentials');
        return { status: 'FAILED' };
    },

    verify2FA(email, code) {
        // Mock 2FA - accept any 6 digit code for now, or specific one
        if (code && code.length === 6) {
            const user = this.users.find(u => u.email === email);
            if (user) {
                this.setUser(user);
                this.logActivity('LOGIN_2FA', user.email, '2FA Verified successfully');
                return true;
            }
        }
        return false;
    },

    logActivity(action, email, details) {
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action,
            email,
            details,
            ip: '127.0.0.1' // Mock IP
        };
        this.state.logs.unshift(log); // Add to top
        // Limit logs to last 100 to prevent overflow
        if (this.state.logs.length > 100) this.state.logs.pop();
        localStorage.setItem('admin_logs', JSON.stringify(this.state.logs));
    },

    getLogs() {
        return this.state.logs;
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

    // --- Reviews Management (Point 12) ---
    reviews: [
        { id: 101, productId: 1, userId: 'user@nutanaa.com', rating: 5, comment: 'Great product, loved it!', status: 'Pending', date: '2025-12-14' },
        { id: 102, productId: 1, userId: 'guest@nutanaa.com', rating: 1, comment: 'Fake item.', status: 'Pending', date: '2025-12-13' },
        { id: 103, productId: 2, userId: 'user@nutanaa.com', rating: 4, comment: 'Good value.', status: 'Approved', date: '2025-12-12' }
    ],

    getReviews(status = 'all') {
        if (status === 'all') return this.reviews;
        return this.reviews.filter(r => r.status === status);
    },

    updateReviewStatus(id, status) {
        const review = this.reviews.find(r => r.id === id);
        if (review) {
            review.status = status;
            this.logActivity('REVIEW_MODERATION', this.state.currentUser.email, `Review ${id} ${status}`);
            return true;
        }
        return false;
    },

    // --- Marketing & Promotions (Point 11) ---
    promotions: [
        { id: 1, code: 'WELCOME10', discount: 10, type: 'percent', expiry: '2025-12-31', usageCount: 50 },
        { id: 2, code: 'FLASH50', discount: 50, type: 'fixed', expiry: '2025-01-01', usageCount: 12 }
    ],

    getPromotions() {
        return this.promotions;
    },

    createCoupon(couponData) {
        // Basic validation
        if (this.promotions.find(p => p.code === couponData.code)) return false;

        const newCoupon = {
            id: Date.now(),
            ...couponData,
            usageCount: 0
        };
        this.promotions.push(newCoupon);
        this.logActivity('MARKETING_CREATE', this.state.currentUser.email, `Created coupon ${couponData.code}`);
        return true;
    },

    deleteCoupon(id) {
        this.promotions = this.promotions.filter(p => p.id !== id);
        this.logActivity('MARKETING_DELETE', this.state.currentUser.email, `Deleted coupon ${id}`);
        return true;
    },

    // --- CMS (Point 13) ---
    cms: {
        pages: [
            { id: 'about', title: 'About Us', content: 'Welcome to Nutanaa, the future of commerce.', lastUpdated: '2025-10-01' },
            { id: 'privacy', title: 'Privacy Policy', content: 'Your data is safe with us.', lastUpdated: '2025-09-15' },
            { id: 'terms', title: 'Terms of Service', content: 'Standard terms apply.', lastUpdated: '2025-09-15' }
        ],
        banners: [
            { id: 1, title: 'Mega Sale', imageUrl: 'https://via.placeholder.com/1200x400/3b82f6/ffffff?text=Mega+Sale', active: true },
            { id: 2, title: 'New Arrivals', imageUrl: 'https://via.placeholder.com/1200x400/10b981/ffffff?text=New+Arrivals', active: true }
        ]
    },

    getCMSPages() {
        return this.cms.pages;
    },

    getCMSBanners() {
        return this.cms.banners;
    },

    updatePageContent(id, content) {
        const page = this.cms.pages.find(p => p.id === id);
        if (page) {
            page.content = content;
            page.lastUpdated = new Date().toISOString().split('T')[0];
            this.logActivity('CMS_UPDATE', this.state.currentUser.email, `Updated page ${id}`);
            return true;
        }
        return false;
    },

    deleteBanner(id) {
        this.cms.banners = this.cms.banners.filter(b => b.id !== id);
        this.logActivity('CMS_DELETE_BANNER', this.state.currentUser.email, `Deleted banner ${id}`);
        return true;
    },

    addBanner(title, imageUrl) {
        this.cms.banners.push({ id: Date.now(), title, imageUrl, active: true });
        this.logActivity('CMS_ADD_BANNER', this.state.currentUser.email, `Added banner ${title}`);
        return true;
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
    },

    updateFranchiseDocumentStatus(email, type, status) {
        const doc = this.franchiseDocuments.find(d => d.userId === email && d.type === type);
        if (doc) {
            doc.status = status;
            // doc.verifiedAt = ...
            return true;
        }
        return false;
    },

    // --- Analytics (Point 15) ---
    getAnalytics() {
        const totalSales = this.orders.reduce((sum, o) => sum + o.total, 0);
        const orderCount = this.orders.length;
        const vendorCount = this.vendors.filter(v => v.status === 'Active').length;
        const productCount = this.state.products.length;

        // Mock Weekly Data
        const weeklySales = [400, 1200, 950, 2100, 1800, 3200, 2800];

        return {
            totalSales,
            orderCount,
            vendorCount,
            productCount,
            weeklySales
        };
    },

    // --- Settings (Points 16, 17, 18) ---
    settings: {
        siteTitle: 'Nutanaa Marketplace',
        currency: 'USD',
        taxRate: 5.0,
        maintenanceMode: false,
        security: {
            require2FA: false, // Global Toggle
            sessionTimeout: 30
        }
    },

    getSettings() {
        return this.settings;
    },

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.logActivity('SETTINGS_UPDATE', this.state.currentUser.email, 'Updated system settings');
        return true;
    },

    // --- Notifications (Point 14) ---
    notifications: [
        { id: 1, type: 'info', message: 'Welcome to the new Admin Dashboard!', date: '2025-12-14', read: false },
        { id: 2, type: 'warning', message: 'Server maintenance scheduled for Dec 20.', date: '2025-12-13', read: true }
    ],

    getNotifications() {
        return this.notifications;
    },

    addNotification(message, type = 'info') {
        this.notifications.unshift({
            id: Date.now(),
            type,
            message,
            date: new Date().toISOString().split('T')[0],
            read: false
        });
        window.dispatchEvent(new CustomEvent('notifications-updated'));
    },

    markNotificationRead(id) {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) notif.read = true;
    },

    // --- Support (Point 20) ---
    tickets: [
        { id: 'TKT-001', userId: 'user@nutanaa.com', subject: 'Order not received', status: 'Open', lastMessage: 'I ordered the watch but...' },
        { id: 'TKT-002', userId: 'vendor@nutanaa.com', subject: 'Payout Issue', status: 'Resolved', lastMessage: 'Thank you for resolving.' }
    ],

    getTickets() {
        return this.tickets;
    },

    updateTicketStatus(id, status) {
        const t = this.tickets.find(t => t.id === id);
        if (t) {
            t.status = status;
            return true;
        }
        return false;
    },

    // Helper to get overall KYC status for a user
    getKYCStatus(email) {
        const docs = this.getFranchiseDocuments(email);
        if (docs.length === 0) return 'Not Submitted';
        if (docs.some(d => d.status === 'Rejected')) return 'Rejected';
        if (docs.some(d => d.status === 'Pending')) return 'Pending Review';
        return 'Verified';
    },

    // --- Vendor Management (Mock) ---
    vendors: [
        {
            email: 'vendor@nutanaa.com',
            shopName: 'Best Electronics',
            status: 'Pending', // pending, active, suspended, blocked 
            category: 'Electronics',
            commissionRate: 10, // %
            balance: 0,
            metrics: { sales: 0, rating: 0, products: 0 }
        }
    ],

    vendorDocuments: [
        { userId: 'vendor@nutanaa.com', type: 'GST Certificate', status: 'Pending', url: '#', uploadedAt: '2025-12-14' },
        { userId: 'vendor@nutanaa.com', type: 'Bank Statement', status: 'Pending', url: '#', uploadedAt: '2025-12-14' }
    ],

    getVendors() {
        return this.vendors;
    },

    getVendorDocuments(email) {
        return this.vendorDocuments.filter(d => d.userId === email);
    },

    updateVendorStatus(email, status) {
        const vendor = this.vendors.find(v => v.email === email);
        if (vendor) {
            vendor.status = status;
            this.logActivity('VENDOR_STATUS', email, `Status changed to ${status}`);
            return true;
        }
        return false;
    },

    updateVendorDocumentStatus(email, type, status) {
        const doc = this.vendorDocuments.find(d => d.userId === email && d.type === type);
        if (doc) {
            doc.status = status;
            return true;
        }
        return false;
    },

    updateVendorCommission(email, rate) {
        const vendor = this.vendors.find(v => v.email === email);
        if (vendor) {
            vendor.commissionRate = rate;
            return true;
        }
        return false;
    }
};

export default Store;
