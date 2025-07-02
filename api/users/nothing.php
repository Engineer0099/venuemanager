<?php
header('Content-Type: application/json');

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

// Get POST data as JSON
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input']);
    exit;
}

$name = $conn->real_escape_string($data['name'] ?? '');
$location = $conn->real_escape_string($data['location'] ?? '');
$description = $conn->real_escape_string($data['description'] ?? '');
$total_capacity = isset($data['total_capacity']) ? (int)$data['total_capacity'] : 0;
$exam_capacity_1 = isset($data['exam_capacity_1']) ? (int)$data['exam_capacity_1'] : 0;
$exam_capacity_2 = isset($data['exam_capacity_2']) ? (int)$data['exam_capacity_2'] : 0;
$image = $conn->real_escape_string($data['image'] ?? '');
$status = $conn->real_escape_string($data['status'] ?? 'free');

// Prepare and execute insert
$stmt = $conn->prepare("INSERT INTO venues (
    name, 
    location, 
    description, 
    total_capacity, 
    exam_capacity_1, 
    exam_capacity_2, 
    image, 
    status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

if ($stmt === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to prepare statement']);
    $conn->close();
    exit;
}

$stmt->bind_param("sssiiiss", $name, $location, $description, $total_capacity, $exam_capacity_1, $exam_capacity_2, $image, $status);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'venue_id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to register venue',
        'mysqli_error' => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>