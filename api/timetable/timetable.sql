CREATE TABLE venue_timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20),
    lecturer_id INT,
    department VARCHAR(100) NOT NULL,
    repeat_weekly BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    booking_reference VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    
    INDEX idx_venue_day (venue_id, day_of_week),
    INDEX idx_lecturer (lecturer_id),
    INDEX idx_department (department)
);

-- Trigger to validate timetable slots
DELIMITER //
CREATE TRIGGER validate_timetable_slot
BEFORE INSERT ON venue_timetable
FOR EACH ROW
BEGIN
    -- Check if end time is after start time
    IF NEW.end_time <= NEW.start_time THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'End time must be after start time';
    END IF;
    
    -- Check for overlapping slots
    IF EXISTS (
        SELECT 1 FROM venue_timetable
        WHERE venue_id = NEW.venue_id
        AND day_of_week = NEW.day_of_week
        AND status = 'active'
        AND (
            (start_time < NEW.end_time AND end_time > NEW.start_time)
        )
        AND (id != NEW.id OR NEW.id IS NULL)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Time slot overlaps with existing timetable entry';
    END IF;
END//
DELIMITER ;

-- Event to archive completed timetable entries
DELIMITER //
CREATE EVENT archive_completed_timetable
ON SCHEDULE EVERY 1 WEEK
DO
BEGIN
    -- Archive entries marked as completed
    INSERT INTO timetable_archive
    SELECT * FROM venue_timetable 
    WHERE status = 'completed'
    AND updated_at < DATE_SUB(NOW(), INTERVAL 1 MONTH);
    
    -- Delete the archived entries
    DELETE FROM venue_timetable 
    WHERE status = 'completed'
    AND updated_at < DATE_SUB(NOW(), INTERVAL 1 MONTH);
END//
DELIMITER ;