<?php

namespace App\Services;

class SpringVendingLogger
{
    private static $logFile = 'spring_vending.log';
    
    /**
     * Log a dispensing attempt
     */
    public static function logDispensingAttempt(string $tier, int $scoreId): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'dispensing_attempt',
            'tier' => $tier,
            'score_id' => $scoreId,
            'source' => 'game_screen'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log a successful dispensing operation
     */
    public static function logDispensingSuccess(string $tier, int $channel): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'dispensing_success',
            'tier' => $tier,
            'channel' => $channel,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log a failed dispensing operation
     */
    public static function logDispensingFailure(string $tier, string $error): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'dispensing_failure',
            'tier' => $tier,
            'error' => $error,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log system initialization
     */
    public static function logSystemInitialization(bool $success, string $error = null): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'system_initialization',
            'success' => $success,
            'error' => $error,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log channel status check
     */
    public static function logChannelStatusCheck(int $channel, bool $isHealthy, bool $hasProduct): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'channel_status_check',
            'channel' => $channel,
            'is_healthy' => $isHealthy,
            'has_product' => $hasProduct,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log system error
     */
    public static function logError(string $message, string $context = null): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'error',
            'message' => $message,
            'context' => $context,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Log diagnostic test results
     */
    public static function logDiagnosticTest(string $testName, bool $success, string $message = null): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'action' => 'diagnostic_test',
            'test_name' => $testName,
            'success' => $success,
            'message' => $message,
            'source' => 'spring_sdk'
        ];
        
        file_put_contents(self::$logFile, json_encode($logEntry) . "\n", FILE_APPEND);
    }
    
    /**
     * Get recent log entries
     */
    public static function getRecentLogs(int $limit = 10): array
    {
        if (!file_exists(self::$logFile)) {
            return [];
        }
        
        $lines = array_slice(file(self::$logFile), -$limit);
        $logs = [];
        
        foreach ($lines as $line) {
            $logEntry = json_decode($line, true);
            if ($logEntry) {
                $logs[] = $logEntry;
            }
        }
        
        return array_reverse($logs);
    }
    
    /**
     * Clear log file
     */
    public static function clearLogs(): void
    {
        if (file_exists(self::$logFile)) {
            file_put_contents(self::$logFile, '');
        }
    }
    
    /**
     * Get log file path for external access
     */
    public static function getLogFilePath(): string
    {
        return self::$logFile;
    }
}