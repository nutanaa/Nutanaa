import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminSupport = async () => {
    const currentStore = window.Store || Store;
    window.currentSupportView = 'tickets'; // tickets, notifications

    window.renderSupportPage = () => {
        const container = document.getElementById('support-content');
        if (!container) return;

        if (window.currentSupportView === 'tickets') {
            const tickets = currentStore.getTickets();
            container.innerHTML = `
                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">ID</th>
                                <th style="padding: 1rem;">User</th>
                                <th style="padding: 1rem;">Subject</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tickets.map(t => `
                                <tr>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${t.id}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); color: var(--color-text-secondary);">${t.userId}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-weight: 500;">${t.subject}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        <span style="padding: 2px 8px; border-radius: 99px; font-size: 0.8rem; background: ${t.status === 'Open' ? '#fee2e2' : '#d1fae5'}; color: ${t.status === 'Open' ? '#991b1b' : '#065f46'};">
                                            ${t.status}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        ${t.status === 'Open' ? `
                                            <button onclick="window.resolveTicket('${t.id}')" class="btn-sm" style="background: var(--color-accent); color: white;">Resolve</button>
                                        ` : '<span style="color: #aaa;">Closed</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            const notifications = currentStore.getNotifications();
            container.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${notifications.map(n => `
                        <div class="card" style="padding: 1rem; border-left: 4px solid ${n.type === 'warning' ? '#f59e0b' : '#3b82f6'}; display: flex; justify-content: space-between; align-items: center; opacity: ${n.read ? 0.6 : 1};">
                            <div>
                                <h4 style="margin: 0; font-size: 1rem;">${n.message}</h4>
                                <span style="font-size: 0.8rem; color: var(--color-text-secondary);">${n.date}</span>
                            </div>
                            ${!n.read ? `<button onclick="window.markRead(${n.id})" class="btn-sm" style="background: var(--color-bg-tertiary); color: var(--color-text-primary);">Mark Read</button>` : '<span>✓</span>'}
                        </div>
                    `).join('')}
                </div>
            `;
        }
    };

    window.setSupportView = (view) => {
        window.currentSupportView = view;
        window.renderSupportPage();
        updateTabStyles();
    };

    window.resolveTicket = (id) => {
        if (confirm('Mark this ticket as Resolved?')) {
            currentStore.updateTicketStatus(id, 'Resolved');
            window.renderSupportPage();
        }
    };

    window.markRead = (id) => {
        currentStore.markNotificationRead(id);
        window.renderSupportPage();
    };

    const updateTabStyles = () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.view === window.currentSupportView) {
                btn.style.borderBottom = '2px solid var(--color-accent)';
                btn.style.color = 'var(--color-accent)';
            } else {
                btn.style.borderBottom = 'none';
                btn.style.color = 'var(--color-text-secondary)';
            }
        });
    };

    setTimeout(() => window.renderSupportPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Support')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="margin-bottom: 2rem;">
                    <h2>Help & Support</h2>
                </header>
                
                <div style="border-bottom: 1px solid var(--color-bg-tertiary); margin-bottom: 2rem; display: flex; gap: 1.5rem;">
                    <button class="tab-btn" data-view="tickets" onclick="window.setSupportView('tickets')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; border-bottom: 2px solid var(--color-accent); color: var(--color-accent);">Support Tickets</button>
                    <button class="tab-btn" data-view="notifications" onclick="window.setSupportView('notifications')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; color: var(--color-text-secondary);">System Notifications</button>
                </div>

                <div id="support-content"></div>
            </div>
        </div>
    `;
};

export default AdminSupport;
