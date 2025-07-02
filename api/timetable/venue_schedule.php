<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$venueId = $_GET['venue_id'] ?? null;
$weekStart = $_GET['week_start'] ?? date('Y-m-d');

if (!$venueId) {
    respondError("Venue ID is required", 400);
}

try {
    // Calculate the week's dates
    $weekDates = [];
    for ($i = 0; $i < 7; $i++) {
        $weekDates[] = date('Y-m-d', strtotime("$weekStart +$i days"));
    }
    
    // Get all timetable entries for the venue
    $stmt = $pdo->prepare("SELECT * FROM venue_timetable 
        WHERE venue_id = ? 
        AND status = 'active'
        ORDER BY day_of_week, start_time");
    $stmt->execute([$venueId]);
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
                    'lecturer_id' => $entry['lecturer_id'],
                    'department' => $entry['department'],
                    'notes' => $entry['notes']
                ];
            }
        }
        
        $schedule[] = $daySchedule;
    }
    
    respond(['schedule' => $schedule, 'week_start' => $weekStart]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>