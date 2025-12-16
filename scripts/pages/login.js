import Store from '../store.js?v=61';

const Login = async () => {
    // Login Handler
    setTimeout(() => {
        window.handleLoginSubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;

            // Save to Store - Use Global window.Store to ensure we share state with Router/Header
            const appStore = window.Store || Store;

            const authResult = appStore.authenticate(email, password);

            if (authResult.status === 'SUCCESS') {
                handleSuccess(authResult.user);
            } else if (authResult.status === '2FA_REQUIRED') {
                // Swith to 2FA Form
                document.getElementById('login-form-step-1').style.display = 'none';
                document.getElementById('login-form-step-2').style.display = 'flex';
                // Pass email to step 2 implicitly or via closure
                window.tempEmail = email;
            } else {
                alert('Invalid Credentials! Try:\n- Admin: admin@nutanaa.com / nutanaa\n- Franchisee: franchisee@nutanaa.com / franchisee\n- User: user@nutanaa.com / user');
            }
        };

        window.handle2FASubmit = (e) => {
            e.preventDefault();
            const code = document.getElementById('2fa-code').value;
            const appStore = window.Store || Store;

            if (appStore.verify2FA(window.tempEmail, code)) {
                const user = appStore.getUser();
                handleSuccess(user);
            } else {
                alert('Invalid 2FA Code. Use "123456" for demo.');
            }
        };

        window.handleSuccess = (user) => {
            setTimeout(() => {
                // Redirect based on role
                if (['admin', 'sub-admin', 'support', 'finance', 'vendor'].includes(user.role)) {
                    window.location.hash = '#/admin';
                }
                else if (user.role === 'franchisee') window.location.hash = '#/';
                else window.location.hash = '#/';
            }, 50);
        };

    }, 100);

    return `
        <div class="page-container" style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
            <div class="card" style="width: 100%; max-width: 400px; padding: 2.5rem;">
                <h2 style="margin-bottom: 0.5rem; text-align: center;">Welcome Back</h2>
                <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 2rem;">Login to your Nutanaa account</p>
                
                <!-- Step 1: Credentials -->
                <form id="login-form-step-1" onsubmit="window.handleLoginSubmit(event)" style="display: flex; flex-direction: column; gap: 1.5rem;">
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
                        <strong>Test Credentials:</strong><br>
                        Super Admin: admin@nutanaa.com / nutanaa (2FA)<br>
                        Sub-Admin: subadmin@nutanaa.com / sub (2FA)<br>
                        Franchisee: franchisee@nutanaa.com / franchisee<br>
                        User: user@nutanaa.com / user
                    </div>
                </form>

                <!-- Step 2: 2FA -->
                <form id="login-form-step-2" onsubmit="window.handle2FASubmit(event)" style="display: none; flex-direction: column; gap: 1.5rem;">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <span style="font-size: 3rem;">🔒</span>
                        <h3 style="margin-top: 1rem;">Two-Factor Authentication</h3>
                        <p style="color: var(--color-text-secondary); font-size: 0.9rem;">Please enter the 6-digit code sent to your device.</p>
                    </div>

                    <div>
                        <label style="display: block; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.5rem;">Verification Code</label>
                        <input type="text" id="2fa-code" placeholder="123456" maxlength="6" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm); text-align: center; letter-spacing: 0.5em; font-size: 1.2rem;">
                    </div>

                    <button type="submit" class="btn" style="width: 100%; padding: 1rem;">Verify</button>
                    <button type="button" onclick="location.reload()" style="background: transparent; border: none; color: var(--color-text-secondary); cursor: pointer; text-decoration: underline;">Cancel</button>
                </form>

            </div>
        </div>
    `;
};

export default Login;
