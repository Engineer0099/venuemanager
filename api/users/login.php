<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

if (empty($data['email']) || empty($data['password'])) {
    respondError("Email and password are required", 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        respondError("Invalid credentials", 401);
    }
    
    // Check account status
    if ($user['account_status'] !== 'active') {
        respondError("Account is " . $user['account_status'], 403);
    }
    
    // Verify password
    $hashParts = explode('$', $user['password_hash']);
    $salt = $hashParts[1];
    $computedHash = '$' . $salt . '$' . hash('sha256', $salt . $data['password']);
    
    if ($computedHash !== $user['password_hash']) {
        // Track failed login attempts
        $stmt = $pdo->prepare("UPDATE users SET 
            failed_login_attempts = failed_login_attempts + 1,
            last_failed_login = NOW()
            WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
        
        // Auto-suspend after 5 failed attempts
        if ($user['failed_login_attempts'] + 1 >= 5) {
            $pdo->prepare("UPDATE users SET account_status = 'suspended' WHERE user_id = ?")
                ->execute([$user['user_id']]);
            respondError("Too many failed attempts. Account suspended.", 403);
        }
        
        respondError("Invalid credentials", 401);
    }
    
    // Reset failed attempts on successful login
    $pdo->prepare("UPDATE users SET 
        failed_login_attempts = 0,
        last_login = NOW()
        WHERE user_id = ?")
        ->execute([$user['user_id']]);
    
    // Return user data (excluding sensitive fields)
    unset($user['password_hash'], $user['salt'], $user['password_reset_token']);
    respond($user);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>