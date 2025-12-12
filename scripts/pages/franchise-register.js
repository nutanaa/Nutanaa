const FranchiseRegister = () => {

    setTimeout(() => {
        window.handleRegistrationSubmit = (e) => {
            e.preventDefault();
            alert('Application Submitted Successfully! Reference ID: FR-' + Math.floor(Math.random() * 10000) + '\nWe will verify your documents and visit the location shortly.');
            window.location.hash = '#/';
        };

        window.getLocation = () => {
            const btn = document.getElementById('location-btn');
            const output = document.getElementById('location-output');

            btn.innerText = 'Detecting...';

            // Simulation
            setTimeout(() => {
                const lat = (12.97 + Math.random() * 0.1).toFixed(6);
                const lng = (77.59 + Math.random() * 0.1).toFixed(6);
                output.value = `${lat}, ${lng}`;
                btn.innerText = '✅ Location Captured';
                btn.style.backgroundColor = '#10b981';
                btn.style.color = 'white';
                btn.disabled = true;
            }, 1000);
        };
    }, 100);

    return `
        <div class="page-container" style="max-width: 800px; margin: 0 auto; padding: 4rem 1rem;">
             <div class="card" style="padding: 2.5rem;">
                <h1 style="margin-bottom: 1rem; text-align: center; color: var(--color-accent);">Franchise Partner Registration</h1>
                <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 3rem;">
                    Complete your e-KYC and Business Profile to join the Nutanaa Network.
                </p>

                <form onsubmit="window.handleRegistrationSubmit(event)" style="display: grid; gap: 2rem;">
                    
                    <!-- Section 1: Personal Info -->
                    <div style="border-bottom: 1px solid var(--color-bg-tertiary); padding-bottom: 2rem;">
                        <h3 style="margin-bottom: 1.5rem;">1. Partner Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                             <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Full Name</label>
                                <input type="text" required class="form-input" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Mobile</label>
                                <input type="tel" required class="form-input" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                            </div>
                            <div style="grid-column: span 2;">
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Profile Photo</label>
                                <input type="file" required accept="image/*" style="font-size: 0.9rem;">
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: e-KYC -->
                    <div style="border-bottom: 1px solid var(--color-bg-tertiary); padding-bottom: 2rem;">
                        <h3 style="margin-bottom: 1.5rem;">2. e-KYC Verification</h3>
                        <div style="display: grid; gap: 1.5rem;">
                             <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Aadhar Number</label>
                                <input type="text" required placeholder="XXXX-XXXX-XXXX" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                            </div>
                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">PAN Number</label>
                                <input type="text" required placeholder="ABCDE1234F" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Upload Aadhar (Front/Back)</label>
                                    <input type="file" required style="font-size: 0.9rem;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.9rem; margin-bottom: 0.5rem;">Upload PAN Card</label>
                                    <input type="file" required style="font-size: 0.9rem;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: Business Location -->
                     <div>
                        <h3 style="margin-bottom: 1.5rem;">3. Business Location</h3>
                        <div style="display: grid; gap: 1.5rem;">
                             <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Store Address</label>
                                <textarea required rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);"></textarea>
                            </div>

                            <div>
                                <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Photos of Business (Interior/Exterior)</label>
                                <input type="file" multiple required accept="image/*" style="font-size: 0.9rem;">
                                <p style="font-size: 0.8rem; color: var(--color-text-secondary); margin-top: 0.25rem;">Upload at least 2 photos (Max 5MB each)</p>
                            </div>
                            
                            <!-- Geo Location -->
                            <div style="background: var(--color-bg-secondary); padding: 1.5rem; border-radius: var(--radius-md); border: 1px dashed var(--color-accent);">
                                <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Geo-Tag Location</label>
                                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1rem;">We need the exact GPS coordinates for Google Maps verification.</p>
                                
                                <div style="display: flex; gap: 1rem;">
                                    <button type="button" id="location-btn" onclick="window.getLocation()" class="btn" style="background: white; color: var(--color-accent); border: 1px solid var(--color-accent);">
                                        📍 Detect My Current Location
                                    </button>
                                    <input type="text" id="location-output" readonly placeholder="Waiting for location..." style="flex: 1; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm); background: #eee;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="btn" style="justify-content: center; padding: 1rem; font-size: 1.1rem; margin-top: 1rem;">Submit Application</button>
                </form>
            </div>
        </div>
    `;
};

export default FranchiseRegister;
