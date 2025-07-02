<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$params = [];
$where = [];
$query = "SELECT * FROM bookings";

// Filter by user_id
if (!empty($_GET['user_id'])) {
    $where[] = "user_id = ?";
    $params[] = $_GET['user_id'];
}

// Filter by venue_id
if (!empty($_GET['venue_id'])) {
    $where[] = "venue_id = ?";
    $params[] = $_GET['venue_id'];
}

// Filter by status
if (!empty($_GET['status'])) {
    $where[] = "status = ?";
    $params[] = $_GET['status'];
}

// Filter by date range
if (!empty($_GET['start_date'])) {
    $where[] = "date >= ?";
    $params[] = $_GET['start_date'];
}
if (!empty($_GET['end_date'])) {
    $where[] = "date <= ?";
    $params[] = $_GET['end_date'];
}

if (!empty($where)) {
    $query .= " WHERE " . implode(" AND ", $where);
}

// Add sorting
$sortField = $_GET['sort'] ?? 'date';
$sortOrder = strtoupper($_GET['order'] ?? 'ASC') === 'DESC' ? 'DESC' : 'ASC';
$query .= " ORDER BY $sortField $sortOrder";

// Add pagination
$page = max(1, intval($_GET['page'] ?? 1));
$perPage = min(50, max(5, intval($_GET['per_page'] ?? 20)));
$offset = ($page - 1) * $perPage;
$query .= " LIMIT ? OFFSET ?";
$params[] = $perPage;
$params[] = $offset;

try {
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = preg_replace('/SELECT \* FROM/', 'SELECT COUNT(*) as total FROM', $query);
    $countQuery = preg_replace('/LIMIT \? OFFSET \?/', '', $countQuery);
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute(array_slice($params, 0, -2));
    $total = $stmt->fetchColumn();
    
    respond([
        'data' => $bookings,
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