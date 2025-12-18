CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Active', 'Suspended', 'Rejected') DEFAULT 'Pending',
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    document_type ENUM('PAN', 'Aadhar', 'GST', 'StoreFront', 'Other') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE vendor_payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Processed') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
