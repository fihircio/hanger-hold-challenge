
import React from 'react';

interface TimerDisplayProps {
  time: number; // in milliseconds
  className?: string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, className = '' }) => {
  const seconds = Math.floor(time / 1000);
  const milliseconds = Math.floor((time % 1000) / 10);

  return (
    <div className={`digital-font tracking-wide w-full flex items-center justify-center ${className}`}>
      <span className="inline-block text-center" style={{ minWidth: '1.2em', marginRight: '0.1em' }}>{seconds.toString().padStart(2, '0')}</span>
      <span className="text-gray-500 text-7xl align-top mx-2 flex-shrink-0">:</span>
      <span className="inline-block text-center" style={{ minWidth: '1.2em', marginLeft: '0.1em' }}>{milliseconds.toString().padStart(2, '0')}</span>
    </div>
  );
};

export default TimerDisplay;
