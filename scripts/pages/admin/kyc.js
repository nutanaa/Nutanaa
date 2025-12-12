import AdminSidebar from '../../components/admin-sidebar.js';

const mockApplications = [
    { id: 101, name: "Alpha Franchises Ltd.", status: "Pending", documents: ["License.pdf", "Tax_Record.pdf"], submittedAt: "2024-10-25" },
    { id: 102, name: "Beta Retail Group", status: "Pending", documents: ["ID_Proof.jpg"], submittedAt: "2024-10-26" },
    { id: 103, name: "Gamma Stores", status: "Approved", documents: ["All_Docs.zip"], submittedAt: "2024-10-20" },
    { id: 104, name: "Delta Outlets", status: "Rejected", documents: ["Invalid_License.pdf"], submittedAt: "2024-10-22" },
];

const AdminKYC = async () => {
    // Helper functionality setup after render
    setTimeout(() => {
        window.handleKYC = (id, action) => {
            const row = document.getElementById(`row-${id}`);
            const statusCell = row.querySelector('.status-cell');
            if (action === 'approve') {
                statusCell.innerHTML = '<span style="color: var(--color-success)">Approved</span>';
                statusCell.style.fontWeight = 'bold';
            } else {
                statusCell.innerHTML = '<span style="color: var(--color-danger)">Rejected</span>';
                statusCell.style.fontWeight = 'bold';
            }
            alert(`Application ${id} has been ${action}d.`);
        };
    }, 100);

    const renderRows = () => {
        return mockApplications.map(app => `
            <tr id="row-${app.id}">
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="font-weight: 500;">${app.name}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">ID: ${app.id}</div>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    ${app.documents.map(doc => `<div style="display: flex; align-items: center; gap: 0.5rem;"><span style="font-size: 1.2rem;">📄</span> <a href="#" style="font-size: 0.9rem;">${doc}</a></div>`).join('')}
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${app.submittedAt}</td>
                <td class="status-cell" style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <span style="
                        padding: 0.25rem 0.5rem; 
                        border-radius: 4px; 
                        background: ${app.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : app.status === 'Rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
                        color: ${app.status === 'Approved' ? 'var(--color-success)' : app.status === 'Rejected' ? 'var(--color-danger)' : 'var(--color-warning)'};
                    ">
                        ${app.status}
                    </span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    ${app.status === 'Pending' ? `
                    <div style="display: flex; gap: 0.5rem;">
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-success);"
                            onclick="window.handleKYC(${app.id}, 'approve')">
                            Approve
                         </button>
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-danger);"
                            onclick="window.handleKYC(${app.id}, 'reject')">
                            Reject
                         </button>
                    </div>
                    ` : '<span style="color: var(--color-text-muted); font-size: 0.9rem;">No actions</span>'}
                </td>
            </tr>
        `).join('');
    };

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('KYC Verify')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Franchisee KYC Verification</h2>
                    <div>
                         <span style="color: var(--color-text-secondary);">4 Total Applications</span>
                    </div>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background-color: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">Applicant</th>
                                <th style="padding: 1rem;">Documents</th>
                                <th style="padding: 1rem;">Submitted</th>
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

export default AdminKYC;
