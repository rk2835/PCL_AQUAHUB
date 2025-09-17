-- Quick SQL queries to check your data
-- Copy and paste these into pgAdmin or psql

-- 1. See all registered users
SELECT 
    username, 
    email, 
    user_type, 
    created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. See customer details
SELECT 
    u.username,
    u.email,
    cp.phone,
    cp.address,
    cp.city,
    cp.state,
    cp.preferred_delivery_time
FROM users u
JOIN customer_profiles cp ON u.id = cp.user_id
WHERE u.user_type = 'customer';

-- 3. See vendor details  
SELECT 
    u.username,
    u.email,
    vp.company_name,
    vp.business_type,
    vp.phone,
    vp.service_areas
FROM users u
JOIN vendor_profiles vp ON u.id = vp.user_id
WHERE u.user_type = 'vendor';

-- 4. Count registrations by type
SELECT 
    user_type, 
    COUNT(*) as count 
FROM users 
GROUP BY user_type;

-- 5. Recent registrations (today)
SELECT 
    username, 
    email, 
    user_type, 
    created_at 
FROM users 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- 6. See all water requirements
SELECT 
    u.username,
    cwr.water_type,
    cwr.quantity_needed,
    cwr.delivery_frequency
FROM customer_water_requirements cwr
JOIN users u ON cwr.customer_id = u.id;

-- 7. See all vendor services
SELECT 
    u.username as vendor,
    vs.service_type,
    vs.water_type,
    vs.price_per_unit,
    vs.delivery_areas
FROM vendor_services vs
JOIN users u ON vs.vendor_id = u.id;
