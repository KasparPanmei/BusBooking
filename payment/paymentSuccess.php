<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "finalproject");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
file_put_contents("debug.txt", print_r($data, true)); // Log input

$razorpay_id = $data["razorpay_payment_id"] ?? '';
$name = $data["name"] ?? '';
$phone = $data["phone"] ?? '';
$email = $data["email"] ?? '';
$seat = $data["seat"] ?? '';
$from = $data["from"] ?? '';
$to = $data["to"] ?? '';
$amount = $data["amount"] ?? 0;
$bus_id = $data["busId"] ?? ''; // 🔥 NOTE: Correct key name

// ✅ Check seat availability again before inserting
$check = $conn->prepare("SELECT * FROM payments WHERE seat_number = ? AND bus_id = ? AND from_location = ? AND to_location = ?");
if (!$check) {
    echo json_encode(["error" => "Prepare failed (check): " . $conn->error]);
    exit();
}
$check->bind_param("ssss", $seat, $bus_id, $from, $to);
$check->execute();
$checkResult = $check->get_result();

if ($checkResult->num_rows > 0) {
    http_response_code(409);
    echo json_encode(["error" => "Seat already booked"]);
    exit();
}

// ✅ Insert
$stmt = $conn->prepare("INSERT INTO payments (razorpay_payment_id, fullname, phone, email, seat_number, bus_id, from_location, to_location, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    echo json_encode(["error" => "Prepare failed (insert): " . $conn->error]);
    exit();
}

$stmt->bind_param("ssssssssd", $razorpay_id, $name, $phone, $email, $seat, $bus_id, $from, $to, $amount);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "invoice_url" => "http://localhost/finalproject/payment/invoice.php?payment_id=" . $razorpay_id
    ]);
} else {
    echo json_encode(["error" => "Execute failed: " . $stmt->error]);
}

$conn->close();
