-- Update invoice status ENUM to include 'refunded' option

ALTER TABLE invoices 
MODIFY COLUMN status ENUM('unpaid', 'partial', 'paid', 'refunded') DEFAULT 'unpaid';
