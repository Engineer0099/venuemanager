CREATE TABLE venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    projector BOOLEAN DEFAULT FALSE,
    whiteboard BOOLEAN DEFAULT FALSE,
    computer BOOLEAN DEFAULT FALSE,
    audio_system BOOLEAN DEFAULT FALSE,
    wheelchair_access BOOLEAN DEFAULT FALSE,
    total_capacity INT NOT NULL,
    exam_capacity_1 INT,
    exam_capacity_2 INT,
    image VARCHAR(255),
    status ENUM('free', 'timetable', 'booked') DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_location (location),
    INDEX idx_status (status)
);

-- Trigger to validate capacities
DELIMITER //
CREATE TRIGGER validate_venue_capacity
BEFORE INSERT ON venues
FOR EACH ROW
BEGIN
    IF NEW.exam_capacity_1 > NEW.total_capacity OR NEW.exam_capacity_2 > NEW.total_capacity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Exam capacity cannot exceed total capacity';
    END IF;
END//
DELIMITER ;

-- Event to check venue maintenance status
DELIMITER //
CREATE EVENT check_venue_maintenance
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    -- Auto-reactivate venues after maintenance period
    UPDATE venues 
    SET status = 'free'
    WHERE status = 'booked'
    AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY);
END//
DELIMITER ;