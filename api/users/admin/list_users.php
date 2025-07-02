<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../shared/helpers.php';

// In production, verify admin role here

$params = [];
$where = [];
$query = "SELECT 
    user_id, title, fname, lname, email, role, department, 
    reg_number, account_status, created_at, last_login
    FROM users";

// Filter by role
if (!empty($_GET['role'])) {
    $where[] = "role = ?";
    $params[] = $_GET['role'];
}

// Filter by status
if (!empty($_GET['status'])) {
    $where[] = "account_status = ?";
    $params[] = $_GET['status'];
}

// Filter by department
if (!empty($_GET['department'])) {
    $where[] = "department = ?";
    $params[] = $_GET['department'];
}

// Search by name or email
if (!empty($_GET['search'])) {
    $where[] = "(CONCAT(fname, ' ', lname) LIKE ? OR email LIKE ?)";
    $params[] = '%' . $_GET['search'] . '%';
    $params[] = '%' . $_GET['search'] . '%';
}

if (!empty($where)) {
    $query .= " WHERE " . implode(" AND ", $where);
}

// Add sorting
$sortField = in_array($_GET['sort'] ?? '', ['name', 'email', 'role', 'created_at']) 
    ? $_GET['sort'] 
    : 'created_at';
$sortOrder = strtoupper($_GET['order'] ?? 'DESC') === 'ASC' ? 'ASC' : 'DESC';
$query .= " ORDER BY $sortField $sortOrder";

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
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countQuery = preg_replace('/SELECT .*? FROM/', 'SELECT COUNT(*) as total FROM', $query);
    $countQuery = preg_replace('/LIMIT \? OFFSET \?/', '', $countQuery);
    $stmt = $pdo->prepare($countQuery);
    $stmt->execute(array_slice($params, 0, -2));
    $total = $stmt->fetchColumn();
    
    respond([
        'data' => $users,
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