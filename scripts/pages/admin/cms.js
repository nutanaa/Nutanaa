import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminCMS = async () => {
    window.currentCMSView = 'pages'; // pages, banners
    const currentStore = window.Store || Store;

    window.renderCMSPage = () => {
        const container = document.getElementById('cms-content');
        if (!container) return;

        if (window.currentCMSView === 'pages') {
            const pages = currentStore.getCMSPages();
            container.innerHTML = `
                <div class="card" style="padding: 0; overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: var(--color-bg-tertiary);">
                            <tr>
                                <th style="padding: 1rem;">Page Title</th>
                                <th style="padding: 1rem;">Last Updated</th>
                                <th style="padding: 1rem;">Start of Content</th>
                                <th style="padding: 1rem;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pages.map(p => `
                                <tr>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-weight: 500;">
                                        ${p.title}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); color: var(--color-text-secondary);">
                                        ${p.lastUpdated}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                        ${p.content}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        <button onclick="window.editPage('${p.id}')" class="btn-sm" style="background: var(--color-accent); color: white;">Edit</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            const banners = currentStore.getCMSBanners();
            container.innerHTML = `
                 <div class="card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                    <h3 style="margin-top: 0;">Add New Banner</h3>
                    <div style="display: flex; gap: 1rem;">
                        <input type="text" id="bannerTitle" placeholder="Banner Title" style="flex: 1; padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                        <input type="text" id="bannerUrl" placeholder="Image URL (e.g. https://...)" style="flex: 2; padding: 0.5rem; border: 1px solid var(--color-bg-tertiary); border-radius: 4px;">
                        <button onclick="window.addBanner()" class="btn" style="background: var(--color-accent); color: white;">Add Banner</button>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                    ${banners.map(b => `
                        <div class="card" style="padding: 0; overflow: hidden;">
                            <img src="${b.imageUrl}" style="width: 100%; height: 150px; object-fit: cover;">
                            <div style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 500;">${b.title}</span>
                                <button onclick="window.deleteBanner(${b.id})" class="btn-sm" style="background: #ef4444; color: white;">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    };

    window.setCMSView = (view) => {
        window.currentCMSView = view;
        window.renderCMSPage();
        updateTabStyles();
    };

    window.editPage = (id) => {
        const pages = currentStore.getCMSPages();
        const page = pages.find(p => p.id === id);
        if (page) {
            const newContent = prompt(`Edit content for ${page.title}:`, page.content);
            if (newContent !== null) {
                currentStore.updatePageContent(id, newContent);
                window.renderCMSPage();
            }
        }
    };

    window.addBanner = () => {
        const title = document.getElementById('bannerTitle').value;
        const url = document.getElementById('bannerUrl').value;
        if (title && url) {
            currentStore.addBanner(title, url);
            window.renderCMSPage();
        } else {
            alert('Please enter title and URL');
        }
    };

    window.deleteBanner = (id) => {
        if (confirm('Delete banner?')) {
            currentStore.deleteBanner(id);
            window.renderCMSPage();
        }
    };

    const updateTabStyles = () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.view === window.currentCMSView) {
                btn.style.borderBottom = '2px solid var(--color-accent)';
                btn.style.color = 'var(--color-accent)';
            } else {
                btn.style.borderBottom = 'none';
                btn.style.color = 'var(--color-text-secondary)';
            }
        });
    };

    setTimeout(() => window.renderCMSPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('CMS')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="margin-bottom: 2rem;">
                    <h2>Content Management</h2>
                    <p style="color: var(--color-text-secondary); margin-top: -0.5rem; font-size: 0.9rem;">Manage website pages and banners</p>
                </header>
                
                <div style="border-bottom: 1px solid var(--color-bg-tertiary); margin-bottom: 2rem; display: flex; gap: 1.5rem;">
                    <button class="tab-btn" data-view="pages" onclick="window.setCMSView('pages')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; border-bottom: 2px solid var(--color-accent); color: var(--color-accent);">Pages</button>
                    <button class="tab-btn" data-view="banners" onclick="window.setCMSView('banners')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; color: var(--color-text-secondary);">Home Banners</button>
                </div>

                <div id="cms-content"></div>
            </div>
        </div>
    `;
};

export default AdminCMS;
