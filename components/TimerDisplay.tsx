
import React from 'react';

interface TimerDisplayProps {
  time: number; // in milliseconds
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, className = '' }) => {
  const seconds = Math.floor(time / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  return (
    <div className={`font-mono tracking-tighter ${className}`}>
      <span>{seconds.toString().padStart(2, '0')}</span>
      <span className="text-gray-500 text-7xl align-top">:</span>
      <span>{milliseconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default TimerDisplay;
