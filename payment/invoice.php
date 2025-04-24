<?php
$payment_id = $_GET['payment_id'] ?? '';

$conn = new mysqli("localhost", "root", "", "finalproject");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$stmt = $conn->prepare("SELECT * FROM payments WHERE razorpay_payment_id = ?");
$stmt->bind_param("s", $payment_id);
$stmt->execute();
$result = $stmt->get_result();
$data = $result->fetch_assoc();

if (!$data) {
    die("Invalid payment ID");
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Invoice</title>
  <style>
    body { font-family: Arial; margin: 2em; }
    .invoice-box { border: 1px solid #ccc; padding: 2em; }
    h2 { color: #333; }
  </style>
</head>
<body>
  <div class="invoice-box">
    <h2>Bus Ticket Invoice</h2>
    <p><strong>Payment ID:</strong> <?= $data['razorpay_payment_id'] ?></p>
    <p><strong>Name:</strong> <?= $data['fullname'] ?></p>
    <p><strong>Email:</strong> <?= $data['email'] ?></p>
    <p><strong>Phone:</strong> <?= $data['phone'] ?></p>
    <p><strong>Route:</strong> <?= $data['from_location'] ?> → <?= $data['to_location'] ?></p>
    <p><strong>Seat No:</strong> <?= $data['seat_number'] ?></p>
    <p><strong>Amount:</strong> ₹<?= $data['amount'] ?></p>
    <hr>
    <button onclick="window.print()">🖨️ Print / Save Invoice</button>
  </div>
</body>
</html>
