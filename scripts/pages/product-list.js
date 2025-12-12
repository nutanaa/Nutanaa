import { products } from '../data/products.js';
import Store from '../store.js?v=10';

const ProductList = async () => {

    // Reactive Render Logic
    const renderCard = (product) => {
        const qty = Store.getCartItemCount(product.id);

        let buttonHtml = '';
        if (qty > 0) {
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
                    <a href="#/product/${product.id}">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                    </a>
                </div>
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <a href="#/product/${product.id}" style="text-decoration: none; color: inherit;">
                        <h3 class="product-title" style="cursor: pointer;">${product.name}</h3>
                    </a>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    ${buttonHtml}
                    <a href="#/product/${product.id}" class="view-details-link">View Details</a>
                </div>
            </div>
        `;
    };

    // Global Handler for simplified event binding
    window.updateCartQty = (id, delta) => {
        // Use global Store if available, or fall back to imported
        const s = window.Store || Store;
        if (delta > 0) s.addToCart(id);
        else s.removeFromCart(id);
    };

    // Listen for re-renders efficiently (Dom Diffing would be better, but re-render is fine for MVP)
    const updateGrid = () => {
        const grid = document.querySelector('.product-grid');
        if (grid) {
            grid.innerHTML = products.map(p => renderCard(p)).join('');
        }
    };

    // We attach this listener once per page load ideally, but hashchange handles cleanup loosely
    window.addEventListener('cart-updated', updateGrid);

    setTimeout(() => {
        // Search Logic
        const input = document.getElementById('product-search');
        if (input) {
            input.addEventListener('input', (e) => {
                // ... (Search logic would need to use renderCard too)
            });
        }
    }, 100);

    return `
        <div class="page-container">
            <header class="page-header">
                <h2>Our Products</h2>
                <div class="filters">
                    <input type="text" id="product-search" placeholder="Search products..." style="padding: 0.5rem 1rem; border-radius: 4px; border: 1px solid var(--color-bg-tertiary); background: var(--color-bg-secondary); color: var(--color-text-primary); width: 300px;">
                </div>
            </header>
            
            <div class="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; margin-top: 2rem;">
                ${products.map(p => renderCard(p)).join('')}
            </div>
        </div>
    `;
};

export default ProductList;
