// Login.js - Authentication and User Management

// Toggle between login and register forms
document.addEventListener('DOMContentLoaded', function() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginToggle.addEventListener('click', function() {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    });

    registerToggle.addEventListener('click', function() {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        loginUser(email, password);
    });

    // Handle register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const userType = document.getElementById('userType').value;
        
        registerUser(name, email, phone, password, userType);
    });
});

// Demo login function
function demoLogin(userType) {
    if (userType === 'customer') {
        // Set demo customer session
        setUserSession({
            id: 'demo_customer_001',
            name: 'Demo Customer',
            email: 'customer@demo.com',
            userType: 'customer',
            isDemo: true
        });
        window.location.href = 'buyer-dashboard.html';
    } else if (userType === 'vendor') {
        // Set demo vendor session
        setUserSession({
            id: 'demo_vendor_001',
            name: 'Demo Vendor',
            email: 'vendor@demo.com',
            userType: 'vendor',
            isDemo: true
        });
        window.location.href = 'vendor-dashboard.html';
    }
}

// Login user function
function loginUser(email, password) {
    // Get stored users from localStorage
    const users = JSON.parse(localStorage.getItem('aquahub_users') || '[]');
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Set user session
        setUserSession(user);
        
        // Redirect based on user type
        if (user.userType === 'customer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        }
        
        showMessage('Login successful! Redirecting...', 'success');
    } else {
        showMessage('Invalid email or password. Please try again.', 'error');
    }
}

// Register user function
function registerUser(name, email, phone, password, userType) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('aquahub_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user_' + Date.now(),
        name: name,
        email: email,
        phone: phone,
        password: password,
        userType: userType,
        registeredAt: new Date().toISOString(),
        isDemo: false
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('aquahub_users', JSON.stringify(users));
    
    // Set user session
    setUserSession(newUser);
    
    // Redirect based on user type
    if (userType === 'customer') {
        window.location.href = 'buyer-dashboard.html';
    } else if (userType === 'vendor') {
        window.location.href = 'vendor-dashboard.html';
    }
    
    showMessage('Registration successful! Redirecting...', 'success');
}

// Set user session
function setUserSession(user) {
    // Store current user session
    localStorage.setItem('aquahub_current_user', JSON.stringify(user));
}

// Get current user session
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('aquahub_current_user') || 'null');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Logout function
function logout() {
    localStorage.removeItem('aquahub_current_user');
    window.location.href = 'login.html';
}

// Check user permissions
function checkUserAccess(requiredUserType) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (currentUser.userType !== requiredUserType) {
        showMessage('Access denied. You do not have permission to view this page.', 'error');
        // Redirect to appropriate dashboard
        if (currentUser.userType === 'customer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (currentUser.userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        }
        return false;
    }
    
    return true;
}

// Show message function
function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message ${type}`;
    messageEl.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #e74c3c)'};
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
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
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 4 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            messageEl.remove();
            style.remove();
        }, 300);
    }, 4000);
}

// Initialize some demo users if none exist
function initializeDemoUsers() {
    const users = JSON.parse(localStorage.getItem('aquahub_users') || '[]');
    
    if (users.length === 0) {
        const demoUsers = [
            {
                id: 'demo_admin_customer',
                name: 'John Customer',
                email: 'customer@aquahub.com',
                phone: '+91 9876543210',
                password: 'customer123',
                userType: 'customer',
                registeredAt: new Date().toISOString(),
                isDemo: false
            },
            {
                id: 'demo_admin_vendor',
                name: 'Mike Vendor',
                email: 'vendor@aquahub.com',
                phone: '+91 9876543211',
                password: 'vendor123',
                userType: 'vendor',
                registeredAt: new Date().toISOString(),
                isDemo: false
            }
        ];
        
        localStorage.setItem('aquahub_users', JSON.stringify(demoUsers));
    }
}

// Initialize demo users when page loads
document.addEventListener('DOMContentLoaded', initializeDemoUsers);
