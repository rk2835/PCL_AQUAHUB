// Buyer Dashboard JavaScript

// Global variables
let selectedTanker = null;
let allTankers = [];
let map;
let marker;
let autocomplete;
let selectedLocation = null;
let useOpenStreetMap = false; // Flag to track which map system to use

// Initialize map (called by Google Maps callback or manually)
function initMap() {
    console.log('initMap called');
    
    // Check if Google Maps is available
    if (typeof google !== 'undefined' && google.maps) {
        console.log('Using Google Maps');
        useOpenStreetMap = false;
        initializeGoogleMaps();
    } else {
        console.log('Google Maps not available, using OpenStreetMap');
        useOpenStreetMap = true;
        initializeOpenStreetMap();
    }
}

// Initialize Google Maps
function initializeGoogleMaps() {
    const locationInput = document.getElementById('location');
    
    if (!locationInput) return;

    try {
        // Initialize Autocomplete
        autocomplete = new google.maps.places.Autocomplete(locationInput, {
            types: ['address'],
            componentRestrictions: { country: 'in' }, // Restrict to India
            fields: ['formatted_address', 'geometry', 'name', 'address_components']
        });

        // Listen for place selection
        autocomplete.addListener('place_changed', onPlaceChanged);

        // Current location button
        const currentLocationBtn = document.getElementById('useCurrentLocation');
        if (currentLocationBtn) {
            currentLocationBtn.addEventListener('click', getCurrentLocation);
        }
        
        showNotification('Map ready! Enter your location or use current location.', 'success');
    } catch (error) {
        console.error('Google Maps initialization failed:', error);
        useOpenStreetMap = true;
        initializeOpenStreetMap();
    }
}

// Initialize OpenStreetMap (Leaflet) as fallback
function initializeOpenStreetMap() {
    const locationInput = document.getElementById('location');
    
    if (!locationInput) return;

    // Add autocomplete using OpenStreetMap Nominatim
    let searchTimeout;
    locationInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value;
        
        if (query.length < 3) return;
        
        searchTimeout = setTimeout(() => {
            searchLocationOSM(query);
        }, 500);
    });

    // Current location button
    const currentLocationBtn = document.getElementById('useCurrentLocation');
    if (currentLocationBtn) {
        currentLocationBtn.addEventListener('click', getCurrentLocation);
    }
    
    showNotification('Map ready! Using OpenStreetMap. Enter your location or use current location.', 'info');
}

