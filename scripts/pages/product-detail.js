import { products } from '../data/products.js';
import Store from '../store.js?v=10';

const ProductDetail = async (params) => {
    const id = parseInt(params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return `<h1>Product not found</h1>`;
    }

    // Reactive Render Logic
    const renderButtons = () => {
        const qty = Store.getCartItemCount(id);
        const container = document.getElementById('action-buttons-container');
        if (!container) return;

        if (qty > 0) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button class="btn" style="padding: 0.5rem 1rem;" onclick="Store.removeFromCart(${id})">-</button>
                    <span style="font-size: 1.5rem; font-weight: bold;">${qty}</span>
                    <button class="btn" style="padding: 0.5rem 1rem;" onclick="Store.addToCart(${id})">+</button>
                </div>
                 <button class="btn" id="toggle-3d" style="background-color: var(--color-bg-tertiary); margin-left: 1rem;">Enable 3D View</button>
            `;
        } else {
            container.innerHTML = `
                <button class="btn" onclick="Store.addToCart(${id})">Add to Cart</button>
                 <button class="btn" id="toggle-3d" style="background-color: var(--color-bg-tertiary); margin-left: 1rem;">Enable 3D View</button>
            `;
        }

        // Re-attach 3D toggle listener since we wiped HTML
        attach3DListener();
    };

    const attach3DListener = () => {
        const rotateBtn = document.getElementById('toggle-3d');
        const img = document.querySelector('.detail-image');
        if (rotateBtn && img) {
            let is3D = img.style.animationName === 'rotate3d';
            rotateBtn.textContent = is3D ? 'Disable 3D View' : 'Enable 3D View';

            rotateBtn.onclick = () => {
                is3D = !is3D;
                if (is3D) {
                    img.style.transition = 'transform 1s infinite linear';
                    img.style.animation = 'rotate3d 5s infinite linear';
                    rotateBtn.textContent = 'Disable 3D View';
                } else {
                    img.style.animation = 'none';
                    img.style.transform = 'scale(1)';
                    rotateBtn.textContent = 'Enable 3D View';
                }
            };
        }
    };

    // Delayed execution to attach event listeners after render
    setTimeout(() => {
        const img = document.querySelector('.detail-image');
        const container = document.querySelector('.detail-image-container');

        if (container && img) {
            // Zoom Effect
            container.addEventListener('mousemove', (e) => {
                const { left, top, width, height } = container.getBoundingClientRect();
                const x = (e.clientX - left) / width;
                const y = (e.clientY - top) / height;

                img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                img.style.transform = 'scale(1.5)';
            });

            container.addEventListener('mouseleave', () => {
                if (img.style.animationName !== 'rotate3d') {
                    img.style.transform = 'scale(1)';
                    img.style.transformOrigin = 'center center';
                }
            });
        }

        // Initial button render
        renderButtons();

        // Listen for updates
        window.addEventListener('cart-updated', renderButtons);

    }, 100);

    return `
        <style>
            @keyframes rotate3d {
                from { transform: perspective(1000px) rotateY(0deg); }
                to { transform: perspective(1000px) rotateY(360deg); }
            }
            .detail-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4rem;
                margin-top: 2rem;
            }
            .detail-image-container {
                position: relative;
                overflow: hidden;
                border-radius: var(--radius-lg);
                background: var(--color-bg-secondary);
                cursor: crosshair;
                height: 500px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid var(--color-bg-tertiary);
            }
            .detail-image {
                max-width: 80%;
                max-height: 80%;
                transition: transform 0.1s ease-out;
            }
            .detail-info h1 {
                font-size: 3rem;
                line-height: 1.1;
                margin-bottom: 1rem;
            }
            .detail-price {
                font-size: 2rem;
                color: var(--color-accent);
                font-weight: bold;
                margin-bottom: 2rem;
            }
            .detail-desc {
                color: var(--color-text-secondary);
                font-size: 1.1rem;
                margin-bottom: 2rem;
            }
            .action-buttons {
                display: flex;
                gap: 1rem;
                align-items: center;
            }
        </style>

        <div class="breadcrumb">
            <a href="#/products">Products</a> > <span>${product.name}</span>
        </div>

        <div class="detail-container">
            <div class="detail-image-container">
                <img src="${product.image}" alt="${product.name}" class="detail-image">
            </div>
            
            <div class="detail-info">
                <h1>${product.name}</h1>
                <div class="detail-price">$${product.price.toFixed(2)}</div>
                <p class="detail-desc">${product.description}</p>
                
                <div class="action-buttons" id="action-buttons-container">
                    <!-- Buttons rendered via JS -->
                     <button class="btn">Loading...</button>
                </div>
            </div>
        </div>
    `;
};

export default ProductDetail;
