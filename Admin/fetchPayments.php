<?php
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "finalproject");

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed."]);
    exit();
}

$seat_number = $_GET['seat_number'] ?? null;
$bus_id = $_GET['bus_id'] ?? null;

if ($seat_number) {
    // 🟡 Check seat booking status
    $stmt = $conn->prepare("SELECT seat_number FROM payments WHERE seat_number = ?");
    $stmt->bind_param("s", $seat_number);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["status" => "booked"]);
    } else {
        echo json_encode(["status" => "available"]);
    }

    $stmt->close();
} elseif ($bus_id) {
    // 🔵 Fetch all payments for a bus_id
    $stmt = $conn->prepare("SELECT seat_number, fullname, phone, razorpay_payment_id, from_location, to_location FROM payments WHERE bus_id = ?");
    $stmt->bind_param("s", $bus_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }

    echo json_encode($payments);
    $stmt->close();
} else {
    // 🚫 Missing params
    echo json_encode(["error" => "Missing required parameter: seat_number or bus_id."]);
}

$conn->close();
?>
