import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminAnalytics = async () => {
    const currentStore = window.Store || Store;

    window.renderAnalyticsPage = () => {
        const container = document.getElementById('analytics-content');
        if (!container) return;

        const data = currentStore.getAnalytics();

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="card" style="padding: 1.5rem; text-align: center;">
                    <h4 style="margin: 0; color: var(--color-text-secondary);">Total Sales</h4>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-accent); margin-top: 0.5rem;">$${data.totalSales.toFixed(2)}</div>
                </div>
                <div class="card" style="padding: 1.5rem; text-align: center;">
                    <h4 style="margin: 0; color: var(--color-text-secondary);">Total Orders</h4>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-top: 0.5rem;">${data.orderCount}</div>
                </div>
                <div class="card" style="padding: 1.5rem; text-align: center;">
                    <h4 style="margin: 0; color: var(--color-text-secondary);">Active Vendors</h4>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-top: 0.5rem;">${data.vendorCount}</div>
                </div>
                <div class="card" style="padding: 1.5rem; text-align: center;">
                    <h4 style="margin: 0; color: var(--color-text-secondary);">Products</h4>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-top: 0.5rem;">${data.productCount}</div>
                </div>
            </div>

            <div class="card" style="padding: 2rem;">
                <h3 style="margin-top: 0; margin-bottom: 1.5rem;">Weekly Sales Overview</h3>
                <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 300px; padding-top: 2rem;">
                    ${data.weeklySales.map((val, index) => {
            const max = Math.max(...data.weeklySales);
            const height = (val / max) * 100;
            return `
                            <div style="display: flex; flex-direction: column; align-items: center; width: 10%;">
                                <div style="width: 100%; background: var(--color-accent); border-radius: 4px 4px 0 0; height: ${height}%; opacity: 0.8; transition: height 0.3s;"></div>
                                <span style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--color-text-secondary);">Day ${index + 1}</span>
                                <span style="font-size: 0.8rem; font-weight: 500;">$${val}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    };

    setTimeout(() => window.renderAnalyticsPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Reports')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="margin-bottom: 2rem;">
                    <h2>Reports & Analytics</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Business performance insights</p>
                </header>
                <div id="analytics-content"></div>
            </div>
        </div>
    `;
};

export default AdminAnalytics;
