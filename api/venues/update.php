<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$venueId = $data['venue_id'] ?? null;

if (!$venueId) {
    respondError("Venue ID is required", 400);
}

// Fields that can be updated
$allowedFields = [
    'name', 'location', 'description', 'total_capacity',
    'exam_capacity_1', 'exam_capacity_2', 'image', 'status'
];

// Validate and prepare update data
$updateData = [];
foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        // Special validation for capacities
        if (strpos($field, 'capacity') !== false && $data[$field] !== null) {
            if (!is_numeric($data[$field]) || $data[$field] < 0) {
                respondError("Invalid value for $field", 400);
            }
        }
        $updateData[$field] = $data[$field];
    }
}

if (empty($updateData)) {
    respondError("No valid fields to update", 400);
}

try {
    // Verify venue exists
    $stmt = $pdo->prepare("SELECT 1 FROM venues WHERE venue_id = ?");
    $stmt->execute([$venueId]);
    if (!$stmt->fetch()) {
        respondError("Venue not found", 404);
    }
    
    // Build dynamic UPDATE query
    $setParts = [];
    $params = [];
    foreach ($updateData as $field => $value) {
        $setParts[] = "$field = ?";
        $params[] = $value;
    }
    $params[] = $venueId;
    
    $sql = "UPDATE venues SET " . implode(', ', $setParts) . " WHERE venue_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    respond(['message' => 'Venue updated successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>