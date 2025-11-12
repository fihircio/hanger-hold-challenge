<?php
// Simple test to check if PHP is working
echo "PHP is working!";
echo "<br>";
echo "Current directory: " . __DIR__;
echo "<br>";
echo "Parent directory: " . dirname(__DIR__);

// Check if vendor/autoload.php exists
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
echo "<br>Autoload exists: " . (file_exists($autoloadPath) ? "Yes" : "No");

// Try to load dotenv
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
    echo "<br>Autoload loaded successfully";
    
    // Check if dotenv class exists
    if (class_exists('Dotenv\Dotenv')) {
        echo "<br>Dotenv class exists";
        
        try {
            $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
            $dotenv->load();
            echo "<br>Dotenv loaded successfully";
            echo "<br>DB_DATABASE: " . ($_ENV['DB_DATABASE'] ?? 'Not set');
        } catch (Exception $e) {
            echo "<br>Dotenv error: " . $e->getMessage();
        }
    } else {
        echo "<br>Dotenv class does not exist";
    }
}
?>