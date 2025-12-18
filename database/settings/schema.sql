CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    option_key VARCHAR(100) UNIQUE NOT NULL,
    option_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Initial Seed for Settings
INSERT INTO settings (option_key, option_value) VALUES 
('site_title', 'Nutanaa Marketplace'),
('currency', 'USD'),
('tax_rate', '5.00'),
('maintenance_mode', 'false'),
('require_2fa', 'false'),
('session_timeout', '30');
