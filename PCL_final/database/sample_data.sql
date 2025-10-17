-- Sample data for testing the AquaHub database

-- Insert sample users
INSERT INTO users (email, password_hash, user_type, email_verified) VALUES
('john.doe@email.com', crypt('password123', gen_salt('bf')), 'customer', true),
('jane.smith@email.com', crypt('password123', gen_salt('bf')), 'customer', true),
('aqua.services@business.com', crypt('vendor123', gen_salt('bf')), 'vendor', true),
('water.supply.co@business.com', crypt('vendor456', gen_salt('bf')), 'vendor', true);

-- Insert sample customer profiles
INSERT INTO customer_profiles (
    user_id, first_name, last_name, phone, date_of_birth, gender,
    address_line1, address_line2, city, state, postal_code,
    emergency_contact_name, emergency_contact_phone
) VALUES
(
    (SELECT id FROM users WHERE email = 'john.doe@email.com'),
    'John', 'Doe', '+91-9876543210', '1990-05-15', 'male',
    '123 Main Street', 'Apartment 4B', 'Bangalore', 'Karnataka', '560001',
    'Jane Doe', '+91-9876543211'
),
(
    (SELECT id FROM users WHERE email = 'jane.smith@email.com'),
    'Jane', 'Smith', '+91-9876543212', '1988-08-22', 'female',
    '456 Oak Avenue', NULL, 'Mumbai', 'Maharashtra', '400001',
    'Robert Smith', '+91-9876543213'
);

-- Insert sample vendor profiles
INSERT INTO vendor_profiles (
    user_id, business_name, contact_person_name, phone, alternate_phone,
    business_address_line1, city, state, postal_code,
    business_type, years_in_business, license_number,
    service_areas, tanker_capacity, delivery_radius_km, is_verified
) VALUES
(
    (SELECT id FROM users WHERE email = 'aqua.services@business.com'),
    'Aqua Services Pvt Ltd', 'Rajesh Kumar', '+91-9876543220', '+91-9876543221',
    '789 Industrial Area', 'Bangalore', 'Karnataka', '560045',
    'Water Supply', 8, 'WS-BLR-2016-001',
    ARRAY['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City'],
    ARRAY[5000, 10000, 15000],
    25, true
),
(
    (SELECT id FROM users WHERE email = 'water.supply.co@business.com'),
    'Premium Water Supply Co', 'Meera Patel', '+91-9876543225', '+91-9876543226',
    '321 Supply Chain Road', 'Mumbai', 'Maharashtra', '400075',
    'Water Distribution', 12, 'WS-MUM-2012-002',
    ARRAY['Andheri', 'Bandra', 'Juhu', 'Powai'],
    ARRAY[8000, 12000, 20000],
    30, true
);

-- Insert sample customer water requirements
INSERT INTO customer_water_requirements (
    customer_id, required_quantity, frequency, preferred_delivery_days,
    preferred_time_slots, water_type, storage_capacity, special_instructions
) VALUES
(
    (SELECT id FROM customer_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'john.doe@email.com')),
    5000, 'weekly', ARRAY['Monday', 'Wednesday', 'Friday'],
    ARRAY['10:00-12:00', '14:00-16:00'], 'potable', 10000,
    'Please call before delivery. Security gate access required.'
),
(
    (SELECT id FROM customer_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'jane.smith@email.com')),
    8000, 'bi-weekly', ARRAY['Tuesday', 'Thursday'],
    ARRAY['09:00-11:00'], 'potable', 15000,
    'Rooftop tank filling required. Pump available on site.'
);

-- Insert sample vendor services
INSERT INTO vendor_services (
    vendor_id, service_name, water_type, tanker_capacity, price_per_liter,
    minimum_order_quantity, available_days, available_time_slots, coverage_areas
) VALUES
(
    (SELECT id FROM vendor_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'aqua.services@business.com')),
    'Premium Potable Water Delivery', 'potable', 5000, 1.50,
    2000, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ARRAY['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'],
    ARRAY['Koramangala', 'Indiranagar', 'Whitefield']
),
(
    (SELECT id FROM vendor_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'aqua.services@business.com')),
    'Industrial Water Supply', 'industrial', 10000, 1.20,
    5000, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    ARRAY['08:00-12:00', '14:00-18:00'],
    ARRAY['Electronic City', 'Whitefield', 'Peenya']
),
(
    (SELECT id FROM vendor_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'water.supply.co@business.com')),
    'Premium Home Water Delivery', 'potable', 8000, 1.75,
    3000, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    ARRAY['09:00-11:00', '11:00-13:00', '15:00-17:00'],
    ARRAY['Andheri', 'Bandra', 'Juhu']
);
