// Login.js - Authentication and User Management

// Toggle between login and register forms
document.addEventListener('DOMContentLoaded', function() {
    const loginToggle = document.getElementById('loginToggle');
    const registerToggle = document.getElementById('registerToggle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const userTypeSelect = document.getElementById('userType');

    // Check URL parameters for intended user type
    const urlParams = new URLSearchParams(window.location.search);
    const intendedType = urlParams.get('type');
    
    // Store intended type for later use
    if (intendedType) {
        sessionStorage.setItem('intended_user_type', intendedType);
        
        // Pre-select user type in registration form
        if (userTypeSelect && (intendedType === 'customer' || intendedType === 'vendor')) {
            userTypeSelect.value = intendedType;
        }
        
        // Update page text to be more specific
        const loginHeader = document.querySelector('.login-header h1');
        const loginSubtext = document.querySelector('.login-header p');
        const userTypeHint = document.getElementById('userTypeHint');
        
        if (loginHeader && loginSubtext) {
            if (intendedType === 'customer') {
                loginHeader.textContent = 'Customer Login';
                loginSubtext.textContent = 'Sign in to book water tankers';
                
                if (userTypeHint) {
                    userTypeHint.innerHTML = '<i class="fas fa-info-circle"></i> New here? Click "Register" and select "Customer" to book water tankers';
                    userTypeHint.style.display = 'block';
                    userTypeHint.style.cssText = `
                        display: block;
                        margin-top: 1rem;
                        padding: 0.75rem 1rem;
                        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
                        color: #1565c0;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    `;
                }
            } else if (intendedType === 'vendor') {
                loginHeader.textContent = 'Vendor Login';
                loginSubtext.textContent = 'Sign in to manage your services';
                
                if (userTypeHint) {
                    userTypeHint.innerHTML = '<i class="fas fa-info-circle"></i> New here? Click "Register" and select "Vendor" to provide water services';
                    userTypeHint.style.display = 'block';
                    userTypeHint.style.cssText = `
                        display: block;
                        margin-top: 1rem;
                        padding: 0.75rem 1rem;
                        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
                        color: #e65100;
                        border-radius: 8px;
                        font-size: 0.9rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    `;
                }
            }
        }
    }

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
        
        // Check if there was an intended user type
        const intendedType = sessionStorage.getItem('intended_user_type');
        
        // Warn if user type doesn't match intended type, but still allow login
        if (intendedType && user.userType !== intendedType) {
            if (intendedType === 'customer' && user.userType === 'vendor') {
                showMessage('Note: You are logging in as a Vendor. To book water tankers, please register a Customer account.', 'warning');
                setTimeout(() => {
                    window.location.href = 'vendor-dashboard.html';
                }, 2000);
                return;
            } else if (intendedType === 'vendor' && user.userType === 'customer') {
                showMessage('Note: You are logging in as a Customer. To provide water services, please register a Vendor account.', 'warning');
                setTimeout(() => {
                    window.location.href = 'buyer-dashboard.html';
                }, 2000);
                return;
            }
        }
        
        // Clear intended type
        sessionStorage.removeItem('intended_user_type');
        
        // Redirect based on user type
        if (user.userType === 'customer') {
            window.location.href = 'buyer-dashboard.html';
        } else if (user.userType === 'vendor') {
            window.location.href = 'vendor-dashboard.html';
        }
        
        showMessage('Login successful! Redirecting...', 'success');
    } else {
        showMessage('Invalid email or password. Please try again or register a new account.', 'error');
    }
}

// Register user function
function registerUser(name, email, phone, password, userType) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('aquahub_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists! Please login instead.', 'error');
        return;
    }
    
    // Validate user type is selected
    if (!userType || userType === '') {
        showMessage('Please select whether you want to register as a Customer or Vendor.', 'error');
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
    
    // Clear intended type
    sessionStorage.removeItem('intended_user_type');
    
    // Redirect based on user type
    if (userType === 'customer') {
        showMessage('Registration successful! Redirecting to Customer Dashboard...', 'success');
        setTimeout(() => {
            window.location.href = 'buyer-dashboard.html';
        }, 1500);
    } else if (userType === 'vendor') {
        showMessage('Registration successful! Redirecting to Vendor Dashboard...', 'success');
        setTimeout(() => {
            window.location.href = 'vendor-dashboard.html';
        }, 1500);
    }
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
    
    // Determine icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    messageEl.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // Determine background color based on type
    let background = 'linear-gradient(135deg, #17a2b8, #20b2aa)'; // info (default)
    if (type === 'success') background = 'linear-gradient(135deg, #28a745, #20c997)';
    else if (type === 'error') background = 'linear-gradient(135deg, #dc3545, #e74c3c)';
    else if (type === 'warning') background = 'linear-gradient(135deg, #ffc107, #ff9800)';
    
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
        background: ${background};
        animation: slideIn 0.3s ease;
        max-width: 400px;
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
