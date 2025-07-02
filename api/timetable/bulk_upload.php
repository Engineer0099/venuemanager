<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

if (empty($data['entries']) || !is_array($data['entries'])) {
    respondError("No timetable entries provided", 400);
}

$successCount = 0;
$errors = [];

try {
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare("INSERT INTO venue_timetable 
        (venue_id, day_of_week, start_time, end_time, class_name, 
         subject_code, lecturer_id, department, repeat_weekly)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($data['entries'] as $index => $entry) {
        try {
            $stmt->execute([
                $entry['venue_id'],
                strtolower($entry['day_of_week']),
                $entry['start_time'],
                $entry['end_time'],
                $entry['class_name'],
                $entry['subject_code'] ?? null,
                $entry['lecturer_id'] ?? null,
                $entry['department'],
                $entry['repeat_weekly'] ?? true
            ]);
            $successCount++;
        } catch (PDOException $e) {
            $errors[] = [
                'index' => $index,
                'error' => $e->getMessage(),
                'entry' => $entry
            ];
        }
    }
    
    if (count($errors)) {
        $pdo->rollBack();
        respond([
            'success' => false,
            'message' => 'Some entries failed',
            'success_count' => $successCount,
            'error_count' => count($errors),
            'errors' => $errors
        ], 207); // 207 Multi-Status
    } else {
        $pdo->commit();
        respond([
            'success' => true,
            'message' => "All $successCount entries added successfully"
        ]);
    }
} catch (PDOException $e) {
    $pdo->rollBack();
    respondError("Database error: " . $e->getMessage(), 500);
}
?>