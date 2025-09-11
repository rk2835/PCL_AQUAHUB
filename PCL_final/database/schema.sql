-- AquaHub Database Schema
-- Tables for Customer and Vendor Registration

-- Users table (base table for both customers and vendors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'vendor')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer profiles table
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    
    -- Address information
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Preferences
    preferred_delivery_time VARCHAR(50),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Vendor profiles table
CREATE TABLE vendor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business information
    business_name VARCHAR(255) NOT NULL,
    contact_person_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    
    -- Business address
    business_address_line1 VARCHAR(255) NOT NULL,
    business_address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Business details
    business_type VARCHAR(100),
    years_in_business INTEGER,
    license_number VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Service information
    service_areas TEXT[], -- Array of areas they serve
    tanker_capacity INTEGER[], -- Array of tanker capacities they have
    delivery_radius_km INTEGER DEFAULT 50,
    
    -- Verification status
    is_verified BOOLEAN DEFAULT false,
    verification_documents TEXT[], -- Array of document URLs
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Customer water requirements table
CREATE TABLE customer_water_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Water requirements
    required_quantity INTEGER NOT NULL, -- in liters
    frequency VARCHAR(50), -- daily, weekly, monthly, one-time
    preferred_delivery_days TEXT[], -- Array of preferred days
    preferred_time_slots TEXT[], -- Array of preferred time slots
    
    -- Special requirements
    water_type VARCHAR(50) DEFAULT 'potable', -- potable, industrial, construction
    storage_capacity INTEGER, -- customer's storage capacity
    special_instructions TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vendor service offerings table
CREATE TABLE vendor_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    
    -- Service details
    service_name VARCHAR(255) NOT NULL,
    water_type VARCHAR(50) NOT NULL, -- potable, industrial, construction, etc.
    tanker_capacity INTEGER NOT NULL, -- in liters
    price_per_liter DECIMAL(10,2),
    minimum_order_quantity INTEGER,
    
    -- Availability
    is_active BOOLEAN DEFAULT true,
    available_days TEXT[], -- Array of available days
    available_time_slots TEXT[], -- Array of available time slots
    
    -- Service area
    coverage_areas TEXT[], -- Array of areas covered
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX idx_customer_profiles_city ON customer_profiles(city);
CREATE INDEX idx_vendor_profiles_city ON vendor_profiles(city);
CREATE INDEX idx_vendor_services_vendor_id ON vendor_services(vendor_id);
CREATE INDEX idx_vendor_services_water_type ON vendor_services(water_type);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_water_requirements_updated_at BEFORE UPDATE ON customer_water_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_services_updated_at BEFORE UPDATE ON vendor_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
