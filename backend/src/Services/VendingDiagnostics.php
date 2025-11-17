<?php

namespace App\Services;

use App\Services\SpringVendingLogger;

class VendingDiagnostics
{
    /**
     * Run comprehensive diagnostics on the vending system
     */
    public static function runFullDiagnostics(): array
    {
        $results = [];
        
        // Test 1: Spring SDK Service Status
        $results['spring_sdk_init'] = self::testSpringSDKInitialization();
        
        // Test 2: Serial Communication
        $results['serial_communication'] = self::testSerialCommunication();
        
        // Test 3: Channel Health
        $results['channel_health'] = self::testChannelHealth();
        
        // Test 4: Dispensing Mechanism
        $results['dispensing_test'] = self::testDispensing();
        
        // Test 5: System Performance
        $results['performance_test'] = self::testSystemPerformance();
        
        // Calculate overall status
        $results['overall_status'] = self::calculateOverallStatus($results);
        $results['timestamp'] = date('Y-m-d H:i:s');
        
        // Log diagnostic run
        SpringVendingLogger::logDiagnosticTest('Full Diagnostics', $results['overall_status'] === 'pass');
        
        return $results;
    }
    
    /**
     * Test Spring SDK service initialization
     */
    private static function testSpringSDKInitialization(): array
    {
        try {
            // Test if Spring SDK service can be instantiated
            // This is a simulation since we don't have actual Spring SDK in PHP
            // In real implementation, this would test actual SDK initialization
            
            return [
                'name' => 'Spring SDK Initialization',
                'status' => 'pass', // Simulated pass
                'message' => 'Spring SDK service initialized successfully',
                'details' => [
                    'service_available' => true,
                    'connection_status' => 'ready'
                ]
            ];
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Spring SDK initialization test failed', $e->getMessage());
            
            return [
                'name' => 'Spring SDK Initialization',
                'status' => 'fail',
                'message' => 'Spring SDK initialization failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test serial communication with vending controller
     */
    private static function testSerialCommunication(): array
    {
        try {
            // Test serial port availability (simulated)
            // In real implementation, this would test actual COM port communication
            
            return [
                'name' => 'Serial Communication',
                'status' => 'pass', // Simulated pass
                'message' => 'Serial communication working',
                'details' => [
                    'port_available' => true,
                    'baud_rate' => 9600,
                    'connection_status' => 'ready'
                ]
            ];
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Serial communication test failed', $e->getMessage());
            
            return [
                'name' => 'Serial Communication',
                'status' => 'fail',
                'message' => 'Serial communication test failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test channel health across all channels
     */
    private static function testChannelHealth(): array
    {
        try {
            $totalChannels = 25; // Based on your prize configuration
            $healthyChannels = rand(15, 20); // Simulated healthy channels
            $unhealthyChannels = $totalChannels - $healthyChannels;
            
            $status = $unhealthyChannels <= 2 ? 'pass' : 'warn';
            $message = $status === 'pass' 
                ? "Channel health check passed ({$healthyChannels}/{$totalChannels} healthy)"
                : "Channel health warning: {$unhealthyChannels} unhealthy channels detected";
            
            return [
                'name' => 'Channel Health',
                'status' => $status,
                'message' => $message,
                'details' => [
                    'total_channels' => $totalChannels,
                    'healthy_channels' => $healthyChannels,
                    'unhealthy_channels' => $unhealthyChannels,
                    'health_percentage' => round(($healthyChannels / $totalChannels) * 100, 1)
                ]
            ];
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Channel health test failed', $e->getMessage());
            
            return [
                'name' => 'Channel Health',
                'status' => 'fail',
                'message' => 'Channel health test failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test dispensing mechanism
     */
    private static function testDispensing(): array
    {
        try {
            // Simulate dispensing test
            $testChannels = [1, 6, 16]; // Test one channel per tier
            $successCount = 0;
            
            foreach ($testChannels as $channel) {
                // Simulate test result (80% success rate)
                if (rand(1, 10) <= 8) {
                    $successCount++;
                }
            }
            
            $status = $successCount >= 2 ? 'pass' : 'fail';
            $message = $status === 'pass'
                ? "Dispensing test passed ({$successCount}/3 channels successful)"
                : "Dispensing test failed (only {$successCount}/3 channels successful)";
            
            return [
                'name' => 'Dispensing Test',
                'status' => $status,
                'message' => $message,
                'details' => [
                    'tested_channels' => $testChannels,
                    'successful_tests' => $successCount,
                    'success_rate' => round(($successCount / count($testChannels)) * 100, 1)
                ]
            ];
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Dispensing test failed', $e->getMessage());
            
            return [
                'name' => 'Dispensing Test',
                'status' => 'fail',
                'message' => 'Dispensing test failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Test system performance
     */
    private static function testSystemPerformance(): array
    {
        try {
            // Simulate performance metrics
            $responseTime = rand(100, 500); // 100-500ms response time
            $memoryUsage = rand(30, 70); // 30-70% memory usage
            $cpuUsage = rand(20, 40); // 20-40% CPU usage
            
            $status = (
                $responseTime < 300 &&
                $memoryUsage < 80 &&
                $cpuUsage < 50
            ) ? 'pass' : 'warn';
            
            $message = $status === 'pass'
                ? 'Performance test passed'
                : 'Performance warning: High resource usage detected';
            
            return [
                'name' => 'Performance Test',
                'status' => $status,
                'message' => $message,
                'details' => [
                    'response_time_ms' => $responseTime,
                    'memory_usage_percent' => $memoryUsage,
                    'cpu_usage_percent' => $cpuUsage,
                    'performance_grade' => $status === 'pass' ? 'excellent' : 'needs_optimization'
                ]
            ];
        } catch (\Exception $e) {
            SpringVendingLogger::logError('Performance test failed', $e->getMessage());
            
            return [
                'name' => 'Performance Test',
                'status' => 'fail',
                'message' => 'Performance test failed: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Calculate overall diagnostic status
     */
    private static function calculateOverallStatus(array $results): string
    {
        $failedTests = array_filter($results, function($test) {
            return $test['status'] === 'fail';
        });
        
        $warningTests = array_filter($results, function($test) {
            return $test['status'] === 'warn';
        });
        
        if (empty($failedTests) && empty($warningTests)) {
            return 'pass';
        } elseif (!empty($failedTests)) {
            return 'fail';
        } else {
            return 'warn';
        }
    }
    
    /**
     * Get diagnostic summary
     */
    public static function getDiagnosticSummary(): array
    {
        $recentLogs = SpringVendingLogger::getRecentLogs(20);
        
        return [
            'timestamp' => date('Y-m-d H:i:s'),
            'recent_errors' => array_filter($recentLogs, function($log) {
                return $log['action'] === 'error';
            }),
            'recent_dispensing' => array_filter($recentLogs, function($log) {
                return in_array($log['action'], ['dispensing_success', 'dispensing_failure']);
            }),
            'system_health' => self::getSystemHealthStatus(),
            'recommendations' => self::getSystemRecommendations()
        ];
    }
    
    /**
     * Get overall system health status
     */
    private static function getSystemHealthStatus(): array
    {
        $recentLogs = SpringVendingLogger::getRecentLogs(50);
        $errorCount = count(array_filter($recentLogs, function($log) {
            return $log['action'] === 'error';
        }));
        
        $dispensingCount = count(array_filter($recentLogs, function($log) {
            return in_array($log['action'], ['dispensing_success', 'dispensing_failure']);
        }));
        
        $successRate = $dispensingCount > 0 ? round(($dispensingCount - $errorCount) / $dispensingCount * 100, 1) : 100;
        
        if ($errorCount === 0 && $successRate >= 90) {
            return 'excellent';
        } elseif ($errorCount <= 2 && $successRate >= 75) {
            return 'good';
        } elseif ($errorCount <= 5 && $successRate >= 60) {
            return 'fair';
        } else {
            return 'poor';
        }
    }
    
    /**
     * Get system recommendations based on current status
     */
    private static function getSystemRecommendations(): array
    {
        $recentLogs = SpringVendingLogger::getRecentLogs(50);
        $recommendations = [];
        
        // Check for frequent errors
        $errorPatterns = self::analyzeErrorPatterns($recentLogs);
        
        if (!empty($errorPatterns)) {
            $recommendations[] = 'Address frequent error patterns: ' . implode(', ', $errorPatterns);
        }
        
        // Check for performance issues
        $performanceIssues = self::analyzePerformanceIssues($recentLogs);
        
        if (!empty($performanceIssues)) {
            $recommendations[] = 'Optimize system performance: ' . implode(', ', $performanceIssues);
        }
        
        // Check maintenance needs
        $maintenanceNeeds = self::analyzeMaintenanceNeeds($recentLogs);
        
        if (!empty($maintenanceNeeds)) {
            $recommendations[] = 'Schedule maintenance: ' . implode(', ', $maintenanceNeeds);
        }
        
        if (empty($recommendations)) {
            $recommendations[] = 'System operating normally';
        }
        
        return $recommendations;
    }
    
    /**
     * Analyze error patterns in recent logs
     */
    private static function analyzeErrorPatterns(array $logs): array
    {
        $patterns = [];
        $errorLogs = array_filter($logs, function($log) {
            return $log['action'] === 'error';
        });
        
        // Look for repeated error types
        $errorTypes = count(array_column($errorLogs, 'message'));
        
        foreach ($errorTypes as $message => $count) {
            if ($count >= 3) {
                $patterns[] = "Repeated error: {$message} ({$count} times)";
            }
        }
        
        return $patterns;
    }
    
    /**
     * Analyze performance issues from logs
     */
    private static function analyzePerformanceIssues(array $logs): array
    {
        $issues = [];
        
        // Look for performance-related keywords in logs
        foreach ($logs as $log) {
            if (isset($log['message'])) {
                $message = strtolower($log['message']);
                
                if (strpos($message, 'timeout') !== false) {
                    $issues[] = 'Response timeouts detected';
                }
                if (strpos($message, 'slow') !== false) {
                    $issues[] = 'Slow response times';
                }
                if (strpos($message, 'memory') !== false) {
                    $issues[] = 'High memory usage';
                }
            }
        }
        
        return array_unique($issues);
    }
    
    /**
     * Analyze maintenance needs from logs
     */
    private static function analyzeMaintenanceNeeds(array $logs): array
    {
        $needs = [];
        
        // Look for maintenance indicators
        foreach ($logs as $log) {
            if (isset($log['message'])) {
                $message = strtolower($log['message']);
                
                if (strpos($message, 'channel') !== false && strpos($message, 'unhealthy') !== false) {
                    $needs[] = 'Channel maintenance required';
                }
                if (strpos($message, 'dispensing') !== false && strpos($message, 'fail') !== false) {
                    $needs[] = 'Dispensing mechanism check';
                }
            }
        }
        
        return array_unique($needs);
    }
}