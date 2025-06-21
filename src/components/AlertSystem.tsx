import React, { useEffect, useState } from 'react';

interface AlertSystemProps {
  isDrowsy: boolean;
  confidence: number;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ isDrowsy, confidence }) => {
  const [alertCount, setAlertCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isDrowsy) {
      setAlertCount(prev => prev + 1);
      
      // Play alert sound
      if (!isPlaying) {
        setIsPlaying(true);
        playAlertSound();
      }
    } else {
      setIsPlaying(false);
    }
  }, [isDrowsy, isPlaying]);

  const playAlertSound = () => {
    // Create audio context for alert sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);

    setTimeout(() => setIsPlaying(false), 1000);
  };

  return (
    <div className="space-y-4">
      {isDrowsy && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded animate-pulse">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium">DROWSINESS DETECTED!</h3>
              <p className="text-sm">Please take a break or pull over safely</p>
              <p className="text-xs mt-1">Confidence: {(confidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Detection Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {isDrowsy ? 'DROWSY' : 'ALERT'}
            </p>
            <p className="text-sm text-gray-600">Current State</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{alertCount}</p>
            <p className="text-sm text-gray-600">Total Alerts</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Confidence Level</span>
            <span>{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isDrowsy ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};