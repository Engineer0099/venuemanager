<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$entryId = $_GET['id'] ?? null;
if (!$entryId) {
    respondError("Timetable entry ID is required", 400);
}

try {
    $stmt = $pdo->prepare("SELECT 
        vt.*, 
        v.name as venue_name,
        CONCAT(u.fname, ' ', u.lname) as lecturer_name
        FROM venue_timetable vt
        LEFT JOIN venues v ON vt.venue_id = v.venue_id
        LEFT JOIN users u ON vt.lecturer_id = u.user_id
        WHERE vt.id = ?");
    $stmt->execute([$entryId]);
    $entry = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$entry) {
        respondError("Timetable entry not found", 404);
    }
    
    respond($entry);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>