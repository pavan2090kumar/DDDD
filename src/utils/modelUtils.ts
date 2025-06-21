import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-tflite';

// Set the WASM paths for TensorFlow.js TFLite
tf.setWasmPaths('/tflite-wasm/');

export class DrowsinessDetector {
  private model: tf.GraphModel | null = null;
  private isModelLoaded = false;

  async loadModel(): Promise<void> {
    try {
      console.log('Loading drowsiness detection model...');
      
      // Load the TFLite model
      this.model = await tf.loadGraphModel('/drowsiness_model.tflite');
      this.isModelLoaded = true;
      
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load drowsiness detection model');
    }
  }

  async predict(imageData: ImageData): Promise<{ isDrowsy: boolean; confidence: number }> {
    if (!this.model || !this.isModelLoaded) {
      throw new Error('Model not loaded');
    }

    try {
      // Preprocess the image
      const tensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([224, 224]) // Resize to model input size
        .expandDims(0)
        .div(255.0); // Normalize to [0, 1]

      // Run prediction
      const prediction = this.model.predict(tensor) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Clean up tensors
      tensor.dispose();
      prediction.dispose();

      // Interpret results (assuming binary classification: 0 = awake, 1 = drowsy)
      const confidence = predictionData[0];
      const isDrowsy = confidence > 0.5;

      return {
        isDrowsy,
        confidence: Math.round(confidence * 100) / 100
      };
    } catch (error) {
      console.error('Error during prediction:', error);
      throw new Error('Failed to analyze image for drowsiness');
    }
  }

  isLoaded(): boolean {
    return this.isModelLoaded;
  }
}