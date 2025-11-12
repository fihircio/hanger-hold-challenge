<?php

require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Database configuration
$host = $_ENV['DB_HOST'] ?? 'localhost';
$port = $_ENV['DB_PORT'] ?? '3306';
$database = $_ENV['DB_DATABASE'] ?? 'test';
$username = $_ENV['DB_USERNAME'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

echo "Testing MySQL connection...\n";
echo "Host: $host\n";
echo "Port: $port\n";
echo "Database: $database\n";
echo "Username: $username\n\n";

try {
    // Create connection
    $conn = new mysqli($host, $username, $password, $database, $port);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "Connected successfully to MySQL database!\n";
    
    // Test query
    $result = $conn->query("SELECT VERSION() as version");
    $row = $result->fetch_assoc();
    echo "MySQL Version: " . $row['version'] . "\n";
    
    // Check if tables exist
    $tables = ['players', 'scores', 'prizes', 'vending_logs'];
    echo "\nChecking tables:\n";
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "✓ Table '$table' exists\n";
        } else {
            echo "✗ Table '$table' does not exist\n";
        }
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}