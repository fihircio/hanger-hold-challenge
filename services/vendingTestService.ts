// Comprehensive testing service for Spring SDK enhanced vending system
// Provides automated testing, diagnostics, and validation

import { springVendingService, SpringErrorCode, ChannelStatus } from './springVendingService';
import { electronVendingService } from './electronVendingService';

export interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  details?: any;
  error?: string;
}

export interface SystemDiagnostics {
  timestamp: Date;
  systemStatus: any;
  channelHealth: ChannelStatus[];
  errorSummary: string[];
  recommendations: string[];
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  overallSuccess: boolean;
  totalDuration: number;
}

class VendingTestService {
  private testResults: TestResult[] = [];
  private isRunning: boolean = false;

  /**
   * Run comprehensive test suite for vending system
   */
  async runFullTestSuite(): Promise<TestSuite> {
    if (this.isRunning) {
      throw new Error('Test suite already running');
    }

    this.isRunning = true;
    this.testResults = [];
    
    const startTime = Date.now();
    console.log('[VENDING TEST] Starting comprehensive test suite...');

    try {
      // 1. System Initialization Test
      await this.testSystemInitialization();
      
      // 2. Communication Test
      await this.testSerialCommunication();
      
      // 3. Channel Status Test
      await this.testChannelStatus();
      
      // 4. Tier-based Dispensing Test
      await this.testTierDispensing();
      
      // 5. Error Handling Test
      await this.testErrorHandling();
      
      // 6. Self-check Test
      await this.testSelfCheck();
      
      // 7. Performance Test
      await this.testPerformance();

    } catch (error) {
      console.error('[VENDING TEST] Test suite error:', error);
      this.testResults.push({
        testName: 'Test Suite Error',
        success: false,
        duration: 0,
        error: error.message
      });
    } finally {
      this.isRunning = false;
    }

    const totalDuration = Date.now() - startTime;
    const overallSuccess = this.testResults.every(result => result.success);
    
    const testSuite: TestSuite = {
      name: 'Spring SDK Vending System Test Suite',
      tests: this.testResults,
      overallSuccess,
      totalDuration
    };

    console.log(`[VENDING TEST] Test suite completed in ${totalDuration}ms. Overall: ${overallSuccess ? 'PASS' : 'FAIL'}`);
    return testSuite;
  }

