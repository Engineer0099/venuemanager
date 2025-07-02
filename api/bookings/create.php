<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
validateBookingData($data);

try {
    $stmt = $pdo->prepare("INSERT INTO bookings 
        (user_id, venue_id, class_name, title, date, start_time, end_time, purpose, 
         requirements, notes, number_of_attendees, recurring_pattern, recurring_end_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['user_id'],
        $data['venue_id'],
        $data['class_name'] ?? null,
        $data['title'],
        $data['date'],
        $data['start_time'],
        $data['end_time'],
        $data['purpose'],
        $data['requirements'] ?? '',
        $data['notes'] ?? null,
        $data['number_of_attendees'] ?? null,
        $data['recurring_pattern'] ?? 'none',
        $data['recurring_end_date'] ?? null
    ]);
    
    $bookingId = $pdo->lastInsertId();
    respond(['booking_id' => $bookingId, 'message' => 'Booking created successfully'], 201);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>