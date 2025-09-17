// Buyer Dashboard JavaScript

// Global variables
let selectedTanker = null;
let allTankers = [];

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    initializePage();
    loadTankerData();
    setupEventListeners();
});

// Initialize the page
function initializePage() {
    // Set minimum date to today
    const dateInput = document.getElementById('deliveryDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    // Load user data from localStorage
    const userData = localStorage.getItem('aquahub_user');
    if (userData) {
        const user = JSON.parse(userData);
        console.log('Welcome back,', user.username);
    }
}

function loadTankerData() {
    // Store tanker data for filtering
    allTankers = Array.from(document.querySelectorAll('.tanker-card')).map(card => ({
        element: card,
        size: card.dataset.size,
        vendor: card.dataset.vendor,
        price: parseInt(card.dataset.price),
        location: card.querySelector('.tanker-details p:last-child').textContent
    }));
}

function setupEventListeners() {
    // Modal close events
    const modal = document.getElementById('orderModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    if (modal) {
        window.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
            }
        };
    }
    
    // Form submission
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
    
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
}

function selectTanker(size, vendor, price, capacity) {
    selectedTanker = {
        size: size,
        vendor: vendor,
        price: price,
        capacity: capacity
    };
    
    showOrderModal();
}

function showOrderModal() {
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    
    if (selectedTanker) {
        orderDetails.innerHTML = `
            <h3>Order Summary</h3>
            <div class="order-summary">
                <p><strong>Vendor:</strong> ${selectedTanker.vendor}</p>
                <p><strong>Tanker Size:</strong> ${selectedTanker.size.charAt(0).toUpperCase() + selectedTanker.size.slice(1)} (${selectedTanker.capacity}L)</p>
                <p><strong>Price:</strong> ₹${selectedTanker.price}</p>
                <p><strong>Water Type:</strong> Drinking Water</p>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('orderModal');
    modal.style.display = 'none';
    
    // Reset form
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.reset();
    }
}

async function handleOrderSubmission(event) {
    event.preventDefault();
    
    const confirmBtn = event.target.querySelector('.confirm-btn');
    const originalText = confirmBtn.textContent;
    
    // Show loading state
    confirmBtn.innerHTML = '<span class="loading"></span> Processing...';
    confirmBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const orderData = {
            tanker: selectedTanker,
            deliveryAddress: formData.get('deliveryAddress') || document.getElementById('deliveryAddress').value,
            deliveryDate: formData.get('deliveryDate') || document.getElementById('deliveryDate').value,
            deliveryTime: formData.get('deliveryTime') || document.getElementById('deliveryTime').value,
            specialInstructions: formData.get('specialInstructions') || document.getElementById('specialInstructions').value,
            orderDate: new Date().toISOString(),
            orderId: generateOrderId(),
            status: 'pending'
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store order in localStorage (in real app, this would be sent to backend)
        const existingOrders = JSON.parse(localStorage.getItem('aquahub_orders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('aquahub_orders', JSON.stringify(existingOrders));
        
        // Show success message
        showSuccessMessage();
        closeModal();
        
    } catch (error) {
        console.error('Order submission failed:', error);
        alert('Failed to submit order. Please try again.');
    } finally {
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

function generateOrderId() {
    return 'AQH' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <h3>🎉 Order Placed Successfully!</h3>
        <p>Order ID: ${selectedTanker ? generateOrderId() : 'AQH12345678'}</p>
        <p>You will receive a confirmation call within 30 minutes.</p>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function applyFilters() {
    const location = document.getElementById('location').value;
    const waterType = document.getElementById('water-type').value;
    const priceRange = document.getElementById('price-range').value;
    
    allTankers.forEach(tanker => {
        let show = true;
        
        // Location filter
        if (location && !tanker.location.toLowerCase().includes(location.toLowerCase())) {
            show = false;
        }
        
        // Price range filter
        if (priceRange) {
            const [min, max] = priceRange.split('-').map(p => parseInt(p.replace('+', '')));
            if (max) {
                if (tanker.price < min || tanker.price > max) {
                    show = false;
                }
            } else {
                if (tanker.price < min) {
                    show = false;
                }
            }
        }
        
        // Apply filter visual effect
        if (show) {
            tanker.element.classList.remove('filtered-out');
        } else {
            tanker.element.classList.add('filtered-out');
        }
    });
    
    // Show filter results
    const visibleTankers = allTankers.filter(t => !t.element.classList.contains('filtered-out'));
    showFilterResults(visibleTankers.length);
}

function showFilterResults(count) {
    // Remove existing filter message
    const existingMessage = document.querySelector('.filter-results');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add new filter message
    const message = document.createElement('div');
    message.className = 'filter-results';
    message.style.cssText = `
        background: #f0f4ff;
        border: 2px solid #667eea;
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
        text-align: center;
        color: #333;
        font-weight: 600;
    `;
    message.textContent = `Found ${count} tanker${count !== 1 ? 's' : ''} matching your criteria`;
    
    const tankerSelection = document.querySelector('.tanker-selection');
    tankerSelection.insertBefore(message, tankerSelection.querySelector('h2').nextSibling);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('aquahub_user');
        localStorage.removeItem('aquahub_token');
        window.location.href = 'index.html';
    }
}

// Smooth scrolling for navigation
function smoothScroll(target) {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth'
    });
}

// Add loading animation to tanker images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.tanker-image img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        img.addEventListener('error', function() {
            // Fallback image
            this.src = 'https://via.placeholder.com/400x250/667eea/ffffff?text=Water+Tanker';
        });
    });
});

// Advanced filtering with real-time search
function setupAdvancedFiltering() {
    const filterInputs = document.querySelectorAll('#location, #water-type, #price-range');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });
}

// Call advanced filtering setup
document.addEventListener('DOMContentLoaded', setupAdvancedFiltering);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe tanker cards for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const tankerCards = document.querySelectorAll('.tanker-card');
    tankerCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Price calculator
function calculateBulkPrice(basePrice, quantity) {
    let discount = 0;
    if (quantity >= 5) discount = 0.15; // 15% discount for 5+ tankers
    else if (quantity >= 3) discount = 0.10; // 10% discount for 3+ tankers
    else if (quantity >= 2) discount = 0.05; // 5% discount for 2+ tankers
    
    return basePrice * quantity * (1 - discount);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        selectTanker,
        applyFilters,
        calculateBulkPrice,
        generateOrderId
    };
}
