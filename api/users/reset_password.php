<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$data = getRequestData();

if (empty($data['email']) && empty($data['token'])) {
    respondError("Email or token required", 400);
}

try {
    // Request password reset (send email with token)
    if (!empty($data['email'])) {
        $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND account_status = 'active'");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if ($user) {
            $token = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour'));
            
            $pdo->prepare("UPDATE users SET 
                password_reset_token = ?,
                token_expiry = ?
                WHERE user_id = ?")
                ->execute([$token, $expiry, $user['user_id']]);
            
            // In production, send email with reset link containing the token
            respond(['message' => 'If this email exists, a reset link has been sent']);
        } else {
            respond(['message' => 'If this email exists, a reset link has been sent']);
        }
    }
    // Process password reset with token
    else if (!empty($data['token']) && !empty($data['new_password'])) {
        $stmt = $pdo->prepare("SELECT user_id FROM users 
            WHERE password_reset_token = ? 
            AND token_expiry > NOW()");
        $stmt->execute([$data['token']]);
        $user = $stmt->fetch();
        
        if (!$user) {
            respondError("Invalid or expired token", 400);
        }
        
        // Generate new salt and hash
        $salt = bin2hex(random_bytes(32));
        $passwordHash = '$' . $salt . '$' . hash('sha256', $salt . $data['new_password']);
        
        $pdo->prepare("UPDATE users SET 
            password_hash = ?,
            salt = ?,
            password_reset_token = NULL,
            token_expiry = NULL,
            last_password_change = NOW()
            WHERE user_id = ?")
            ->execute([$passwordHash, $salt, $user['user_id']]);
        
        respond(['message' => 'Password updated successfully']);
    } else {
        respondError("Token and new password required", 400);
    }
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>