import Store from '../store.js?v=10';

const Profile = async () => {
    const user = Store.getUser();

    if (!user) {
        window.location.hash = '#/login';
        return '';
    }

    // Tab Logic
    window.switchTab = (tabId) => {
        document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

        document.getElementById(tabId).style.display = 'block';
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    };

    // Order Actions
    window.cancelOrder = (id) => {
        if (confirm('Are you sure you want to cancel this order?')) {
            if (Store.cancelOrder(id)) {
                alert('Order Cancelled Successfully');
            } else {
                alert('Failed to cancel order.');
            }
        }
    };

    window.returnOrder = (id) => {
        if (confirm('Request return for this order?')) {
            if (Store.returnOrder(id)) {
                alert('Return Requested Successfully');
            } else {
                alert('Return window closed or invalid order.');
            }
        }
    };

    // Render Orders
    const renderOrders = () => {
        // Use user.email as the ID for now as per Store logic
        const orders = Store.getOrders(user.role === 'admin' ? 'all' : (user.email || 'user@nutanaa.com'));
        // Fallback for mock: if user has no specific orders, show default user orders for demo
        const demoOrders = Store.getOrders('user@nutanaa.com');
        const displayOrders = orders.length > 0 ? orders : (user.role === 'user' ? demoOrders : []);

        if (displayOrders.length === 0) {
            return '<p>No orders found.</p>';
        }

        return displayOrders.map(order => `
            <div class="card" style="margin-bottom: 1rem; padding: 1.5rem; border-left: 5px solid ${getStatusColor(order.status)}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <strong>Order #${order.id}</strong><br>
                        <span style="color: var(--color-text-secondary); font-size: 0.9rem;">${order.date}</span>
                    </div>
                    <div style="text-align: right;">
                        <strong>$${order.total.toFixed(2)}</strong><br>
                        <span style="color: ${getStatusColor(order.status)}; font-weight: bold;">${order.status}</span>
                    </div>
                </div>
                <div style="margin-bottom: 1rem; font-size: 0.95rem;">
                    ${order.items.map(i => `
                        <div style="padding: 0.25rem 0;">
                            ${i.id ?
                `<a href="#/product/${i.id}" onclick="event.stopPropagation();" style="color: var(--color-accent); text-decoration: underline; cursor: pointer; font-weight: 500;">${i.name}</a>`
                : i.name} 
                            <span style="color: var(--color-text-secondary);">($${i.price})</span>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: right;">
                    ${order.status === 'Processing' ? `<button class="btn" style="background: #ef4444; padding: 0.5rem;" onclick="window.cancelOrder('${order.id}')">Cancel Order</button>` : ''}
                    ${order.status === 'Delivered' ? `<button class="btn" style="background: #f59e0b; padding: 0.5rem;" onclick="window.returnOrder('${order.id}')">Return Item</button>` : ''}
                </div>
            </div>
        `).join('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return '#10b981';
            case 'Processing': return '#3b82f6';
            case 'Shipped': return '#8b5cf6';
            case 'Cancelled': return '#ef4444';
            case 'Returned': return '#f59e0b';
            default: return '#64748b';
        }
    };

    // Address Logic
    window.handleLocationDetect = () => {
        const btn = document.getElementById('detect-btn');
        const status = document.getElementById('geo-status');
        const latInput = document.getElementById('addr-lat');
        const lngInput = document.getElementById('addr-lng');

        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        btn.disabled = true;
        btn.innerText = 'Detecting...';
        status.innerText = 'Waiting for permission...';

        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            latInput.value = latitude;
            lngInput.value = longitude;
            status.innerHTML = `✅ Coordinates Captured: <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank">${latitude.toFixed(4)}, ${longitude.toFixed(4)}</a>`;
            btn.innerText = '📍 Refine Location';
            btn.disabled = false;
        }, (error) => {
            status.innerText = '❌ Failed to get location: ' + error.message;
            btn.innerText = '📍 Detect Location';
            btn.disabled = false;
        });
    };

    window.handleAddAddress = (e) => {
        e.preventDefault();
        const type = document.getElementById('addr-type').value;
        const text = document.getElementById('addr-text').value;
        const lat = document.getElementById('addr-lat').value;
        const lng = document.getElementById('addr-lng').value;

        if (!lat || !lng) {
            alert('Please detect your location to save accurate coordinates.');
            return;
        }

        Store.addAddress({
            userId: user.role === 'admin' ? 'admin@nutanaa.com' : (user.email || 'user@nutanaa.com'),
            type,
            address: text,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        });

        e.target.reset();
        document.getElementById('geo-status').innerText = '';
        document.getElementById('detect-btn').innerText = '📍 Detect Location';
        alert('Address Added Successfully!');
    };

    window.deleteAddress = (id) => {
        if (confirm('Delete this address?')) {
            Store.removeAddress(id);
        }
    };

    const renderAddresses = () => {
        const addresses = Store.getAddresses(user.role === 'admin' ? 'admin@nutanaa.com' : (user.email || 'user@nutanaa.com'));

        if (addresses.length === 0) return '<p>No addresses saved.</p>';

        return addresses.map(addr => `
            <div style="border: 1px solid var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; position: relative;">
                <button onclick="window.deleteAddress('${addr.id}')" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #ef4444; cursor: pointer;">🗑️</button>
                <strong>${addr.type}</strong><br>
                ${addr.address}
                <div style="margin-top: 0.75rem; font-size: 0.9rem; display: flex; gap: 1rem;">
                     <a href="https://www.google.com/maps?q=${addr.lat},${addr.lng}" target="_blank" style="color: var(--color-accent); font-weight: 500; display: flex; align-items: center; gap: 0.25rem;">
                        📍 View on Google Maps
                     </a>
                     <span style="color: var(--color-text-secondary);">(${addr.lat.toFixed(4)}, ${addr.lng.toFixed(4)})</span>
                </div>
            </div>
        `).join('');
    };

    setTimeout(() => {
        // Re-render on update
        window.addEventListener('orders-updated', () => {
            const container = document.getElementById('orders-list-container');
            if (container) container.innerHTML = renderOrders();
        });
        window.addEventListener('addresses-updated', () => {
            const container = document.getElementById('address-list-container');
            if (container) container.innerHTML = renderAddresses();
        });

        // Default tab
        window.switchTab('tab-profile');
    }, 100);

    return `
        <div class="page-container">
            <h1 style="margin-bottom: 2rem;">My Account</h1>
            
            <div style="display: grid; grid-template-columns: 250px 1fr; gap: 2rem;">
                <!-- Sidebar Tabs -->
                <div class="card" style="padding: 0; overflow: hidden; height: fit-content;">
                    <div class="tab-btn active" data-tab="tab-profile" onclick="window.switchTab('tab-profile')" 
                         style="padding: 1rem; cursor: pointer; border-bottom: 1px solid var(--color-bg-tertiary);">
                        👤 My Profile
                    </div>
                    <div class="tab-btn" data-tab="tab-orders" onclick="window.switchTab('tab-orders')" 
                         style="padding: 1rem; cursor: pointer; border-bottom: 1px solid var(--color-bg-tertiary);">
                        📦 My Orders
                    </div>
                    <div class="tab-btn" data-tab="tab-address" onclick="window.switchTab('tab-address')" 
                         style="padding: 1rem; cursor: pointer; border-bottom: 1px solid var(--color-bg-tertiary);">
                        📍 Addresses
                    </div>
                     <div class="tab-btn" data-tab="tab-payments" onclick="window.switchTab('tab-payments')" 
                         style="padding: 1rem; cursor: pointer;">
                        💳 Payment Methods
                    </div>
                    ${user.role === 'franchisee' ? `
                    <div class="tab-btn" data-tab="tab-docs" onclick="window.switchTab('tab-docs')" 
                         style="padding: 1rem; cursor: pointer; border-top: 1px solid var(--color-bg-tertiary);">
                        📄 Franchise Docs
                    </div>` : ''}
                </div>

                <!-- Content Area -->
                <div>
                    <!-- Profile Tab -->
                    <div id="tab-profile" class="tab-content">
                        <div class="card" style="padding: 2rem;">
                            <h2 style="margin-bottom: 1.5rem;">Personal Information</h2>
                            <form onclick="event.preventDefault()">
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Full Name</label>
                                    <input type="text" value="${user.name}" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                                </div>
                                <div style="margin-bottom: 1rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Email Address</label>
                                    <input type="email" value="${user.role === 'user' ? 'user@nutanaa.com' : 'admin@nutanaa.com'}" disabled style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm); background: #f1f5f9;">
                                </div>
                                <div style="margin-bottom: 1.5rem;">
                                    <label style="display: block; margin-bottom: 0.5rem;">Phone Number</label>
                                    <input type="tel" placeholder="+1 (555) 000-0000" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                                </div>
                                <button class="btn">Save Changes</button>
                            </form>
                        </div>
                    </div>

                    <!-- Orders Tab -->
                    <div id="tab-orders" class="tab-content" style="display: none;">
                        <h2 style="margin-bottom: 1.5rem;">Order History</h2>
                        <div id="orders-list-container">
                            ${renderOrders()}
                        </div>
                    </div>

                    <!-- Address Tab -->
                    <div id="tab-address" class="tab-content" style="display: none;">
                        <div class="card" style="padding: 2rem;">
                            <h2 style="margin-bottom: 1.5rem;">Saved Addresses</h2>
                            
                            <div id="address-list-container" style="margin-bottom: 2rem;">
                                ${renderAddresses()}
                            </div>

                            <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--color-bg-tertiary);">

                            <h3>Add New Address</h3>
                            <form onsubmit="window.handleAddAddress(event)" style="margin-top: 1rem; display: grid; gap: 1rem;">
                                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
                                    <input type="text" id="addr-type" placeholder="Type (e.g. Home)" required style="padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                                    <input type="text" id="addr-text" placeholder="Full Address" required style="padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                                </div>
                                
                                <div style="background: var(--color-bg-secondary); padding: 1rem; border-radius: var(--radius-sm);">
                                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                        <button type="button" id="detect-btn" onclick="window.handleLocationDetect()" class="btn" style="background: white; color: var(--color-accent); border: 1px solid var(--color-accent);">
                                            📍 Detect Location
                                        </button>
                                        <span id="geo-status" style="font-size: 0.9rem;"></span>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                        <input type="text" id="addr-lat" placeholder="Latitude" readonly style="background: #e2e8f0; border: 1px solid var(--color-bg-tertiary); padding: 0.5rem; border-radius: 4px;">
                                        <input type="text" id="addr-lng" placeholder="Longitude" readonly style="background: #e2e8f0; border: 1px solid var(--color-bg-tertiary); padding: 0.5rem; border-radius: 4px;">
                                    </div>
                                </div>

                                <button type="submit" class="btn">Save Address</button>
                            </form>
                        </div>
                    </div>

                     <!-- Payments Tab (Mock) -->
                    <div id="tab-payments" class="tab-content" style="display: none;">
                        <div class="card" style="padding: 2rem;">
                             <h2 style="margin-bottom: 1.5rem;">Payment Methods</h2>
                             <div style="display: flex; gap: 1rem; align-items: center; border: 1px solid var(--color-bg-tertiary); padding: 1rem; border-radius: var(--radius-sm);">
                                <div style="font-size: 2rem;">💳</div>
                                <div>
                                    <strong>Visa ending in 4242</strong><br>
                                    Expires 12/28
                                </div>
                                <button class="btn" style="margin-left: auto; background: transparent; border: 1px solid var(--color-bg-tertiary); color: var(--color-text-primary);">Remove</button>
                             </div>
                        </div>
                    </div>

                    <!-- Franchise Docs Tab -->
                    ${user.role === 'franchisee' ? `
                    <div id="tab-docs" class="tab-content" style="display: none;">
                        <div class="card" style="padding: 2rem;">
                            <h2 style="margin-bottom: 1.5rem;">Franchise Documents</h2>
                            <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">Managed by Nutanaa Admin Team</p>
                            
                            <div style="display: grid; gap: 1rem;">
                                ${Store.getFranchiseDocuments(user.email).map(doc => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                                        <div>
                                            <strong>${doc.type}</strong><br>
                                            <span style="font-size: 0.85rem; color: var(--color-text-secondary);">Uploaded: ${doc.uploadedAt}</span>
                                        </div>
                                        <div style="text-align: right;">
                                            <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 500; background: ${doc.status === 'Verified' ? '#dcfce7' : '#fef9c3'}; color: ${doc.status === 'Verified' ? '#166534' : '#854d0e'}; margin-bottom: 0.5rem;">
                                                ${doc.status}
                                            </span><br>
                                            <a href="${doc.url}" style="color: var(--color-accent); font-size: 0.9rem;">View Document</a>
                                        </div>
                                    </div>
                                `).join('') || '<p>No documents found.</p>'}
                            </div>
                        </div>
                    </div>` : ''}

                </div>
            </div>
            
            <style>
                .tab-btn.active {
                    background-color: var(--color-bg-secondary);
                    font-weight: bold;
                    color: var(--color-accent);
                    border-left: 3px solid var(--color-accent);
                }
                .tab-btn:hover:not(.active) {
                    background-color: #f8fafc;
                }
            </style>
        </div>
    `;
};

export default Profile;
