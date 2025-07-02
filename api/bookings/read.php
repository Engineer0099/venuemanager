<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$bookingId = $_GET['id'] ?? null;
if (!$bookingId) {
    respondError("Booking ID is required", 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE booking_id = ?");
    $stmt->execute([$bookingId]);
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        respondError("Booking not found", 404);
    }
    
    respond($booking);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>