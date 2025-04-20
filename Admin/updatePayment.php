<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "finalproject");

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $conn->prepare("UPDATE payments SET seat_number=?, fullname=?, phone=? WHERE razorpay_payment_id=?");
$stmt->bind_param("ssss", $data["seat_number"], $data["fullname"], $data["phone"], $data["razorpay_payment_id"]);

if ($stmt->execute()) {
    echo json_encode(["message" => "Record updated successfully."]);
} else {
    echo json_encode(["message" => "Update failed."]);
}

$stmt->close();
$conn->close();
?>
