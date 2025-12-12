import Router from './router.js';
import Store from './store.js?v=10';
import renderHeader from './components/header.js';
import Footer from './components/footer.js';
import renderChatWidget from './components/chat-widget.js';

// Initialize the application
// Export the init function
export const initApp = () => {
    console.log('App Initializing...');

    try {
        // Initialize Store
        Store.init();

        // Initial Header Render
        const header = document.getElementById('main-header');
        if (header) {
            header.innerHTML = renderHeader();
        }

        // Listen for Cart Updates
        window.addEventListener('cart-updated', () => {
            const h = document.getElementById('main-header');
            if (h) h.innerHTML = renderHeader();
        });

        // Listen for User Updates
        window.addEventListener('user-updated', () => {
            const h = document.getElementById('main-header');
            if (h) h.innerHTML = renderHeader();
            console.log('Header updated due to user change');
        });

        // Initial Footer Render
        const layout = document.getElementById('layout-container');
        if (layout) {
            const footerContainer = document.createElement('div');
            footerContainer.innerHTML = Footer();
            layout.appendChild(footerContainer);
        }

        renderChatWidget();

        // Update Header on Hash Change
        window.addEventListener('hashchange', () => {
            const h = document.getElementById('main-header');
            if (h) h.innerHTML = renderHeader();
        });

        // Initialize Router
        Router.init();

        // Force initial route handling if needed
        if (window.location.hash) {
            Router.handleRoute();
        } else {
            window.location.hash = '#/';
        }

    } catch (err) {
        throw new Error('App Init Failed: ' + err.message);
    }
};
