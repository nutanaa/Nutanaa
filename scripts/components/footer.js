const Footer = () => {
    return `
        <footer style="margin-top: auto; padding-top: 4rem; padding-bottom: 2rem; border-top: 1px solid var(--color-bg-tertiary);">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto;">
                <div>
                    <h4 style="margin-bottom: 1rem;">Nutanaa Store</h4>
                    <p style="color: var(--color-text-secondary); font-size: 0.9rem;">
                        Premium products for your lifestyle.
                    </p>
                </div>
                <div>
                    <h4 style="margin-bottom: 1rem;">Quick Links</h4>
                    <ul style="display: flex; flex-direction: column; gap: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
                        <li><a href="#/" style="color: inherit;">Home</a></li>
                        <li><a href="#/products" style="color: inherit;">Shop</a></li>
                        <li><a href="#/cart" style="color: inherit;">Cart</a></li>
                        <li><a href="#/login" style="color: inherit;">Login / Admin</a></li>
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 1rem;">Legal</h4>
                    <ul style="display: flex; flex-direction: column; gap: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
                        <li>Privacy Policy</li>
                        <li>Terms of Service</li>
                    </ul>
                </div>
            </div>
            <div style="text-align: center; margin-top: 3rem; color: var(--color-text-muted); font-size: 0.8rem;">
                &copy; 2025 Nutanaa Store. All rights reserved.
            </div>
        </footer>
    `;
};
export default Footer;
