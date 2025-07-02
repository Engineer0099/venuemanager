<?php
function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function respondError($message, $status = 400) {
    respond(['error' => $message], $status);
}

function getRequestData() {
    $json = file_get_contents('php://input');
    return json_decode($json, true);
}

function validateBookingData($data) {
    $required = ['user_id', 'venue_id', 'title', 'date', 'start_time', 'end_time', 'purpose'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            respondError("Missing required field: $field");
        }
    }
    
    if (strtotime($data['date'] . ' ' . $data['end_time']) <= strtotime($data['date'] . ' ' . $data['start_time'])) {
        respondError("End time must be after start time");
    }
}
?>