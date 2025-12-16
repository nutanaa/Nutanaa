import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=61';

const AdminFranchise = async () => {
    // Ensuring we render with latest state
    const currentStore = window.Store || Store;

    // Helper for refreshing list
    window.renderFranchiseList = () => {
        const list = document.getElementById('franchise-list-body');
        if (!list) return;

        const allUsers = currentStore.getAllUsers();

        // Logic: Users who are 'franchisee' OR have permissions OR have KYC docs OR have 'franchise'/'partner' in name
        const filteredUsers = allUsers.filter(u =>
            u.role === 'franchisee' ||
            (u.permissions && u.permissions.includes('register_franchise')) ||
            currentStore.getFranchiseDocuments(u.email).length > 0 ||
            u.name.toLowerCase().includes('franchise') ||
            u.name.toLowerCase().includes('partner')
        );

        if (filteredUsers.length === 0) {
            list.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">No franchise partners found.</td></tr>`;
            return;
        }

        list.innerHTML = filteredUsers.map(user => {
            const kycStatus = currentStore.getKYCStatus(user.email);
            const docs = currentStore.getFranchiseDocuments(user.email);
            const statusColor = kycStatus === 'Verified' ? 'var(--color-success)' : kycStatus === 'Rejected' ? 'var(--color-danger)' : 'var(--color-warning)';

            return `
                <tr style="border-bottom: 1px solid var(--color-bg-tertiary);">
                    <td style="padding: 1rem;">
                        <div style="font-weight: 500;">${user.name}</div>
                        <div style="font-size: 0.85rem; color: var(--color-text-secondary);">${user.email}</div>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                            ${kycStatus}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                            ${docs.length > 0 ?
                    `<div style="display: flex; flex-direction: column; gap: 0.25rem;">
                                ${docs.map(d => `<a href="${d.url}" target="_blank" style="font-size: 0.85rem; color: var(--color-accent); text-decoration: underline;">${d.type} (${d.status})</a>`).join('')}
                                </div>`
                    : '<span style="color: var(--color-text-secondary); font-size: 0.85rem;">No Docs Submitted</span>'}
                    </td>
                    <td style="padding: 1rem;">
                        <div style="display: flex; gap: 0.5rem;">
                            ${kycStatus === 'Pending' || kycStatus === 'Incomplete' ? `
                                <button onclick="window.updateKYC('${user.email}', 'Verified')" class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--color-success);">Verify All</button>
                                <button onclick="window.updateKYC('${user.email}', 'Rejected')" class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--color-danger);">Reject All</button>
                            ` : '<span style="font-size: 0.85rem; color: var(--color-text-secondary);">Processed</span>'}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    window.updateKYC = (email, status) => {
        const currentStore = window.Store || Store;
        const docs = currentStore.getFranchiseDocuments(email);
        docs.forEach(d => {
            currentStore.updateFranchiseDocumentStatus(email, d.type, status);
        });
        // If Verified, maybe upgrade role?
        if (status === 'Verified') {
            const user = currentStore.getAllUsers().find(u => u.email === email);
            if (user && user.role !== 'franchisee') {
                user.role = 'franchisee';
                currentStore.saveUsers();
            }
        }
        window.renderFranchiseList();
    };

    setTimeout(() => {
        window.renderFranchiseList();
    }, 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Partners')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                    <h2>Franchise Partners & KYC</h2>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Partner</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">KYC Status</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Documents</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="franchise-list-body">
                            <!-- Populated by JS -->
                            <tr><td colspan="4" style="padding: 2rem; text-align: center;">Loading partners...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default AdminFranchise;
