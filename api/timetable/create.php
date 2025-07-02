<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

$required = [
    'venue_id', 'day_of_week', 'start_time', 'end_time',
    'class_name', 'department'
];
foreach ($required as $field) {
    if (empty($data[$field])) {
        respondError("Missing required field: $field");
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO venue_timetable 
        (venue_id, day_of_week, start_time, end_time, class_name, 
         subject_code, lecturer_id, department, repeat_weekly, 
         booking_reference, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $data['venue_id'],
        strtolower($data['day_of_week']),
        $data['start_time'],
        $data['end_time'],
        $data['class_name'],
        $data['subject_code'] ?? null,
        $data['lecturer_id'] ?? null,
        $data['department'],
        $data['repeat_weekly'] ?? true,
        $data['booking_reference'] ?? null,
        $data['notes'] ?? null
    ]);
    
    $timetableId = $pdo->lastInsertId();
    respond(['timetable_id' => $timetableId, 'message' => 'Timetable entry created successfully'], 201);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>