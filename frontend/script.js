document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA (For Customer View) ---
    const products = [
        { name: 'Handcrafted Wooden Bowl', price: 2800, info: 'A beautiful bowl made from sustainable cherry wood.', image: 'https://images.unsplash.com/photo-1570355152286-881c5a27e7f3?w=500' },
        { name: 'Woven Wall Hanging', price: 4500, info: 'Intricate macrame design to elevate any room.', image: 'https://images.unsplash.com/photo-1618221319998-95a2a2a07c3a?w=500' },
        { name: 'Ceramic Coffee Mug', price: 1500, info: 'Hand-thrown and glazed, perfect for your morning coffee.', image: 'https://images.unsplash.com/photo-1594312213898-3a9a7a6a4d7d?w=500' },
        { name: 'Leather Journal', price: 3200, info: 'Genuine leather-bound journal for your thoughts.', image: 'https://images.unsplash.com/photo-1516424322328-09cb33549b4b?w=500' }
    ];

    // --- Page Elements ---
    const pages = document.querySelectorAll('.page');
    const loginAsCustomerBtn = document.getElementById('login-as-customer-btn');
    const loginAsArtisanBtn = document.getElementById('login-as-artisan-btn');
    const customerLogoutBtn = document.getElementById('customer-logout-btn');
    const artisanLogoutBtn = document.getElementById('artisan-logout-btn');

    // --- Page Navigation Logic ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
            }
        });
    }

    loginAsCustomerBtn.addEventListener('click', () => showPage('customer-view-page'));
    loginAsArtisanBtn.addEventListener('click', () => showPage('artisan-view-page'));
    customerLogoutBtn.addEventListener('click', () => showPage('login-choice-page'));
    artisanLogoutBtn.addEventListener('click', () => showPage('login-choice-page'));

    // --- Customer View Logic ---
    const productGrid = document.getElementById('product-grid');
    const cartCountSpan = document.getElementById('cart-count');
    let cartCount = 0;

    function renderProducts() {
        productGrid.innerHTML = ''; 
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.info}</p>
                <p class="price">₹${product.price.toLocaleString('en-IN')}</p>
                <button class="add-to-cart-btn">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    productGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            cartCount++;
            cartCountSpan.textContent = cartCount;
        }
    });

    // --- Artisan AI Analyst Logic ---
    const productAnalysisForm = document.getElementById('product-analysis-form');
    const aiResultsSection = document.getElementById('ai-results-section');
    const aiResultsContent = document.getElementById('ai-results-content');

    productAnalysisForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const productData = {
            productName: document.getElementById('productName').value,
            productCategory: document.getElementById('productCategory').value,
            rawMaterialCost: document.getElementById('rawMaterialCost').value,
            sellingPrice: document.getElementById('sellingPrice').value
        };

        aiResultsSection.style.display = 'block';
        aiResultsContent.innerHTML = '<div class="loader"></div>';

        try {
            // This is the crucial part: calling your backend server
            const response = await fetch('https://artisan-58r6.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Use the 'marked' library to convert Markdown text from the AI to HTML
            aiResultsContent.innerHTML = marked.parse(data.analysis);

        } catch (error) {
            console.error('Error fetching AI analysis:', error);
            aiResultsContent.innerHTML = `<p style="color: var(--error-color);">Sorry, an error occurred while analyzing. Please check if the backend server is running and try again.</p>`;
        }
    });

    // --- Initial Load ---
    renderProducts();
    showPage('login-choice-page');
});