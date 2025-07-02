<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$params = [];
$where = ["status = 'active'"];
$query = "SELECT 
    vt.id, vt.day_of_week, vt.start_time, vt.end_time, 
    vt.class_name, vt.subject_code, vt.department,
    v.name as venue_name,
    CONCAT(u.fname, ' ', u.lname) as lecturer_name
    FROM venue_timetable vt
    JOIN venues v ON vt.venue_id = v.venue_id
    LEFT JOIN users u ON vt.lecturer_id = u.user_id";

// Filter by venue
if (!empty($_GET['venue_id'])) {
    $where[] = "vt.venue_id = ?";
    $params[] = $_GET['venue_id'];
}

// Filter by lecturer
if (!empty($_GET['lecturer_id'])) {
    $where[] = "vt.lecturer_id = ?";
    $params[] = $_GET['lecturer_id'];
}

// Filter by department
if (!empty($_GET['department'])) {
    $where[] = "vt.department = ?";
    $params[] = $_GET['department'];
}

// Filter by day
if (!empty($_GET['day_of_week'])) {
    $where[] = "vt.day_of_week = ?";
    $params[] = strtolower($_GET['day_of_week']);
}

if (!empty($where)) {
    $query .= " WHERE " . implode(" AND ", $where);
}

// Add sorting
$sortField = in_array($_GET['sort'] ?? '', ['day', 'time', 'class', 'venue']) 
    ? $_GET['sort'] 
    : 'day';
    
$sortMapping = [
    'day' => 'vt.day_of_week, vt.start_time',
    'time' => 'vt.start_time, vt.day_of_week',
    'class' => 'vt.class_name, vt.day_of_week, vt.start_time',
    'venue' => 'v.name, vt.day_of_week, vt.start_time'
];

$sortOrder = strtoupper($_GET['order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
$query .= " ORDER BY " . $sortMapping[$sortField] . " $sortOrder";

// Add pagination
$page = max(1, intval($_GET['page'] ?? 1));
$perPage = min(100, max(10, intval($_GET['per_page'] ?? 20)));
$offset = ($page - 1) * $perPage;
$query .= " LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

try {
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $entries = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = preg_replace('/SELECT .*? FROM/', 'SELECT COUNT(*) as total FROM', $query);
    $countQuery = preg_replace('/ORDER BY .*?$/', '', $countQuery);
    $countQuery = preg_replace('/LIMIT \? OFFSET \?/', '', $countQuery);
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute(array_slice($params, 0, -2));
    $total = $stmt->fetchColumn();
    
    respond([
        'data' => $entries,
        'pagination' => [
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage)
        ]
    ]);
} catch (PDOException $e) {
    respondError("Database error: " . $e->getMessage(), 500);
}
?>