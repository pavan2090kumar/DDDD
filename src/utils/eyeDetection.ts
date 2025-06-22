import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';

export interface EyeDetectionResult {
  leftEye: {
    isOpen: boolean;
    landmarks: number[][];
    boundingBox: { x: number; y: number; width: number; height: number };
  };
  rightEye: {
    isOpen: boolean;
    landmarks: number[][];
    boundingBox: { x: number; y: number; width: number; height: number };
  };
  faceDetected: boolean;
  eyeAspectRatio: {
    left: number;
    right: number;
    average: number;
  };
}

export class EyeDetector {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private isLoaded = false;
  private readonly EAR_THRESHOLD = 0.25; // Eye Aspect Ratio threshold for closed eyes
  private readonly CONSECUTIVE_FRAMES_THRESHOLD = 20; // ~20 seconds at 1 FPS
  private closedEyeFrameCount = 0;
  private lastDetectionTime = 0;

  async loadModel(): Promise<void> {
    try {
      console.log('Loading MediaPipe Face Mesh model...');
      
      // Set backend to webgl for better performance
      await tf.setBackend('webgl');
      await tf.ready();

      // Load the MediaPipe Face Mesh model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'mediapipe' as const,
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
        maxFaces: 1
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      this.isLoaded = true;
      console.log('Eye detection model loaded successfully');
    } catch (error) {
      console.error('Error loading eye detection model:', error);
      throw new Error('Failed to load eye detection model');
    }
  }

  async detectEyes(imageData: ImageData): Promise<EyeDetectionResult> {
    if (!this.detector || !this.isLoaded) {
      throw new Error('Eye detection model not loaded');
    }

    try {
      // Convert ImageData to tensor
      const tensor = tf.browser.fromPixels(imageData);
      
      // Detect face landmarks
      const faces = await this.detector.estimateFaces(tensor);
      
      // Clean up tensor
      tensor.dispose();

      if (faces.length === 0) {
        return this.getDefaultResult(false);
      }

      const face = faces[0];
      const keypoints = face.keypoints;

      // Extract eye landmarks (MediaPipe Face Mesh indices)
      const leftEyeLandmarks = this.getEyeLandmarks(keypoints, 'left');
      const rightEyeLandmarks = this.getEyeLandmarks(keypoints, 'right');

      // Calculate Eye Aspect Ratio (EAR) for both eyes
      const leftEAR = this.calculateEAR(leftEyeLandmarks);
      const rightEAR = this.calculateEAR(rightEyeLandmarks);
      const averageEAR = (leftEAR + rightEAR) / 2;

      // Determine if eyes are open or closed
      const leftEyeOpen = leftEAR > this.EAR_THRESHOLD;
      const rightEyeOpen = rightEAR > this.EAR_THRESHOLD;
      const bothEyesOpen = leftEyeOpen && rightEyeOpen;

      // Track consecutive closed eye frames
      if (!bothEyesOpen) {
        this.closedEyeFrameCount++;
      } else {
        this.closedEyeFrameCount = 0;
      }

      // Calculate bounding boxes for eyes
      const leftEyeBBox = this.calculateEyeBoundingBox(leftEyeLandmarks);
      const rightEyeBBox = this.calculateEyeBoundingBox(rightEyeLandmarks);

      return {
        leftEye: {
          isOpen: leftEyeOpen,
          landmarks: leftEyeLandmarks,
          boundingBox: leftEyeBBox
        },
        rightEye: {
          isOpen: rightEyeOpen,
          landmarks: rightEyeLandmarks,
          boundingBox: rightEyeBBox
        },
        faceDetected: true,
        eyeAspectRatio: {
          left: leftEAR,
          right: rightEAR,
          average: averageEAR
        }
      };
    } catch (error) {
      console.error('Error during eye detection:', error);
      return this.getDefaultResult(false);
    }
  }

  private getEyeLandmarks(keypoints: any[], eye: 'left' | 'right'): number[][] {
    // MediaPipe Face Mesh eye landmark indices
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    
    const indices = eye === 'left' ? leftEyeIndices : rightEyeIndices;
    
    return indices.map(index => {
      const point = keypoints[index];
      return [point.x, point.y];
    });
  }

  private calculateEAR(eyeLandmarks: number[][]): number {
    if (eyeLandmarks.length < 6) return 0;

    // Calculate distances between eye landmarks
    // Vertical distances
    const d1 = this.euclideanDistance(eyeLandmarks[1], eyeLandmarks[5]);
    const d2 = this.euclideanDistance(eyeLandmarks[2], eyeLandmarks[4]);
    
    // Horizontal distance
    const d3 = this.euclideanDistance(eyeLandmarks[0], eyeLandmarks[3]);

    // Eye Aspect Ratio formula
    const ear = (d1 + d2) / (2.0 * d3);
    return ear;
  }

  private euclideanDistance(point1: number[], point2: number[]): number {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateEyeBoundingBox(landmarks: number[][]): { x: number; y: number; width: number; height: number } {
    if (landmarks.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const xs = landmarks.map(point => point[0]);
    const ys = landmarks.map(point => point[1]);
    
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  private getDefaultResult(faceDetected: boolean): EyeDetectionResult {
    return {
      leftEye: {
        isOpen: true,
        landmarks: [],
        boundingBox: { x: 0, y: 0, width: 0, height: 0 }
      },
      rightEye: {
        isOpen: true,
        landmarks: [],
        boundingBox: { x: 0, y: 0, width: 0, height: 0 }
      },
      faceDetected,
      eyeAspectRatio: {
        left: 0,
        right: 0,
        average: 0
      }
    };
  }

  isDrowsy(): boolean {
    return this.closedEyeFrameCount >= this.CONSECUTIVE_FRAMES_THRESHOLD;
  }

  getClosedEyeFrameCount(): number {
    return this.closedEyeFrameCount;
  }

  getClosedEyeDuration(): number {
    return this.closedEyeFrameCount; // seconds (assuming 1 FPS)
  }

  isModelLoaded(): boolean {
    return this.isLoaded;
  }

  resetFrameCount(): void {
    this.closedEyeFrameCount = 0;
  }
}