// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Registration Form Tabs
const tabButtons = document.querySelectorAll('.tab-btn');
const formContainers = document.querySelectorAll('.registration-form-container');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        formContainers.forEach(container => container.classList.add('hidden'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(`${targetTab}-form`).classList.remove('hidden');
    });
});

// Form Validation and Submission
function setupFormValidation(formId, formType) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Password validation
        const password = form.querySelector(`#${formType}Password`).value;
        const confirmPassword = form.querySelector(`#${formType}ConfirmPassword`).value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }
        
        // Email validation
        const email = form.querySelector(`#${formType}Email`).value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address!');
            return;
        }
        
        // Phone validation
        const phone = form.querySelector(`#${formType}Phone`).value;
        const phoneRegex = /^[\+]?[1-9][\d]{9,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            alert('Please enter a valid phone number!');
            return;
        }
        
        // Vendor-specific validations
        if (formType === 'vendor') {
            const panNumber = form.querySelector('#panNumber').value;
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            if (!panRegex.test(panNumber)) {
                alert('Please enter a valid PAN number (format: ABCDE1234F)!');
                return;
            }
            
            const gstNumber = form.querySelector('#gstNumber').value;
            if (gstNumber && gstNumber.length !== 15) {
                alert('GST number must be 15 characters long!');
                return;
            }
        }
        
        // Simulate form submission
        const submitBtn = form.querySelector('.register-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Store user data in localStorage
            const userData = {
                type: formType,
                username: form.querySelector(`#${formType}Name`).value || form.querySelector(`#${formType}Username`).value,
                email: form.querySelector(`#${formType}Email`).value,
                registrationDate: new Date().toISOString()
            };
            localStorage.setItem('aquahub_user', JSON.stringify(userData));
            
            if (formType === 'customer') {
                alert('Customer registration successful! Redirecting to your dashboard...');
                setTimeout(() => {
                    window.location.href = 'buyer-dashboard.html';
                }, 1000);
            } else {
                alert('Vendor registration successful! Redirecting to your dashboard...');
                setTimeout(() => {
                    window.location.href = 'vendor-dashboard.html';
                }, 1000);
            }
        }, 2000);
        
        // Track registration event
        trackEvent('registration_completed', { type: formType });
    });
}

// Initialize form validation
setupFormValidation('customerForm', 'customer');
setupFormValidation('vendorForm', 'vendor');

// Check if user is already logged in and update dashboard links
document.addEventListener('DOMContentLoaded', function() {
    const userData = localStorage.getItem('aquahub_user');
    if (userData) {
        const user = JSON.parse(userData);
        updateDashboardLinks(user);
    }
});

function updateDashboardLinks(user) {
    const dashboardLinks = document.querySelectorAll('.dashboard-link');
    dashboardLinks.forEach(link => {
        if (user.type === 'customer' && link.href.includes('buyer-dashboard')) {
            link.textContent = `Go to ${user.username}'s Dashboard`;
        } else if (user.type === 'vendor' && link.href.includes('vendor-dashboard')) {
            link.textContent = `Go to ${user.username}'s Dashboard`;
        }
    });
    
    // Update hero buttons
    const heroButtons = document.querySelectorAll('.hero-btn');
    heroButtons.forEach(btn => {
        if (btn.href.includes('buyer-dashboard') && user.type === 'customer') {
            btn.innerHTML = '<i class="fas fa-tachometer-alt"></i> My Dashboard';
        } else if (btn.href.includes('vendor-dashboard') && user.type === 'vendor') {
            btn.innerHTML = '<i class="fas fa-tachometer-alt"></i> My Dashboard';
        }
    });
}

// Dynamic form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Show/hide additional capacity input for vendors
    const capacitySelect = document.getElementById('tankerCapacity');
    if (capacitySelect) {
        capacitySelect.addEventListener('change', function() {
            const otherCapacityGroup = document.getElementById('otherCapacityGroup');
            if (this.value === 'other') {
                if (!otherCapacityGroup) {
                    const newGroup = document.createElement('div');
                    newGroup.className = 'form-group';
                    newGroup.id = 'otherCapacityGroup';
                    newGroup.innerHTML = `
                        <label for="otherCapacity">Specify Capacity (Liters) *</label>
                        <input type="number" id="otherCapacity" name="otherCapacity" min="1000" required>
                    `;
                    capacitySelect.closest('.form-group').after(newGroup);
                }
            } else if (otherCapacityGroup) {
                otherCapacityGroup.remove();
            }
        });
    }
    
    // Auto-format phone numbers
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.substring(0, 10);
            }
            this.value = value;
        });
    });
    
    // Auto-uppercase PAN number
    const panInput = document.getElementById('panNumber');
    if (panInput) {
        panInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

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

// Observe elements for animation
document.querySelectorAll('.testimonial-card, .step, .feature, .faq-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Contact form submission
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const phone = this.querySelector('input[type="tel"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !phone || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Phone validation (basic)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            alert('Please enter a valid phone number');
            return;
        }
        
        // Simulate form submission
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Scroll to top functionality
function createScrollToTop() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: #17a2b8;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
    `;
    
    document.body.appendChild(scrollBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll to top button
createScrollToTop();

// Loading animation
window.addEventListener('load', () => {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;
    
    loader.innerHTML = `
        <div style="
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #17a2b8;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.appendChild(loader);
    
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 500);
    }, 1000);
});

// Testimonial carousel functionality
function initTestimonialCarousel() {
    const testimonialGrid = document.querySelector('.testimonial-grid');
    if (!testimonialGrid) return;
    
    let currentIndex = 0;
    const cards = testimonialGrid.querySelectorAll('.testimonial-card');
    
    // Auto-rotate testimonials on mobile
    if (window.innerWidth <= 768) {
        setInterval(() => {
            cards.forEach(card => card.style.display = 'none');
            cards[currentIndex].style.display = 'block';
            currentIndex = (currentIndex + 1) % cards.length;
        }, 3000);
    }
}

// Initialize testimonial carousel
initTestimonialCarousel();

// Resize handler
window.addEventListener('resize', () => {
    // Reinitialize components that depend on screen size
    initTestimonialCarousel();
});

// Performance optimization: Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// Add some interactive hover effects
document.querySelectorAll('.step, .feature, .testimonial-card').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

// Analytics tracking (placeholder)
function trackEvent(event, data) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', event, data);
}

// Track important interactions
document.querySelectorAll('.call-btn, .bottom-call-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('phone_call_clicked', { source: btn.className });
    });
});

document.querySelectorAll('.app-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        trackEvent('app_download_clicked', { 
            store: btn.href.includes('play.google') ? 'google_play' : 'app_store' 
        });
    });
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
