<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

if (empty($data['venue_id']) || empty($data['feature'])) {
    respondError("Venue ID and feature are required", 400);
}

$allowedFeatures = ['projector', 'whiteboard', 'computer', 'audio_system', 'wheelchair_access'];
if (!in_array($data['feature'], $allowedFeatures)) {
    respondError("Invalid feature specified", 400);
}

try {
    $stmt = $pdo->prepare("UPDATE venues SET {$data['feature']} = FALSE WHERE venue_id = ?");
    $stmt->execute([$data['venue_id']]);
    
    if ($stmt->rowCount() === 0) {
        respondError("Venue not found", 404);
    }
    
    respond(['message' => 'Venue feature removed successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>