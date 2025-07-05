<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

$name = $_POST['name'];
$location = $_POST['location'];
$capacity = $_POST['capacity'];

if(!$name || !$location || !$capacity){
    echo json_encode(['success'=>false, 'message'=>'Missing Fields']);
    exit;
}else{
    echo json_encode(['success'=> true, 'message'=> 'Received Successfull..!']);
}


?>
