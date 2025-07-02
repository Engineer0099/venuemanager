<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../shared/helpers.php';

$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'venue_manager';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    respondError("Database connection failed: " . $e->getMessage(), 500);
}



?>