// Wait for the entire HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // 1. ELEMENT SELECTORS
    // ======================================================
    const productGrid = document.querySelector('.product-grid');
    const cartItemsList = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.querySelector('.cart-count');
    const generateBillBtn = document.getElementById('generate-bill-btn');
    const searchInput = document.getElementById('search-input');
    
    // Modal Selectors
    const adminLoginBtn = document.getElementById('login-btn');
    const adminLoginModal = document.getElementById('admin-login-modal');
    const billModal = document.getElementById('bill-modal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const loginForm = document.getElementById('login-form');

    // ======================================================
    // 2. STATE MANAGEMENT
    // ======================================================
    let cart = []; // Array to store items in the cart, e.g., [{ id, name, price, quantity }]
    let isAdminLoggedIn = false;

    // ======================================================
    // 3. CORE FUNCTIONS
    // ======================================================

    /**
     * Renders all items from the cart state to the DOM
     */
    function renderCart() {
        // Clear the current cart display
        cartItemsList.innerHTML = '';

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<li class="cart-empty-msg">Your cart is empty.</li>';
        } else {
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.dataset.id = item.id;
                // Note: In a real app, you would create more robust controls for updating quantity
                li.innerHTML = `
                    <span>${item.name}</span>
                    <span>${item.quantity} x ₹${item.price.toFixed(2)}</span>
                    <span>₹${(item.quantity * item.price).toFixed(2)}</span>
                `;
                cartItemsList.appendChild(li);
            });
        }
        updateCartTotal();
        updateCartCount();
    }

    /**
     * Adds an item to the cart or updates its quantity if it already exists
     * @param {string} id - The product's unique ID
     * @param {string} name - The product's name
     * @param {number} price - The product's price
     * @param {number} quantity - The quantity to add
     */
    function addToCart(id, name, price, quantity) {
        if (quantity <= 0) return; // Don't add if quantity is zero or less

        const existingItem = cart.find(item => item.id === id);

        if (existingItem) {
            // If item already in cart, just update the quantity
            existingItem.quantity += quantity;
        } else {
            // If new item, add it to the cart array
            cart.push({ id, name, price, quantity });
        }

        renderCart(); // Re-render the cart UI
    }

    /**
     * Calculates and updates the total price of all items in the cart
     */
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = total.toFixed(2);
    }

    /**
     * Updates the little red counter on the cart icon in the navigation
     */
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
    
    /**
     * Filters products in the grid based on the search query
     */
    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const productName = card.dataset.name.toLowerCase();
            if (productName.includes(query)) {
                card.style.display = 'flex'; // Use 'flex' since that's our display type
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Generates a detailed bill and displays it in a modal
     */
    function handleGenerateBill() {
        const customerName = document.getElementById('customer-name').value;
        const billDetailsContainer = document.getElementById('bill-details');

        if (cart.length === 0) {
            alert("Your cart is empty. Add items before generating a bill.");
            return;
        }

        let billHTML = `
            <h3>Bill For: ${customerName || 'Valued Customer'}</h3>
            <p>Date: ${new Date().toLocaleString()}</p>
            <hr>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        cart.forEach(item => {
            billHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
            `;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        billHTML += `
                </tbody>
            </table>
            <hr>
            <p class="bill-total"><strong>Grand Total: ₹${total.toFixed(2)}</strong></p>
        `;
        
        billDetailsContainer.innerHTML = billHTML;
        billModal.style.display = 'block';
    }

    // ======================================================
    // 4. EVENT LISTENERS
    // ======================================================

    // Listen for clicks within the product grid
    productGrid.addEventListener('click', (e) => {
        // Check if the clicked element is an "Add to Cart" button
        if (e.target.classList.contains('add-to-cart-btn')) {
            const card = e.target.closest('.product-card');
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseFloat(card.querySelector('.product-price').dataset.price);
            const quantity = parseFloat(card.querySelector('.product-qty').value);
            
            addToCart(id, name, price, quantity);
        }
    });

    // Listen for input in the search bar
    searchInput.addEventListener('input', handleSearch);
    
    // Listen for clicks on the "Generate Bill" button
    generateBillBtn.addEventListener('click', handleGenerateBill);

    // --- Modal Logic ---
    adminLoginBtn.addEventListener('click', () => {
        if (isAdminLoggedIn) {
            // If already logged in, the button acts as a logout button
            isAdminLoggedIn = false;
            adminLoginBtn.innerHTML = '<i class="fas fa-user"></i> Admin Login';
            alert('You have been logged out.');
        } else {
            // If logged out, show the login modal
            adminLoginModal.style.display = 'block';
        }
    });

    // Add event listeners to all close buttons to close their parent modal
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modal if user clicks outside of the modal content
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Handle the login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from actually submitting
        const username = loginForm.querySelector('#username').value;
        const password = loginForm.querySelector('#password').value;

        // IMPORTANT: This is a simple, insecure login for demonstration only.
        // A real website MUST handle logins on a secure server.
        if (username === 'admin' && password === 'password') {
            isAdminLoggedIn = true;
            adminLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Logout';
            adminLoginModal.style.display = 'none';
            alert('Admin login successful!');
        } else {
            alert('Invalid username or password.');
        }
        loginForm.reset();
    });

    // ======================================================
    // 5. INITIALIZATION
    // ======================================================
    renderCart(); // Initial render of the cart on page load

});
          
