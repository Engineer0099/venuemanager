<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

$required = ['name', 'location', 'total_capacity'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        respondError("Missing required field: $field");
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO venues 
        (name, location, description, projector, whiteboard, computer, 
         audio_system, wheelchair_access, total_capacity, exam_capacity_1, 
         exam_capacity_2, image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['name'],
        $data['location'],
        $data['description'] ?? null,
        $data['projector'] ?? false,
        $data['whiteboard'] ?? false,
        $data['computer'] ?? false,
        $data['audio_system'] ?? false,
        $data['wheelchair_access'] ?? false,
        $data['total_capacity'],
        $data['exam_capacity_1'] ?? null,
        $data['exam_capacity_2'] ?? null,
        $data['image'] ?? null,
        $data['status'] ?? 'active'
    ]);
    
    $venueId = $pdo->lastInsertId();
    respond(['venue_id' => $venueId, 'message' => 'Venue created successfully'], 201);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>