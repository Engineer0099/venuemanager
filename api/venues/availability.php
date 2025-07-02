<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

if (empty($data['date']) || empty($data['start_time']) || empty($data['end_time'])) {
    respondError("Date, start time and end time are required", 400);
}

$venueId = $data['venue_id'] ?? null;
$capacity = $data['capacity'] ?? null;
$features = $data['features'] ?? [];

try {
    // Base query for available venues
    $query = "SELECT v.* FROM venues v WHERE v.status = 'active'";
    $params = [];
    
    // Filter by venue ID if provided
    if ($venueId) {
        $query .= " AND v.venue_id = ?";
        $params[] = $venueId;
    }
    
    // Filter by capacity if provided
    if ($capacity) {
        $query .= " AND v.total_capacity >= ?";
        $params[] = $capacity;
    }
    
    // Filter by features if provided
    if (!empty($features)) {
        $featureConditions = [];
        foreach ($features as $feature) {
            if (in_array($feature, ['projector', 'whiteboard', 'computer', 'audio_system', 'wheelchair_access'])) {
                $featureConditions[] = "v.$feature = TRUE";
            }
        }
        if (!empty($featureConditions)) {
            $query .= " AND " . implode(" AND ", $featureConditions);
        }
    }
    
    // Check for conflicting bookings
    $query .= " AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.venue_id = v.venue_id
        AND b.date = ?
        AND b.status IN ('approved', 'pending')
        AND (
            (b.start_time < ? AND b.end_time > ?) OR
            (b.start_time >= ? AND b.start_time < ?) OR
            (b.end_time > ? AND b.end_time <= ?)
        )
    )";
    
    $params = array_merge($params, [
        $data['date'],
        $data['end_time'],
        $data['start_time'],
        $data['start_time'],
        $data['end_time'],
        $data['start_time'],
        $data['end_time']
    ]);
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $availableVenues = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    respond(['available_venues' => $availableVenues]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>