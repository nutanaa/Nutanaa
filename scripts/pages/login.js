import Store from '../store.js?v=10';

const Login = async () => {
    // Login Handler
    setTimeout(() => {
        window.handleLoginSubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;

            let role = null;
            let name = "User";
            let permissions = [];

            // Mock Authentication Logic
            if (email === 'admin@nutanaa.com' && password === 'admin') {
                role = 'admin';
                name = 'Admin Manager';
            } else if (email === 'franchisee@nutanaa.com' && password === 'franchisee') {
                role = 'franchisee';
                name = 'Franchise Owner';
                permissions = ['register_franchise']; // Grant permission explicitly
            } else if (email === 'user@nutanaa.com' && password === 'user') {
                role = 'user';
                name = 'Customer';
            } else {
                alert('Invalid Credentials! Try admin@nutanaa.com / admin');
                return;
            }

            // Save to Store - Use Global window.Store to ensure we share state with Router/Header
            const appStore = window.Store || Store;
            appStore.setUser({ name, role, permissions });

            // Force a small delay to ensure state propagation before routing
            setTimeout(() => {
                // Redirect based on role
                if (role === 'admin') window.location.hash = '#/admin';
                else if (role === 'franchisee') window.location.hash = '#/';
                else window.location.hash = '#/';
            }, 50);
        };
    }, 100);

    return `
        <div class="page-container" style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
            <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
                <h2 style="margin-bottom: 0.5rem; text-align: center;">Welcome Back</h2>
                <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 2rem;">Login to your Nutanaa account</p>
                
                <form onsubmit="window.handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div>
                        <label style="display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" id="email" required placeholder="admin@nutanaa.com" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>
                    
                    <div>
                        <label style="display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Password</label>
                        <input type="password" id="password" required placeholder="••••••" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>

                    <button type="submit" class="btn" style="width: 100%; padding: 1rem;">Sign In</button>
                    
                    <div style="font-size: 0.8rem; color: var(--color-text-secondary); background: var(--color-bg-primary); padding: 1rem; border-radius: var(--radius-sm);">
                        <strong>Credentials:</strong><br>
                        Admin: admin@nutanaa.com / admin<br>
                        User: user@nutanaa.com / user
                    </div>
                </form>
            </div>
        </div>
    `;
};

export default Login;
