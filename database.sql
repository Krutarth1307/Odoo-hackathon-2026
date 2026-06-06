CREATE DATABASE IF NOT EXISTS VendorBridge;
USE VendorBridge;

-- =====================================
-- USERS TABLE
-- =====================================

CREATE TABLE users (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role ENUM('ADMIN','OFFICER','MANAGER','VENDOR') NOT NULL
);

-- =====================================
-- VENDORS TABLE
-- =====================================

CREATE TABLE vendors (
id INT PRIMARY KEY AUTO_INCREMENT,
vendor_name VARCHAR(100) NOT NULL,
gst_number VARCHAR(20),
category VARCHAR(50),
contact_number VARCHAR(15),
email VARCHAR(100),
status ENUM('ACTIVE','INACTIVE','PENDING') DEFAULT 'ACTIVE'
);

-- =====================================
-- RFQS TABLE
-- =====================================

CREATE TABLE rfqs (
id INT PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(100) NOT NULL,
description TEXT,
quantity INT,
attachment VARCHAR(255),
deadline DATE,
status ENUM('OPEN','CLOSED','APPROVED','REJECTED') DEFAULT 'OPEN',
created_by INT,
FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =====================================
-- RFQ - VENDOR MAPPING
-- =====================================

CREATE TABLE rfq_vendors (
id INT PRIMARY KEY AUTO_INCREMENT,
rfq_id INT,
vendor_id INT,
FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- =====================================
-- QUOTATIONS TABLE
-- =====================================

CREATE TABLE quotations (
id INT PRIMARY KEY AUTO_INCREMENT,
rfq_id INT,
vendor_id INT,
price DECIMAL(12,2),
delivery_days INT,
notes TEXT,
status ENUM('SUBMITTED','APPROVED','REJECTED') DEFAULT 'SUBMITTED',
FOREIGN KEY (rfq_id) REFERENCES rfqs(id),
FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- =====================================
-- APPROVALS TABLE
-- =====================================

CREATE TABLE approvals (
id INT PRIMARY KEY AUTO_INCREMENT,
quotation_id INT,
manager_id INT,
status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
remarks TEXT,
approval_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (quotation_id) REFERENCES quotations(id),
FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- =====================================
-- PURCHASE ORDERS TABLE
-- =====================================

CREATE TABLE purchase_orders (
id INT PRIMARY KEY AUTO_INCREMENT,
po_number VARCHAR(50) UNIQUE,
quotation_id INT,
po_date DATE,
status ENUM('CREATED','SENT','COMPLETED') DEFAULT 'CREATED',
FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- =====================================
-- INVOICES TABLE
-- =====================================

CREATE TABLE invoices (
id INT PRIMARY KEY AUTO_INCREMENT,
invoice_number VARCHAR(50) UNIQUE,
po_id INT,
subtotal DECIMAL(12,2),
gst DECIMAL(12,2),
total DECIMAL(12,2),
status ENUM('GENERATED','PAID','UNPAID') DEFAULT 'GENERATED',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (po_id) REFERENCES purchase_orders(id)
);

-- =====================================
-- ACTIVITY LOGS TABLE
-- =====================================

CREATE TABLE activity_logs (
id INT PRIMARY KEY AUTO_INCREMENT,
user_id INT,
action VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================
-- SAMPLE USERS
-- =====================================

INSERT INTO users(name,email,password,role)
VALUES
('Admin','[admin@gmail.com](mailto:admin@gmail.com)','123456','ADMIN'),
('Manager','[manager@gmail.com](mailto:manager@gmail.com)','123456','MANAGER'),
('Officer','[officer@gmail.com](mailto:officer@gmail.com)','123456','OFFICER');

-- =====================================
-- SAMPLE VENDOR
-- =====================================

INSERT INTO vendors(
vendor_name,
gst_number,
category,
contact_number,
email,
status
)
VALUES(
'ABC Technologies',
'24ABCDE1234F1Z5',
'IT Hardware',
'9876543210',
'[abc@gmail.com](mailto:abc@gmail.com)',
'ACTIVE'
);

-- =====================================
-- SAMPLE RFQ
-- =====================================

INSERT INTO rfqs(
title,
description,
quantity,
deadline,
status,
created_by
)
VALUES(
'Laptop Procurement',
'Dell Latitude Laptops',
10,
'2026-07-01',
'OPEN',
3
);

-- =====================================
-- ASSIGN RFQ TO VENDOR
-- =====================================

INSERT INTO rfq_vendors(rfq_id,vendor_id)
VALUES(1,1);

-- =====================================
-- SAMPLE QUOTATION
-- =====================================

INSERT INTO quotations(
rfq_id,
vendor_id,
price,
delivery_days,
notes
)
VALUES(
1,
1,
500000,
7,
'Can deliver within one week'
);

-- =====================================
-- SAMPLE APPROVAL
-- =====================================

INSERT INTO approvals(
quotation_id,
manager_id,
status,
remarks
)
VALUES(
1,
2,
'APPROVED',
'Lowest price selected'
);

-- =====================================
-- SAMPLE PURCHASE ORDER
-- =====================================

INSERT INTO purchase_orders(
po_number,
quotation_id,
po_date,
status
)
VALUES(
'PO-001',
1,
CURDATE(),
'CREATED'
);

-- =====================================
-- SAMPLE INVOICE
-- =====================================

INSERT INTO invoices(
invoice_number,
po_id,
subtotal,
gst,
total,
status
)
VALUES(
'INV-001',
1,
500000,
90000,
590000,
'GENERATED'
);

-- =====================================
-- SAMPLE ACTIVITY
-- =====================================

INSERT INTO activity_logs(
user_id,
action
)
VALUES(
1,
'Vendor Created'
);
