
import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import { arduinoSensorService } from '../services/arduinoSensorService';
import { tcnIntegrationService } from '../services/tcnIntegrationService';
import BackgroundWrapper from './BackgroundWrapper';

interface GameScreenProps {
  isHolding: boolean;
  // Optional start timestamp (ms) may be passed by sensor
  onHoldStart: (startTimestamp?: number) => void;
  // onHoldEnd: either measured duration (ms) or (endTimestamp, true)
  onHoldEnd: (value?: number, isTimestamp?: boolean) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ isHolding, onHoldStart, onHoldEnd }) => {
  const [time, setTime] = useState(0);
  const [arduinoState, setArduinoState] = useState<number>(0);
  const [vendingStatus, setVendingStatus] = useState<string>('Ready');
  // Show maintenance in development mode (activator now on GameOverScreen)
  const isDevelopmentMode = !window.electronAPI; // true for npm run dev, false for electron exe
  
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  // Slot inventory and maintenance controls moved to `MaintenancePanel`

  useEffect(() => {
    if (isHolding) {
      startTimeRef.current = Date.now();
      const animate = () => {
        setTime(Date.now() - (startTimeRef.current ?? 0));
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      setTime(0);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHolding]);

  // Handle game end and prize dispensing
  const handleGameEnd = async () => {
    const finalTime = time;
    // Pass the measured finalTime to the parent so it doesn't rely on ref timing
    // Prefer letting the App compute/validate duration from its own startTimeRef by calling onHoldEnd()
    // without a measured value when sensor-based triggers are used. However, when button
    // release calls this function we provide the measured `finalTime` as a fallback.
    onHoldEnd(finalTime);

    console.log(`[GAME SCREEN] Game ended with time: ${finalTime}ms`);
  };

  // Set up Arduino sensor service with enhanced initialization
  useEffect(() => {
    // Check if we're in Electron environment
    if (window.electronAPI) {
      console.log('[GameScreen] Setting up Arduino sensor service...');
      
      // Initialize the sensor service with enhanced error handling
      arduinoSensorService.initialize().then(() => {
        console.log('[GameScreen] Arduino sensor service initialized, setting up handlers...');
        
        // Set up event handlers with enhanced logging
        arduinoSensorService.setEventHandlers({
          onSensorStart: (ts?: number) => {
            console.log('[GameScreen] Arduino sensor START detected - triggering hold start @', ts || Date.now());
            // Allow parent to accept an explicit timestamp if provided
            try { onHoldStart(ts as any); } catch (e) {
              console.error('[GameScreen] Error in onHoldStart handler:', e);
              onHoldStart();
            }
          },
          onSensorEnd: (ts?: number) => {
            console.log('[GameScreen] Arduino sensor END detected - triggering hold end @', ts || Date.now());
            // Small safety wait to allow UI to stabilize (helps with very short pulses)
            const WAIT_MS = 50;
            setTimeout(() => {
              // Pass the end timestamp and mark it as a timestamp via second parameter
              try { onHoldEnd(ts as any, true); } catch (e) {
                console.error('[GameScreen] Error in onHoldEnd handler:', e);
                onHoldEnd(undefined, true);
              }
            }, WAIT_MS);
          },
          onSensorChange: (state: number, ts?: number) => {
            setArduinoState(state);
            console.log('[GameScreen] Arduino sensor state change:', state, 'ts=', ts || Date.now());
            
            // Enhanced status reporting
            if (state === 1) {
              console.log('[GameScreen] Arduino: DETECTION - Object detected by sensor');
            } else {
              console.log('[GameScreen] Arduino: NO DETECTION - Object removed from sensor');
            }
          }
        });

        // Enable the sensor with error handling
        try {
          arduinoSensorService.setEnabled(true);
          console.log('[GameScreen] Arduino sensor service enabled');
        } catch (error) {
          console.error('[GameScreen] Failed to enable Arduino sensor:', error);
        }
        
        // Reset sensor state when component mounts
        try {
          arduinoSensorService.reset();
          console.log('[GameScreen] Arduino sensor state reset');
        } catch (error) {
          console.error('[GameScreen] Failed to reset Arduino sensor:', error);
        }
      }).catch((error) => {
        console.error('[GameScreen] Failed to initialize Arduino sensor service:', error);
        // Set a fallback state to show sensor is not available
        setArduinoState(0);
      });
      
      return () => {
        // Disable sensor when component unmounts with error handling
        try {
          console.log('[GameScreen] Cleaning up Arduino sensor service...');
          arduinoSensorService.setEnabled(false);
        } catch (error) {
          console.error('[GameScreen] Error disabling Arduino sensor:', error);
        }
      };
    } else {
      console.log('[GameScreen] Not in Electron environment - Arduino sensor unavailable');
      setArduinoState(0);
    }
  }, [onHoldStart, onHoldEnd]);

  // Manual maintenance functions
  const handleManualDispense = async (tier: 'gold' | 'silver') => {
    const success = await tcnIntegrationService.dispensePrizeManually(tier);
    if (success) {
      setVendingStatus(`Manual ${tier} prize dispensed!`);
      setTimeout(() => setVendingStatus('Ready'), 2000);
    } else {
      setVendingStatus('Manual dispensing failed');
      setTimeout(() => setVendingStatus('Ready'), 2000);
    }
  };

  const handleResetCounts = () => {
    tcnIntegrationService.resetSlotCounts();
    setVendingStatus('Slot counts reset');
    setTimeout(() => setVendingStatus('Ready'), 1500);
  };

  const getSlotStatusColor = (count: number, maxCount: number) => {
    const percentage = count / maxCount;
    if (percentage >= 0.8) return 'text-green-500';
    if (percentage >= 0.6) return 'text-yellow-500';
    if (percentage >= 0.4) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8 scale-40 origin-center">
        <div className="w-full max-w-4xl flex flex-col p-12 justify-between" style={{ maxHeight: '70vh' }}>
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={isHolding ? "./UI/RB_zero_UI_slice_text_06.png" : "./UI/RB_zero_UI_slice_text_04.png"}
                  alt={isHolding ? "KEEP GOING!" : "GET READY!"}
                  className="h-auto"
                  style={{ maxHeight: '60px' }}
                />
              </div>
              <div className="mb-4 flex justify-center">
                <img
                  src="./UI/RB_zero_UI_slice_text_05.png"
                  alt="PRESS AND HOLD TO START"
                  className="h-auto"
                  style={{ maxHeight: '60px' }}
                />
              </div>
              <div className="mb-4 flex justify-center">
                {isHolding && (
                  <img
                    src="./UI/RB_zero_UI_slice_text_07.png"
                    alt="HOLDING..."
                    className="h-auto"
                    style={{ maxHeight: '60px' }}
                  />
                )}
              </div>
              <h3 className="text-3xl font-semibold text-gray-300">
                {!isHolding ? "" : ""}
              </h3>
              
            </div>

            <div className="flex-grow flex items-center justify-center mb-8">
              <TimerDisplay time={time} className="text-9xl w-full scale-125" />
            </div>
                
            <div className="flex justify-center">
              <button
                onMouseDown={onHoldStart}
                onMouseUp={handleGameEnd}
                onTouchStart={onHoldStart}
                onTouchEnd={handleGameEnd}
                className="w-3/4 max-w-2xl transform focus:outline-none scale-75"
              >
                <img
                  src={isHolding ? "./UI/RB_zero_UI_slice_button_04.png" : "./UI/RB_zero_UI_slice_button_03.png"}
                  alt={isHolding ? "RELEASE TO STOP" : "PRESS AND HOLD"}
                  className="h-auto"
                  style={{ maxHeight: '80px' }}
                />
              </button>
            </div>
            
            {/* Maintenance activator moved to GameOverScreen */}
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default GameScreen;
