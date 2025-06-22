import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamCaptureProps {
  onFrame: (imageData: ImageData) => void;
  isActive: boolean;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onFrame, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsWebcamActive(true);
          setError('');
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Unable to access webcam. Please ensure camera permissions are granted.');
      }
    };

    const stopWebcam = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setIsWebcamActive(false);
      }
    };

    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isActive]);

  useEffect(() => {
    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && isActive && isWebcamActive) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.drawImage(video, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          onFrame(imageData);
        }
      }
    };

    if (isActive && isWebcamActive) {
      intervalRef.current = setInterval(captureFrame, 1000); // Capture every second
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isWebcamActive, onFrame]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-xl">
        <div className="flex items-center justify-center mb-3">
          <CameraOff className="h-8 w-8 text-red-500" />
        </div>
        <p className="font-semibold text-center">Camera Error</p>
        <p className="text-sm text-center mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-xl shadow-lg bg-gray-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto max-w-full"
          style={{ aspectRatio: '4/3' }}
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Camera status indicator */}
        <div className="absolute top-3 right-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isWebcamActive 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            <Camera className="h-3 w-3" />
            <span>{isWebcamActive ? 'LIVE' : 'OFF'}</span>
          </div>
        </div>

        {/* Loading overlay */}
        {!isWebcamActive && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Inactive overlay */}
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center text-white">
              <CameraOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Camera inactive</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};