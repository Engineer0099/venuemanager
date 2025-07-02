<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

$required = ['venue_id', 'day_of_week', 'start_time', 'end_time'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        respondError("Missing required field: $field");
    }
}

// Optional - exclude specific entry when updating
$excludeId = $data['exclude_id'] ?? null;

try {
    $query = "SELECT id, class_name, lecturer_id, start_time, end_time 
        FROM venue_timetable
        WHERE venue_id = ?
        AND day_of_week = ?
        AND status = 'active'
        AND (
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND start_time < ?) OR
            (end_time > ? AND end_time <= ?)
        )";
    
    $params = [
        $data['venue_id'],
        strtolower($data['day_of_week']),
        $data['end_time'],
        $data['start_time'],
        $data['start_time'],
        $data['end_time'],
        $data['start_time'],
        $data['end_time']
    ];
    
    if ($excludeId) {
        $query .= " AND id != ?";
        $params[] = $excludeId;
    }
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $conflicts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get lecturer names for conflicts
    if (!empty($conflicts)) {
        $lecturerIds = array_filter(array_column($conflicts, 'lecturer_id'));
        if (!empty($lecturerIds)) {
            $placeholders = implode(',', array_fill(0, count($lecturerIds), '?'));
            $stmt = $pdo->prepare("SELECT user_id, CONCAT(fname, ' ', lname) as name 
                FROM users 
                WHERE user_id IN ($placeholders)");
            $stmt->execute($lecturerIds);
            $lecturers = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            
            foreach ($conflicts as &$conflict) {
                $conflict['lecturer_name'] = $lecturers[$conflict['lecturer_id']] ?? null;
            }
        }
    }
    
    respond([
        'has_conflicts' => !empty($conflicts),
        'conflicts' => $conflicts
    ]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>