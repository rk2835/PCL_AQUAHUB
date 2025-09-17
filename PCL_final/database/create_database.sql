-- AquaHub Database Creation Script
-- Run this script to create the main database

-- Create the database
CREATE DATABASE aquahub_db;

-- Connect to the database
\c aquahub_db;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';
