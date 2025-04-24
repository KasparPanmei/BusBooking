<?php
header('Content-Type: application/json');
$host = "localhost";
$user = "root";
$pass = "";
$db = "finalproject";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$action = $_REQUEST['action'] ?? '';

if ($action === 'get') {
  $bus_id = $_GET['bus_id'];
  $from = $_GET['from'] ?? null;
  $to = $_GET['to'] ?? null;

  if ($from && $to) {
    $query = "SELECT seat_number FROM payments WHERE bus_id = ? AND from_location = ? AND to_location = ? ORDER BY seat_number ASC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $bus_id, $from, $to);
  } else {
    $query = "SELECT seat_number, status FROM bus_seats WHERE bus_id = ? ORDER BY seat_number ASC";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $bus_id);
  }

  $stmt->execute();
  $result = $stmt->get_result();

  $seats = [];
  while ($row = $result->fetch_assoc()) {
    $seats[] = $row;
  }

  echo json_encode($seats);
} elseif ($action === 'create') {
  $bus_id = $_POST['bus_id'];
  $seat_number = $_POST['seat_number'];
  $status = $_POST['status'];
  $conn->query("INSERT INTO bus_seats (bus_id, seat_number, status) VALUES ('$bus_id', $seat_number, '$status')");
  echo json_encode(["message" => "Seat added."]);
} elseif ($action === 'update') {
  $bus_id = $_POST['bus_id'];
  $seat_number = $_POST['seat_number'];
  $status = $_POST['status'];
  $conn->query("UPDATE bus_seats SET status='$status' WHERE bus_id='$bus_id' AND seat_number=$seat_number");
  echo json_encode(["message" => "Seat updated."]);
} elseif ($action === 'delete') {
  $bus_id = $_POST['bus_id'];
  $seat_number = $_POST['seat_number'];
  $conn->query("DELETE FROM bus_seats WHERE bus_id='$bus_id' AND seat_number=$seat_number");
  echo json_encode(["message" => "Seat deleted."]);
}

$conn->close();
?>
