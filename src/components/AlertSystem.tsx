import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Volume2, Eye, EyeOff } from 'lucide-react';

interface AlertSystemProps {
  isDrowsy: boolean;
  confidence: number;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ isDrowsy, confidence }) => {
  const [alertCount, setAlertCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isDrowsy) {
      setAlertCount(prev => prev + 1);
      setLastAlertTime(new Date());
      
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
    try {
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
    } catch (error) {
      console.error('Error playing alert sound:', error);
      setIsPlaying(false);
    }
  };

  const getAlertLevel = () => {
    if (confidence > 0.8) return 'critical';
    if (confidence > 0.6) return 'high';
    if (confidence > 0.4) return 'medium';
    return 'low';
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="space-y-4">
      {/* Main Alert */}
      {isDrowsy && (
        <div className={`border-l-4 p-4 rounded-lg animate-pulse ${
          alertLevel === 'critical' 
            ? 'bg-red-100 border-red-500 text-red-700'
            : alertLevel === 'high'
            ? 'bg-orange-100 border-orange-500 text-orange-700'
            : 'bg-yellow-100 border-yellow-500 text-yellow-700'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className={`h-6 w-6 ${
                alertLevel === 'critical' ? 'text-red-500' : 
                alertLevel === 'high' ? 'text-orange-500' : 'text-yellow-500'
              }`} />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-bold">
                {alertLevel === 'critical' ? 'CRITICAL DROWSINESS!' : 'DROWSINESS DETECTED!'}
              </h3>
              <p className="text-sm font-medium">
                {alertLevel === 'critical' 
                  ? 'STOP DRIVING IMMEDIATELY - Pull over safely'
                  : 'Please take a break or pull over safely'
                }
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  Confidence: {(confidence * 100).toFixed(1)}%
                </span>
                {isPlaying && (
                  <div className="flex items-center text-xs">
                    <Volume2 className="h-3 w-3 mr-1" />
                    Alert Sound Playing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Status */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Driver Status</h3>
            {isDrowsy ? (
              <EyeOff className="h-5 w-5 text-red-500" />
            ) : (
              <Eye className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${isDrowsy ? 'text-red-600' : 'text-green-600'}`}>
              {isDrowsy ? 'DROWSY' : 'ALERT'}
            </p>
            <p className="text-sm text-gray-600 mt-1">Current State</p>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Alert Count</h3>
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{alertCount}</p>
            <p className="text-sm text-gray-600 mt-1">Total Alerts</p>
            {lastAlertTime && (
              <p className="text-xs text-gray-500 mt-1">
                Last: {lastAlertTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Detection Confidence</span>
          <span className="text-sm font-bold text-gray-900">{(confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              isDrowsy 
                ? alertLevel === 'critical' 
                  ? 'bg-red-600' 
                  : alertLevel === 'high'
                  ? 'bg-orange-500'
                  : 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
          <span>Critical</span>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Safety Recommendations
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Take breaks every 2 hours during long drives
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Get 7-8 hours of sleep before driving
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Pull over safely if you feel drowsy
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Consider switching drivers when possible
          </li>
        </ul>
      </div>
    </div>
  );
};