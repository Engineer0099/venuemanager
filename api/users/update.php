<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$userId = $data['user_id'] ?? null;

if (!$userId) {
    respondError("User ID is required", 400);
}

// Fields that can be updated
$allowedFields = [
    'title', 'fname', 'mname', 'lname', 'phone', 'gender',
    'department', 'profile_pic'
];

// Validate and prepare update data
$updateData = [];
foreach ($allowedFields as $field) {
    if (isset($data[$field])) {
        $updateData[$field] = $data[$field];
    }
}

if (empty($updateData)) {
    respondError("No valid fields to update", 400);
}

try {
    // Build dynamic UPDATE query
    $setParts = [];
    $params = [];
    foreach ($updateData as $field => $value) {
        $setParts[] = "$field = ?";
        $params[] = $value;
    }
    $params[] = $userId;
    
    $sql = "UPDATE users SET " . implode(', ', $setParts) . " WHERE user_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    respond(['message' => 'Profile updated successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>