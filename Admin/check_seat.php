<?php
header('Content-Type: application/json');

$conn = new mysqli("localhost", "root", "", "finalproject"); 

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed"]);
    exit;
}

$seat_number = $_GET['seat_number'] ?? '';
$bus_id = $_GET['bus_id'] ?? '';

if (empty($seat_number) || empty($bus_id)) {
    echo json_encode(["status" => "error", "message" => "Missing parameters"]);
    exit;
}

$query = "SELECT * FROM bus_seats WHERE seat_number = ? AND bus_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $seat_number, $bus_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    echo json_encode(["status" => "booked"]);
} else {
    echo json_encode(["status" => "available"]);
}
?>
