import * as vendingService from './vendingService';
import { apiService, Prize as ApiPrize } from './apiService';

export interface Prize {
  id?: number;
  name: string;
  message: string;
  slot: number;
}

// Fallback prize tiers for offline mode
const FALLBACK_PRIZE_TIERS: { time: number; prize: Prize }[] = [
  { time: 60000, prize: { name: 'Gold Prize', message: 'Incredible! You won the Gold Prize!', slot: 1 } }, // 60s
  { time: 30000, prize: { name: 'Silver Prize', message: 'Amazing! You won the Silver Prize!', slot: 2 } }, // 30s
  { time: 10000, prize: { name: 'Bronze Prize', message: 'Great job! You won the Bronze Prize!', slot: 3 } }, // 10s
];

/**
 * Checks the player's time against prize tiers and triggers the vending machine
 * to dispense the corresponding prize.
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
      
      // Trigger the vending machine dispensing logic (asynchronously)
      // We don't need to wait for it to finish to show the game over screen.
      if (scoreId && prize.id) {
        vendingService.dispensePrize(prize.slot, prize.id, parseInt(scoreId)).then(success => {
          if (success) {
            console.log(`[PRIZE SERVICE] Vending for ${prize.name} initiated.`);
          } else {
            console.error(`[PRIZE SERVICE] Vending for ${prize.name} failed.`);
            // Here you might add logic to retry or notify an attendant.
          }
        });
      }
      
      return prize;
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize.`);
    return null;
  } catch (error) {
    console.error('Failed to check prize eligibility from API, using fallback:', error);
    
    // Fallback to local logic for offline mode
    for (const tier of FALLBACK_PRIZE_TIERS) {
      if (time >= tier.time) {
        console.log(`Time of ${time}ms qualifies for ${tier.prize.name} (fallback mode).`);
        console.log(`Attempting to dispense from slot ${tier.prize.slot}.`);
        
        // Trigger the vending machine dispensing logic (asynchronously)
        vendingService.dispensePrize(tier.prize.slot).then(success => {
          if (success) {
            console.log(`[PRIZE SERVICE] Vending for ${tier.prize.name} initiated (fallback).`);
          } else {
            console.error(`[PRIZE SERVICE] Vending for ${tier.prize.name} failed (fallback).`);
          }
        });
        
        return tier.prize;
      }
    }
    
    console.log(`Time of ${time}ms did not qualify for a prize (fallback).`);
    return null;
  }
};
