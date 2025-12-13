import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=54';

const AdminProducts = async () => {
    // Ensure we are using the initialized global store if available
    // This fixes issues where the imported module instance might differ due to cache busting version mismatch
    const currentStore = window.Store || Store;

    // State for image upload
    let currentImageBase64 = null;
    let editingProductId = null;

    // Global handlers for this page
    setTimeout(() => {
        const modal = document.getElementById('addProductModal');
        const categorySelect = document.getElementById('categorySelect');
        const newCategoryInput = document.getElementById('newCategoryInput');

        // Populate Categories
        const renderCategories = () => {
            if (categorySelect) {
                const options = currentStore.state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
                categorySelect.innerHTML = `<option value="" disabled selected>Select Category</option>` + options;
            }
        };
        renderCategories();

        window.toggleNewCategory = () => {
            const container = document.getElementById('newCategoryContainer');
            if (container.style.display === 'none') {
                container.style.display = 'flex';
                newCategoryInput.focus();
            } else {
                container.style.display = 'none';
            }
        };

        window.saveNewCategory = () => {
            const val = newCategoryInput.value.trim();
            if (val) {
                if (currentStore.addCategory(val)) {
                    renderCategories();
                    categorySelect.value = val; // Auto-select new category
                    newCategoryInput.value = '';
                    document.getElementById('newCategoryContainer').style.display = 'none';
                } else {
                    alert('Category already exists!');
                }
            }
        };

        window.handleImageUpload = (input) => {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                if (file.size > 5000000) { // 5MB limit
                    alert('File is too large! Please choose an image under 5MB.');
                    input.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    currentImageBase64 = e.target.result;
                    document.getElementById('imagePreview').src = currentImageBase64;
                    document.getElementById('imagePreview').style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        };

        const resetForm = (form) => {
            form.reset();
            currentImageBase64 = null;
            editingProductId = null;
            document.getElementById('imagePreview').style.display = 'none';
            modalTitle.textContent = 'Add New Product';
            submitBtn.textContent = 'Add Product';
        };

        window.openAddProductModal = () => {
            resetForm(document.querySelector('#addProductModal form'));
            renderCategories();
            modal.style.display = 'flex';
        };

        window.closeAddProductModal = () => {
            modal.style.display = 'none';
        };

        window.editProduct = (id) => {
            const product = currentStore.state.products.find(p => p.id === id);
            if (!product) return;

            editingProductId = id;
            modalTitle.textContent = 'Edit Product';
            submitBtn.textContent = 'Update Product';

            const form = document.querySelector('#addProductModal form');
            form.name.value = product.name;
            form.price.value = product.price;
            form.franchisePrice.value = product.franchisePrice;
            form.expiryDate.value = product.expiryDate || '';
            form.description.value = product.description;

            // Handle Category
            renderCategories();
            form.category.value = product.category;

            // Handle Image
            if (product.image && product.image.startsWith('data:image')) {
                currentImageBase64 = product.image;
                document.getElementById('imagePreview').src = currentImageBase64;
                document.getElementById('imagePreview').style.display = 'block';
            } else {
                // Keep URL if it's a URL, but we can't show preview easily if it's external without loading
                currentImageBase64 = product.image; // Keep existing image string
                if (product.image) {
                    document.getElementById('imagePreview').src = product.image;
                    document.getElementById('imagePreview').style.display = 'block';
                }
            }

            modal.style.display = 'flex';
        };

        window.handleAddProduct = (e) => {
            e.preventDefault();
            const form = e.target;

            // Use uploaded image or fallback or existing logic
            let image = currentImageBase64;
            if (!image) {
                image = 'https://placehold.co/400x400/1a1d24/FFF?text=No+Image';
            }

            const productData = {
                name: form.name.value,
                image: image,
                category: form.category.value,
                price: parseFloat(form.price.value),
                franchisePrice: parseFloat(form.franchisePrice.value),
                expiryDate: form.expiryDate.value,
                description: form.description.value
            };

            if (editingProductId) {
                // Update Existing
                const index = currentStore.state.products.findIndex(p => p.id === editingProductId);
                if (index !== -1) {
                    currentStore.state.products[index] = {
                        ...currentStore.state.products[index],
                        ...productData
                    };
                    currentStore.saveProducts();
                    alert('Product updated successfully!');
                }
            } else {
                // Add New
                currentStore.addProduct(productData);
                alert('Product added successfully!');
            }

            window.closeAddProductModal();
            resetForm(form);
            window.location.reload();
        };

        window.deleteProduct = (id) => {
            if (confirm('Are you sure you want to delete this product?')) {
                currentStore.state.products = currentStore.state.products.filter(p => p.id !== id);
                currentStore.saveProducts();
                window.location.reload();
            }
        };

        // Close on outside click
        window.onclick = (event) => {
            if (event.target == modal) {
                window.closeAddProductModal();
            }
        };
    }, 100);

    const renderTableRows = () => {
        return currentStore.state.products.map(p => `
            <tr>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); display: flex; align-items: center; gap: 1rem;">
                    <img src="${p.image}" alt="" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <span>${p.name}</span>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="font-weight: 500;">$${p.price.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; color: var(--color-success);">${p.franchisePrice ? 'Wholesale: $' + p.franchisePrice.toFixed(2) : '-'}</div>
                </td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">${p.category}</td>
                <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                    <div style="display: flex; gap: 0.5rem;">
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.editProduct(${p.id})">Edit</button>
                         <button class="btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background-color: var(--color-danger);"
                            onclick="window.deleteProduct(${p.id})">
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
                    <button class="btn" onclick="window.openAddProductModal()">+ Add Product</button>
                </header>

                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background-color: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">Product</th>
                                <th style="padding: 1rem;">Pricing (Retail / Franchise)</th>
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

            <!-- Add Product Modal -->
            <div id="addProductModal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); align-items: center; justify-content: center;">
                <div class="card" style="background-color: var(--color-bg-secondary); width: 100%; max-width: 500px; padding: 2rem; position: relative; animation: slideIn 0.3s;">
                    <span onclick="window.closeAddProductModal()" style="color: var(--color-text-secondary); float: right; font-size: 1.5rem; font-weight: bold; cursor: pointer;">&times;</span>
                    <h3 id="modalTitle" style="margin-bottom: 1.5rem;">Add New Product</h3>
                    
                    <form onsubmit="window.handleAddProduct(event)" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Product Name</label>
                            <input type="text" name="name" required style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div>
                                <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Retail Price ($)</label>
                                <input type="number" name="price" step="0.01" required style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem; color: var(--color-success);">Franchise Price ($)</label>
                                <input type="number" name="franchisePrice" step="0.01" required style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                            </div>
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Category</label>
                            <div style="display: flex; gap: 0.5rem;">
                                <select id="categorySelect" name="category" required style="flex: 1; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                                    <!-- Dynamic Options -->
                                </select>
                                <button type="button" class="btn" style="padding: 0.5rem;" onclick="window.toggleNewCategory()">+</button>
                            </div>
                            
                            <div id="newCategoryContainer" style="display: none; gap: 0.5rem; margin-top: 0.5rem;">
                                <input type="text" id="newCategoryInput" placeholder="New Category Name" style="flex: 1; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                                <button type="button" class="btn" style="background: var(--color-success);" onclick="window.saveNewCategory()">Save</button>
                            </div>
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Expiry Date</label>
                            <input type="date" name="expiryDate" required style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Product Image</label>
                            <input type="file" accept="image/*" onchange="window.handleImageUpload(this)" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;">
                            <img id="imagePreview" src="" style="display: none; width: 100px; height: 100px; object-fit: cover; margin-top: 0.5rem; border-radius: 4px; border: 1px solid var(--color-bg-tertiary);">
                        </div>

                        <div>
                            <label style="display: block; font-size: 0.9rem; margin-bottom: 0.25rem;">Description</label>
                            <textarea name="description" rows="3" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #ccc; background: white; color: black;"></textarea>
                        </div>

                        <button type="submit" id="submitBtn" class="btn" style="margin-top: 1rem;">Add Product</button>
                    </form>
                </div>
            </div>
        </div>
    `;
};

export default AdminProducts;
