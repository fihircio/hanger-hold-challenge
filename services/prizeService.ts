import * as vendingService from './vendingService';
import { apiService, Prize as ApiPrize } from './apiService';
import { tcnIntegrationService } from './tcnIntegrationService';
import { electronVendingService } from './electronVendingService';

export interface Prize {
  id?: number;
  name: string;
  message: string;
  slot: number;
  tier?: 'gold' | 'silver';
}

// Fallback prize tiers for offline mode (updated for new slot configuration)
const FALLBACK_PRIZE_TIERS: { time: number; prize: Prize }[] = [
  { time: 120000, prize: { name: 'Gold Prize', message: 'Incredible! You won the Gold Prize!', slot: 25, tier: 'gold' } }, // 4+ minutes - Gold slot 25
  { time: 10000, prize: { name: 'Silver Prize', message: 'Amazing! You won the Silver Prize!', slot: 1, tier: 'silver' } }, // 2+ minutes - Silver slot 1
];

/**
 * Checks player's time against prize tiers and triggers vending machine
 * to dispense corresponding prize.
 * @param time The player's final score in milliseconds.
 * @returns The prize that was won, or null if no prize was won.
 */
export const checkAndDispensePrize = async (time: number, scoreId?: string): Promise<Prize | null> => {
  try {
    // Use Electron Vending Service as primary trigger chain
    console.log(`[PRIZE SERVICE] Using Electron Vending Service as primary trigger for time: ${time}ms`);
    
    const result = await electronVendingService.handlePrizeDispensing(time, scoreId);
    
    if (result.success && result.slot) {
      // Create prize object based on successful dispensing
      const prize: Prize = {
        id: result.prizeId,
        name: `${result.tier.charAt(0).toUpperCase() + result.tier.slice(1)} Prize`,
        message: result.tier === 'gold' ? 'Incredible! You won the Gold Prize!' :
                  result.tier === 'silver' ? 'Amazing! You won the Silver Prize!' :
                  'No prize won',
        slot: result.slot,
        tier: result.tier,
      };
      
      console.log(`[PRIZE SERVICE] Electron Vending Service successfully dispensed ${prize.name} from slot ${prize.slot}.`);
      return prize;
    } else {
      console.log(`[PRIZE SERVICE] Electron Vending Service could not dispense prize: ${result.error || 'No eligible prize'}`);
      
      // Try API fallback for eligibility check
      try {
        const response = await apiService.checkPrizeEligibility(time);
        
        if (response.eligible && response.prize) {
          const prize: Prize = {
            id: response.prize.id,
            name: response.prize.name,
            message: response.prize.message,
            slot: response.prize.slot,
            tier: response.prize.name.toLowerCase().includes('gold') ? 'gold' :
                   response.prize.name.toLowerCase().includes('silver') ? 'silver' : undefined,
          };
          
          console.log(`[PRIZE SERVICE] API fallback - Time of ${time}ms qualifies for ${prize.name}.`);
          
          // Use TCN integration as secondary fallback
          const prizeTier = prize.name.toLowerCase().includes('gold') ? 'gold' :
                          prize.name.toLowerCase().includes('silver') ? 'silver' : 'silver';
          
          tcnIntegrationService.handlePrizeDispensing(time, scoreId).then(() => {
            console.log(`[PRIZE SERVICE] TCN Integration fallback for ${prize.name} completed.`);
          }).catch(error => {
            console.error(`[PRIZE SERVICE] TCN Integration fallback error for ${prize.name}:`, error);
            // Final fallback to original vending service
            if (scoreId && prize.id) {
              vendingService.dispensePrize(prize.slot, prize.id, parseInt(scoreId)).then(success => {
                if (success) {
                  console.log(`[PRIZE SERVICE] Final vending fallback for ${prize.name} initiated.`);
                } else {
                  console.error(`[PRIZE SERVICE] Final vending fallback for ${prize.name} failed.`);
                }
              });
            }
          });
          
          return prize;
        }
      } catch (apiError) {
        console.error('[PRIZE SERVICE] API fallback also failed:', apiError);
      }
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize.`);
    return null;
  } catch (error) {
    console.error('[PRIZE SERVICE] Primary Electron Vending Service failed, using complete fallback:', error);
    
    // Complete fallback to local logic for offline mode (updated for 2-tier system)
    for (const tier of FALLBACK_PRIZE_TIERS) {
      if (time >= tier.time) {
        console.log(`Time of ${time}ms qualifies for ${tier.prize.name} (complete fallback mode).`);
        
        // Try TCN integration first using the new handlePrizeDispensing method
        tcnIntegrationService.handlePrizeDispensing(time).then(() => {
          console.log(`[PRIZE SERVICE] TCN Integration for ${tier.prize.name} completed (complete fallback).`);
        }).catch(error => {
          console.error(`[PRIZE SERVICE] TCN Integration error for ${tier.prize.name}:`, error);
          // Final fallback to vending service
          vendingService.dispensePrize(tier.prize.slot).then(success => {
            if (success) {
              console.log(`[PRIZE SERVICE] Final vending fallback for ${tier.prize.name} initiated (complete fallback).`);
            } else {
              console.error(`[PRIZE SERVICE] Final vending fallback for ${tier.prize.name} failed (complete fallback).`);
            }
          });
        });
        
        return tier.prize;
      }
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize (complete fallback).`);
    return null;
  }
};
