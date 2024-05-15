<?php

// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
// Allow requests with these methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
// Allow requests with these headers
header("Access-Control-Allow-Headers: *");

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Return an empty response with CORS headers
    http_response_code(204); // No Content
    exit();
}

include 'DbConnect.php';
$objDb = new DbConnect;
$conn = $objDb->connect();

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

switch ($method) {
    case "GET":
        if (strpos($uri, '/archived') !== false) {
            $sql = "SELECT * FROM archived";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $arch = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($arch);
        } else {
            $sql = "SELECT * FROM emplist1";
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $emplist1 = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($emplist1);
        }
        break;
    case "POST":
        $data = json_decode(file_get_contents('php://input'));

        if (!empty($data->username) && !empty($data->password)) {
            // Validate the credentials by querying the database
            $username = $data->username;
            $password = $data->password;

            // Prepare and execute a SQL query to retrieve user data
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':password', $password); // Note: This comparison is done without hashing
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Verify if user exists
            if ($user) {
                $response = ['status' => 1, 'message' => 'Login successful', 'redirect' => '/dashboard'];
            } else {
                $response = ['status' => 0, 'message' => 'Invalid username or password'];
            }
        } else {
            $response = ['status' => 0, 'message' => 'Username and password are required'];
        }

        // Send the response with CORS headers
        header('Content-Type: application/json');
        echo json_encode($response);
        break;

    default:
        // Handle other HTTP methods if needed
        http_response_code(405); // Method Not Allowed
        echo json_encode(['status' => 0, 'message' => 'Method not allowed']);
        break;
}
?>
