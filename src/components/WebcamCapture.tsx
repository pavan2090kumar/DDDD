import React, { useRef, useEffect, useState } from 'react';

interface WebcamCaptureProps {
  onFrame: (imageData: ImageData) => void;
  isActive: boolean;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onFrame, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number;

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

    const captureFrame = () => {
      if (videoRef.current && canvasRef.current && isActive) {
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
      
      if (isActive) {
        animationFrame = requestAnimationFrame(captureFrame);
      }
    };

    if (isActive) {
      startWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      setIsWebcamActive(false);
    };
  }, [isActive]);

  useEffect(() => {
    let animationFrame: number;
    
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
      
      if (isActive && isWebcamActive) {
        animationFrame = requestAnimationFrame(captureFrame);
      }
    };

    if (isActive && isWebcamActive) {
      captureFrame();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, isWebcamActive, onFrame]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Camera Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
      {!isWebcamActive && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Starting camera...</p>
          </div>
        </div>
      )}
    </div>
  );
};