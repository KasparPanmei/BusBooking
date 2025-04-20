<?php
session_start();
$conn = new mysqli("localhost", "root", "", "finalproject");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
  $username = $_POST['username'];
  $password = $_POST['password'];

  $stmt = $conn->prepare("SELECT * FROM admins WHERE username = ? AND password = SHA1(?)");
  $stmt->bind_param("ss", $username, $password);
  $stmt->execute();
  $result = $stmt->get_result();

  if ($result->num_rows === 1) {
    
    $_SESSION['admin'] = $username;
    header("Location: ./admin.html");
    exit;
  } else {
    $error = "Invalid credentials";
  }
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Admin Login</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="shortcut icon" href="../Icons/bus.png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css">
    <link rel="stylesheet" href="../styles/style.css">
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100..900&display=swap" rel="stylesheet">
</head>
<body class="flex items-center justify-center h-screen bg-gray-100">
  <form method="POST" class="bg-white p-6 rounded-lg shadow-md w-80">
    <h2 class="text-2xl font-bold mb-4">Admin Login</h2>
    <?php if (isset($error)): ?>
      <p class="text-red-500 text-sm mb-2"><?= $error ?></p>
    <?php endif; ?>
    <input name="username" placeholder="Username" class="w-full border px-3 py-2 mb-3 rounded" required>
    <input name="password" type="password" placeholder="Password" class="w-full border px-3 py-2 mb-4 rounded" required>
    <button class="w-full bg-blue-500 text-white py-2 rounded">Login</button>
  </form>
</body>
</html>
