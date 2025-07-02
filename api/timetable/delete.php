<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$entryId = $data['id'] ?? null;

if (!$entryId) {
    respondError("Timetable entry ID is required", 400);
}

try {
    // Soft delete by marking as cancelled
    $stmt = $pdo->prepare("UPDATE venue_timetable 
        SET status = 'cancelled'
        WHERE id = ?");
    $stmt->execute([$entryId]);
    
    if ($stmt->rowCount() === 0) {
        respondError("Timetable entry not found", 404);
    }
    
    respond(['message' => 'Timetable entry cancelled successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>