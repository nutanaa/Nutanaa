import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminOrders = async () => {
    window.currentOrderTab = 'all'; // all, pending, returns
    const currentStore = window.Store || Store;

    // Actions
    window.handleOrderAction = (id, action) => {
        const currentStore = window.Store || Store;

        if (action === 'ship') {
            const carrier = prompt("Enter Shipping Carrier (e.g. FedEx, DHL):");
            if (!carrier) return;
            const tracking = prompt("Enter Tracking Number:");
            if (!tracking) return;
            currentStore.updateOrderStatus(id, 'Shipped', { carrier, tracking });
        } else if (action === 'deliver') {
            currentStore.updateOrderStatus(id, 'Delivered');
        } else if (action === 'cancel') {
            if (confirm('Cancel this order?')) currentStore.cancelOrder(id);
        } else if (action === 'return_request_mock') {
            // Mocking User Action
            currentStore.requestReturn(id, 'Product damaged in transit');
            alert('Return Requested (Simulated User Action)');
        } else if (action === 'return_approve') {
            currentStore.processReturn(id, 'Approve');
        } else if (action === 'return_reject') {
            currentStore.processReturn(id, 'Reject');
        } else if (action === 'refund') {
            if (confirm('Process Refund for this order?')) currentStore.processReturn(id, 'Refund');
        }
        window.renderOrderPage();
    };

    window.setOrderTab = (tab) => {
        window.currentOrderTab = tab;
        window.renderOrderPage();
    };

    window.renderOrderPage = () => {
        const container = document.getElementById('orders-content');
        if (!container) return;

        // Update Tabs Styles
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === window.currentOrderTab) {
                btn.style.borderBottom = '2px solid var(--color-accent)';
                btn.style.color = 'var(--color-accent)';
            } else {
                btn.style.borderBottom = 'none';
                btn.style.color = 'var(--color-text-secondary)';
            }
        });

        // Fetch Data
        const orders = currentStore.getOrders(window.currentOrderTab);

        if (orders.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 2rem;">No orders found.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background-color: var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Order ID</th>
                            <th style="padding: 1rem;">Customer</th>
                            <th style="padding: 1rem;">Total</th>
                            <th style="padding: 1rem;">Status</th>
                            <th style="padding: 1rem;">Return Info</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(o => `
                            <tr>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <strong>${o.id}</strong>
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${o.userId}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">$${o.total.toFixed(2)}</td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <span style="padding: 2px 8px; border-radius: 99px; font-size: 0.8rem; background: ${getStatusBg(o.status)}; color: ${getStatusColor(o.status)};">
                                        ${o.status}
                                    </span>
                                </td>
                                 <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-size: 0.85rem; color: var(--color-text-secondary);">
                                    ${o.returnReason || '-'}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${renderActions(o)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                 ${window.currentOrderTab === 'all' ? '<div style="padding:1rem; text-align:right;"><button class="btn-sm" onclick="window.handleOrderAction(\'ORD-002\', \'return_request_mock\')">Simulate Return on ORD-002</button></div>' : ''}
            </div>
        `;
    };

    // Invoice Generator
    window.generateInvoice = (orderId) => {
        const currentStore = window.Store || Store;
        const order = currentStore.state.orders.find(o => o.id === orderId);
        if (!order) return;

        const invoiceWindow = window.open('', '_blank', 'width=800,height=600');
        invoiceWindow.document.write(`
            <html>
            <head>
                <title>Invoice #${order.id}</title>
                <style>
                    body { font-family: sans-serif; padding: 2rem; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 2rem; border-bottom: 2px solid #333; padding-bottom: 1rem; }
                    .details { margin-bottom: 2rem; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border-bottom: 1px solid #ddd; padding: 0.5rem; text-align: left; }
                    .total { text-align: right; font-size: 1.5rem; font-weight: bold; margin-top: 1rem; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>INVOICE</h1>
                        <p>Nutanaa Marketplace</p>
                    </div>
                    <div style="text-align: right;">
                        <h3>#${order.id}</h3>
                        <p>Date: ${order.date}</p>
                        <p>Status: ${order.status}</p>
                    </div>
                </div>
                <div class="details">
                    <p><strong>Bill To:</strong> ${order.userId}</p>
                    ${order.shipping ? `<p><strong>Tracking:</strong> ${order.shipping.carrier} - ${order.shipping.tracking}</p>` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items ? order.items.map(i => `<tr><td>${i.name}</td><td>$${i.price.toFixed(2)}</td></tr>`).join('') : '<tr><td>Item Details Unavailable</td><td>-</td></tr>'}
                    </tbody>
                </table>
                <div class="total">
                    Total: $${order.total.toFixed(2)}
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
    };

    const renderActions = (order) => {
        if (order.status === 'Processing') {
            return `
                <button class="btn-sm" style="background:#3b82f6;" onclick="window.handleOrderAction('${order.id}', 'ship')">Ship</button>
                <button class="btn-sm" style="background:#ef4444;" onclick="window.handleOrderAction('${order.id}', 'cancel')">Cancel</button>
            `;
        }
        if (order.status === 'Shipped') {
            return `<button class="btn-sm" style="background:#10b981;" onclick="window.handleOrderAction('${order.id}', 'deliver')">Mark Delivered</button>`;
        }
        if (order.status === 'Return Requested') {
            return `
                <button class="btn-sm" style="background:#10b981;" onclick="window.handleOrderAction('${order.id}', 'return_approve')">Approve</button>
                <button class="btn-sm" style="background:#ef4444;" onclick="window.handleOrderAction('${order.id}', 'return_reject')">Reject</button>
             `;
        }
        if (order.status === 'Return Approved') {
            return `<button class="btn-sm" style="background:#f59e0b;" onclick="window.handleOrderAction('${order.id}', 'refund')">Refund</button>`;
        }
        return `<button class="btn-sm" style="background:transparent; color:#888; border:1px solid #ccc;" onclick="window.generateInvoice('${order.id}')">View Invoice</button>`;
    };

    const getStatusBg = (s) => (['Processing'].includes(s) ? '#dbeafe' : ['Shipped', 'Delivered'].includes(s) ? '#d1fae5' : ['Cancelled', 'Returned'].includes(s) ? '#fee2e2' : '#f3f4f6');
    const getStatusColor = (s) => (['Processing'].includes(s) ? '#1e40af' : ['Shipped', 'Delivered'].includes(s) ? '#065f46' : ['Cancelled', 'Returned'].includes(s) ? '#991b1b' : '#374151');

    // Initial Render
    setTimeout(() => window.renderOrderPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Orders')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Order Management</h2>
                    <button class="btn" onclick="alert('Manual Order Creation Mock')">+ Create Order</button>
                </header>

                <div style="border-bottom: 1px solid var(--color-bg-tertiary); margin-bottom: 1.5rem; display: flex; gap: 1.5rem;">
                    <button class="tab-btn" data-tab="all" onclick="window.setOrderTab('all')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">All Orders</button>
                    <button class="tab-btn" data-tab="pending" onclick="window.setOrderTab('pending')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">Pending</button>
                    <button class="tab-btn" data-tab="returns" onclick="window.setOrderTab('returns')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">Returns & Disputes</button>
                </div>

                <div id="orders-content">
                    <!-- Dynamic Content -->
                </div>
            </div>
        </div>
    `;
};

export default AdminOrders;
