<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$venueId = $data['venue_id'] ?? null;

if (!$venueId) {
    respondError("Venue ID is required", 400);
}

try {
    // Check for future bookings
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings 
        WHERE venue_id = ? 
        AND date >= CURDATE() 
        AND status IN ('pending', 'approved')");
    $stmt->execute([$venueId]);
    $futureBookings = $stmt->fetchColumn();
    
    if ($futureBookings > 0) {
        respondError("Cannot delete venue with future bookings", 409);
    }
    
    // Soft delete (set status to closed) instead of actual deletion
    $stmt = $pdo->prepare("UPDATE venues SET status = 'closed' WHERE venue_id = ?");
    $stmt->execute([$venueId]);
    
    if ($stmt->rowCount() === 0) {
        respondError("Venue not found", 404);
    }
    
    respond(['message' => 'Venue marked as closed successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>