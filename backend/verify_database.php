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

echo "Database Verification Script\n";
echo "=======================\n\n";
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
    
    echo "✅ Connected successfully to MySQL database!\n\n";
    
    // Check if tables exist
    $tables = ['players', 'scores', 'prizes', 'vending_logs'];
    echo "Checking tables:\n";
    
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "✅ Table '$table' exists\n";
        } else {
            echo "❌ Table '$table' missing\n";
        }
    }
    
    echo "\nChecking prize data:\n";
    $result = $conn->query("SELECT COUNT(*) as count FROM prizes");
    $row = $result->fetch_assoc();
    $prizeCount = $row['count'];
    
    if ($prizeCount > 0) {
        echo "✅ Prizes table seeded with $prizeCount entries\n";
        
        // Show prize details
        $result = $conn->query("SELECT id, name, slot, time_threshold FROM prizes ORDER BY time_threshold DESC");
        echo "\nPrize Details:\n";
        echo "ID | Name | Slot | Time Threshold\n";
        echo "---|------|------|---------------\n";
        while ($row = $result->fetch_assoc()) {
            printf("%-2d | %-20s | %-4d | %dms\n", 
                $row['id'], 
                $row['name'], 
                $row['slot'], 
                $row['time_threshold']
            );
        }
    } else {
        echo "❌ No prize data found\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}