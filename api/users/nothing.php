<?php
// Database connection
$host = 'localhost';
$db   = 'venue_manager';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get POST data
$name = $conn->real_escape_string($_POST['name'] ?? '');
$location = $conn->real_escape_string($_POST['location'] ?? '');
$description = $conn->real_escape_string($_POST['description'] ?? '');
$total_capacity = (int)($_POST['total_capacity'] ?? 0);
$exam_capacity_1 = (int)($_POST['exam_capacity_1'] ?? 0);
$exam_capacity_2 = (int)($_POST['exam_capacity_2'] ?? 0);
$image = $conn->real_escape_string($_POST['image'] ?? '');
$status = $conn->real_escape_string($_POST['status'] ?? 'free');




// Prepare and execute insert
$stmt = $conn->prepare("INSERT INTO venues (
name, 
location, 
description, 
total_capacity, 
exam_capacity_1, 
exam_capacity_2, 
image, 
status) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssss", $name, $location, $description, $total_capacity, $exam_capacity_1, $exam_capacity_2, $image, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'venue_id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to register venue']);
}

$stmt->close();
$conn->close();
?>