-- Create verification_codes table for email verification
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('signup', 'password_reset') NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_type (email, type),
    INDEX idx_expires_at (expires_at),
    INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional: Create a cleanup event to delete expired codes older than 24 hours
DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_expired_verification_codes
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM verification_codes 
    WHERE expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
END$$
DELIMITER ;
