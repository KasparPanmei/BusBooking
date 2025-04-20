<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "finalproject");

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $conn->prepare("DELETE FROM payments WHERE razorpay_payment_id = ?");
$stmt->bind_param("s", $data["razorpay_payment_id"]);

if ($stmt->execute()) {
    echo json_encode(["message" => "Record deleted successfully."]);
} else {
    echo json_encode(["message" => "Delete failed."]);
}

$stmt->close();
$conn->close();
?>
