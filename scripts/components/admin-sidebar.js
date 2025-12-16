import Store from '../store.js?v=70';

const AdminSidebar = (active) => {
    // Get Current User from Store
    const currentStore = window.Store || Store;
    const user = currentStore.getUser();

    // Default to empty if no user (should not happen in admin routes due to guard, but safe)
    const role = user ? user.role : 'guest';
    const permissions = user ? (user.permissions || []) : [];

    // Define Links with Visibility Logic
    // Logic:
    // - admin: SEE ALL
    // - sub-admin: See Products, Orders, Users, Partners (maybe), Logs
    // - support: See Orders, Users
    // - finance: See Orders, Dashboard

    // We can also use specific permissions if available, but Role-based is simpler for this requirement.

    const allLinks = [
        { name: 'Dashboard', href: '#/admin', icon: '📊', roles: ['admin', 'sub-admin', 'finance'] },
        { name: 'Products', href: '#/admin/products', icon: '📦', roles: ['admin', 'sub-admin', 'vendor'] },
        { name: 'Orders', href: '#/admin/orders', icon: '🛒', roles: ['admin', 'sub-admin', 'support', 'finance'] },
        { name: 'Users', href: '#/admin/users', icon: '👥', roles: ['admin', 'sub-admin', 'support'] },
        { name: 'Partners', href: '#/admin/partners', icon: '🤝', roles: ['admin', 'sub-admin'] },
        { name: 'Vendors', href: '#/admin/vendors', icon: '🏪', roles: ['admin', 'sub-admin'] },
        { name: 'Marketing', href: '#/admin/marketing', icon: '📢', roles: ['admin', 'sub-admin'] },
        { name: 'CMS', href: '#/admin/cms', icon: '📝', roles: ['admin', 'sub-admin'] },
        { name: 'Reviews', href: '#/admin/reviews', icon: '⭐', roles: ['admin', 'sub-admin', 'support'] },
        { name: 'Reports', href: '#/admin/reports', icon: '📊', roles: ['admin', 'finance'] },
        { name: 'Settings', href: '#/admin/settings', icon: '⚙️', roles: ['admin'] },
        { name: 'Support', href: '#/admin/support', icon: '💬', roles: ['admin', 'support'] },
        { name: 'Logs', href: '#/admin/logs', icon: '📜', roles: ['admin', 'sub-admin'] } // Only admins see logs
    ];

    const visibleLinks = allLinks.filter(link => {
        if (link.roles.includes('all')) return true;
        return link.roles.includes(role);
    });

    return `
        <aside class="admin-sidebar" style="width: 250px; background: var(--color-bg-secondary); padding: 2rem; border-right: 1px solid var(--color-bg-tertiary); display: flex; flex-direction: column;">
            <h3 style="margin-bottom: 2rem; color: var(--color-accent);">Admin Panel</h3>
            <div style="margin-bottom: 2rem; padding: 1rem; background: var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                <div style="font-weight: 500;">${user ? user.name : 'User'}</div>
                <div style="font-size: 0.8rem; color: var(--color-text-secondary); text-transform: capitalize;">${role}</div>
            </div>
            <nav style="flex: 1;">
                <ul style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${visibleLinks.map(link => `
                        <li>
                            <a href="${link.href}" 
                               class="admin-nav-link ${active === link.name ? 'active' : ''}"
                               style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: var(--radius-md); color: var(--color-text-secondary); transition: all 0.2s; ${active === link.name ? 'background: var(--color-accent); color: white;' : ''}">
                                <span>${link.icon}</span>
                                <span>${link.name}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
        </aside>
    `;
};

export default AdminSidebar;
