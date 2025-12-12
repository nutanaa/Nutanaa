import Store from '../store.js?v=10';

const renderHeader = () => {
    const user = Store.getUser();
    const cartCount = Store.getCart().reduce((acc, item) => acc + item.quantity, 0);

    return `
        <header style="
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 1rem 2rem; 
            background: rgba(248, 250, 252, 0.96); 
            backdrop-filter: blur(12px); 
            position: fixed; 
            top: 0; 
            left: 0;
            z-index: 1000; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
            border-bottom: 1px solid rgba(0,0,0,0.05);
            width: 100%;
            box-sizing: border-box;
        ">
            <a href="#/" style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.5px; text-decoration: none;">
                <span style="color: var(--color-accent); font-size: 1.8rem; line-height: 1;">●</span> Nutanaa
            </a>
            
            <nav style="display: flex; gap: 2rem; align-items: center; flex-wrap: wrap;">
                <a href="#/" class="nav-link" style="color: var(--color-text-primary); font-weight: 500;">Home</a>
                <a href="#/products" class="nav-link" style="color: var(--color-text-primary); font-weight: 500;">Products</a>
                <a href="#/about" class="nav-link" style="color: var(--color-text-primary); font-weight: 500;">About</a>
                <a href="#/contact" class="nav-link" style="color: var(--color-text-primary); font-weight: 500;">Support</a>
                <a href="#/franchise-enquiry" class="nav-link" style="color: var(--color-text-primary); font-weight: 500;">Franchise</a>
                ${Store.hasPermission('register_franchise') ?
            `<a href="#/franchise-register" class="nav-link" style="color: var(--color-accent); font-weight: 600; font-size: 0.9rem; border: 1px solid var(--color-accent); padding: 0.35rem 0.75rem; border-radius: 50px; transition: all 0.2s;">Partner (e-KYC)</a>`
            : ''}
                ${user && user.role === 'admin' ? '<a href="#/admin" class="nav-link" style="color: var(--color-danger); font-weight: bold;">Admin Panel</a>' : ''}
            </nav>
            
            <div style="display: flex; gap: 1.5rem; align-items: center;">
                <a href="#/cart" style="position: relative; color: var(--color-text-primary); text-decoration: none; display: flex; align-items: center;">
                    <span style="font-size: 1.25rem;">🛒</span> 
                    ${cartCount > 0 ? `<span style="position: absolute; top: -8px; right: -8px; background: var(--color-accent); color: white; font-size: 0.7rem; font-weight: bold; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${cartCount}</span>` : ''}
                </a>
                ${user ?
            `<button class="btn" style="padding: 0.35rem 1rem; font-size: 0.9rem; border-radius: 50px;" onclick="localStorage.removeItem('user'); window.location.reload();">Logout</button>` :
            `<a href="#/login" class="btn" style="padding: 0.35rem 1rem; font-size: 0.9rem; border-radius: 50px;">Login</a>`
        }
            </div>
        </header>
    `;
};

// Auto-update header on render
export default renderHeader;
