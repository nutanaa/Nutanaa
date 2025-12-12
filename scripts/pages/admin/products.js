import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=4';

const AdminProducts = async () => {
    // Helper to refresh table (in a real framework, this would be reactive)
    const renderTableRows = () => {
        return Store.state.products.map(p => `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); display: flex; align-items: center; gap: 1rem;">
                    <img src="${p.image}" alt="" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <span>${p.name}</span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">$${p.price.toFixed(2)}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${p.category}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="display: flex; gap: 0.5rem;">
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">Edit</button>
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-danger);"
                            onclick="if(confirm('Delete product?')) { alert('Simulated Delete: ${p.id}'); }">
                            Delete
                         </button>
                    </div>
                </td>
            </tr>
        `).join('');
    };

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Products')}
            
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Product Management</h2>
                    <button class="btn" onclick="alert('Open Add Product Modal')">+ Add Product</button>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background-color: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">Product</th>
                                <th style="padding: 1rem;">Price</th>
                                <th style="padding: 1rem;">Category</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${renderTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

export default AdminProducts;
