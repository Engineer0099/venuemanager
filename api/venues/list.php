<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

$params = [];
$where = ["status = 'active'"];
$query = "SELECT * FROM venues";

// Filter by capacity
if (!empty($_GET['min_capacity'])) {
    $where[] = "total_capacity >= ?";
    $params[] = $_GET['min_capacity'];
}

// Filter by features
$featureFilters = [
    'projector' => 'projector = TRUE',
    'whiteboard' => 'whiteboard = TRUE',
    'computer' => 'computer = TRUE',
    'audio' => 'audio_system = TRUE',
    'wheelchair' => 'wheelchair_access = TRUE'
];

foreach ($featureFilters as $param => $condition) {
    if (isset($_GET[$param]) && $_GET[$param] === 'true') {
        $where[] = $condition;
    }
}

// Filter by location
if (!empty($_GET['location'])) {
    $where[] = "location LIKE ?";
    $params[] = '%' . $_GET['location'] . '%';
}

if (!empty($where)) {
    $query .= " WHERE " . implode(" AND ", $where);
}

// Add sorting
$sortOptions = [
    'name' => 'name',
    'capacity' => 'total_capacity',
    'location' => 'location'
];
$sortField = $sortOptions[$_GET['sort'] ?? 'name'] ?? 'name';
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
    $venues = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = preg_replace('/SELECT \* FROM/', 'SELECT COUNT(*) as total FROM', $query);
    $countQuery = preg_replace('/LIMIT \? OFFSET \?/', '', $countQuery);
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute(array_slice($params, 0, -2));
    $total = $stmt->fetchColumn();
    
    respond([
        'data' => $venues,
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