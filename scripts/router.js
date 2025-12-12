import Home from './pages/home.js';
import ProductList from './pages/product-list.js';
import ProductDetail from './pages/product-detail.js';
import AdminDashboard from './pages/admin/dashboard.js';
import AdminProducts from './pages/admin/products.js';
import AdminKYC from './pages/admin/kyc.js';
import Cart from './pages/cart.js';
import Login from './pages/login.js';
import About from './pages/about.js';
import Contact from './pages/contact.js';
import FranchiseEnquiry from './pages/franchise-enquiry.js';
import FranchiseRegister from './pages/franchise-register.js';
import Store from './store.js?v=10';

const Router = {
    routes: {
        '/': Home,
        '/products': ProductList,
        '/product/:id': ProductDetail,
        '/cart': Cart,
        '/login': Login,
        '/about': About,
        '/contact': Contact,
        '/franchise-enquiry': FranchiseEnquiry,
        '/franchise-register': FranchiseRegister,
        '/admin': AdminDashboard,
        '/admin/products': AdminProducts,
        '/admin/kyc': AdminKYC,
        // Add more routes here dynamically or statically
        // '/admin': AdminDashboard,
    },

    init() {
        window.addEventListener('hashchange', this.handleRoute.bind(this));
        window.addEventListener('load', this.handleRoute.bind(this));

        // Handle initial loaded route if no hash
        if (!window.location.hash) {
            window.location.hash = '#/';
        }

        // Global link click interceptor for Scroll to Top on Forward Nav
        window.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href')?.startsWith('#/')) {
                window.scrollTo(0, 0);
            }
        });
    },

    async handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, queryString] = hash.split('?');

        console.log(`Navigating to: ${path}`);

        let pageFunction;
        let params = {};

        // Route Matching Logic
        if (this.routes[path]) {
            pageFunction = this.routes[path];
        } else {
            // Check for dynamic routes (e.g., /product/:id)
            for (const route in this.routes) {
                if (route.includes(':')) {
                    const routeParts = route.split('/');
                    const pathParts = path.split('/');

                    if (routeParts.length === pathParts.length) {
                        let match = true;
                        const tempParams = {};

                        for (let i = 0; i < routeParts.length; i++) {
                            if (routeParts[i].startsWith(':')) {
                                tempParams[routeParts[i].slice(1)] = pathParts[i];
                            } else if (routeParts[i] !== pathParts[i]) {
                                match = false;
                                break;
                            }
                        }

                        if (match) {
                            pageFunction = this.routes[route];
                            params = tempParams;
                            break;
                        }
                    }
                }
            }
        }

        const contentContainer = document.getElementById('main-content');

        // Security Check for Admin
        if (path.startsWith('/admin')) {
            const user = Store.getUser();
            if (!user || user.role !== 'admin') {
                alert('Access Denied: Admin Rights Required');
                window.location.hash = '#/login';
                return;
            }
        }

        // Security Check for Franchise Registration
        if (path === '/franchise-register') {
            // Check usage of the new helper, or fallback to direct check if store update isn't hot yet
            const hasAccess = Store.hasPermission ? Store.hasPermission('register_franchise') : (Store.getUser() && Store.getUser().role === 'admin');

            if (!hasAccess) {
                alert('Access Denied: You need permission to access Franchise Registration.\nPlease contact Administrator.');
                window.location.hash = '#/'; // Redirect to home
                return;
            }
        }

        if (pageFunction) {
            contentContainer.innerHTML = await pageFunction(params);
        } else {
            contentContainer.innerHTML = `<h1>404 - Page Not Found</h1>`;
        }
    },

    navigateTo(path) {
        window.location.hash = `#${path}`;
    }
};

export default Router;
