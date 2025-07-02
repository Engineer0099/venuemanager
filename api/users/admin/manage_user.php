<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$userId = $data['user_id'] ?? null;

if (!$userId) {
    respondError("User ID is required", 400);
}

// Allowed admin actions
$allowedActions = [
    'update_status' => ['account_status'],
    'update_role' => ['role'],
    'force_password_reset' => ['must_change_password']
];

// Determine which action is being requested
$action = null;
$updateFields = [];
foreach ($allowedActions as $actionName => $fields) {
    if (isset($data[$fields[0]])) {
        $action = $actionName;
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updateFields[$field] = $data[$field];
            }
        }
        break;
    }
}

if (!$action) {
    respondError("No valid management action specified", 400);
}

try {
    // Verify user exists
    $stmt = $pdo->prepare("SELECT 1 FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    if (!$stmt->fetch()) {
        respondError("User not found", 404);
    }
    
    // Prepare update based on action
    $updateData = [];
    switch ($action) {
        case 'update_status':
            if (!in_array($updateFields['account_status'], ['active', 'inactive', 'suspended', 'pending'])) {
                respondError("Invalid status value", 400);
            }
            $updateData['account_status'] = $updateFields['account_status'];
            if ($updateFields['account_status'] === 'active') {
                $updateData['failed_login_attempts'] = 0; // Reset on activation
            }
            break;
            
        case 'update_role':
            if (!in_array($updateFields['role'], ['student', 'lecturer', 'admin', 'staff', 'guest'])) {
                respondError("Invalid role value", 400);
            }
            $updateData['role'] = $updateFields['role'];
            break;
            
        case 'force_password_reset':
            $updateData['must_change_password'] = $updateFields['must_change_password'] ? 1 : 0;
            break;
    }
    
    // Perform update
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
    
    respond(['message' => 'User account updated successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>