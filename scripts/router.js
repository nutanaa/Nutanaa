import Home from './pages/home.js?v=72';
import ProductList from './pages/product-list.js?v=72';
import ProductDetail from './pages/product-detail.js?v=72';
import AdminDashboard from './pages/admin/dashboard.js?v=72';
import AdminProducts from './pages/admin/products.js?v=76';
import AdminFranchise from './pages/admin/franchise.js?v=72';
import AdminUsers from './pages/admin/users.js?v=72';
import AdminOrders from './pages/admin/orders.js?v=77';
import AdminVendors from './pages/admin/vendors.js?v=74';
import AdminLogs from './pages/admin/logs.js?v=72';
import AdminReviews from './pages/admin/reviews.js?v=76';
import AdminMarketing from './pages/admin/marketing.js?v=76';
import AdminCMS from './pages/admin/cms.js?v=76';
import AdminAnalytics from './pages/admin/analytics.js?v=76';
import AdminSettings from './pages/admin/settings.js?v=76';
import AdminSupport from './pages/admin/support.js?v=76';
import Cart from './pages/cart.js?v=72';
import Login from './pages/login.js?v=72';
import About from './pages/about.js?v=72';
import Contact from './pages/contact.js?v=72';
import FranchiseEnquiry from './pages/enquiry-form.js?v=72';
import FranchiseRegister from './pages/franchise-register.js?v=72';
import Profile from './pages/profile.js?v=72';
import Store from './store.js?v=76';

const Router = {
    routes: {
        '/': Home,
        '/products': ProductList,
        '/product/:id': ProductDetail,
        '/cart': Cart,
        '/login': Login,
        '/about': About,
        '/contact': Contact,
        '/profile': Profile,
        '/franchise-enquiry': FranchiseEnquiry,
        '/franchise-register': FranchiseRegister,
        '/admin': AdminDashboard,
        '/admin/products': AdminProducts,
        '/admin/partners': AdminFranchise,
        '/admin/users': AdminUsers,
        '/admin/orders': AdminOrders,
        '/admin/vendors': AdminVendors,
        '/admin/reviews': AdminReviews,
        '/admin/marketing': AdminMarketing,
        '/admin/cms': AdminCMS,
        '/admin/reports': AdminAnalytics,
        '/admin/settings': AdminSettings,
        '/admin/support': AdminSupport,
        '/admin/logs': AdminLogs
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
            const currentStore = window.Store || Store;
            const user = currentStore.getUser();
            console.log('Router checking admin access for:', user);

            const allowedRoles = ['admin', 'sub-admin', 'vendor', 'support', 'finance'];

            if (!user || !allowedRoles.includes(user.role)) {
                alert('Access Denied: Admin Rights Required');
                window.location.hash = '#/login';
                return;
            }
        }

        // Security Check for Franchise Registration
        if (path === '/franchise-register') {
            const currentStore = window.Store || Store;
            const hasAccess = currentStore.hasPermission && currentStore.hasPermission('register_franchise');

            // Allow admin too
            const isAdmin = currentStore.getUser() && currentStore.getUser().role === 'admin';

            if (!hasAccess && !isAdmin) {
                alert('Access Denied: You need permission to access Franchise Registration.\nPlease contact Administrator.');
                window.location.hash = '#/';
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
