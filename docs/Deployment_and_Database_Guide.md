# Nutanaa Admin Dashboard - Deployment & Database Guide

This document provides a comprehensive guide on how to deploy the Nutanaa Admin Dashboard on a new system and setup the Database infrastructure.

---

## Part 1: System Requirements & Prerequisites

Before starting, ensure the new system has the following installed:

1.  **Git**: To clone the repository.
2.  **Node.js (v14+)**: For future backend APIs and package management.
3.  **Python (v3.x)**: For running the local development server (or any static file server like Apache/Nginx).
4.  **MySQL Server (v8.0+)**: For the relational database.

---

## Part 2: Installation & Deployment

### Step 1: Get the Code
Clone the project repository to your desired directory:
```bash
git clone <repository_url>
cd ghost-andromeda
```

### Step 2: Launch the Website
The current version of the dashboard is built as a **Single Page Application (SPA)** using pure Vanilla JS. It requires a static file server to run correctly (to handle module imports).

**Using Python (Simplest Method):**
Run the following command in the project root:
```bash
# Windows
python -m http.server 8000

# Linux/Mac
python3 -m http.server 8000
```
Then open your browser and access: `http://localhost:8000`

**Using Node.js (Alternative):**
If you prefer Node.js, you can use `serve`:
```bash
npx serve .
```

---

## Part 3: Database Setup Guide

The project architecture reserves a dedicated `database/` directory for SQL schemas, organized by module.

### Step 1: Open MySQL Shell
Login to your MySQL server:
```bash
mysql -u root -p
```

### Step 2: Create the Master Database
Run the following command to create the main database:
```sql
CREATE DATABASE nutanaa_admins;
USE nutanaa_admins;
```

### Step 3: Run SQL Commands
Copy and paste the following SQL commands to create all necessary tables. They are grouped by module.

#### 1. Authentication (Users & Roles)
*Stored in: `database/auth/schema.sql`*

```sql
-- Main Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE, -- User Login ID
    password_hash VARCHAR(255) NOT NULL, -- Hashed Password
    role ENUM('admin', 'sub-admin', 'vendor', 'support', 'finance', 'user') DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE -- Point 1 (Security)
);

-- RBAC Roles Table
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSON -- Flexible permission storage
);

-- Activity Logs (Point 1: Security)
CREATE TABLE user_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL, -- e.g., 'LOGIN', 'PAYOUT_APPROVE'
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 2. Vendor Management
*Stored in: `database/vendors/schema.sql`*

```sql
-- Vendor Profiles
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_name VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Active', 'Suspended', 'Rejected') DEFAULT 'Pending', -- Approval Workflow
    commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Point 6 (Commission)
    balance DECIMAL(10,2) DEFAULT 0.00, -- Earnings Wallet
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Vendor KYC Documents
CREATE TABLE vendor_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    document_type ENUM('PAN', 'Aadhar', 'GST', 'StoreFront', 'Other') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Payout Requests (Point 7)
CREATE TABLE vendor_payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected', 'Processed') DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);
```

#### 3. Products & Catalog
*Stored in: `database/products/schema.sql`*

```sql
-- Categories (Recursive Structure)
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INT NULL, -- Allows Sub-categories
    slug VARCHAR(255) UNIQUE,
    image_url VARCHAR(255),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Brands
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(255)
);

-- Products Table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    category_id INT,
    brand_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock_quantity INT DEFAULT 0,
    status ENUM('Draft', 'Pending', 'Active', 'Rejected') DEFAULT 'Draft', -- Point 3 (Moderation)
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);
```

#### 4. Orders & Shipping
*Stored in: `database/orders/schema.sql`*

```sql
-- Orders Header
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'Pending',
    payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Order Items (Line Items)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    vendor_id INT NOT NULL, -- Supports Split Orders (Point 5)
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned') DEFAULT 'Pending',
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Shipping Details (Point 8)
CREATE TABLE order_shipping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### 5. Marketing, Support & CMS
*Consolidated from `marketing/`, `cms/`, `support/`, `settings/`*

```sql
-- Coupons (Point 11)
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('percent', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    expiry_date DATE,
    usage_count INT DEFAULT 0
);

-- Support Tickets (Point 20)
CREATE TABLE support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CMS Pages (Point 13)
CREATE TABLE cms_pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Settings (Points 16-18)
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    option_key VARCHAR(100) UNIQUE NOT NULL,
    option_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Part 4: Connecting the Pieces
Currently, the application runs with **Mock Data** in `store.js` to simulate database interactions.

**To transition to this MySQL Database:**
1.  **Backend API**: You will need to create a Node.js/Express server (e.g., in a `server/` directory).
2.  **Database Connection**: Use `mysql2` or `sequelize` (ORM) in Node.js to connect to the `nutanaa_admins` database using the credentials defined in Part 3.
3.  **API Endpoints**: Create API routes (e.g., `/api/products`, `/api/users`) that query these tables.
4.  **Frontend Update**: Modify `store.js` to use `fetch()` calls to these API endpoints instead of returning static arrays.

This structure provides a production-ready foundation for the Nutanaa Marketplace.
