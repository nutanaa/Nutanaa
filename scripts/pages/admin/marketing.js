import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminMarketing = async () => {
    const currentStore = window.Store || Store;

    window.renderMarketingPage = () => {
        const container = document.getElementById('marketing-content');
        if (!container) return;

        const coupons = currentStore.getPromotions();

        container.innerHTML = `
            ${renderCreateForm()}
            <div class="card" style="padding: 0; overflow: hidden; margin-top: 2rem;">
                <h3 style="padding: 1.5rem; margin: 0; border-bottom: 1px solid var(--color-bg-tertiary);">Active Campaigns</h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Code</th>
                            <th style="padding: 1rem;">Discount</th>
                            <th style="padding: 1rem;">Type</th>
                            <th style="padding: 1rem;">Expiry</th>
                            <th style="padding: 1rem;">Usage</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${coupons.map(c => `
                            <tr>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-weight: 700; color: var(--color-accent);">
                                    ${c.code}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${c.discount}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${c.type}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${c.expiry}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${c.usageCount}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <button onclick="window.deleteCoupon(${c.id})" class="btn-sm" style="background: #ef4444;">Delete</button>
                                </td>
                            </tr>
                        `).join('')}
                         ${coupons.length === 0 ? '<tr><td colspan="6" style="padding: 2rem; text-align: center;">No active promotions.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderCreateForm = () => `
        <div class="card" style="padding: 1.5rem;">
            <h3 style="margin-top: 0;">Create New Coupon</h3>
            <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                <div>
                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Coupon Code</label>
                    <input type="text" id="couponCode" placeholder="e.g. SALE2025" style="padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Discount Value</label>
                    <input type="number" id="couponValue" placeholder="e.g. 20" style="padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px; width: 80px;">
                </div>
                <div>
                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Type</label>
                    <select id="couponType" style="padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                        <option value="percent">% Percentage</option>
                        <option value="fixed">$ Fixed Amount</option>
                    </select>
                </div>
                 <div>
                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Expiry Date</label>
                    <input type="date" id="couponExpiry" style="padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                </div>
                <button onclick="window.createCoupon()" class="btn" style="background: var(--color-accent); color: white; height: 38px;">Create Coupon</button>
            </div>
        </div>
    `;

    window.createCoupon = () => {
        const code = document.getElementById('couponCode').value.toUpperCase();
        const discount = document.getElementById('couponValue').value;
        const type = document.getElementById('couponType').value;
        const expiry = document.getElementById('couponExpiry').value;

        if (!code || !discount || !expiry) return alert('Please fill all fields');

        if (currentStore.createCoupon({ code, discount, type, expiry })) {
            alert('Coupon Created!');
            window.renderMarketingPage();
        } else {
            alert('Error: Coupon Code may already exist.');
        }
    };

    window.deleteCoupon = (id) => {
        if (confirm('Delete this coupon?')) {
            currentStore.deleteCoupon(id);
            window.renderMarketingPage();
        }
    };

    setTimeout(() => window.renderMarketingPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Marketing')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="margin-bottom: 2rem;">
                    <h2>Marketing & Promotions</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Manage discount codes and campaigns</p>
                </header>
                <div id="marketing-content"></div>
            </div>
        </div>
    `;
};

export default AdminMarketing;
