import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=70';

const AdminLogs = async () => {
    // Helper for refreshing list
    window.renderLogList = () => {
        const list = document.getElementById('log-list-body');
        if (!list) return;

        const currentStore = window.Store || Store;
        const logs = currentStore.getLogs();

        if (logs.length === 0) {
            list.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-secondary);">No activity recorded yet.</td></tr>`;
            return;
        }

        list.innerHTML = logs.map(log => `
            <tr style="border-bottom: 1px solid var(--color-bg-tertiary);">
                <td style="padding: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;">
                    ${new Date(log.timestamp).toLocaleString()}
                </td>
                <td style="padding: 1rem; font-weight: 500;">
                    ${log.email}
                </td>
                <td style="padding: 1rem;">
                    <span style="display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: var(--color-bg-tertiary); font-weight: 500;">
                        ${log.action}
                    </span>
                </td>
                <td style="padding: 1rem; color: var(--color-text-primary);">
                    ${log.details}
                </td>
            </tr>
        `).join('');
    };

    setTimeout(() => {
        window.renderLogList();
    }, 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Logs')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
                    <h2>System Activity Logs</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Monitor user logins and actions</p>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Timestamp</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">User</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Action</th>
                                <th style="padding: 1rem; font-weight: 500; color: var(--color-text-secondary);">Details</th>
                            </tr>
                        </thead>
                        <tbody id="log-list-body">
                            <!-- Populated by JS -->
                            <tr><td colspan="4" style="padding: 2rem; text-align: center;">Loading logs...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default AdminLogs;
