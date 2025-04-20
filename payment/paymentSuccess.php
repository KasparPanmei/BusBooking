<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "finalproject"); // replace with your DB name

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed", "error" => $conn->connect_error]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
file_put_contents("log.txt", json_encode($data));


// Extract data safely
$razorpay_payment_id = $data["razorpay_payment_id"] ?? '';
$fullname = $data["name"] ?? '';
$phone = $data["phone"] ?? '';
$email = $data["email"] ?? '';
$seat = $data["seat"] ?? '';
$from = $data["from"] ?? '';
$to = $data["to"] ?? '';
$amount = $data["amount"] ?? 0;
$bus_id = $data["bus_id"] ?? '';

// Prepare query
$stmt = $conn->prepare("INSERT INTO payments (razorpay_payment_id, fullname, phone, email, seat_number, from_location, to_location, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(["message" => "Prepare failed", "error" => $conn->error]);
    exit();
}

$stmt->bind_param("sssssssi", $razorpay_payment_id, $fullname, $phone, $email, $seat, $from, $to, $amount);

if ($stmt->execute()) {
   // ✅ Step 1: Update seat status
    if (!empty($seat) && !empty($bus_id)) {
       // STEP 1: Automatically update seat status to 'booked' in bus_seats
        $bus_id = "BUS001"; // default bus ID
        $updateSeat = $conn->prepare("UPDATE bus_seats SET status='booked' WHERE bus_id=? AND seat_number=?");
        $updateSeat->bind_param("ss", $bus_id, $seat);
        $updateSeat->execute();
        echo json_encode(["message" => "Payment stored successfully and seat marked as booked"]);
        }
} else {
    http_response_code(500);
    echo json_encode([
        "message" => "Failed to store payment",
        "error" => $stmt->error
    ]);
}
?>
