CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    title ENUM('Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof') NOT NULL,
    fname VARCHAR(50) NOT NULL,
    lname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role ENUM('student', 'lecturer', 'admin', 'staff', 'guest') NOT NULL DEFAULT 'guest',
    gender ENUM('male', 'female', 'other'),
    department VARCHAR(100),
    reg_number VARCHAR(50) UNIQUE,
    profile_pic VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(100) NOT NULL,
    account_status ENUM('active', 'inactive', 'suspended', 'pending') DEFAULT 'pending',
    last_login DATETIME,
    last_failed_login DATETIME,
    failed_login_attempts INT DEFAULT 0,
    password_reset_token VARCHAR(100),
    token_expiry DATETIME,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_password_change DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_reg_number (reg_number),
    INDEX idx_department (department),
    INDEX idx_account_status (account_status)
);

-- Trigger to update last password change date
DELIMITER //
CREATE TRIGGER after_password_change
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF NEW.password_hash <> OLD.password_hash THEN
        UPDATE users 
        SET last_password_change = CURRENT_TIMESTAMP,
            must_change_password = FALSE
        WHERE user_id = NEW.user_id;
    END IF;
END//
DELIMITER ;

-- Event to clear expired password reset tokens
DELIMITER //
CREATE EVENT clear_expired_tokens
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE users
    SET password_reset_token = NULL,
        token_expiry = NULL
    WHERE token_expiry < NOW();
END//
DELIMITER ;