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

echo "MySQL Migration Script\n";
echo "=====================\n\n";

try {
    // Create connection
    $conn = new mysqli($host, $username, $password, $database, $port);
    
    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error . "\n");
    }
    
    echo "Connected successfully to MySQL database!\n\n";
    
    // Read and execute migration files
    $migrationFiles = [
        'database/migrations/001_create_players_table.sql',
        'database/migrations/002_create_scores_table.sql',
        'database/migrations/003_create_prizes_table.sql',
        'database/migrations/004_create_vending_logs_table.sql',
        'database/migrations/005_seed_prizes.sql'
    ];
    
    foreach ($migrationFiles as $file) {
        echo "Executing migration: $file\n";
        
        if (file_exists($file)) {
            $sql = file_get_contents($file);
            
            // Split SQL statements by semicolon
            $statements = array_filter(array_map('trim', explode(';', $sql)));
            
            foreach ($statements as $statement) {
                if (!empty($statement)) {
                    if ($conn->query($statement)) {
                        echo "  ✓ Success\n";
                    } else {
                        echo "  ✗ Error: " . $conn->error . "\n";
                    }
                }
            }
        } else {
            echo "  ✗ File not found\n";
        }
        echo "\n";
    }
    
    echo "Migration completed!\n";
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}