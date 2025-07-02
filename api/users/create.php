<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
// Database connection
$conn = new mysqli("localhost", "root", "", "venue_manager");

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query to get all venues
$sql = "SELECT * FROM venues";
$result = $conn->query($sql);

$venues = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $venues[] = $row;
    }
}

// Output as JSON
header('Content-Type: application/json');
echo json_encode($venues);

$conn->close();
?>
