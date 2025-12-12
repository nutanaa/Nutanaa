const Contact = () => {
    setTimeout(() => {
        window.handleContactSubmit = (e) => {
            e.preventDefault();
            alert('Thank you for contacting us! We will get back to you shortly.');
            window.location.hash = '#/';
        };
    }, 100);

    return `
        <div class="page-container" style="max-width: 800px; margin: 0 auto; padding: 4rem 1rem;">
            <div class="card" style="padding: 3rem;">
                <h1 style="text-align: center; margin-bottom: 1rem; color: var(--color-accent);">Contact Us</h1>
                <p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 3rem;">
                    We'd love to hear from you. Fill out the form below or reach us at <a href="mailto:support@nutanaa.com">support@nutanaa.com</a>.
                </p>

                <form onsubmit="window.handleContactSubmit(event)" style="display: grid; gap: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div>
                            <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">First Name</label>
                            <input type="text" required class="form-input" placeholder="John" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Last Name</label>
                            <input type="text" required class="form-input" placeholder="Doe" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                        </div>
                    </div>

                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Email Address</label>
                        <input type="email" required class="form-input" placeholder="john@example.com" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm);">
                    </div>

                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 0.5rem;">Message</label>
                        <textarea required rows="5" class="form-input" placeholder="How can we help you?" style="width: 100%; padding: 0.75rem; border: 1px solid var(--color-bg-tertiary); border-radius: var(--radius-sm); font-family: inherit;"></textarea>
                    </div>

                    <button type="submit" class="btn" style="justify-content: center;">Send Message</button>
                </form>
            </div>
        </div>
    `;
};

export default Contact;
