import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, Volume2, Eye, EyeOff, Clock, Target } from 'lucide-react';

interface AlertSystemProps {
  isDrowsy: boolean;
  confidence: number;
  closedEyeDuration: number;
  eyeAspectRatio: number;
  faceDetected: boolean;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ 
  isDrowsy, 
  confidence, 
  closedEyeDuration, 
  eyeAspectRatio,
  faceDetected 
}) => {
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
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);

      setTimeout(() => setIsPlaying(false), 2000);
    } catch (error) {
      console.error('Error playing alert sound:', error);
      setIsPlaying(false);
    }
  };

  const getAlertLevel = () => {
    if (closedEyeDuration >= 20) return 'critical';
    if (closedEyeDuration >= 15) return 'high';
    if (closedEyeDuration >= 10) return 'medium';
    if (closedEyeDuration >= 5) return 'warning';
    return 'normal';
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="space-y-4">
      {/* Critical Drowsiness Alert */}
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
                {alertLevel === 'critical' ? '🚨 CRITICAL DROWSINESS DETECTED!' : 'DROWSINESS ALERT!'}
              </h3>
              <p className="text-sm font-medium">
                Eyes closed for {closedEyeDuration} seconds
                {alertLevel === 'critical' 
                  ? ' - PULL OVER IMMEDIATELY!'
                  : ' - Please stay alert!'
                }
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                  EAR: {eyeAspectRatio.toFixed(3)}
                </span>
                {isPlaying && (
                  <div className="flex items-center text-xs">
                    <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
                    Alert Sound Playing
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Face Detection Status */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Face</h3>
            <Target className={`h-4 w-4 ${faceDetected ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${faceDetected ? 'text-green-600' : 'text-red-600'}`}>
              {faceDetected ? 'DETECTED' : 'NOT FOUND'}
            </p>
          </div>
        </div>

        {/* Eye Status */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Eyes</h3>
            {isDrowsy ? (
              <EyeOff className="h-4 w-4 text-red-500" />
            ) : (
              <Eye className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${isDrowsy ? 'text-red-600' : 'text-green-600'}`}>
              {isDrowsy ? 'CLOSED' : 'OPEN'}
            </p>
          </div>
        </div>

        {/* Closed Eye Duration */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Duration</h3>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${
              closedEyeDuration >= 20 ? 'text-red-600' :
              closedEyeDuration >= 10 ? 'text-orange-600' :
              closedEyeDuration >= 5 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {closedEyeDuration}s
            </p>
          </div>
        </div>

        {/* Alert Count */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm">Alerts</h3>
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{alertCount}</p>
            {lastAlertTime && (
              <p className="text-xs text-gray-500 mt-1">
                {lastAlertTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Eye Aspect Ratio Meter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Eye Aspect Ratio (EAR)</span>
          <span className="text-sm font-bold text-gray-900">{eyeAspectRatio.toFixed(3)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 relative">
          {/* Threshold line */}
          <div 
            className="absolute top-0 w-0.5 h-4 bg-red-500 z-10"
            style={{ left: '25%' }}
          ></div>
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${
              eyeAspectRatio < 0.25 ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(eyeAspectRatio * 200, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.0</span>
          <span className="text-red-500">Threshold: 0.25</span>
          <span>0.5+</span>
        </div>
      </div>

      {/* Drowsiness Progress Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Drowsiness Alert Progress</span>
          <span className="text-sm font-bold text-gray-900">{closedEyeDuration}/20s</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all duration-300 ${
              closedEyeDuration >= 20 ? 'bg-red-600' :
              closedEyeDuration >= 15 ? 'bg-orange-500' :
              closedEyeDuration >= 10 ? 'bg-yellow-500' :
              closedEyeDuration >= 5 ? 'bg-blue-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min((closedEyeDuration / 20) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0s</span>
          <span>10s</span>
          <span className="text-red-500">20s Alert</span>
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Real-time Eye Detection Active
        </h3>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            Green squares = Eyes open and alert
          </li>
          <li className="flex items-start">
            <span className="text-red-500 mr-2">✗</span>
            Red squares = Eyes closed (drowsiness risk)
          </li>
          <li className="flex items-start">
            <span className="text-orange-500 mr-2">⚠</span>
            Alert triggers after 20 seconds of closed eyes
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">ℹ</span>
            EAR below 0.25 indicates closed eyes
          </li>
        </ul>
      </div>
    </div>
  );
};