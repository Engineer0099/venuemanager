<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$venueId = $_GET['id'] ?? null;
if (!$venueId) {
    respondError("Venue ID is required", 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM venues WHERE venue_id = ?");
    $stmt->execute([$venueId]);
    $venue = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$venue) {
        respondError("Venue not found", 404);
    }
    
    // Get upcoming bookings for this venue
    $stmt = $pdo->prepare("SELECT 
        b.booking_id, b.title, b.date, b.start_time, b.end_time, 
        b.purpose, b.status, u.fname, u.lname
        FROM bookings b
        JOIN users u ON b.user_id = u.user_id
        WHERE b.venue_id = ?
        AND b.date >= CURDATE()
        ORDER BY b.date, b.start_time
        LIMIT 10");
    $stmt->execute([$venueId]);
    $upcomingBookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $venue['upcoming_bookings'] = $upcomingBookings;
    
    respond($venue);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>