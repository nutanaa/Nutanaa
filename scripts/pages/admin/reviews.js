import AdminSidebar from '../../components/admin-sidebar.js';
import Store from '../../store.js?v=76';

const AdminReviews = async () => {
    window.currentReviewView = 'pending'; // pending, all
    const currentStore = window.Store || Store;

    window.renderReviewPage = () => {
        const container = document.getElementById('reviews-content');
        if (!container) return;

        const reviews = currentStore.getReviews(window.currentReviewView === 'pending' ? 'Pending' : 'all');
        const products = currentStore.state.products;

        container.innerHTML = `
            <div class="card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-tertiary);">
                        <tr>
                            <th style="padding: 1rem;">Product</th>
                            <th style="padding: 1rem;">User</th>
                            <th style="padding: 1rem;">Rating</th>
                            <th style="padding: 1rem;">Comment</th>
                            <th style="padding: 1rem;">Status</th>
                            <th style="padding: 1rem;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reviews.map(r => {
            const product = products.find(p => p.id === r.productId) || { name: 'Unknown Product' };
            return `
                                <tr>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); font-weight: 500;">
                                        ${product.name}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary); color: var(--color-text-secondary); font-size: 0.9rem;">
                                        ${r.userId}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        ${'⭐'.repeat(r.rating)}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        ${r.comment}
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        <span style="padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; background: ${r.status === 'Approved' ? '#d1fae5' : r.status === 'Rejected' ? '#fee2e2' : '#fef3c7'}; color: ${r.status === 'Approved' ? '#065f46' : r.status === 'Rejected' ? '#991b1b' : '#92400e'};">
                                            ${r.status}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; border-bottom: 1px solid var(--color-bg-tertiary);">
                                        ${r.status === 'Pending' ? `
                                            <button onclick="window.modReview(${r.id}, 'Approved')" class="btn-sm" style="background: #10b981;">Approve</button>
                                            <button onclick="window.modReview(${r.id}, 'Rejected')" class="btn-sm" style="background: #ef4444;">Reject</button>
                                        ` : `
                                            <button onclick="window.modReview(${r.id}, 'Pending')" class="btn-sm" style="background: var(--color-bg-tertiary); color: var(--color-text-primary);">Reset</button>
                                        `}
                                    </td>
                                </tr>
                            `;
        }).join('')}
                        ${reviews.length === 0 ? '<tr><td colspan="6" style="padding: 2rem; text-align: center;">No reviews found.</td></tr>' : ''}
                    </tbody>
                </table>
            </div>
        `;
    };

    window.modReview = (id, status) => {
        currentStore.updateReviewStatus(id, status);
        window.renderReviewPage();
    };

    window.setReviewView = (view) => {
        window.currentReviewView = view;
        window.renderReviewPage();
        updateTabStyles();
    };

    const updateTabStyles = () => {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.view === window.currentReviewView) {
                btn.style.borderBottom = '2px solid var(--color-accent)';
                btn.style.color = 'var(--color-accent)';
            } else {
                btn.style.borderBottom = 'none';
                btn.style.color = 'var(--color-text-secondary)';
            }
        });
    };

    setTimeout(() => window.renderReviewPage(), 50);

    return `
        <div style="display: flex; min-height: 80vh;">
            ${AdminSidebar('Reviews')}
            <div class="admin-content" style="flex: 1; padding: 2rem;">
                 <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Reviews & Ratings</h2>
                </header>

                <div style="border-bottom: 1px solid var(--color-bg-tertiary); margin-bottom: 1.5rem; display: flex; gap: 1.5rem;">
                    <button class="tab-btn" data-view="pending" onclick="window.setReviewView('pending')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; border-bottom: 2px solid var(--color-accent); color: var(--color-accent);">Pending Moderation</button>
                    <button class="tab-btn" data-view="all" onclick="window.setReviewView('all')" style="background: none; border: none; padding: 0.5rem 0; cursor: pointer; font-weight: 500; color: var(--color-text-secondary);">All Reviews</button>
                </div>

                <div id="reviews-content"></div>
            </div>
        </div>
    `;
};

export default AdminReviews;
