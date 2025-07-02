<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();
$userId = $data['user_id'] ?? null;

if (!$userId || empty($data['current_password']) || empty($data['new_password'])) {
    respondError("User ID, current password and new password are required", 400);
}

try {
    // Get current password hash
    $stmt = $pdo->prepare("SELECT password_hash, salt FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        respondError("User not found", 404);
    }
    
    // Verify current password
    $hashParts = explode('$', $user['password_hash']);
    $salt = $hashParts[1];
    $computedHash = '$' . $salt . '$' . hash('sha256', $salt . $data['current_password']);
    
    if ($computedHash !== $user['password_hash']) {
        respondError("Current password is incorrect", 401);
    }
    
    // Generate new salt and hash
    $newSalt = bin2hex(random_bytes(32));
    $newPasswordHash = '$' . $newSalt . '$' . hash('sha256', $newSalt . $data['new_password']);
    
    // Update password
    $stmt = $pdo->prepare("UPDATE users SET 
        password_hash = ?,
        salt = ?,
        last_password_change = NOW(),
        must_change_password = 0,
        failed_login_attempts = 0
        WHERE user_id = ?");
    $stmt->execute([$newPasswordHash, $newSalt, $userId]);
    
    respond(['message' => 'Password changed successfully']);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>