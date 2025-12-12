import { products } from '../data/products.js';
import Store from '../store.js?v=10';

const Home = async () => {

    // Carousel Logic
    setTimeout(() => {
        const track = document.getElementById('carousel-track');
        const slides = document.querySelectorAll('.carousel-slide');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        const updateSlide = () => {
            const width = track.clientWidth;
            track.style.transform = `translateX(-${currentIndex * width}px)`;
        };

        const nextSlide = () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlide();
        };

        const prevSlide = () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlide();
        };

        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);

        // Resize Listener to reset alignment
        window.addEventListener('resize', updateSlide);

        // Auto-play
        const interval = setInterval(nextSlide, 5000); // 5 seconds

        // Cleanup on route change (basic workaround)
        window.addEventListener('hashchange', () => clearInterval(interval), { once: true });

    }, 100);

    const slidesHtml = products.map(p => `
        <div class="carousel-slide">
             <a href="#/product/${p.id}" style="text-decoration: none; color: inherit; width: 100%; height: 100%;">
                <img src="${p.image}" alt="${p.name}">
                <div class="carousel-caption">
                    <h3 style="margin: 0; font-size: 1.2rem;">${p.name}</h3>
                    <p style="margin: 0; opacity: 0.9;">$${p.price.toFixed(2)}</p>
                </div>
             </a>
        </div>
    `).join('');

    return `
        <section class="hero" style="text-align: center; padding-bottom: 2rem; padding-top: 0;">
            
            <!-- Slider Component -->
            <div class="carousel-container">
                <div class="carousel-track" id="carousel-track">
                    ${slidesHtml}
                </div>
                <button class="carousel-btn carousel-prev" id="prev-btn">❮</button>
                <button class="carousel-btn carousel-next" id="next-btn">❯</button>
            </div>

            <div style="padding: 0 1rem;">
                <h1 style="margin-top: 1rem; margin-bottom: 0.5rem;">Welcome to Nutanaa Store</h1>
                <p style="margin-bottom: 1.5rem; color: var(--color-text-secondary); font-size: 1.1rem;">Premium products curated for modern living.</p>
                
                <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 3rem;">
                    <button class="btn" onclick="window.location.hash='#/products'">Shop Collection</button>
                    <button class="btn" style="background: white; color: var(--color-accent); border: 1px solid var(--color-accent);" onclick="window.location.hash='#/contact'">Contact Us</button>
                </div>

                <!-- Most Purchased Products Section -->
                <div style="margin-bottom: 4rem;">
                    <h2 style="margin-bottom: 2rem; font-size: 1.8rem; color: var(--color-text-primary);">Most Purchased</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; text-align: left;">
                        ${products.slice(0, 4).map(p => `
                            <div class="card product-card" style="transition: transform 0.2s; cursor: pointer;" onclick="window.location.hash='#/product/${p.id}'">
                                <div style="aspect-ratio: 1; overflow: hidden; border-radius: var(--radius-md); margin-bottom: 1rem;">
                                    <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                </div>
                                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${p.name}</h3>
                                <div style="font-weight: bold; color: var(--color-accent);">$${p.price.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div style="margin-top: 2rem; text-align: center;">
                        <a href="#/products" style="color: var(--color-accent); font-weight: 500; text-decoration: none; border-bottom: 2px solid transparent; transition: all 0.2s;" onmouseover="this.style.borderBottomColor='var(--color-accent)'" onmouseout="this.style.borderBottomColor='transparent'">
                            For more products click here →
                        </a>
                    </div>
                </div>

                <!-- Franchise Opportunity Section -->
                <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2.5rem; text-align: left; border: 1px solid var(--color-bg-tertiary); background: linear-gradient(135deg, #fff 0%, #f3f4f6 100%);">
                    <div style="display: flex; flex-direction: column; md:flex-row; gap: 2rem; align-items: center;">
                        <div style="flex: 1;">
                            <h2 style="margin-bottom: 0.5rem;">Partner with Nutanaa</h2>
                            <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">
                                Join our rapidly growing network of franchise owners. Complete ownership, full support, and premium branding.
                            </p>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <a href="#/franchise-enquiry" class="btn" style="font-size: 0.9rem;">Franchise Enquiry</a>
                                ${Store.hasPermission('register_franchise') ?
            `<a href="#/franchise-register" class="btn" style="background: var(--color-text-primary); font-size: 0.9rem;">Register Partner (e-KYC)</a>`
            : ''}
                            </div>
                        </div>
                         <div style="flex: 1; text-align: center;">
                             <div style="font-size: 4rem;">🤝</div>
                        </div>
                    </div>
                </div>

                <!-- Links Removed as per request -->

            </div>
        </section>
    `;
};

export default Home;
