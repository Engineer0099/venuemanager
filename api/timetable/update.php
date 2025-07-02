<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$entryId = $data['id'] ?? null;

if (!$entryId) {
    respondError("Timetable entry ID is required", 400);
}

// Fields that can be updated
$allowedFields = [
    'day_of_week', 'start_time', 'end_time', 'class_name',
    'subject_code', 'lecturer_id', 'department', 'repeat_weekly',
    'status', 'notes'
];

// Validate and prepare update data
$updateData = [];
foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $updateData[$field] = $data[$field];
    }
}

if (empty($updateData)) {
    respondError("No valid fields to update", 400);
}

try {
    // Verify entry exists
    $stmt = $pdo->prepare("SELECT venue_id FROM venue_timetable WHERE id = ?");
    $stmt->execute([$entryId]);
    if (!$stmt->fetch()) {
        respondError("Timetable entry not found", 404);
    }
    
    // Build dynamic UPDATE query
    $setParts = [];
    $params = [];
    foreach ($updateData as $field => $value) {
        $setParts[] = "$field = ?";
        $params[] = $value;
    }
    $params[] = $entryId;
    
    $sql = "UPDATE venue_timetable SET " . implode(', ', $setParts) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    respond(['message' => 'Timetable entry updated successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>