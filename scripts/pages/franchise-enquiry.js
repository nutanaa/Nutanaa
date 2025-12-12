const FranchiseEnquiry = () => {
    setTimeout(() => {
        window.handleEnquirySubmit = (e) => {
            e.preventDefault();
            alert('Enquiry Request Received! Our team will contact you for initial screening.');
            window.location.hash = '#/';
        };
    }, 100);

    return `
        <div class="page-container" style="max-width: 600px; margin: 0 auto; padding: 4rem 1rem;">
             <div class="card" style="padding: 2.5rem; text-align: center;">
                <h1 style="margin-bottom: 1rem; color: var(--color-accent);">Franchise Enquiry</h1>
                <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
                    Interested in owning a Nutanaa Store? Submit a preliminary enquiry to check eligibility and availability in your area.
                </p>

                <form onsubmit="window.handleEnquirySubmit(event)" style="display: flex; flex-direction: column; gap: 1.5rem; text-align: left;">
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Full Name</label>
                        <input type="text" required placeholder="Your Name" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Phone Number</label>
                        <input type="tel" required placeholder="+91 98765 43210" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>

                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Proposed City/Location</label>
                        <input type="text" required placeholder="e.g. Bangaluru, Koramangala" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>

                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Investment Capacity (INR)</label>
                        <select style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm); bg: white;">
                            <option>5 Lakhs - 10 Lakhs</option>
                            <option>10 Lakhs - 25 Lakhs</option>
                            <option>25 Lakhs+</option>
                        </select>
                    </div>

                    <button type="submit" class="btn" style="justify-content: center; margin-top: 1rem;">Submit Enquiry</button>
                    
                    <p style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center;">
                        Already discussed with us? <a href="#/franchise-register">Proceed to Registration</a>
                    </p>
                </form>
            </div>
        </div>
    `;
};

export default FranchiseEnquiry;
