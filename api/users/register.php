<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "<script>alert('Method not allowed');</script>";
    exit;
}

require_once __DIR__ . '/../config/db.php';

$title      = $_POST['title']      ?? '';
$fname      = $_POST['fname']      ?? '';
$lname      = $_POST['lname']      ?? '';
$email      = $_POST['email']      ?? '';
$password   = $_POST['password']   ?? '';
$role       = $_POST['role']       ?? '';
$phone      = $_POST['phone']      ?? null;
$gender     = $_POST['gender']     ?? null;
$department = $_POST['department'] ?? null;
$reg_number = $_POST['reg_number'] ?? null;
$profile_pic= $_POST['profile_pic']?? null;

if (!$title || !$fname || !$lname || !$email || !$password || !$role) {
    echo "<script>alert('Please fill all required fields');</script>";
    exit;
}else{
    echo "<script>alert('server reached');</script>";
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "<script>alert('Invalid email');</script>";
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT 1 FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo "<script>alert('Email already registered');</script>";
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO users 
        (title, fname, lname, email, phone, role, gender, department, reg_number, profile_pic, password_hash, account_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->execute([
        $title, $fname, $lname, $email, $phone, $role, $gender, $department, $reg_number, $profile_pic,
        password_hash($password, PASSWORD_DEFAULT)
    ]);

    echo "<script>alert('Registration successful. Account pending approval.');</script>";
} catch (Exception $e) {
    echo "<script>alert('Server error');</script>";
}
?>
