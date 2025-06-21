import React, { useState, useEffect, useCallback } from 'react';
import { WebcamCapture } from './components/WebcamCapture';
import { AlertSystem } from './components/AlertSystem';
import { DrowsinessDetector } from './utils/modelUtils';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Driver Drowsiness Detection
          </h1>
          <p className="text-gray-600">
            AI-powered system to detect driver fatigue and prevent accidents
          </p>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-3"></div>
                <p>Loading drowsiness detection model...</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Camera Feed</h2>
              
              <div className="mb-4">
                <button
                  onClick={toggleDetection}
                  disabled={!isModelLoaded || isLoading}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    isDetectionActive
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } ${
                    (!isModelLoaded || isLoading) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {isDetectionActive ? 'Stop Detection' : 'Start Detection'}
                </button>
              </div>

              <div className="flex justify-center">
                <WebcamCapture
                  onFrame={handleFrame}
                  isActive={isDetectionActive}
                />
              </div>

              <div className="mt-4 text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  isModelLoaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {isModelLoaded ? 'Model Ready' : 'Loading Model...'}
                </div>
              </div>
            </div>

            {/* Alert Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Alert System</h2>
              
              <AlertSystem
                isDrowsy={detectionResult.isDrowsy}
                confidence={detectionResult.confidence}
              />

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Safety Tips:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Take breaks every 2 hours during long drives</li>
                  <li>• Get adequate sleep before driving</li>
                  <li>• Pull over safely if you feel drowsy</li>
                  <li>• Consider switching drivers if possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>This system uses AI to detect signs of drowsiness. Always prioritize safety and use your judgment.</p>
        </div>
      </div>
    </div>
  );
}

export default App;