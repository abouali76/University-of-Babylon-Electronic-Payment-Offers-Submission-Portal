-- Database Schema for University of Babylon Electronic Payment Form

CREATE DATABASE IF NOT EXISTS babylon_payment_db;
USE babylon_payment_db;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'company') DEFAULT 'company',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    company_name VARCHAR(255) NOT NULL,
    representative_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(100),
    license_number VARCHAR(100),
    experience_years INT,
    gov_entities_count INT,
    capital DECIMAL(20, 2),
    address TEXT,
    submission_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Form Submissions (Paragraphs 2 & 3)
CREATE TABLE IF NOT EXISTS form_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT,
    
    -- Operational & Financial (II)
    settlement_mechanism TEXT,
    commissions_discounts TEXT,
    intermediary_bank TEXT,
    delay_penalty TEXT,
    atm_commitment TEXT,
    student_cards_details TEXT,
    charging_centers TEXT,
    pos_commitment TEXT,
    
    -- Technical & Security (III)
    integrated_system_details TEXT,
    special_cards_issuance TEXT,
    
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Supporting Documents
CREATE TABLE IF NOT EXISTS attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_type VARCHAR(50),
    FOREIGN KEY (submission_id) REFERENCES form_submissions(id) ON DELETE CASCADE
);