  /**
   * Test system initialization
   */
  private async testSystemInitialization(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing system initialization...');
      
      const initialized = await electronVendingService.initializeVending();
      
      if (initialized) {
        this.testResults.push({
          testName: 'System Initialization',
          success: true,
          duration: Date.now() - startTime,
          details: { initialized: true }
        });
        console.log('[VENDING TEST] ✓ System initialization successful');
      } else {
        this.testResults.push({
          testName: 'System Initialization',
          success: false,
          duration: Date.now() - startTime,
          error: 'Failed to initialize Spring SDK'
        });
        console.log('[VENDING TEST] ✗ System initialization failed');
      }
    } catch (error) {
      this.testResults.push({
        testName: 'System Initialization',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ System initialization error:', error.message);
    }
  }

  /**
   * Test serial communication
   */
  private async testSerialCommunication(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing serial communication...');
      
      const status = await electronVendingService.getSystemStatus();
      
      if (status && status.connected) {
        this.testResults.push({
          testName: 'Serial Communication',
          success: true,
          duration: Date.now() - startTime,
          details: { connected: true, status }
        });
        console.log('[VENDING TEST] ✓ Serial communication working');
      } else {
        this.testResults.push({
          testName: 'Serial Communication',
          success: false,
          duration: Date.now() - startTime,
          error: 'Serial communication not established'
        });
        console.log('[VENDING TEST] ✗ Serial communication failed');
      }
    } catch (error) {
      this.testResults.push({
        testName: 'Serial Communication',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Serial communication error:', error.message);
    }
  }

  /**
   * Test channel status queries
   */
  private async testChannelStatus(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing channel status queries...');
      
      const testChannels = [1, 5, 10, 15, 20, 25]; // Sample channels
      const results = [];
      
      for (const channel of testChannels) {
        try {
          const status = await springVendingService.queryChannelStatus(channel);
          results.push({ channel, status });
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between queries
        } catch (error) {
          results.push({ channel, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.status && r.status.isHealthy !== undefined).length;
      
      if (successCount >= testChannels.length * 0.8) { // 80% success rate
        this.testResults.push({
          testName: 'Channel Status Query',
          success: true,
          duration: Date.now() - startTime,
          details: { 
            testedChannels: testChannels.length,
            successfulQueries: successCount,
            results 
          }
        });
        console.log(`[VENDING TEST] ✓ Channel status query working (${successCount}/${testChannels.length} successful)`);
      } else {
        this.testResults.push({
          testName: 'Channel Status Query',
          success: false,
          duration: Date.now() - startTime,
          error: `Low success rate: ${successCount}/${testChannels.length}`
        });
        console.log(`[VENDING TEST] ✗ Channel status query poor success rate: ${successCount}/${testChannels.length}`);
      }
    } catch (error) {
      this.testResults.push({
        testName: 'Channel Status Query',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Channel status query error:', error.message);
    }
  }

  /**
   * Test tier-based dispensing
   */
  private async testTierDispensing(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing tier-based dispensing...');
      
      const tiers: Array<'gold' | 'silver' | 'bronze'> = ['gold', 'silver', 'bronze'];
      const results = [];
      
      for (const tier of tiers) {
        try {
          console.log(`[VENDING TEST] Testing ${tier} tier dispensing...`);
          
          // Test with simulation mode (no actual dispensing)
          const result = await electronVendingService.dispensePrizeByTier(tier);
          results.push({ tier, result });
          
          // Wait between tests
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          results.push({ tier, error: error.message });
        }
      }
      
      const successCount = results.filter(r => r.result && r.result.success).length;
      
      if (successCount >= 2) { // At least 2 tiers should work
        this.testResults.push({
          testName: 'Tier-based Dispensing',
          success: true,
          duration: Date.now() - startTime,
          details: { 
            testedTiers: tiers.length,
            successfulDispenses: successCount,
            results 
          }
        });
        console.log(`[VENDING TEST] ✓ Tier-based dispensing working (${successCount}/${tiers.length} successful)`);
      } else {
        this.testResults.push({
          testName: 'Tier-based Dispensing',
          success: false,
          duration: Date.now() - startTime,
          error: `Low success rate: ${successCount}/${tiers.length}`
        });
        console.log(`[VENDING TEST] ✗ Tier-based dispensing poor success rate: ${successCount}/${tiers.length}`);
      }
    } catch (error) {
      this.testResults.push({
        testName: 'Tier-based Dispensing',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Tier-based dispensing error:', error.message);
    }
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing error handling...');
      
      // Test invalid channel
      try {
        await springVendingService.queryChannelStatus(999);
        this.testResults.push({
          testName: 'Error Handling - Invalid Channel',
          success: false,
          duration: Date.now() - startTime,
          error: 'Should have thrown error for invalid channel'
        });
      } catch (error) {
        // Expected behavior
        console.log('[VENDING TEST] ✓ Invalid channel properly handled');
      }
      
      // Test timeout scenarios
      const originalTimeout = springVendingService['testTimeout'];
      springVendingService['testTimeout'] = 1; // Force timeout for testing
      
      try {
        await springVendingService.queryChannelStatus(1);
        this.testResults.push({
          testName: 'Error Handling - Timeout',
          success: false,
          duration: Date.now() - startTime,
          error: 'Should have handled timeout properly'
        });
      } catch (error) {
        // Expected behavior
        console.log('[VENDING TEST] ✓ Timeout properly handled');
      }
      
      // Restore original timeout
      if (originalTimeout !== undefined) {
        springVendingService['testTimeout'] = originalTimeout;
      }
      
      this.testResults.push({
        testName: 'Error Handling',
        success: true,
        duration: Date.now() - startTime,
        details: { errorHandlingWorking: true }
      });
      console.log('[VENDING TEST] ✓ Error handling working properly');
      
    } catch (error) {
      this.testResults.push({
        testName: 'Error Handling',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Error handling test error:', error.message);
    }
  }

  /**
   * Test self-check functionality
   */
  private async testSelfCheck(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing self-check functionality...');
      
      const result = await electronVendingService.performSelfCheck();
      
      this.testResults.push({
        testName: 'Self-check',
        success: result, // Should return true for successful self-check
        duration: Date.now() - startTime,
        details: { selfCheckResult: result }
      });
      
      if (result) {
        console.log('[VENDING TEST] ✓ Self-check completed successfully');
      } else {
        console.log('[VENDING TEST] ✗ Self-check failed');
      }
    } catch (error) {
      this.testResults.push({
        testName: 'Self-check',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Self-check error:', error.message);
    }
  }

  /**
   * Test system performance
   */
  private async testPerformance(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('[VENDING TEST] Testing system performance...');
      
      // Test multiple rapid channel status queries
      const rapidTestStart = Date.now();
      const rapidQueries = [];
      
      for (let i = 0; i < 10; i++) {
        try {
          const queryStart = Date.now();
          await springVendingService.queryChannelStatus(1);
          const queryTime = Date.now() - queryStart;
          rapidQueries.push(queryTime);
        } catch (error) {
          rapidQueries.push(-1); // Error
        }
      }
      
      const rapidTestDuration = Date.now() - rapidTestStart;
      const avgQueryTime = rapidQueries.filter(t => t > 0).reduce((a, b) => a + b, 0) / rapidQueries.filter(t => t > 0).length;
      const errorRate = rapidQueries.filter(t => t === -1).length / rapidQueries.length;
      
      // Performance criteria: average query time < 2 seconds, error rate < 20%
      const performanceGood = avgQueryTime < 2000 && errorRate < 0.2;
      
      this.testResults.push({
        testName: 'Performance Test',
        success: performanceGood,
        duration: Date.now() - startTime,
        details: {
          rapidTestDuration,
          avgQueryTime,
          errorRate,
          totalQueries: rapidQueries.length
        }
      });
      
      if (performanceGood) {
        console.log(`[VENDING TEST] ✓ Performance acceptable (avg: ${avgQueryTime}ms, error rate: ${(errorRate * 100).toFixed(1)}%)`);
      } else {
        console.log(`[VENDING TEST] ✗ Performance poor (avg: ${avgQueryTime}ms, error rate: ${(errorRate * 100).toFixed(1)}%)`);
      }
    } catch (error) {
      this.testResults.push({
        testName: 'Performance Test',
        success: false,
        duration: Date.now() - startTime,
        error: error.message
      });
      console.log('[VENDING TEST] ✗ Performance test error:', error.message);
    }
  }

  /**
   * Generate system diagnostics report
   */
  async generateDiagnostics(): Promise<SystemDiagnostics> {
    console.log('[VENDING TEST] Generating system diagnostics...');
    
    const timestamp = new Date();
    const systemStatus = await electronVendingService.getSystemStatus();
    const channelHealth = await electronVendingService.getAllChannelStatus();
    
    const errorSummary: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze channel health
    const unhealthyChannels = channelHealth.filter(ch => !ch.isHealthy);
    const emptyChannels = channelHealth.filter(ch => !ch.hasProduct);
    
    if (unhealthyChannels.length > 0) {
      errorSummary.push(`${unhealthyChannels.length} unhealthy channels detected`);
      recommendations.push('Check power and connections for unhealthy channels');
    }
    
    if (emptyChannels.length > channelHealth.length * 0.3) {
      errorSummary.push(`${emptyChannels.length} empty channels detected`);
      recommendations.push('Refill empty channels to ensure availability');
    }
    
    if (systemStatus && !systemStatus.connected) {
      errorSummary.push('System not connected to vending controller');
      recommendations.push('Check serial cable connections and power');
    }
    
    if (systemStatus && systemStatus.lastError) {
      errorSummary.push(`Last error: ${systemStatus.lastError.description}`);
      recommendations.push(systemStatus.lastError.suggestedAction);
    }
    
    if (errorSummary.length === 0) {
      errorSummary.push('No critical issues detected');
      recommendations.push('System operating normally');
    }
    
    return {
      timestamp,
      systemStatus,
      channelHealth,
      errorSummary,
      recommendations
    };
  }

  /**
   * Print test results summary
   */
  printTestSummary(testSuite: TestSuite): void {
    console.log('\n' + '='.repeat(60));
    console.log('VENDING SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Test Suite: ${testSuite.name}`);
    console.log(`Overall Result: ${testSuite.overallSuccess ? 'PASS' : 'FAIL'}`);
    console.log(`Total Duration: ${testSuite.totalDuration}ms`);
    console.log('\nIndividual Test Results:');
    
    testSuite.tests.forEach((test, index) => {
      const status = test.success ? '✓ PASS' : '✗ FAIL';
      const duration = `(${test.duration}ms)`;
      console.log(`${index + 1}. ${test.testName.padEnd(30)} ${status.padEnd(10)} ${duration}`);
      if (test.error) {
        console.log(`   Error: ${test.error}`);
      }
      if (test.details) {
        console.log(`   Details:`, test.details);
      }
    });
    
    console.log('='.repeat(60));
  }

  /**
   * Export test results to file (for logging)
   */
  exportTestResults(testSuite: TestSuite): string {
    const report = {
      timestamp: new Date(),
      testSuite: testSuite.name,
      overallResult: testSuite.overallSuccess ? 'PASS' : 'FAIL',
      totalDuration: testSuite.totalDuration,
      tests: testSuite.tests.map(test => ({
        name: test.testName,
        success: test.success,
        duration: test.duration,
        error: test.error,
        details: test.details
      }))
    };
    
    return JSON.stringify(report, null, 2);
  }

  /**
   * Get current test results
   */
  getTestResults(): TestResult[] {
    return [...this.testResults];
  }

  /**
   * Clear test results
   */
  clearTestResults(): void {
    this.testResults = [];
  }

  /**
   * Check if test is currently running
   */
  isTestRunning(): boolean {
    return this.isRunning;
  }
}

export const vendingTestService = new VendingTestService();