<!-- <?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $conn = new mysqli("localhost", "root", "", "venue_manager");

    if ($conn->connect_error) {
        die("false");
    }

    $email = $conn->real_escape_string($_POST['email']);

    $sql = "SELECT user_id FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        echo "true";
    } else {
        echo "false";
    }

    $conn->close();
}
?> -->






<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $conn = new mysqli("localhost", "root", "", "venue_manager");

    if ($conn->connect_error) {
        die("false");
    }

    $email = $conn->real_escape_string($_POST['email']);

    $sql = "SELECT user_id FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        echo "true";
    } else {
        echo "false";
    }

    $conn->close();
}
?>







