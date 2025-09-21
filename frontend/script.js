document.addEventListener('DOMContentLoaded', () => {

    // --- Page Elements ---
    const pages = document.querySelectorAll('.page');
    const loginAsCustomerBtn = document.getElementById('login-as-customer-btn');
    const loginAsArtisanBtn = document.getElementById('login-as-artisan-btn');
    const customerLogoutBtn = document.getElementById('customer-logout-btn');
    const artisanLogoutBtn = document.getElementById('artisan-logout-btn');

// ADD THESE TWO LINES
const customerBackBtn = document.getElementById('customer-back-btn');
const artisanBackBtn = document.getElementById('artisan-back-btn');

    // --- Page Navigation Logic ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === pageId) {
                page.classList.add('active');
            }
        });
        // If we are showing the customer page, fetch the latest products
        if (pageId === 'customer-view-page') {
            fetchProducts();
        }
    }

    loginAsCustomerBtn.addEventListener('click', () => showPage('customer-view-page'));
    loginAsArtisanBtn.addEventListener('click', () => showPage('artisan-view-page'));
    customerLogoutBtn.addEventListener('click', () => showPage('login-choice-page'));
    artisanLogoutBtn.addEventListener('click', () => showPage('login-choice-page'));
    // --- Page Navigation Logic ---
// ... (other listeners)

// ADD THESE TWO LINES
customerBackBtn.addEventListener('click', () => showPage('login-choice-page'));
artisanBackBtn.addEventListener('click', () => showPage('login-choice-page'));

    // --- Customer View Logic ---
    const productGrid = document.getElementById('product-grid');
    const cartCountSpan = document.getElementById('cart-count');
    let cartCount = 0;

    // New function to fetch products from the backend
    async function fetchProducts() {
        try {
            // NOTE: Replace with your live Render URL when deployed
            const response = await fetch('http://localhost:3000/get-products');
            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            productGrid.innerHTML = '<p>Could not load products. Please try again later.</p>';
        }
    }

    function renderProducts(products) {
        productGrid.innerHTML = '';
        if (!products || products.length === 0) {
            productGrid.innerHTML = '<p>No products available right now.</p>';
            return;
        }
        
        products.forEach(product => {
            // Construct the full image URL
            const imageUrl = `http://localhost:3000${product.image}`;
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
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

    // --- Artisan AI Product Upload Logic ---
    const productUploadForm = document.getElementById('product-upload-form');
    const uploadStatus = document.getElementById('upload-status');

    productUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        uploadStatus.textContent = 'Uploading and analyzing with AI... Please wait.';

        // Use FormData to send the file and price
        const formData = new FormData(productUploadForm);
        
        try {
            // NOTE: Replace with your live Render URL when deployed
            const response = await fetch('http://localhost:3000/upload-product', {
                method: 'POST',
                body: formData, // No 'Content-Type' header needed, browser sets it
            });

            if (response.ok) {
                const newProduct = await response.json();
                uploadStatus.innerHTML = `<p style="color: green;">Success! Product "${newProduct.name}" added.</p>`;
                productUploadForm.reset();
            } else {
                throw new Error('Upload failed.');
            }
        } catch (error) {
            console.error('Error uploading product:', error);
            uploadStatus.innerHTML = `<p style="color: red;">Error: Could not add product.</p>`;
        }
    });

    // --- Initial Load ---
    showPage('login-choice-page');
});