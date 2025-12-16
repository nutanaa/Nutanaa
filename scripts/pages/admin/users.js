import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=61';

const AdminUsers = async () => {
    const currentStore = window.Store || Store;

    window.renderUserList = () => {
        const list = document.getElementById('user-list-body');
        if (!list) return;

        const allUsers = currentStore.getAllUsers();
        // Filter for NON-franchise users (Admins + Regular Customers)
        const filteredUsers = allUsers.filter(u =>
            (u.role === 'user' || u.role === 'admin') &&
            !u.permissions?.includes('register_franchise') &&
            currentStore.getFranchiseDocuments(u.email).length === 0 &&
            !u.name.toLowerCase().includes('franchise') &&
            !u.name.toLowerCase().includes('partner')
        );

        if (filteredUsers.length === 0) {
            list.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">No registered customers found.</td></tr>`;
            return;
        }

        list.innerHTML = filteredUsers.map(user => {
            return `
                     <tr style="border-bottom: 1px solid var(--color-bg-tertiary);">
                        <td style="padding: 1rem; font-weight: 500;">${user.name}</td>
                        <td style="padding: 1rem; color: var(--color-text-secondary);">${user.email}</td>
                        <td style="padding: 1rem;">
                            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; background: var(--color-bg-tertiary);">
                                ${user.role}
                            </span>
                        </td>
                     <td style="padding: 1rem; display: flex; gap: 0.5rem;">
                             <button onclick="window.viewUserOrders('${user.email}')" 
                                class="btn-sm" 
                                style="background: var(--color-accent); color: white;">
                                History
                            </button>
                             <button onclick="window.toggleUserPermission('${user.email}', 'register_franchise')" 
                                class="btn-sm" 
                                style="background: var(--color-bg-tertiary); color: var(--color-text-primary);">
                                Grant Franchise
                            </button>
                        </td>
                    </tr>
                `;
        }).join('');
    };

    window.toggleUserPermission = (email, permission) => {
        const currentStore = window.Store || Store;
        const user = currentStore.getAllUsers().find(u => u.email === email);
        if (!user) return;
        const hasPermission = user.permissions && user.permissions.includes(permission);
        if (hasPermission) currentStore.revokePermission(email, permission);
        else currentStore.grantPermission(email, permission);
        window.renderUserList();
    };

    setTimeout(() => {
        window.renderUserList();
    }, 50);

    window.viewUserOrders = (email) => {
        const currentStore = window.Store || Store;
        const orders = currentStore.getOrders('all').filter(o => o.userId === email);

        const modal = document.getElementById('userModal');
        const content = document.getElementById('userModalContent');

        let html = `<h3>Order History: ${email}</h3>`;

        if (orders.length === 0) {
            html += '<p>No orders found for this user.</p>';
        } else {
            html += `
                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 1rem;">
                    <thead>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <th style="padding: 0.5rem;">ID</th>
                            <th style="padding: 0.5rem;">Date</th>
                            <th style="padding: 0.5rem;">Status</th>
                            <th style="padding: 0.5rem;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 0.5rem;">${o.id}</td>
                                <td style="padding: 0.5rem;">${o.date}</td>
                                <td style="padding: 0.5rem;">${o.status}</td>
                                <td style="padding: 0.5rem;">$${o.total.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }

        content.innerHTML = html;
        modal.style.display = 'flex';
    };

    window.closeUserModal = () => {
        document.getElementById('userModal').style.display = 'none';
    };

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Users')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                    <h2>User Management</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Manage registered customers</p>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">User</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Email</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Role</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="user-list-body">
                            <!-- Populated by JS -->
                            <tr><td colspan="4" style="padding: 2rem; text-align: center;">Loading users...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- User Modal -->
            <div id="userModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
                 <div class="card" style="background-color: var(--color-bg-secondary); width: 100%; max-width: 600px; padding: 2rem; position: relative;">
                    <button onclick="window.closeUserModal()" style="position: absolute; right: 1rem; top: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    <div id="userModalContent"></div>
                 </div>
            </div>
        </div>
    `;
};

export default AdminUsers;
