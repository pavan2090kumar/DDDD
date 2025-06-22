import React, { useState, useEffect, useCallback } from 'react';
import { WebcamCapture } from './components/WebcamCapture';
import { AlertSystem } from './components/AlertSystem';
import { DrowsinessDetector } from './utils/modelUtils';
import { Car, Brain, Smartphone, Monitor } from 'lucide-react';

function App() {
  const [detector] = useState(() => new DrowsinessDetector());
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const [detectionResult, setDetectionResult] = useState({
    isDrowsy: false,
    confidence: 0
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        await detector.loadModel();
        setIsModelLoaded(true);
        setError('');
      } catch (err) {
        setError('Failed to load drowsiness detection model. Please refresh the page.');
        console.error('Model loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [detector]);

  const handleFrame = useCallback(async (imageData: ImageData) => {
    if (!detector.isLoaded()) return;

    try {
      const result = await detector.predict(imageData);
      setDetectionResult(result);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  }, [detector]);

  const toggleDetection = () => {
    if (!isModelLoaded) return;
    setIsDetectionActive(!isDetectionActive);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-center space-x-2">
              <Car className="h-6 w-6 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-800">DrowsyGuard</h1>
              <Brain className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-center text-sm text-gray-600 mt-1">
              AI-Powered Driver Safety
            </p>
          </div>
        </div>

        <div className="px-4 py-4 space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-bold text-sm">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading Display */}
          {isLoading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
                <p className="text-sm">Loading AI model...</p>
              </div>
            </div>
          )}

          {/* Camera Section */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Camera Feed</h2>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                isModelLoaded 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                {isModelLoaded ? 'AI Ready' : 'Loading...'}
              </div>
            </div>

            <WebcamCapture
              onFrame={handleFrame}
              isActive={isDetectionActive}
            />

            <button
              onClick={toggleDetection}
              disabled={!isModelLoaded || isLoading}
              className={`w-full mt-4 py-3 px-6 rounded-xl font-semibold transition-all ${
                isDetectionActive
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
              } ${
                (!isModelLoaded || isLoading) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'active:scale-95'
              }`}
            >
              {isDetectionActive ? 'Stop Detection' : 'Start Detection'}
            </button>
          </div>

          {/* Alert Section */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Alert System</h2>
            <AlertSystem
              isDrowsy={detectionResult.isDrowsy}
              confidence={detectionResult.confidence}
            />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="text-center p-4 text-gray-500 text-xs">
          <p>AI-powered drowsiness detection for safer driving</p>
          <p className="mt-1">Always prioritize safety and use your judgment</p>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Desktop Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Car className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">DrowsyGuard</h1>
            <Brain className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-gray-600 text-lg">
            AI-powered driver drowsiness detection system for safer roads
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Monitor className="h-4 w-4 mr-2" />
              Desktop Optimized
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Smartphone className="h-4 w-4 mr-2" />
              Mobile Friendly
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Loading Display */}
        {isLoading && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-3"></div>
                <p>Loading drowsiness detection model...</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Car className="h-6 w-6 mr-3 text-blue-600" />
                Camera Feed
              </h2>
              
              <div className="mb-6">
                <button
                  onClick={toggleDetection}
                  disabled={!isModelLoaded || isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                    isDetectionActive
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                      : 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                  } ${
                    (!isModelLoaded || isLoading) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  {isDetectionActive ? 'Stop Detection' : 'Start Detection'}
                </button>
              </div>

              <WebcamCapture
                onFrame={handleFrame}
                isActive={isDetectionActive}
              />

              <div className="mt-6 text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  isModelLoaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {isModelLoaded ? 'AI Model Ready' : 'Loading AI Model...'}
                </div>
              </div>
            </div>

            {/* Alert Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Brain className="h-6 w-6 mr-3 text-indigo-600" />
                Alert System
              </h2>
              
              <AlertSystem
                isDrowsy={detectionResult.isDrowsy}
                confidence={detectionResult.confidence}
              />
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p className="text-lg">This system uses advanced AI to detect signs of drowsiness.</p>
          <p className="text-sm mt-2">Always prioritize safety and use your judgment while driving.</p>
        </div>
      </div>
    </div>
  );
}

export default App;