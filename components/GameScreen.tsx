
import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import { arduinoSensorService } from '../services/arduinoSensorService';
import BackgroundWrapper from './BackgroundWrapper';

interface GameScreenProps {
  isHolding: boolean;
  onHoldStart: () => void;
  onHoldEnd: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ isHolding, onHoldStart, onHoldEnd }) => {
  const [time, setTime] = useState(0);
  const [arduinoState, setArduinoState] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

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

  // Set up Arduino sensor service
  useEffect(() => {
    // Check if we're in Electron environment
    if (window.electronAPI) {
      console.log('Setting up Arduino sensor service...');
      
      // Initialize the sensor service
      arduinoSensorService.initialize().then(() => {
        // Set up event handlers
        arduinoSensorService.setEventHandlers({
          onSensorStart: () => {
            console.log('Arduino sensor START - triggering hold start');
            onHoldStart();
          },
          onSensorEnd: () => {
            console.log('Arduino sensor END - triggering hold end');
            onHoldEnd();
          },
          onSensorChange: (state: number) => {
            setArduinoState(state);
          }
        });

        // Enable the sensor
        arduinoSensorService.setEnabled(true);
        
        // Reset sensor state when component mounts
        arduinoSensorService.reset();
      });
      
      return () => {
        // Disable sensor when component unmounts
        arduinoSensorService.setEnabled(false);
      };
    }
  }, [onHoldStart, onHoldEnd]);

  return (
    <BackgroundWrapper imagePath="./UI/04.gamescreen.png">
      <div className="flex flex-col items-center justify-center h-screen w-screen text-center p-8">
        <div className="relative w-full max-w-4xl">
          <img
            src="./UI/04.gamescreen_bg.png"
            alt="Panel Background"
            className="w-full h-auto"
            style={{ maxHeight: '70vh' }}
          />
          <div className="absolute inset-0 flex flex-col p-12 justify-between">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <img
                  src={isHolding ? "./UI/RB_zero_UI_slice_text_07.png" : "./UI/RB_zero_UI_slice_text_05.png"}
                  alt={isHolding ? "KEEP GOING!" : "GET READY!"}
                  className="h-auto"
                  style={{ maxHeight: '60px' }}
                />
              </div>
              <h3 className="text-3xl font-semibold text-gray-300">
                {isHolding ? "HOLDING..." : "PRESS AND HOLD TO START"}
              </h3>
              {window.electronAPI && (
                <p className="text-lg mt-2 text-gray-400">
                  Arduino Sensor: {arduinoState === 1 ? "DETECTED" : "NO DETECTION"}
                </p>
              )}
            </div>

            <div className="flex-grow flex items-center justify-center">
              <TimerDisplay time={time} className="text-9xl w-full" />
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center mt-8">
          <button
            onMouseDown={onHoldStart}
            onMouseUp={onHoldEnd}
            onTouchStart={onHoldStart}
            onTouchEnd={onHoldEnd}
            className={`w-3/4 max-w-2xl text-5xl font-bold text-white py-12 rounded-full transition-colors duration-300 focus:outline-none ${
              isHolding
                ? 'bg-red-600 shadow-[0_0_80px_rgba(220,38,38,0.8)]'
                : 'bg-green-500 shadow-[0_0_80px_rgba(34,197,94,0.6)] animate-pulse'
            }`}
          >
            {isHolding ? "RELEASE TO STOP" : "PRESS AND HOLD"}
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default GameScreen;
