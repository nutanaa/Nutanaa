import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=74';

const AdminVendors = async () => {
    // Helper to update the view
    window.currentSection = 'list'; // list, onboarding, payouts

    window.renderVendorView = () => {
        const container = document.getElementById('vendor-content-area');
        if (!container) return;

        const currentStore = window.Store || Store;
        const vendors = currentStore.getVendors();

        if (window.currentSection === 'list') {
            container.innerHTML = renderVendorList(vendors);
        } else if (window.currentSection === 'onboarding') {
            container.innerHTML = renderOnboarding(vendors);
        } else if (window.currentSection === 'payouts') {
            container.innerHTML = renderPayouts(vendors);
        }
    };

    const renderVendorList = (vendors) => {
        const activeVendors = vendors.filter(v => v.status !== 'Pending');
        return `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-secondary); border-bottom: 1px solid var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Shop Name</th>
                            <th style="padding: 1rem;">Email</th>
                            <th style="padding: 1rem;">Status</th>
                            <th style="padding: 1rem;">Commission</th>
                            <th style="padding: 1rem;">Metrics</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeVendors.map(v => `
                            <tr style="border-bottom: 1px solid var(--color-bg-tertiary);">
                                <td style="padding: 1rem; font-weight: 500;">${v.shopName}</td>
                                <td style="padding: 1rem; color: var(--color-text-secondary);">${v.email}</td>
                                <td style="padding: 1rem;">
                                    <span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; background: ${v.status === 'Active' ? '#e6fffa' : '#fff5f5'}; color: ${v.status === 'Active' ? '#0d9488' : '#e11d48'};">
                                        ${v.status}
                                    </span>
                                </td>
                                <td style="padding: 1rem;">${v.commissionRate}%</td>
                                <td style="padding: 1rem; font-size: 0.9rem;">
                                    ⭐ ${v.metrics.rating} | Sales: $${v.metrics.sales}
                                </td>
                                <td style="padding: 1rem;">
                                    <button onclick="window.toggleVendorStatus('${v.email}')" class="btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--color-bg-secondary); border: 1px solid var(--color-bg-tertiary);">
                                        ${v.status === 'Active' ? 'Suspend' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                        ${activeVendors.length === 0 ? '<tr><td colspan="6" style="padding: 2rem; text-align: center;">No active vendors.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderOnboarding = (vendors) => {
        const pendingVendors = vendors.filter(v => v.status === 'Pending');
        const currentStore = window.Store || Store;

        return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${pendingVendors.length === 0 ? '<div class="card" style="padding: 2rem; text-align: center;">No pending approvals.</div>' : ''}
                ${pendingVendors.map(v => {
            const docs = currentStore.getVendorDocuments(v.email);
            return `
                    <div class="card" style="padding: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                            <div>
                                <h3 style="margin: 0;">${v.shopName}</h3>
                                <p style="color: var(--color-text-secondary); margin: 0.25rem 0 0;">${v.email} | Category: ${v.category}</p>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="window.approveVendor('${v.email}')" class="btn" style="background: var(--color-accent); color: white;">Approve Vendor</button>
                                <button onclick="window.rejectVendor('${v.email}')" class="btn" style="background: var(--color-bg-tertiary); color: var(--color-text-primary);">Reject</button>
                            </div>
                        </div>
                        
                        <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: var(--radius-sm);">
                            <h4 style="margin-top: 0; font-size: 0.9rem; margin-bottom: 0.5rem;">Submitted Documents</h4>
                            <div style="display: grid; gap: 0.5rem;">
                                ${docs.map(doc => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; background: white; padding: 0.5rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--color-bg-tertiary);">
                                        <span>${doc.type}</span>
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            <a href="#" style="color: var(--color-accent); font-size: 0.9rem;">View</a>
                                            <select onchange="window.updateDocStatus('${v.email}', '${doc.type}', this.value)" style="padding: 0.25rem; border-radius: 4px; border: 1px solid var(--color-bg-tertiary);">
                                                <option value="Pending" ${doc.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                                <option value="Verified" ${doc.status === 'Verified' ? 'selected' : ''}>Verified</option>
                                                <option value="Rejected" ${doc.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
    };

    const renderPayouts = (vendors) => {
        const currentStore = window.Store || Store;
        const user = currentStore.getUser();

        // Filter logic: Vendor sees own, Admin sees all
        let payouts = currentStore.getVendorPayouts();
        if (user.role === 'vendor') {
            payouts = payouts.filter(p => p.vendorEmail === user.email);
        }

        const vendorBalance = user.role === 'vendor' ? (vendors.find(v => v.email === user.email)?.balance || 0) : 0;

        return `
            <div style="display: flex; flex-direction: column; gap: 2rem;">
                <!-- Balance Card for Vendor -->
                ${user.role === 'vendor' ? `
                    <div class="card" style="background: linear-gradient(135deg, var(--color-accent), #4f46e5); color: white;">
                        <h3 style="margin: 0; opacity: 0.9;">Available Balance</h3>
                        <div style="font-size: 2.5rem; font-weight: 700; margin: 1rem 0;">$${vendorBalance.toFixed(2)}</div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <input type="number" id="payoutAmount" placeholder="Amount" style="padding: 0.5rem; border-radius: 4px; border: none; width: 150px;">
                            <button class="btn" onclick="window.requestPayout()" style="background: white; color: var(--color-accent);">Request Payout</button>
                        </div>
                    </div>
                ` : ''}

                <div class="card" style="padding: 0; overflow: hidden;">
                    <h3 style="padding: 1.5rem; margin: 0; border-bottom: 1px solid var(--color-bg-tertiary);">Payout History</h3>
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">ID</th>
                                <th style="padding: 1rem;">Vendor</th>
                                <th style="padding: 1rem;">Date</th>
                                <th style="padding: 1rem;">Amount</th>
                                <th style="padding: 1rem;">Status</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${payouts.map(p => `
                                <tr>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-size: 0.9rem;">${p.id}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${p.vendorEmail}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${p.date}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-weight: 500;">$${p.amount.toFixed(2)}</td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        <span style="padding: 2px 8px; border-radius: 99px; font-size: 0.8rem; background: ${p.status === 'Processed' ? '#d1fae5' : p.status === 'Rejected' ? '#fee2e2' : '#fef3c7'}; color: ${p.status === 'Processed' ? '#065f46' : p.status === 'Rejected' ? '#991b1b' : '#92400e'};">
                                            ${p.status}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        ${user.role === 'admin' && p.status === 'Pending' ? `
                                            <button class="btn-sm" style="background: #10b981;" onclick="window.processPayout('${p.id}', 'Processed')">Approve</button>
                                            <button class="btn-sm" style="background: #ef4444;" onclick="window.processPayout('${p.id}', 'Rejected')">Reject</button>
                                        ` : '<span style="color: #aaa;">-</span>'}
                                    </td>
                                </tr>
                            `).join('')}
                             ${payouts.length === 0 ? '<tr><td colspan="6" style="padding: 2rem; text-align: center;">No payout records found.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    };

    // Inline Handlers
    window.setSection = (section) => {
        window.currentSection = section;
        document.querySelectorAll('.section-tab').forEach(b => {
            b.style.borderBottom = b.dataset.section === section ? '2px solid var(--color-accent)' : 'none';
            b.style.color = b.dataset.section === section ? 'var(--color-accent)' : 'var(--color-text-secondary)';
        });
        window.renderVendorView();
    };

    window.toggleVendorStatus = (email) => {
        const store = window.Store || Store;
        const v = store.getVendors().find(v => v.email === email);
        if (v) {
            const newStatus = v.status === 'Active' ? 'Suspended' : 'Active';
            store.updateVendorStatus(email, newStatus);
            window.renderVendorView();
        }
    };

    window.approveVendor = (email) => {
        const store = window.Store || Store;
        store.updateVendorStatus(email, 'Active');
        alert(`Vendor ${email} Approved!`);
        window.renderVendorView();
    };

    window.updateDocStatus = (email, type, status) => {
        const store = window.Store || Store;
        store.updateVendorDocumentStatus(email, type, status);
    };

    window.requestPayout = () => {
        const amount = document.getElementById('payoutAmount').value;
        if (!amount || amount <= 0) return alert('Please enter a valid amount');

        const store = window.Store || Store;
        if (store.requestPayout(amount)) {
            alert('Payout requested successfully!');
            window.renderVendorView();
        } else {
            alert('Insufficient balance or request failed.');
        }
    };

    window.processPayout = (id, status) => {
        const store = window.Store || Store;
        if (store.processPayout(id, status)) {
            alert(`Payout ${status}`);
            window.renderVendorView();
        }
    };

    setTimeout(() => window.renderVendorView(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Partners')} <!-- Reusing Partners active state for now or add new -->
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2>Vendor Management</h2>
                        <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Manage sellers, approvals, and payouts</p>
                    </div>
                    <div style="display: flex; gap: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                        <button class="section-tab" data-section="list" onclick="window.setSection('list')" style="background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; color: var(--color-accent); border-bottom: 2px solid var(--color-accent); font-weight: 500;">All Vendors</button>
                        <button class="section-tab" data-section="onboarding" onclick="window.setSection('onboarding')" style="background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; color: var(--color-text-secondary); font-weight: 500;">Onboarding (Pending)</button>
                        <button class="section-tab" data-section="payouts" onclick="window.setSection('payouts')" style="background: none; border: none; padding: 0.5rem 1rem; cursor: pointer; color: var(--color-text-secondary); font-weight: 500;">Payouts</button>
                    </div>
                </header>

                <div id="vendor-content-area">
                    <!-- Dynamic Content -->
                </div>
            </div>
        </div>
    `;
};

export default AdminVendors;
