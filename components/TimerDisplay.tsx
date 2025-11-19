
import React from 'react';

interface TimerDisplayProps {
  time: number; // in milliseconds
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, className = '' }) => {
  const seconds = Math.floor(time / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  return (
    <div className={`digital-font tracking-tighter w-full flex items-center justify-center ${className}`}>
      <span className="flex-shrink-0">{seconds.toString().padStart(2, '0')}</span>
      <span className="text-gray-500 text-7xl align-top mx-1 flex-shrink-0">:</span>
      <span className="flex-shrink-0">{milliseconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default TimerDisplay;