// Search for locations using OpenStreetMap Nominatim
function searchLocationOSM(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, India&limit=5`, {
        headers: {
            'User-Agent': 'AquaHub Water Booking App'
        }
    })
    .then(response => response.json())
    .then(results => {
        if (results && results.length > 0) {
            // Create a simple datalist for suggestions
            let datalist = document.getElementById('location-suggestions');
            if (!datalist) {
                datalist = document.createElement('datalist');
                datalist.id = 'location-suggestions';
                document.getElementById('location').setAttribute('list', 'location-suggestions');
                document.body.appendChild(datalist);
            }
            
            datalist.innerHTML = results.map(r => 
                `<option value="${r.display_name}" data-lat="${r.lat}" data-lon="${r.lon}"></option>`
            ).join('');
        }
    })
    .catch(error => {
        console.error('Location search failed:', error);
    });
}

// Handle place selection
function onPlaceChanged() {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
        showNotification('Please select a valid location from the dropdown', 'error');
        return;
    }

    // Extract address components
    let addressComponents = {};
    if (place.address_components) {
        place.address_components.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
                addressComponents.house_number = component.long_name;
            }
            if (types.includes('route')) {
                addressComponents.road = component.long_name;
            }
            if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
                addressComponents.suburb = component.long_name;
            }
            if (types.includes('locality')) {
                addressComponents.city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
                addressComponents.state = component.long_name;
            }
            if (types.includes('postal_code')) {
                addressComponents.postcode = component.long_name;
            }
        });
    }

    selectedLocation = {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.name,
        addressDetails: addressComponents
    };

    console.log('Selected location:', selectedLocation);
    
    // Auto-fill manual address form
    fillManualAddressFromLocation(addressComponents);
    
    // Show map with selected location
    showLocationOnMap(selectedLocation);
    
    showNotification(`📍 Location set and address form filled! You can modify the details if needed.`, 'success');
}

// Get current location using browser geolocation
function getCurrentLocation() {
    if (!navigator.geolocation) {
        showNotification('Geolocation is not supported by your browser', 'error');
        return;
    }

    showNotification('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            console.log('Current coordinates:', lat, lng);

            // Use OpenStreetMap for geocoding (works for both map systems)
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'User-Agent': 'AquaHub Water Booking App'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data && data.display_name) {
                    const locationInput = document.getElementById('location');
                    locationInput.value = data.display_name;

                    selectedLocation = {
                        address: data.display_name,
                        lat: lat,
                        lng: lng,
                        name: 'Current Location',
                        addressDetails: data.address // Store full address details
                    };

                    // Auto-fill the manual address form with detected location
                    fillManualAddressFromLocation(data.address);

                    showLocationOnMap(selectedLocation);
                    showNotification('📍 Current location detected and address form filled! You can modify the details if needed.', 'success');
                } else {
                    setLocationWithCoordinates(lat, lng);
                }
            })
            .catch(error => {
                console.error('Geocoding failed:', error);
                setLocationWithCoordinates(lat, lng);
            });
        },
        (error) => {
            let message = 'Unable to get your location';
            if (error.code === error.PERMISSION_DENIED) {
                message = 'Location permission denied. Please enable location access in your browser settings.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                message = 'Location information unavailable. Please try again.';
            } else if (error.code === error.TIMEOUT) {
                message = 'Location request timed out. Please try again.';
            }
            showNotification(message, 'error');
            console.error('Geolocation error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

// Fallback function when geocoding fails
function useCoordinatesOnly(lat, lng) {
    // Try alternative geocoding service as fallback
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
            'Accept-Language': 'en'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.display_name) {
            const locationInput = document.getElementById('location');
            locationInput.value = data.display_name;

            selectedLocation = {
                address: data.display_name,
                lat: lat,
                lng: lng,
                name: 'Current Location',
                addressDetails: data.address
            };

            // Auto-fill the manual address form
            fillManualAddressFromLocation(data.address);

            showLocationOnMap(selectedLocation);
            showNotification('📍 Current location detected and address form filled!', 'success');
        } else {
            setLocationWithCoordinates(lat, lng);
        }
    })
    .catch(error => {
        console.error('Fallback geocoding failed:', error);
        setLocationWithCoordinates(lat, lng);
    });
}

// Set location using only coordinates
function setLocationWithCoordinates(lat, lng) {
    const locationInput = document.getElementById('location');
    const coordinateString = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    locationInput.value = coordinateString;

    selectedLocation = {
        address: coordinateString,
        lat: lat,
        lng: lng,
        name: 'Current Location (Coordinates)'
    };

    showLocationOnMap(selectedLocation);
    showNotification('Location set using coordinates. You can refine the address manually.', 'info');
}

// Show location on map
function showLocationOnMap(location) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;

    mapDiv.style.display = 'block';

    if (useOpenStreetMap) {
        showLocationOnOpenStreetMap(location, mapDiv);
    } else {
        showLocationOnGoogleMaps(location, mapDiv);
    }
}

// Show location on Google Maps
function showLocationOnGoogleMaps(location, mapDiv) {
    try {
        if (!map) {
            map = new google.maps.Map(mapDiv, {
                zoom: 15,
                center: { lat: location.lat, lng: location.lng },
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
            });
        } else {
            map.setCenter({ lat: location.lat, lng: location.lng });
        }

        // Remove existing marker
        if (marker) {
            marker.setMap(null);
        }

        // Add new marker
        marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            animation: google.maps.Animation.DROP,
            title: location.name || location.address
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; font-family: 'Poppins', sans-serif;">
                    <h4 style="margin: 0 0 5px 0; color: #17a2b8;">📍 Delivery Location</h4>
                    <p style="margin: 0; color: #666;">${location.address}</p>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

        // Open info window by default
        infoWindow.open(map, marker);
    } catch (error) {
        console.error('Google Maps display failed:', error);
        useOpenStreetMap = true;
        showLocationOnOpenStreetMap(location, mapDiv);
    }
}

// Show location on OpenStreetMap using Leaflet
function showLocationOnOpenStreetMap(location, mapDiv) {
    if (!map) {
        // Create Leaflet map
        map = L.map(mapDiv).setView([location.lat, location.lng], 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
    } else {
        map.setView([location.lat, location.lng], 15);
    }

    // Remove existing marker
    if (marker) {
        map.removeLayer(marker);
    }

    // Add new marker
    marker = L.marker([location.lat, location.lng], {
        draggable: true
    }).addTo(map);

    // Add popup
    marker.bindPopup(`
        <div style="font-family: 'Poppins', sans-serif;">
            <h4 style="margin: 0 0 5px 0; color: #17a2b8;">📍 Delivery Location</h4>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">${location.address}</p>
            <p style="margin: 5px 0 0 0; color: #999; font-size: 0.8rem;">Drag marker to adjust</p>
        </div>
    `).openPopup();

    // Handle marker drag
    marker.on('dragend', function(event) {
        const position = event.target.getLatLng();
        updateLocationFromCoordinates(position.lat, position.lng);
    });

    // Handle map click
    map.on('click', function(event) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        
        marker.setLatLng([lat, lng]);
        updateLocationFromCoordinates(lat, lng);
    });
}

// Update location from coordinates
function updateLocationFromCoordinates(lat, lng) {
    showNotification('Updating address...', 'info');
    
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
            'User-Agent': 'AquaHub Water Booking App'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data && data.display_name) {
            const locationInput = document.getElementById('location');
            locationInput.value = data.display_name;

            selectedLocation = {
                address: data.display_name,
                lat: lat,
                lng: lng,
                name: 'Selected Location'
            };

            if (useOpenStreetMap && marker) {
                marker.setPopupContent(`
                    <div style="font-family: 'Poppins', sans-serif;">
                        <h4 style="margin: 0 0 5px 0; color: #17a2b8;">📍 Delivery Location</h4>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">${data.display_name}</p>
                        <p style="margin: 5px 0 0 0; color: #999; font-size: 0.8rem;">Drag marker to adjust</p>
                    </div>
                `).openPopup();
            }

            showNotification('Location updated!', 'success');
        }
    })
    .catch(error => {
        console.error('Geocoding failed:', error);
        showNotification('Could not get address. Location set to coordinates.', 'warning');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .notification-toast {
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
            gap: 0.75rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        }
        .notification-toast.success {
            background: linear-gradient(135deg, #28a745, #20c997);
        }
        .notification-toast.error {
            background: linear-gradient(135deg, #dc3545, #e74c3c);
        }
        .notification-toast.info {
            background: linear-gradient(135deg, #17a2b8, #20b2aa);
        }
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
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
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 4000);
}

// Setup manual address form functionality
function setupManualAddressForm() {
    const toggleBtn = document.getElementById('toggleManualAddress');
    const manualForm = document.getElementById('manualAddressForm');
    const locateBtn = document.getElementById('locateOnMap');
    const pincodeInput = document.getElementById('pincode');

    if (!toggleBtn || !manualForm) return;

    // Toggle manual address form
    toggleBtn.addEventListener('click', function() {
        const isVisible = manualForm.style.display !== 'none';
        manualForm.style.display = isVisible ? 'none' : 'block';
        toggleBtn.classList.toggle('active');
        
        if (!isVisible) {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i> Close Manual Entry';
            manualForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-keyboard"></i> Enter Address Manually';
        }
    });

    // Validate pincode input (only numbers, max 6 digits)
    if (pincodeInput) {
        pincodeInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
        });

        // Auto-lookup location when 6 digits entered
        pincodeInput.addEventListener('input', function(e) {
            if (this.value.length === 6) {
                lookupPincode(this.value);
            }
        });
    }

    // Locate on map button
    if (locateBtn) {
        locateBtn.addEventListener('click', locateManualAddress);
    }
}

// Fill manual address form from detected location
function fillManualAddressFromLocation(addressData) {
    if (!addressData) return;

    console.log('Filling address form with:', addressData);

    // Show the manual address form
    const manualForm = document.getElementById('manualAddressForm');
    const toggleBtn = document.getElementById('toggleManualAddress');
    
    if (manualForm && manualForm.style.display === 'none') {
        manualForm.style.display = 'block';
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.innerHTML = '<i class="fas fa-times"></i> Close Manual Entry';
        }
    }

    // Extract address components from OpenStreetMap/Nominatim response
    const houseNumber = addressData.house_number || '';
    const road = addressData.road || addressData.street || '';
    const suburb = addressData.suburb || addressData.neighbourhood || addressData.quarter || '';
    const city = addressData.city || addressData.town || addressData.village || 'Bangalore';
    const state = addressData.state || 'Karnataka';
    const postcode = addressData.postcode || '';

    // Fill the form fields
    if (document.getElementById('houseNo')) {
        document.getElementById('houseNo').value = houseNumber;
        // Add visual feedback
        highlightField('houseNo');
    }

    if (document.getElementById('streetAddress')) {
        document.getElementById('streetAddress').value = road;
        highlightField('streetAddress');
    }

    if (document.getElementById('area')) {
        document.getElementById('area').value = suburb;
        highlightField('area');
    }

    if (document.getElementById('city')) {
        document.getElementById('city').value = city;
        highlightField('city');
    }

    if (document.getElementById('state')) {
        const stateSelect = document.getElementById('state');
        // Try to match the state
        const stateOptions = Array.from(stateSelect.options);
        const matchedOption = stateOptions.find(opt => 
            opt.value.toLowerCase().includes(state.toLowerCase()) || 
            opt.text.toLowerCase().includes(state.toLowerCase())
        );
        if (matchedOption) {
            stateSelect.value = matchedOption.value;
        } else {
            stateSelect.value = 'Karnataka'; // Default
        }
        highlightField('state');
    }

    if (document.getElementById('pincode') && postcode) {
        document.getElementById('pincode').value = postcode;
        highlightField('pincode');
    }

    // Show notification
    showNotification('✅ Address form auto-filled! Please review and modify if needed.', 'success');

    // Scroll to the form
    setTimeout(() => {
        manualForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

// Highlight field with animation to show it was auto-filled
function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Add highlight class
    field.style.transition = 'all 0.3s ease';
    field.style.backgroundColor = '#d4edda';
    field.style.borderColor = '#28a745';

    // Remove highlight after 2 seconds
    setTimeout(() => {
        field.style.backgroundColor = '';
        field.style.borderColor = '';
    }, 2000);
}

// Lookup location by pincode
function lookupPincode(pincode) {
    if (pincode.length !== 6) return;

    showNotification('Looking up pincode...', 'info');

    // Use India Post API or OpenStreetMap
    fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(response => response.json())
        .then(data => {
            if (data && data[0] && data[0].Status === 'Success') {
                const postOffice = data[0].PostOffice[0];
                
                // Auto-fill area and city
                if (postOffice.Name && !document.getElementById('area').value) {
                    document.getElementById('area').value = postOffice.Name;
                }
                if (postOffice.District && !document.getElementById('city').value) {
                    document.getElementById('city').value = postOffice.District;
                }
                if (postOffice.State) {
                    const stateSelect = document.getElementById('state');
                    const matchingOption = Array.from(stateSelect.options).find(
                        opt => opt.value.toLowerCase() === postOffice.State.toLowerCase()
                    );
                    if (matchingOption) {
                        stateSelect.value = matchingOption.value;
                    }
                }
                
                showNotification(`✓ Pincode found: ${postOffice.Name}, ${postOffice.District}`, 'success');
            } else {
                showNotification('Pincode not found. Please verify and try again.', 'warning');
            }
        })
        .catch(error => {
            console.error('Pincode lookup failed:', error);
            showNotification('Could not verify pincode. You can still proceed.', 'warning');
        });
}

// Locate manual address on map
function locateManualAddress() {
    const houseNo = document.getElementById('houseNo').value.trim();
    const street = document.getElementById('streetAddress').value.trim();
    const area = document.getElementById('area').value.trim();
    const landmark = document.getElementById('landmark') ? document.getElementById('landmark').value.trim() : '';
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value;
    const pincode = document.getElementById('pincode').value.trim();
    const additionalInfo = document.getElementById('additionalInfo') ? document.getElementById('additionalInfo').value.trim() : '';

    // Validate required fields
    const validationErrors = [];
    
    if (!houseNo) {
        validationErrors.push('House/Flat/Building No.');
    }
    if (!street) {
        validationErrors.push('Street/Road Name');
    }
    if (!area) {
        validationErrors.push('Area/Locality');
    }
    if (!city) {
        validationErrors.push('City');
    }
    if (!state) {
        validationErrors.push('State');
    }
    if (!pincode || pincode.length !== 6) {
        validationErrors.push('Valid 6-digit Pincode');
    }

    // Show validation errors
    if (validationErrors.length > 0) {
        const errorMessage = `Please fill the following required fields: ${validationErrors.join(', ')}`;
        showNotification(errorMessage, 'error');
        
        // Focus on first empty required field
        if (!houseNo) document.getElementById('houseNo').focus();
        else if (!street) document.getElementById('streetAddress').focus();
        else if (!area) document.getElementById('area').focus();
        else if (!city) document.getElementById('city').focus();
        else if (!state) document.getElementById('state').focus();
        else if (!pincode || pincode.length !== 6) document.getElementById('pincode').focus();
        
        return;
    }

    // Build full address
    const addressParts = [houseNo, street, area];
    if (landmark) addressParts.push(`Near ${landmark}`);
    addressParts.push(city, state, pincode);

    const fullAddress = addressParts.join(', ');

    showNotification('📍 Locating your address on map...', 'info');

    // Geocode the address
    const query = `${houseNo} ${street}, ${area}, ${city}, ${pincode}, India`;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
        headers: {
            'User-Agent': 'AquaHub Water Booking App'
        }
    })
    .then(response => response.json())
    .then(results => {
        if (results && results.length > 0) {
            const result = results[0];
            
            // Update location input and selected location
            document.getElementById('location').value = fullAddress;
            
            selectedLocation = {
                address: fullAddress,
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                name: 'Manual Address',
                pincode: pincode,
                landmark: landmark,
                additionalInfo: additionalInfo,
                houseNo: houseNo,
                street: street,
                area: area,
                city: city,
                state: state
            };

            // Show on map
            showLocationOnMap(selectedLocation);
            
            showNotification(`✅ Address located successfully! ${area}, ${city}`, 'success');
            
            // Scroll to map
            setTimeout(() => {
                document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
            }, 500);
        } else {
            // Fallback: Try with just area and pincode
            geocodeByPincode(pincode, fullAddress);
        }
    })
    .catch(error => {
        console.error('Geocoding failed:', error);
        geocodeByPincode(pincode, fullAddress);
    });
}

// Fallback geocoding using just pincode
function geocodeByPincode(pincode, fullAddress) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincode}&country=India&limit=1`, {
        headers: {
            'User-Agent': 'AquaHub Water Booking App'
        }
    })
    .then(response => response.json())
    .then(results => {
        if (results && results.length > 0) {
            const result = results[0];
            
            document.getElementById('location').value = fullAddress;
            
            selectedLocation = {
                address: fullAddress,
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                name: 'Manual Address',
                pincode: pincode
            };

            showLocationOnMap(selectedLocation);
            showNotification(`📍 Location found using pincode ${pincode}`, 'success');
            
            document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
        } else {
            showNotification('Unable to locate address on map. Please check the details and try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Pincode geocoding failed:', error);
        showNotification('Unable to locate address. Please try using "Search" or "Current Location" instead.', 'error');
    });
}

