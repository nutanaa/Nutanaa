import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=49';

const AdminUsers = async () => {
    // Get latest users
    const users = Store.getAllUsers();

    // Helper for refreshing list
    window.renderUserList = () => {
        const list = document.getElementById('user-list-body');
        if (!list) return; // Guard for page switch

        // Re-fetch to be safe
        const currentUsers = Store.getAllUsers();

        list.innerHTML = currentUsers.map(user => {
            const hasFranchiseAccess = user.permissions && user.permissions.includes('register_franchise');
            const isFranchisee = user.role === 'franchisee';
            const isAdmin = user.role === 'admin';

            return `
                 <tr style="border-bottom: 1px solid var(--color-bg-tertiary);">
                    <td style="padding: 1rem;">
                        <div style="font-weight: 500;">${user.name}</div>
                        <div style="font-size: 0.85rem; color: var(--color-text-secondary);">${user.email}</div>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; background: var(--color-bg-tertiary);">
                            ${user.role}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                         ${isAdmin ? '<span style="color: var(--color-text-secondary);">Full Access</span>' : `
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button onclick="window.toggleUserPermission('${user.email}', 'register_franchise')" 
                                    class="btn" 
                                    style="padding: 0.25rem 0.75rem; font-size: 0.8rem; background: ${hasFranchiseAccess ? '#dcfce7' : 'var(--color-bg-tertiary)'}; color: ${hasFranchiseAccess ? '#166534' : 'var(--color-text-primary)'}; border: 1px solid ${hasFranchiseAccess ? '#166534' : 'transparent'};">
                                    ${hasFranchiseAccess ? '✅ Access Granted' : 'Grant Access'}
                                </button>
                            </div>
                         `}
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.toggleUserPermission = (email, permission) => {
        const user = Store.getAllUsers().find(u => u.email === email);
        if (!user) return;

        const hasPermission = user.permissions && user.permissions.includes(permission);

        if (hasPermission) {
            Store.revokePermission(email, permission);
        } else {
            Store.grantPermission(email, permission);
        }

        // Refresh UI
        window.renderUserList();
    };

    setTimeout(() => {
        window.renderUserList();
    }, 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Users')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>User Management</h2>
                    <button class="btn" onclick="alert('Add User feature to be implemented')">Add New User</button>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">User</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Role</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Franchise Registration Access</th>
                            </tr>
                        </thead>
                        <tbody id="user-list-body">
                            <!-- Populated by JS -->
                            <tr><td colspan="3" style="padding: 2rem; text-align: center;">Loading users...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default AdminUsers;
