import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=51';

const AdminDashboard = async () => {
    // Delayed Chart Rendering
    setTimeout(() => {
        const canvas = document.getElementById('salesChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#1a1d24'; // secondary bg
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Simple Line Chart Drawing
            const data = [10, 25, 18, 50, 60, 45, 80];
            const max = Math.max(...data);
            const stepX = canvas.width / (data.length - 1);
            const scaleY = (canvas.height - 40) / max; // -40 for padding

            ctx.beginPath();
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.moveTo(0, canvas.height - (data[0] * scaleY));

            data.forEach((val, index) => {
                const x = index * stepX;
                const y = canvas.height - (val * scaleY) - 20;
                ctx.lineTo(x, y);
            });
            ctx.stroke();

            // Dots
            ctx.fillStyle = '#fff';
            data.forEach((val, index) => {
                const x = index * stepX;
                const y = canvas.height - (val * scaleY) - 20;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }, 100);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Dashboard')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Overview</h2>
                    <div style="display: flex; gap: 1rem;">
                         <button class="btn" style="background: var(--color-bg-tertiary);" onclick="
                            import('../../utils.js').then(m => m.downloadCSV([
                                { date: '2024-11-01', sales: 1200, visitors: 450 },
                                { date: '2024-11-02', sales: 1500, visitors: 500 }
                            ], 'sales_report.csv'))
                         ">Export Report</button>
                    </div>
                </header>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="card stat-card">
                        <h4 style="color: var(--color-text-secondary); font-size: 0.9rem;">Total Sales</h4>
                        <div style="font-size: 2rem; font-weight: bold;">$24,500</div>
                        <div style="color: var(--color-success); font-size: 0.8rem;">+12% from last month</div>
                    </div>
                    <div class="card stat-card">
                        <h4 style="color: var(--color-text-secondary); font-size: 0.9rem;">New Users</h4>
                        <div style="font-size: 2rem; font-weight: bold;">1,204</div>
                        <div style="color: var(--color-success); font-size: 0.8rem;">+5% from last month</div>
                    </div>
                    <div class="card stat-card">
                        <h4 style="color: var(--color-text-secondary); font-size: 0.9rem;">Pending Orders</h4>
                        <div style="font-size: 2rem; font-weight: bold;">38</div>
                        <div style="color: var(--color-warning); font-size: 0.8rem;">Action required</div>
                    </div>
                    <div class="card stat-card">
                        <h4 style="color: var(--color-text-secondary); font-size: 0.9rem;">Pending KYC</h4>
                        <div style="font-size: 2rem; font-weight: bold;">5</div>
                        <div style="color: var(--color-accent); font-size: 0.8rem;">Review needed</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <!-- Chart Section -->
                    <div class="card">
                        <h3>Sales Trends</h3>
                        <canvas id="salesChart" width="600" height="300" style="width: 100%; height: auto; border-radius: 4px;"></canvas>
                    </div>

                    <!-- Recent Activity -->
                    <div class="card">
                        <h3>Recent Activity</h3>
                        <ul style="margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                            <li style="border-bottom: 1px solid var(--color-bg-primary); padding-bottom: 0.5rem;">
                                <div style="font-weight: 500;">User Registration</div>
                                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">John Doe joined as User</div>
                            </li>
                            <li style="border-bottom: 1px solid var(--color-bg-primary); padding-bottom: 0.5rem;">
                                <div style="font-weight: 500;">Order #1234</div>
                                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">Shipped via FedEx</div>
                            </li>
                            <li>
                                <div style="font-weight: 500;">KYC Submitted</div>
                                <div style="font-size: 0.8rem; color: var(--color-text-secondary);">Franchise A submission</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default AdminDashboard;
