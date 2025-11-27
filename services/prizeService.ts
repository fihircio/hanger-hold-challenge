import * as vendingService from './vendingService';
import { apiService, Prize as ApiPrize } from './apiService';
import { tcnIntegrationService } from './tcnIntegrationService';

export interface Prize {
  id?: number;
  name: string;
  message: string;
  slot: number;
}

// Fallback prize tiers for offline mode (updated for 2-tier system)
const FALLBACK_PRIZE_TIERS: { time: number; prize: Prize }[] = [
  { time: 60000, prize: { name: 'Gold Prize', message: 'Incredible! You won the Gold Prize!', slot: 24 } }, // 60s - Gold slot 24
  { time: 30000, prize: { name: 'Silver Prize', message: 'Amazing! You won the Silver Prize!', slot: 1 } }, // 30s - Silver slot 1
];

/**
 * Checks player's time against prize tiers and triggers vending machine
 * to dispense corresponding prize.
 * @param time The player's final score in milliseconds.
 * @returns The prize that was won, or null if no prize was won.
 */
export const checkAndDispensePrize = async (time: number, scoreId?: string): Promise<Prize | null> => {
  try {
    // Try to get prize eligibility from API first
    const response = await apiService.checkPrizeEligibility(time);
    
    if (response.eligible && response.prize) {
      const prize: Prize = {
        id: response.prize.id,
        name: response.prize.name,
        message: response.prize.message,
        slot: response.prize.slot,
      };
      
      console.log(`Time of ${time}ms qualifies for ${prize.name}.`);
      console.log(`Attempting to dispense from slot ${prize.slot}.`);
      
      // Use TCN integration service for dispensing based on actual game time
      // We don't need to wait for it to finish to show the game over screen.
      const prizeTier = prize.name.toLowerCase().includes('gold') ? 'gold' : 'silver';
      
      // Call the new handlePrizeDispensing method with the actual game time
      tcnIntegrationService.handlePrizeDispensing(time, scoreId).then(() => {
        console.log(`[PRIZE SERVICE] TCN Integration for ${prize.name} completed.`);
      }).catch(error => {
        console.error(`[PRIZE SERVICE] TCN Integration error for ${prize.name}:`, error);
        // Fallback to original vending service
        if (scoreId && prize.id) {
          vendingService.dispensePrize(prize.slot, prize.id, parseInt(scoreId)).then(success => {
            if (success) {
              console.log(`[PRIZE SERVICE] Fallback vending for ${prize.name} initiated.`);
            } else {
              console.error(`[PRIZE SERVICE] Fallback vending for ${prize.name} failed.`);
            }
          });
        }
      });
      
      return prize;
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize.`);
    return null;
  } catch (error) {
    console.error('Failed to check prize eligibility from API, using fallback:', error);
    
    // Fallback to local logic for offline mode (updated for 2-tier system)
    for (const tier of FALLBACK_PRIZE_TIERS) {
      if (time >= tier.time) {
        console.log(`Time of ${time}ms qualifies for ${tier.prize.name} (fallback mode).`);
        console.log(`Attempting to dispense from slot ${tier.prize.slot}.`);
        
        // Determine tier from prize name for TCN integration
        const prizeTier = tier.prize.name.toLowerCase().includes('gold') ? 'gold' : 'silver';
        
        // Try TCN integration first using the new handlePrizeDispensing method
        tcnIntegrationService.handlePrizeDispensing(time).then(() => {
          console.log(`[PRIZE SERVICE] TCN Integration for ${tier.prize.name} completed (fallback).`);
        }).catch(error => {
          console.error(`[PRIZE SERVICE] TCN Integration error for ${tier.prize.name}:`, error);
          // Fallback to vending service
          vendingService.dispensePrize(tier.prize.slot).then(success => {
            if (success) {
              console.log(`[PRIZE SERVICE] Fallback vending for ${tier.prize.name} initiated (fallback).`);
            } else {
              console.error(`[PRIZE SERVICE] Fallback vending for ${tier.prize.name} failed (fallback).`);
            }
          });
        });
        
        return tier.prize;
      }
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize (fallback).`);
    return null;
  }
};
