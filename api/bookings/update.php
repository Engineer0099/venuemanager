<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
if (empty($data['booking_id']) || empty($data['status'])) {
    respondError("Booking ID and status are required", 400);
}

$allowedStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
if (!in_array($data['status'], $allowedStatuses)) {
    respondError("Invalid status value", 400);
}

try {
    // Check if booking exists
    $stmt = $pdo->prepare("SELECT 1 FROM bookings WHERE booking_id = ?");
    $stmt->execute([$data['booking_id']]);
    if (!$stmt->fetch()) {
        respondError("Booking not found", 404);
    }
    
    // Update status
    $updateData = [
        'status' => $data['status'],
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    if ($data['status'] === 'approved') {
        $updateData['approved_by'] = $data['user_id'] ?? null;
        $updateData['approval_date'] = date('Y-m-d H:i:s');
    }
    
    if ($data['status'] === 'rejected' && !empty($data['rejection_reason'])) {
        $updateData['rejection_reason'] = $data['rejection_reason'];
    }
    
    $setParts = [];
    $params = [];
    foreach ($updateData as $field => $value) {
        $setParts[] = "$field = ?";
        $params[] = $value;
    }
    $params[] = $data['booking_id'];
    
    $sql = "UPDATE bookings SET " . implode(', ', $setParts) . " WHERE booking_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    respond(['message' => 'Booking status updated successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>