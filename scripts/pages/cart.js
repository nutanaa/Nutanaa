import Store from '../store.js?v=10';

const Cart = async () => {

    // Reactive Refresh Logic
    const renderCartContent = () => {
        const cartItems = Store.getCart();
        const total = Store.getCartTotal();
        const isCartEmpty = cartItems.length === 0;

        if (isCartEmpty) {
            return `
                <div class="page-container" style="text-align: center; padding: 4rem;">
                    <h1>Your Cart is Empty</h1>
                    <p style="color: var(--color-text-secondary); margin-top: 1rem;">Looks like you haven't added any premium tech yet.</p>
                    <div style="margin-top: 2rem;">
                        <a href="#/products" class="btn">Continue Shopping</a>
                    </div>
                </div>
            `;
        }

        const itemsHtml = cartItems.map(item => `
            <div class="card" style="display: flex; gap: 1.5rem; padding: 1.5rem; margin-bottom: 1rem; align-items: center;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; border-radius: var(--radius-md); object-fit: cover;">
                <div style="flex: 1;">
                    <h3 style="margin-bottom: 0.25rem;">${item.name}</h3>
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem;">Category: ${item.category}</div>
                </div>
                <div style="text-align: right; margin-right: 2rem;">
                    <div style="font-weight: bold;">$${item.price.toFixed(2)}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">
                        <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;">
                             <button class="btn" style="padding: 0.25rem 0.5rem; min-width: 1.5rem; font-size: 0.8rem;" onclick="Store.removeFromCart(${item.id})">-</button>
                             <span>${item.quantity}</span>
                             <button class="btn" style="padding: 0.25rem 0.5rem; min-width: 1.5rem; font-size: 0.8rem;" onclick="Store.addToCart(${item.id})">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
             <div class="page-container">
            <h2 style="margin-bottom: 2rem;">Shopping Cart</h2>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 3rem;">
                <div class="cart-items">
                    ${itemsHtml}
                </div>
                
                <div class="cart-summary">
                    <div class="card" style="position: sticky; top: 2rem;">
                        <h3 style="margin-bottom: 1.5rem;">Order Summary</h3>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="color: var(--color-text-secondary);">Subtotal</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                         <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span style="color: var(--color-text-secondary);">Shipping</span>
                            <span>Calculated at checkout</span>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid var(--color-bg-tertiary); margin: 1.5rem 0;">
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 1.25rem; font-weight: bold;">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        
                        <button class="btn" ${isCartEmpty ? 'disabled style="opacity: 0.5; cursor: not-allowed; width: 100%; justify-content: center;"' : 'style="width: 100%; justify-content: center;"'}>
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    };

    // Make Store available for inline onclicks if not already
    window.Store = Store;

    // Self-updating wrapper
    // We wrap the content in a div that we can target for updates
    setTimeout(() => {
        const wrapper = document.getElementById('cart-page-wrapper');

        const updateCartView = () => {
            if (wrapper) wrapper.innerHTML = renderCartContent();
        };

        window.addEventListener('cart-updated', updateCartView);
        // Initial render
        updateCartView();
    }, 0);

    return `<div id="cart-page-wrapper"> Loading Cart... </div>`;
};

export default Cart;
