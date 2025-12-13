import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=50';

const AdminOrders = async () => {
    // Helper functionality setup after render
    setTimeout(() => {
        window.handleAdminOrder = (id, action) => {
            if (action === 'cancel') {
                if (Store.cancelOrder(id)) {
                    alert(`Order ${id} cancelled.`);
                    // In a real app we'd re-render, but for now we reload or just alert
                    window.location.reload();
                } else {
                    alert('Could not cancel order.');
                }
            } else if (action === 'ship') {
                alert('Shipping logic mocked: Order marked as Shipped.');
                // Update store mock directly for demo
                const order = Store.orders.find(o => o.id === id);
                if (order) order.status = 'Shipped';
                window.location.reload();
            }
        };
    }, 100);

    const renderRows = () => {
        const orders = Store.getOrders('all');

        return orders.map(order => `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="font-weight: 500;">${order.id}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${order.userId}</div>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${order.date}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">$${order.total.toFixed(2)}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <span style="
                        padding: 0.25rem 0.75rem; 
                        border-radius: 999px; 
                        font-size: 0.85rem; 
                        background: ${getStatusBg(order.status)}; 
                        color: ${getStatusColor(order.status)};
                    ">
                        ${order.status}
                    </span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="display: flex; gap: 0.5rem;">
                         ${order.status === 'Processing' ? `
                             <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: #3b82f6;"
                                onclick="window.handleAdminOrder('${order.id}', 'ship')">
                                Ship
                             </button>
                             <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: #ef4444;"
                                onclick="window.handleAdminOrder('${order.id}', 'cancel')">
                                Cancel
                             </button>
                         ` : '<span style="color: var(--color-text-secondary); font-size: 0.9rem;">View Details</span>'}
                    </div>
                </td>
            </tr>
        `).join('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#166534'; // darker green
            case 'Processing': return '#1e40af'; // darker blue
            case 'Shipped': return '#5b21b6'; // darker purple
            case 'Cancelled': return '#991b1b'; // darker red
            case 'Returned': return '#92400e'; // darker amber
            default: return '#475569';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'Delivered': return '#dcfce7';
            case 'Processing': return '#dbeafe';
            case 'Shipped': return '#f3e8ff';
            case 'Cancelled': return '#fee2e2';
            case 'Returned': return '#fef3c7';
            default: return '#f1f5f9';
        }
    };

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Orders')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Order Management</h2>
                     <div style="display: flex; gap: 1rem;">
                        <button class="btn" style="background: var(--color-bg-tertiary);">Filter by Status</button>
                    </div>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background-color: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">Order ID</th>
                                <th style="padding: 1rem;">Date</th>
                                <th style="padding: 1rem;">Total</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default AdminOrders;
