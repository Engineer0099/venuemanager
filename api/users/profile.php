<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

// Get user ID from JWT token or session in production
$userId = $_GET['id'] ?? null;
if (!$userId) {
    respondError("User ID is required", 400);
}

try {
    $stmt = $pdo->prepare("SELECT 
        user_id, title, fname, mname, lname, email, phone, role, 
        gender, department, reg_number, profile_pic, account_status,
        created_at, last_login
        FROM users WHERE user_id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        respondError("User not found", 404);
    }
    
    respond($user);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>