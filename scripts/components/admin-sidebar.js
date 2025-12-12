const AdminSidebar = (active) => {
    const links = [
        { name: 'Dashboard', href: '#/admin', icon: '📊' },
        { name: 'Products', href: '#/admin/products', icon: '📦' },
        { name: 'Orders', href: '#/admin/orders', icon: '🛒' },
        { name: 'Users', href: '#/admin/users', icon: '👥' },
        { name: 'KYC Verify', href: '#/admin/kyc', icon: '✅' },
        { name: 'Logout', href: '#/', icon: '🚪' }
    ];

    return `
        <aside class="admin-sidebar" style="width: 250px; background: var(--color-bg-secondary); padding: 2rem; border-right: 1px solid var(--color-bg-tertiary); display: flex; flex-direction: column;">
            <h3 style="margin-bottom: 2rem; color: var(--color-accent);">Admin Panel</h3>
            <nav style="flex: 1;">
                <ul style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${links.map(link => `
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
