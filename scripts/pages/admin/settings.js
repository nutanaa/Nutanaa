import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminSettings = async () => {
    const currentStore = window.Store || Store;

    window.renderSettingsPage = () => {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const settings = currentStore.getSettings();

        container.innerHTML = `
            <div class="card" style="padding: 2rem; max-width: 600px;">
                <h3 style="margin-top: 0; border-bottom: 1px solid var(--color-bg-tertiary); padding-bottom: 1rem;">General Settings</h3>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Site Title</label>
                    <input type="text" id="siteTitle" value="${settings.siteTitle}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Currency</label>
                    <select id="currency" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                        <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                        <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                        <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
                    </select>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Default Tax Rate (%)</label>
                    <input type="number" id="taxRate" value="${settings.taxRate}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
                        <input type="checkbox" id="maintenanceMode" ${settings.maintenanceMode ? 'checked' : ''}>
                        Enable Maintenance Mode
                    </label>
                    <p style="color: var(--color-text-secondary); margin: 0.25rem 0 0 1.5rem; font-size: 0.85rem;">Only admins will be able to access the site.</p>
                </div>

                <h3 style="margin-top: 2rem; border-bottom: 1px solid var(--color-bg-tertiary); padding-bottom: 1rem;">Security Settings</h3>
                
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: 500;">
                        <input type="checkbox" id="require2FA" ${settings.security.require2FA ? 'checked' : ''}>
                        Force 2FA for All Admins
                    </label>
                </div>

                <button onclick="window.saveSettings()" class="btn" style="background: var(--color-accent); color: white; width: 100%;">Save Changes</button>
            </div>
        `;
    };

    window.saveSettings = () => {
        const newSettings = {
            siteTitle: document.getElementById('siteTitle').value,
            currency: document.getElementById('currency').value,
            taxRate: parseFloat(document.getElementById('taxRate').value),
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            security: {
                require2FA: document.getElementById('require2FA').checked,
                sessionTimeout: 30
            }
        };

        if (currentStore.updateSettings(newSettings)) {
            alert('Settings Saved Successfully!');
            window.renderSettingsPage();
        }
    };

    setTimeout(() => window.renderSettingsPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Settings')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="margin-bottom: 2rem;">
                    <h2>Settings & Configuration</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Manage compliance, tax, and system preferences</p>
                </header>
                <div id="settings-content"></div>
            </div>
        </div>
    `;
};

export default AdminSettings;
