// Vendor Dashboard JavaScript

// Mobile menu functionality and page initialization
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

    initializeVendorDashboard();
    loadVendorData();
    setupEventListeners();
});

function initializeVendorDashboard() {
    // Load vendor data from localStorage
    const userData = localStorage.getItem('aquahub_user');
    if (userData) {
        const user = JSON.parse(userData);
        console.log('Welcome back,', user.username);
        
        // Update welcome message with vendor name
        const welcomeSection = document.querySelector('.welcome-section h1');
        if (welcomeSection && user.username) {
            welcomeSection.textContent = `Welcome back, ${user.username}!`;
        }
    }
}

function loadVendorData() {
    // Load vendor-specific data
    loadStats();
    loadRecentOrders();
}

function loadStats() {
    // In a real application, this would fetch data from the backend
    const stats = {
        activeOrders: 24,
        totalDeliveries: 156,
        monthlyRevenue: 45230,
        averageRating: 4.8
    };
    
    // Update stats in the UI (already displayed in HTML)
    console.log('Stats loaded:', stats);
}

function loadRecentOrders() {
    // In a real application, this would fetch orders from the backend
    console.log('Recent orders loaded');
}

function setupEventListeners() {
    // Modal close events
    const modal = document.getElementById('serviceModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.onclick = closeServiceModal;
    }
    
    if (modal) {
        window.onclick = function(event) {
            if (event.target == modal) {
                closeServiceModal();
            }
        };
    }
    
    // Service form submission
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmission);
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

// Quick Action Functions
function addNewService() {
    const modal = document.getElementById('serviceModal');
    modal.style.display = 'block';
}

function viewOrders() {
    alert('Order management feature coming soon!');
}

function updateProfile() {
    alert('Profile update feature coming soon!');
}

function viewReports() {
    alert('Reports and analytics feature coming soon!');
}

// Order Management Functions
function acceptOrder(orderId) {
    if (confirm(`Accept order ${orderId}?`)) {
        updateOrderStatus(orderId, 'confirmed');
        showNotification(`Order ${orderId} accepted successfully!`, 'success');
    }
}

function declineOrder(orderId) {
    if (confirm(`Decline order ${orderId}?`)) {
        updateOrderStatus(orderId, 'declined');
        showNotification(`Order ${orderId} declined.`, 'info');
    }
}

function trackOrder(orderId) {
    alert(`Tracking for order ${orderId}:\n\nStatus: In Transit\nEstimated Delivery: 2 hours\nDriver: Raj Kumar\nContact: +91 9876543210`);
}

function viewOrder(orderId) {
    alert(`Order Details for ${orderId}:\n\nCustomer: Mike Johnson\nService: Large Tanker (8000L)\nAddress: Koramangala, Bangalore\nDelivered: Aug 18, 2025\nAmount: ₹1,200\nRating: 5 stars`);
}

function updateOrderStatus(orderId, status) {
    // In a real application, this would update the backend
    const statusElement = document.querySelector(`tr:has([onclick*="${orderId}"]) .status`);
    if (statusElement) {
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `status ${status}`;
    }
}

// Service Management Functions
function editService(serviceType) {
    alert(`Edit ${serviceType} service feature coming soon!`);
}

function deleteService(serviceType) {
    if (confirm(`Are you sure you want to delete the ${serviceType} service?`)) {
        showNotification(`${serviceType} service deleted successfully!`, 'success');
        // In a real application, this would update the backend and remove the service card
    }
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.style.display = 'none';
    
    // Reset form
    const serviceForm = document.getElementById('serviceForm');
    if (serviceForm) {
        serviceForm.reset();
    }
}

async function handleServiceSubmission(event) {
    event.preventDefault();
    
    const confirmBtn = event.target.querySelector('.confirm-btn');
    const originalText = confirmBtn.textContent;
    
    // Show loading state
    confirmBtn.innerHTML = '<span class="loading"></span> Adding Service...';
    confirmBtn.disabled = true;
    
    try {
        const formData = new FormData(event.target);
        const serviceData = {
            name: formData.get('serviceName') || document.getElementById('serviceName').value,
            tankerSize: formData.get('tankerSize') || document.getElementById('tankerSize').value,
            waterType: formData.get('waterType') || document.getElementById('waterType').value,
            price: formData.get('servicePrice') || document.getElementById('servicePrice').value,
            coverageArea: formData.get('coverageArea') || document.getElementById('coverageArea').value,
            availability: formData.get('availability') || document.getElementById('availability').value,
            createdDate: new Date().toISOString(),
            serviceId: generateServiceId(),
            status: 'active'
        };
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Store service in localStorage (in real app, this would be sent to backend)
        const existingServices = JSON.parse(localStorage.getItem('aquahub_vendor_services') || '[]');
        existingServices.push(serviceData);
        localStorage.setItem('aquahub_vendor_services', JSON.stringify(existingServices));
        
        // Show success message and close modal
        showNotification('Service added successfully!', 'success');
        closeServiceModal();
        
        // Refresh services section (in real app, this would reload from backend)
        location.reload();
        
    } catch (error) {
        console.error('Service submission failed:', error);
        showNotification('Failed to add service. Please try again.', 'error');
    } finally {
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

function generateServiceId() {
    return 'SRV' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#28a745';
            break;
        case 'error':
            notification.style.background = '#dc3545';
            break;
        case 'info':
        default:
            notification.style.background = '#17a2b8';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('aquahub_user');
        localStorage.removeItem('aquahub_token');
        localStorage.removeItem('aquahub_vendor_services');
        window.location.href = 'index.html';
    }
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .loading {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        acceptOrder,
        declineOrder,
        addNewService,
        generateServiceId
    };
}
