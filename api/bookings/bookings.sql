CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    class_name VARCHAR(100),
    title VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose ENUM('lecture', 'exam', 'meeting', 'event', 'class', 'other') NOT NULL,
    requirements SET('projector', 'whiteboard', 'computer', 'audio', 'video_conferencing', 'special_lighting', 'wheelchair_access', 'catering') NOT NULL DEFAULT '',
    notes TEXT,
    number_of_attendees INT,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
    approved_by INT,
    approval_date DATETIME,
    rejection_reason TEXT,
    recurring_pattern ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurring_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(venue_id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Trigger to update expired bookings to 'completed'
DELIMITER //
CREATE TRIGGER update_booking_status
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.date < CURDATE() OR (NEW.date = CURDATE() AND NEW.end_time < CURTIME()) THEN
        SET NEW.status = 'completed';
    END IF;
END//
DELIMITER ;

-- Event to daily update booking statuses
DELIMITER //
CREATE EVENT daily_booking_status_update
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE bookings
    SET status = 'completed'
    WHERE status IN ('pending', 'approved')
    AND (date < CURDATE() OR (date = CURDATE() AND end_time < CURTIME()));
END//
DELIMITER ;

















