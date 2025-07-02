<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

try {
    // Get total venues count
    $stmt = $pdo->query("SELECT COUNT(*) as total_venues FROM venues WHERE status != 'closed'");
    $totalVenues = $stmt->fetchColumn();
    
    // Get venues by status
    $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM venues GROUP BY status");
    $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get most popular venues
    $stmt = $pdo->query("SELECT v.venue_id, v.name, COUNT(b.booking_id) as bookings_count
        FROM venues v
        LEFT JOIN bookings b ON v.venue_id = b.venue_id
        WHERE b.status = 'approved'
        AND b.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        GROUP BY v.venue_id
        ORDER BY bookings_count DESC
        LIMIT 5");
    $popularVenues = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get utilization rate
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total_slots,
        SUM(CASE WHEN b.booking_id IS NOT NULL THEN 1 ELSE 0 END) as booked_slots
        FROM (
            SELECT date, start_time, end_time 
            FROM bookings 
            WHERE date BETWEEN DATE_SUB(CURDATE(), INTERVAL 1 MONTH) AND CURDATE()
            GROUP BY date, start_time, end_time
        ) as time_slots
        LEFT JOIN bookings b ON b.date = time_slots.date 
            AND b.start_time = time_slots.start_time 
            AND b.end_time = time_slots.end_time
            AND b.status = 'approved'");
    $utilization = $stmt->fetch(PDO::FETCH_ASSOC);
    
    respond([
        'total_venues' => $totalVenues,
        'status_counts' => $statusCounts,
        'popular_venues' => $popularVenues,
        'utilization_rate' => $utilization['total_slots'] > 0 
            ? round(($utilization['booked_slots'] / $utilization['total_slots']) * 100, 2)
            : 0
    ]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>