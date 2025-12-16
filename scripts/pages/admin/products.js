import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminProducts = async () => {
    window.currentProductTab = 'all'; // all, moderation, config
    const currentStore = window.Store || Store;

    // --- Render Logic ---
    window.renderProductPage = () => {
        const container = document.getElementById('product-content');
        if (!container) return;

        const isVendor = currentStore.state.currentUser && currentStore.state.currentUser.role === 'vendor';

        // Tabs Logic (Hide non-relevant tabs for vendors)
        const tabContainer = document.getElementById('product-tabs');
        if (isVendor && tabContainer) {
            tabContainer.style.display = 'none'; // Vendors only have "My Products" effectively
            window.currentProductTab = 'all';
        }

        if (window.currentProductTab === 'all') {
            container.innerHTML = renderAllProducts(isVendor);
        } else if (window.currentProductTab === 'moderation') {
            container.innerHTML = renderModeration();
        } else if (window.currentProductTab === 'config') {
            container.innerHTML = renderConfig();
        }

        if (!isVendor) updateTabStyles();
    };

    const updateTabStyles = () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === window.currentProductTab) {
                btn.style.borderBottom = '2px solid var(--color-accent)';
                btn.style.color = 'var(--color-accent)';
            } else {
                btn.style.borderBottom = 'none';
                btn.style.color = 'var(--color-text-secondary)';
            }
        });
    };

    const renderAllProducts = (isVendor) => {
        let products = currentStore.state.products;

        if (isVendor) {
            // Vendor View: Show OWN products (Active, Draft, Pending, Rejected)
            const myEmail = currentStore.state.currentUser.email;
            products = products.filter(p => p.vendorEmail === myEmail);
        } else {
            // Admin View: Show ACTIVE products (Moderation tab handles the rest)
            products = products.filter(p => p.status === 'Active');
        }

        if (products.length === 0) return '<div class="card" style="padding: 2rem; text-align: center;">No products found.</div>';

        return `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Product</th>
                             ${isVendor ? '<th style="padding: 1rem;">Status</th>' : '<th style="padding: 1rem;">Brand</th>'}
                            <th style="padding: 1rem;">Price</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <img src="${p.image || '#'}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                                        <div>
                                            <div style="font-weight: 500;">${p.name}</div>
                                            <div style="font-size: 0.8rem; color: var(--color-text-secondary);">${p.category}</div>
                                        </div>
                                    </div>
                                </td>
                                 <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${isVendor ?
                `<span style="padding:2px 6px; border-radius:4px; font-size:0.8rem; background:${getStatusColor(p.status)}; color:white;">${p.status}</span>`
                : (p.brand || '-')}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">$${p.price}</td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <button class="btn-sm" onclick="window.editProduct(${p.id})">Edit</button>
                                    ${!isVendor ? `<button class="btn-sm" style="color: red; margin-left: 0.5rem;" onclick="window.deleteProduct(${p.id})">Del</button>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderModeration = () => {
        const pending = currentStore.state.products.filter(p => ['Draft', 'Pending', 'Rejected'].includes(p.status));
        return `
            <div class="card" style="padding: 0; overflow: hidden;">
                ${pending.length === 0 ? '<div style="padding: 2rem; text-align: center;">No products pending moderation.</div>' : ''}
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Product</th>
                            <th style="padding: 1rem;">Vendor</th>
                            <th style="padding: 1rem;">Status</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pending.map(p => `
                            <tr>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <strong>${p.name}</strong><br>
                                    <span style="font-size: 0.8rem;">${p.category}</span>
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    ${p.vendorEmail || 'Admin/System'}
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <span style="padding: 2px 6px; border-radius: 4px; background: ${getStatusColor(p.status)}; color: white; font-size: 0.8rem;">
                                        ${p.status}
                                    </span>
                                </td>
                                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                    <button class="btn-sm" onclick="window.updateStatus(${p.id}, 'Active')">Approve</button>
                                    <button class="btn-sm" onclick="window.updateStatus(${p.id}, 'Rejected')">Reject</button>
                                    <button class="btn-sm" onclick="window.editProduct(${p.id})">Edit</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderConfig = () => {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                <div class="card">
                    <h3>Categories</h3>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="newCatInput" placeholder="New Category" style="flex: 1; padding: 0.5rem;">
                        <button class="btn" onclick="window.addCategory()">Add</button>
                    </div>
                    <ul style="list-style: none; padding: 0;">
                        ${currentStore.state.categories.map(c => `
                            <li style="padding: 0.5rem; border-bottom: 1px solid var(--color-bg-tertiary);">${c}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="card">
                    <h3>Brands</h3>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="newBrandInput" placeholder="New Brand" style="flex: 1; padding: 0.5rem;">
                        <button class="btn" onclick="window.addBrand()">Add</button>
                    </div>
                     <ul style="list-style: none; padding: 0;">
                        ${(currentStore.state.brands || []).map(b => `
                            <li style="padding: 0.5rem; border-bottom: 1px solid var(--color-bg-tertiary);">${b}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;
    };

    const getStatusColor = (status) => {
        if (status === 'Pending') return '#f59e0b';
        if (status === 'Draft') return '#6b7280';
        if (status === 'Rejected') return '#ef4444';
        return '#10b981';
    };

    // --- Modal & Form Logic ---
    window.openAddProductModal = () => {
        const isVendor = currentStore.state.currentUser && currentStore.state.currentUser.role === 'vendor';
        document.getElementById('productForm').reset();
        document.getElementById('modalTitle').textContent = isVendor ? 'Request New Product Listing' : 'Add New Product';
        window.editingProductId = null;
        populateSelects(isVendor);

        // Hide Admin Fields for Vendors
        const statusDiv = document.getElementById('admin-fields');
        if (statusDiv) statusDiv.style.display = isVendor ? 'none' : 'block';

        document.getElementById('productModal').style.display = 'flex';
    };

    window.closeProductModal = () => {
        document.getElementById('productModal').style.display = 'none';
    };

    window.submitProductForm = (e) => {
        e.preventDefault();
        const form = e.target;
        const isVendor = currentStore.state.currentUser && currentStore.state.currentUser.role === 'vendor';

        const data = {
            name: form.name.value,
            category: form.category.value,
            brand: isVendor ? null : form.brand.value, // Vendors auto-assigned in Store
            price: parseFloat(form.price.value),
            franchisePrice: parseFloat(form.franchisePrice.value || 0),
            description: form.description.value,
            status: isVendor ? 'Pending' : form.status.value,
            seo: {
                title: form.seoTitle.value,
                description: form.seoDesc.value,
                tags: form.seoTags.value.split(',').map(t => t.trim())
            }
            // Image handling mock
        };

        if (window.editingProductId) {
            currentStore.updateProduct(window.editingProductId, data);
        } else {
            currentStore.addProduct(data);
        }
        window.closeProductModal();
        window.renderProductPage();
    };

    window.editProduct = (id) => {
        const isVendor = currentStore.state.currentUser && currentStore.state.currentUser.role === 'vendor';
        const p = currentStore.state.products.find(x => x.id === id);
        if (!p) return;
        window.editingProductId = id;
        populateSelects(isVendor);
        const form = document.getElementById('productForm');
        form.name.value = p.name;
        form.category.value = p.category;

        if (!isVendor) {
            form.brand.value = p.brand || '';
            form.status.value = p.status || 'Active';
            document.getElementById('admin-fields').style.display = 'block';
        } else {
            document.getElementById('admin-fields').style.display = 'none';
        }

        form.price.value = p.price;
        form.franchisePrice.value = p.franchisePrice || '';
        form.description.value = p.description;

        if (p.seo) {
            form.seoTitle.value = p.seo.title || '';
            form.seoDesc.value = p.seo.description || '';
            form.seoTags.value = (p.seo.tags || []).join(', ');
        }
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productModal').style.display = 'flex';
    };

    window.updateStatus = (id, status) => {
        currentStore.updateProductStatus(id, status);
        window.renderProductPage();
    };

    window.addCategory = () => {
        const val = document.getElementById('newCatInput').value;
        if (val && currentStore.addCategory(val)) window.renderProductPage();
    };

    window.addBrand = () => {
        const val = document.getElementById('newBrandInput').value;
        if (val && currentStore.addBrand(val)) window.renderProductPage();
    };

    const populateSelects = (isVendor) => {
        const catSelect = document.querySelector('select[name="category"]');
        catSelect.innerHTML = currentStore.state.categories.map(c => `<option value="${c}">${c}</option>`).join('');

        if (!isVendor) {
            const brandSelect = document.querySelector('select[name="brand"]');
            brandSelect.innerHTML = (currentStore.state.brands || []).map(b => `<option value="${b}">${b}</option>`).join('');
        }
    };

    // Helper for Tabs
    window.setTab = (tab) => {
        window.currentProductTab = tab;
        window.renderProductPage();
    };

    // Initial Render
    setTimeout(() => window.renderProductPage(), 50);

    const isVendor = currentStore.state.currentUser && currentStore.state.currentUser.role === 'vendor';

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Products')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2>Product Management</h2>
                        <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">${isVendor ? 'Manage your shop listings' : 'Oversee catalog and approvals'}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn" onclick="alert('Bulk Upload Feature: \n\nSelect CSV file to upload multiple products at once. (Mock)')" style="background: var(--color-bg-tertiary); color: var(--color-text-primary);">Bulk Upload</button>
                        <button class="btn" onclick="window.openAddProductModal()" style="background: var(--color-accent); color: white;">
                             ${isVendor ? 'Request New Product' : '+ Add Product'}
                        </button>
                    </div>
                </header>
                <div id="product-tabs" style="border-bottom: 1px solid var(--color-bg-tertiary); margin-bottom: 1.5rem; display: flex; gap: 1.5rem;">
                    <button class="tab-btn" data-tab="all" onclick="window.setTab('all')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">All Products</button>
                    <button class="tab-btn" data-tab="moderation" onclick="window.setTab('moderation')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">Moderation</button>
                    <button class="tab-btn" data-tab="config" onclick="window.setTab('config')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500;">Categories & Brands</button>
                </div>

                <div id="product-content">
                    <!-- Dynamic Content -->
                </div>
            </div>

            <!-- Modal -->
             <div id="productModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
                <div class="card" style="background-color: var(--color-bg-secondary); width: 100%; max-width: 600px; padding: 2rem; max-height: 90vh; overflow-y: auto;">
                    <h3 id="modalTitle">Product</h3>
                    <form id="productForm" onsubmit="window.submitProductForm(event)" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="text" name="name" placeholder="Product Name" required style="padding: 0.5rem;">
                        
                        <div id="admin-fields">
                             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                                <select name="status" style="padding: 0.5rem;">
                                    <option value="Draft">Draft</option>
                                    <option value="Pending">Pending Review</option>
                                    <option value="Active">Active</option>
                                </select>
                                <select name="brand"></select>
                            </div>
                        </div>

                        <select name="category" style="padding: 0.5rem;"></select>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <input type="number" name="price" placeholder="Retail Price" required style="padding: 0.5rem;">
                            <input type="number" name="franchisePrice" placeholder="Franchise Price" style="padding: 0.5rem;">
                        </div>
                        
                        <textarea name="description" placeholder="Description" rows="3" style="padding: 0.5rem;"></textarea>
                        
                        <h4>SEO Settings</h4>
                        <input type="text" name="seoTitle" placeholder="Meta Title" style="padding: 0.5rem;">
                        <input type="text" name="seoDesc" placeholder="Meta Description" style="padding: 0.5rem;">
                        <input type="text" name="seoTags" placeholder="Tags (comma separated)" style="padding: 0.5rem;">

                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
                            <button type="button" class="btn" style="background: gray;" onclick="window.closeProductModal()">Cancel</button>
                            <button type="submit" class="btn">Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};

export default AdminProducts;