// Mobile menu functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize map (will auto-detect Google Maps or use OpenStreetMap)
    setTimeout(() => {
        initMap();
    }, 500); // Small delay to ensure Google Maps script has loaded

    // Setup manual address form toggle
    setupManualAddressForm();

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

// ==================== BOOKING MODAL FUNCTIONALITY ====================

// Select tanker and show confirmation modal
function selectTanker(size, vendor, price, capacity) {
    // Get address details
    const address = getAddressDetails();
    
    // Get water type
    const waterTypeSelect = document.getElementById('water-type');
    const waterType = waterTypeSelect ? waterTypeSelect.options[waterTypeSelect.selectedIndex].text : 'Not selected';

    // Store booking data
    window.currentBooking = {
        size: size,
        vendor: vendor,
        price: price,
        capacity: capacity,
        address: address,
        waterType: waterType
    };

    // Populate modal
    document.getElementById('modal-vendor').textContent = vendor;
    document.getElementById('modal-capacity').textContent = capacity;
    document.getElementById('modal-size').textContent = size.charAt(0).toUpperCase() + size.slice(1);
    document.getElementById('modal-price').textContent = price;
    document.getElementById('modal-total').textContent = price;
    document.getElementById('modal-water-type').textContent = waterType;

    // Populate address in modal
    const modalAddress = document.getElementById('modal-address');
    if (address && address.houseNo) {
        modalAddress.innerHTML = `
            <p>${address.houseNo}, ${address.streetAddress}</p>
            <p>${address.area}, ${address.city}</p>
            <p>${address.state} - ${address.pincode}</p>
            ${address.landmark ? `<p><em>Landmark: ${address.landmark}</em></p>` : ''}
        `;
    } else {
        modalAddress.innerHTML = '<p style="color: #dc3545;">⚠️ Please enter your delivery address in the form above</p>';
    }

    // Show modal
    const modal = document.getElementById('bookingModal');
    modal.classList.add('show');
    modal.style.display = 'flex';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Get address details from manual form
function getAddressDetails() {
    const houseNo = document.getElementById('houseNo')?.value || '';
    const streetAddress = document.getElementById('streetAddress')?.value || '';
    const area = document.getElementById('area')?.value || '';
    const landmark = document.getElementById('landmark')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const state = document.getElementById('state')?.value || '';
    const pincode = document.getElementById('pincode')?.value || '';
    const additionalInfo = document.getElementById('additionalInfo')?.value || '';

    // Check if at least basic fields are filled
    if (!houseNo || !streetAddress || !area || !city || !state || !pincode) {
        return null;
    }

    return {
        houseNo,
        streetAddress,
        area,
        landmark,
        city,
        state,
        pincode,
        additionalInfo
    };
}

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        });
    }
});

// Proceed to payment
function proceedToPayment() {
    const booking = window.currentBooking;

    if (!booking) {
        alert('No booking data found');
        return;
    }

    // Validate address
    if (!booking.address || !booking.address.houseNo) {
        alert('Please enter your complete delivery address before proceeding to payment');
        closeBookingModal();
        
        // Scroll to address form
        const addressForm = document.getElementById('manualAddressForm');
        if (addressForm) {
            addressForm.style.display = 'block';
            addressForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Validate water type
    const waterTypeSelect = document.getElementById('water-type');
    if (!waterTypeSelect || !waterTypeSelect.value) {
        alert('Please select a water type before proceeding to payment');
        closeBookingModal();
        waterTypeSelect?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    // Store booking data in localStorage for payment page
    localStorage.setItem('bookingData', JSON.stringify(booking));

    // Redirect to payment page
    window.location.href = 'payment.html';
}
