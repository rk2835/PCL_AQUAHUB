// Payment Page JavaScript

// Load booking data from localStorage
document.addEventListener('DOMContentLoaded', function() {
    loadBookingData();
    setupPaymentMethods();
    setupCardFormatting();
});

// Load booking data
function loadBookingData() {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    
    if (!bookingData.vendor) {
        alert('No booking data found. Redirecting to dashboard...');
        window.location.href = 'buyer-dashboard.html';
        return;
    }

    // Populate order summary
    document.getElementById('summary-vendor').textContent = bookingData.vendor || '-';
    document.getElementById('summary-capacity').textContent = bookingData.capacity || '-';
    document.getElementById('summary-size').textContent = bookingData.size || '-';
    document.getElementById('summary-water-type').textContent = bookingData.waterType || 'Not selected';

    // Populate address
    const addressDiv = document.getElementById('summary-address');
    if (bookingData.address) {
        const addr = bookingData.address;
        addressDiv.innerHTML = `
            <p>${addr.houseNo}, ${addr.streetAddress}</p>
            <p>${addr.area}, ${addr.city}</p>
            <p>${addr.state} - ${addr.pincode}</p>
            ${addr.landmark ? `<p><em>Landmark: ${addr.landmark}</em></p>` : ''}
        `;
    }

    // Calculate prices
    const basePrice = parseFloat(bookingData.price) || 0;
    const gstAmount = Math.round(basePrice * 0.18);
    const totalAmount = basePrice + gstAmount;

    document.getElementById('base-price').textContent = basePrice;
    document.getElementById('gst-amount').textContent = gstAmount;
    document.getElementById('total-amount').textContent = totalAmount;
    document.getElementById('pay-amount').textContent = totalAmount;

    // Store total for later use
    window.bookingTotal = totalAmount;
}

// Setup payment method switching
function setupPaymentMethods() {
    const paymentMethods = document.querySelectorAll('.payment-method');
    const radioButtons = document.querySelectorAll('input[name="payment"]');

    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            // Remove active class from all methods
            paymentMethods.forEach(method => method.classList.remove('active'));
            
            // Add active class to selected method
            const selectedMethod = this.closest('.payment-method');
            selectedMethod.classList.add('active');
        });
    });

    // Also allow clicking on the entire method header
    paymentMethods.forEach(method => {
        const header = method.querySelector('.method-header');
        header.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                const radio = this.querySelector('input[type="radio"]');
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });
    });
}

// Setup card number formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry');
    const cvvInput = document.getElementById('cvv');

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// Process payment
function processPayment() {
    const selectedMethod = document.querySelector('input[name="payment"]:checked');
    
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }

    const paymentMethod = selectedMethod.id;
    
    // Validate based on payment method
    if (!validatePaymentMethod(paymentMethod)) {
        return;
    }

    // Show loading state
    const payBtn = document.querySelector('.btn-pay');
    const originalText = payBtn.innerHTML;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payBtn.disabled = true;

    // Simulate payment processing
    setTimeout(() => {
        payBtn.innerHTML = originalText;
        payBtn.disabled = false;

        // Show success message
        showPaymentSuccess(paymentMethod);
    }, 2000);
}

// Validate payment method fields
function validatePaymentMethod(method) {
    switch(method) {
        case 'upi':
            const upiId = document.getElementById('upi-id').value.trim();
            if (!upiId) {
                alert('Please enter your UPI ID');
                return false;
            }
            if (!upiId.includes('@')) {
                alert('Please enter a valid UPI ID (e.g., yourname@paytm)');
                return false;
            }
            break;

        case 'card':
            const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;
            const cvv = document.getElementById('cvv').value;
            const cardName = document.getElementById('card-name').value.trim();

            if (!cardNumber || cardNumber.length < 15) {
                alert('Please enter a valid card number');
                return false;
            }
            if (!expiry || expiry.length < 5) {
                alert('Please enter a valid expiry date (MM/YY)');
                return false;
            }
            if (!cvv || cvv.length < 3) {
                alert('Please enter a valid CVV');
                return false;
            }
            if (!cardName) {
                alert('Please enter the cardholder name');
                return false;
            }
            break;

        case 'netbanking':
            const bank = document.getElementById('bank-select').value;
            if (!bank) {
                alert('Please select your bank');
                return false;
            }
            break;

        case 'wallet':
            // Wallet selection would be handled by the wallet buttons
            alert('Please select a wallet provider and complete the payment in their app');
            return false;

        case 'cod':
            // COD doesn't need validation
            break;

        default:
            alert('Invalid payment method');
            return false;
    }

    return true;
}

// Show payment success
function showPaymentSuccess(method) {
    const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
    const orderId = 'AH' + Date.now().toString().slice(-8);
    
    let message = '';
    
    if (method === 'cod') {
        message = `
            ✅ Booking Confirmed!
            
            Order ID: ${orderId}
            Payment Method: Cash on Delivery
            Amount: ₹${window.bookingTotal}
            
            Our delivery partner will contact you shortly.
            Please keep cash ready at the time of delivery.
            
            Thank you for choosing AquaHub! 💧
        `;
    } else {
        message = `
            ✅ Payment Successful!
            
            Order ID: ${orderId}
            Payment Method: ${method.toUpperCase()}
            Amount Paid: ₹${window.bookingTotal}
            
            Your water tanker has been booked successfully!
            Our delivery partner will contact you shortly.
            
            Thank you for choosing AquaHub! 💧
        `;
    }

    alert(message);

    // Clear booking data
    localStorage.removeItem('bookingData');

    // Redirect to dashboard
    setTimeout(() => {
        window.location.href = 'buyer-dashboard.html';
    }, 1000);
}

// Go back to dashboard
function goBack() {
    if (confirm('Are you sure you want to go back? Your booking data will be lost.')) {
        localStorage.removeItem('bookingData');
        window.location.href = 'buyer-dashboard.html';
    }
}

// Wallet button handlers
document.querySelectorAll('.wallet-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const walletName = this.querySelector('span').textContent;
        alert(`Redirecting to ${walletName}...`);
        // In real implementation, this would redirect to wallet's payment page
    });
});

// Bank logo handlers
document.querySelectorAll('.bank-logo').forEach(logo => {
    logo.addEventListener('click', function() {
        const bankSelect = document.getElementById('bank-select');
        const bankName = this.textContent.toLowerCase();
        
        // Try to match with select options
        const options = Array.from(bankSelect.options);
        const matchedOption = options.find(opt => 
            opt.text.toLowerCase().includes(bankName)
        );
        
        if (matchedOption) {
            bankSelect.value = matchedOption.value;
        }
    });
});
