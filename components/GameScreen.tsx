
import React, { useState, useEffect, useRef } from 'react';
import TimerDisplay from './TimerDisplay';
import { arduinoSensorService } from '../services/arduinoSensorService';

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
    <div className="flex flex-col items-center justify-between h-screen w-screen p-16">
      <div className="text-center">
        <h2 className="text-6xl font-bold text-cyan-400">
          {isHolding ? "HOLDING..." : "GET READY..."}
        </h2>
        {window.electronAPI && (
          <p className="text-xl mt-4 text-gray-400">
            Arduino Sensor: {arduinoState === 1 ? "DETECTED" : "NO DETECTION"}
          </p>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center">
        <TimerDisplay time={time} className="text-9xl" />
      </div>

      <div className="w-full flex justify-center">
        <button
          onMouseDown={onHoldStart}
          onMouseUp={onHoldEnd}
          onTouchStart={onHoldStart}
          onTouchEnd={onHoldEnd}
          className={`w-3/4 max-w-2xl text-6xl font-bold text-white py-16 rounded-full transition-colors duration-300 focus:outline-none ${
            isHolding
              ? 'bg-red-600 shadow-[0_0_80px_rgba(220,38,38,0.8)]'
              : 'bg-green-500 shadow-[0_0_80px_rgba(34,197,94,0.6)] animate-pulse'
          }`}
        >
          {isHolding ? "RELEASE TO STOP" : "PRESS AND HOLD"}
        </button>
      </div>
    </div>
  );
};

export default GameScreen;
