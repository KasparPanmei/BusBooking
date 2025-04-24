<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "finalproject");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

$query = "SELECT seat_number, fullname, phone, razorpay_payment_id, from_location, to_location, created_at FROM payments ORDER BY seat_number";
$result = $conn->query($query);

$payments = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
}

echo json_encode($payments);
$conn->close();
?>
