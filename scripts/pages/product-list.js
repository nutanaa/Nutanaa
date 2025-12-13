import { products } from '../data/products.js';
import Store from '../store.js?v=10';

const ProductList = async () => {

    // Ensure we reference the Global Store with latest data
    const currentStore = window.Store || Store;
    // Fallback to empty array if state not ready, but it should be
    const allProducts = currentStore.state.products || [];

    // Reactive Render Logic
    const renderCard = (product) => {
        const qty = currentStore.getCartItemCount(product.id);
        const displayPrice = currentStore.getProductPrice(product);
        const isFranchisee = currentStore.getUser() && currentStore.getUser().role === 'franchisee';

        // Expiry Logic
        let isExpired = false;
        if (product.expiryDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const expDate = new Date(product.expiryDate);
            if (expDate < today) {
                isExpired = true;
            }
        }

        let buttonHtml = '';
        if (isExpired) {
            buttonHtml = `
                <button class="btn" disabled style="background-color: var(--color-text-secondary); cursor: not-allowed; opacity: 0.7;">
                    Expired
                </button>
            `;
        } else if (qty > 0) {
            buttonHtml = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: var(--color-bg-tertiary); padding: 0.25rem; border-radius: var(--radius-md);">
                    <button class="btn" style="padding: 0.25rem 0.75rem; min-width: 2rem;" onclick="window.updateCartQty(${product.id}, -1)">-</button>
                    <span style="font-weight: 600;">${qty}</span>
                    <button class="btn" style="padding: 0.25rem 0.75rem; min-width: 2rem;" onclick="window.updateCartQty(${product.id}, 1)">+</button>
                </div>
            `;
        } else {
            buttonHtml = `
                <button class="btn product-btn" onclick="window.updateCartQty(${product.id}, 1)">
                    Add to Cart
                </button>
            `;
        }

        return `
            <div class="card product-card" id="product-card-${product.id}">
                <div class="product-image-container">
                    ${isFranchisee ? '<span style="position: absolute; top: 10px; right: 10px; background: var(--color-success); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; z-index: 2;">Wholesale</span>' : ''}
                    <a href="#/product/${product.id}">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </a>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <a href="#/product/${product.id}" style="text-decoration: none; color: inherit;">
                        <h3 class="product-title" style="cursor: pointer;">${product.name}</h3>
                    </a>
                    <div class="product-price">
                        $${displayPrice.toFixed(2)} 
                        ${isFranchisee && product.franchisePrice < product.price ? `<span style="font-size: 0.8rem; text-decoration: line-through; color: var(--color-text-secondary); margin-left: 0.5rem;">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                    ${buttonHtml}
                    <a href="#/product/${product.id}" class="view-details-link">View Details</a>
                </div>
            </div>
        `;
    };

    // Global Handler for simplified event binding
    window.updateCartQty = (id, delta) => {
        const s = window.Store || Store;
        if (delta > 0) s.addToCart(id);
        else s.removeFromCart(id);
    };

    // --- Search & Autocomplete Logic ---
    setTimeout(() => {
        const input = document.getElementById('product-search');
        const listContainer = document.querySelector('.product-grid');
        const suggestionsBox = document.getElementById('search-suggestions');

        if (input && listContainer && suggestionsBox) {

            const filterProducts = (query) => {
                const lowerQ = query.toLowerCase();
                // Filter logic
                const filtered = allProducts.filter(p =>
                    p.name.toLowerCase().includes(lowerQ) ||
                    p.category.toLowerCase().includes(lowerQ)
                );

                // Update Grid
                if (filtered.length > 0) {
                    listContainer.innerHTML = filtered.map(p => renderCard(p)).join('');
                } else {
                    listContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--color-text-secondary); padding: 4rem;"><h3>No products found matching "${query}"</h3></div>`;
                }

                return filtered;
            };

            input.addEventListener('input', (e) => {
                const val = e.target.value.trim();

                // Filter Grid immediately
                if (val === '') {
                    listContainer.innerHTML = allProducts.map(p => renderCard(p)).join('');
                    suggestionsBox.style.display = 'none';
                    return;
                }
                const filtered = filterProducts(val);

                // Update Suggestions Dropdown
                if (filtered.length > 0) {
                    suggestionsBox.innerHTML = filtered.slice(0, 5).map(p => `
                        <div class="suggestion-item" onclick="document.getElementById('product-search').value = '${p.name.replace(/'/g, "\\'")}'; document.getElementById('product-search').dispatchEvent(new Event('input')); document.getElementById('search-suggestions').style.display = 'none';">
                            <img src="${p.image}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">
                            <span>${p.name} <sm style='color:var(--color-text-secondary); font-size:0.8em'>in ${p.category}</sm></span>
                        </div>
                    `).join('');
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.style.display = 'none';
                }
            });

            // Hide suggestions on click outside
            document.addEventListener('click', (e) => {
                if (e.target !== input && e.target !== suggestionsBox) {
                    suggestionsBox.style.display = 'none';
                }
            });

            // Focus Search if provided in hash? (Optional enhancement)
        }
    }, 100);

    // Initial listener for Cart Updates
    const updateGrid = () => {
        const grid = document.querySelector('.product-grid');
        const input = document.getElementById('product-search');
        if (grid && input && input.value === '') {
            grid.innerHTML = allProducts.map(p => renderCard(p)).join('');
        } else if (grid && input && input.value !== '') {
            // Re-run filter logic if search is active
            input.dispatchEvent(new Event('input'));
        }
    };
    window.addEventListener('cart-updated', updateGrid);


    return `
        <style>
            .suggestion-item {
                padding: 0.75rem 1rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                cursor: pointer;
                border-bottom: 1px solid var(--color-bg-tertiary);
                color: var(--color-text-primary);
                background: var(--color-bg-secondary);
            }
            .suggestion-item:hover {
                background: var(--color-bg-tertiary);
            }
            .suggestion-item:last-child {
                border-bottom: none;
            }
        </style>
        <div class="page-container">
            <header class="page-header">
                <h2>Our Products</h2>
                <div class="filters" style="position: relative;">
                    <input type="text" id="product-search" placeholder="Search products..." style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--color-bg-tertiary); background: var(--color-bg-secondary); color: var(--color-text-primary); width: 300px;">
                    <!-- Suggestions Dropdown -->
                    <div id="search-suggestions" style="
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        width: 300px;
                        background: var(--color-bg-secondary);
                        border: 1px solid var(--color-bg-tertiary);
                        border-radius: 0 0 4px 4px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        z-index: 100;
                        max-height: 300px;
                        overflow-y: auto;
                    "></div>
                </div>
            </header>
            
            <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; margin-top: 2rem;">
                ${allProducts.map(p => renderCard(p)).join('')}
            </div>
        </div>
    `;
};

export default ProductList;
