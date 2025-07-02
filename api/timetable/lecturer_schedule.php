<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$lecturerId = $_GET['lecturer_id'] ?? null;
$weekStart = $_GET['week_start'] ?? date('Y-m-d');

if (!$lecturerId) {
    respondError("Lecturer ID is required", 400);
}

try {
    // Calculate the week's dates
    $weekDates = [];
    for ($i = 0; $i < 7; $i++) {
        $weekDates[] = date('Y-m-d', strtotime("$weekStart +$i days"));
    }
    
    // Get lecturer details
    $stmt = $pdo->prepare("SELECT fname, lname FROM users WHERE user_id = ?");
    $stmt->execute([$lecturerId]);
    $lecturer = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$lecturer) {
        respondError("Lecturer not found", 404);
    }
    
    // Get all timetable entries for the lecturer
    $stmt = $pdo->prepare("SELECT 
        vt.*, 
        v.name as venue_name
        FROM venue_timetable vt
        JOIN venues v ON vt.venue_id = v.venue_id
        WHERE vt.lecturer_id = ?
        AND vt.status = 'active'
        ORDER BY vt.day_of_week, vt.start_time");
    $stmt->execute([$lecturerId]);
    $timetableEntries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Organize by day
    $schedule = [];
    $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    foreach ($days as $index => $day) {
        $daySchedule = [
            'date' => $weekDates[$index],
            'day_name' => ucfirst($day),
            'classes' => []
        ];
        
        foreach ($timetableEntries as $entry) {
            if ($entry['day_of_week'] === $day) {
                $daySchedule['classes'][] = [
                    'id' => $entry['id'],
                    'start_time' => $entry['start_time'],
                    'end_time' => $entry['end_time'],
                    'class_name' => $entry['class_name'],
                    'subject_code' => $entry['subject_code'],
                    'venue_name' => $entry['venue_name'],
                    'department' => $entry['department'],
                    'notes' => $entry['notes']
                ];
            }
        }
        
        $schedule[] = $daySchedule;
    }
    
    respond([
        'lecturer' => $lecturer,
        'schedule' => $schedule,
        'week_start' => $weekStart
    ]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>