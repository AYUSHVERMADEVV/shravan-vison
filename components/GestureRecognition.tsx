'use client';

import { useRef, useEffect, useState } from 'react';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as tf from '@tensorflow/tfjs';

interface GestureRecognitionProps {
  isActive: boolean;
  onGestureDetected: (gesture: string) => void;
  onError: (error: string) => void;
}

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export default function GestureRecognition({ 
  isActive, 
  onGestureDetected, 
  onError 
}: GestureRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hands, setHands] = useState<Hands | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  
  // Debouncing constants
  const DETECTION_COOLDOWN = 2000; // 2 seconds between detections
  const STABILITY_THRESHOLD = 3; // Need 3 consistent detections
  const CONFIDENCE_THRESHOLD = 0.7;

  // Comprehensive ISL gesture patterns mapping
  const gesturePatterns = {
    'hello': detectHelloGesture,
    'thank_you': detectThankYouGesture,
    'yes': detectYesGesture,
    'no': detectNoGesture,
    'please': detectPleaseGesture,
    'sorry': detectSorryGesture,
    'good': detectGoodGesture,
    'bad': detectBadGesture,
    'help': detectHelpGesture,
    'water': detectWaterGesture,
    'food': detectFoodGesture,
    'home': detectHomeGesture,
    'love': detectLoveGesture,
    'family': detectFamilyGesture,
    'friend': detectFriendGesture,
    'work': detectWorkGesture
  };

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeMediaPipe();
    } else if (!isActive && camera) {
      camera.stop();
    }
  }, [isActive, isInitialized]);

  const initializeMediaPipe = async () => {
    try {
      // Initialize MediaPipe Hands
      const handsInstance = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      handsInstance.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      handsInstance.onResults(onResults);
      setHands(handsInstance);

      // Initialize camera
      if (videoRef.current) {
        const cameraInstance = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsInstance) {
              await handsInstance.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        await cameraInstance.start();
        setCamera(cameraInstance);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
      onError('Failed to initialize gesture recognition');
    }
  };

  const onResults = (results: any) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || !videoRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw video frame
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness[i];

        // Draw hand landmarks
        drawConnectors(ctx, landmarks, (Hands as any).HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });

        // Detect gestures with improved stability
        const detectedGesture = detectGesture(landmarks, handedness.label);
        if (detectedGesture) {
          handleStableGestureDetection(detectedGesture);
        }
        
        // Display current stable gesture on canvas
        if (currentGesture) {
          ctx.fillStyle = '#00FF00';
          ctx.font = 'bold 24px Arial';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeText(`${currentGesture.replace('_', ' ').toUpperCase()}`, 10, 40);
          ctx.fillText(`${currentGesture.replace('_', ' ').toUpperCase()}`, 10, 40);
          
          // Show stability indicator
          ctx.fillStyle = '#FFD700';
          ctx.font = '14px Arial';
          ctx.fillText(`Stable Detection`, 10, 65);
        }
      }
    }
  };

  const handleStableGestureDetection = (gesture: string) => {
    const now = Date.now();
    
    // Add to gesture history
    setGestureHistory(prev => {
      const newHistory = [...prev.slice(-STABILITY_THRESHOLD + 1), gesture];
      
      // Check if we have enough consistent detections
      const consistentGestures = newHistory.filter(g => g === gesture).length;
      
      if (consistentGestures >= STABILITY_THRESHOLD && 
          now - lastDetectionTime > DETECTION_COOLDOWN &&
          gesture !== currentGesture) {
        
        // Stable gesture detected
        setCurrentGesture(gesture);
        setLastDetectionTime(now);
        onGestureDetected(gesture);
        
        // Clear history after successful detection
        return [];
      }
      
      return newHistory;
    });
  };

  const detectGesture = (landmarks: HandLandmark[], handLabel: string): string | null => {
    for (const [gestureName, detectFunction] of Object.entries(gesturePatterns)) {
      if (detectFunction(landmarks, handLabel)) {
        return gestureName;
      }
    }
    return null;
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        width={640}
        height={480}
      />
    </div>
  );
}

// Gesture detection functions
function detectHelloGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Hello: Open palm facing forward
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  const wrist = landmarks[0];

  // Check if all fingers are extended upward
  const fingersUp = [
    thumb.y < landmarks[3].y,
    index.y < landmarks[6].y,
    middle.y < landmarks[10].y,
    ring.y < landmarks[14].y,
    pinky.y < landmarks[18].y
  ];

  return fingersUp.filter(f => f).length >= 4;
}

function detectThankYouGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Thank you: Hand moves from chin outward
  const index = landmarks[8];
  const middle = landmarks[12];
  const thumb = landmarks[4];
  
  // Simple approximation: fingers pointing upward, hand near face level
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && thumb.y < landmarks[3].y;
}

function detectYesGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Yes: Closed fist nodding motion (simplified: closed fist)
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  // Check if fingers are folded down
  const fingersFolded = [
    index.y > landmarks[6].y,
    middle.y > landmarks[10].y,
    ring.y > landmarks[14].y,
    pinky.y > landmarks[18].y
  ];

  return fingersFolded.filter(f => f).length >= 3;
}

function detectNoGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // No: Index finger side to side (simplified: pointing finger)
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  // Index finger up, others down
  return (
    index.y < landmarks[6].y && 
    middle.y > landmarks[10].y && 
    ring.y > landmarks[14].y && 
    pinky.y > landmarks[18].y
  );
}

function detectPleaseGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Please: Circular motion with flat hand (simplified: flat hand)
  const fingers = [8, 12, 16, 20]; // fingertips
  const fingersExtended = fingers.map(i => landmarks[i].y < landmarks[i - 2].y);
  
  return fingersExtended.filter(f => f).length >= 3;
}

function detectSorryGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Sorry: Circular motion on chest (simplified: hand position near center)
  const wrist = landmarks[0];
  const middle = landmarks[9]; // middle finger base
  
  // Hand positioned in center area
  return Math.abs(wrist.x - 0.5) < 0.2 && wrist.y > 0.4 && wrist.y < 0.8;
}

// Additional ISL Gestures
function detectGoodGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Good: Thumbs up
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y > landmarks[6].y && middle.y > landmarks[10].y;
}

function detectBadGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Bad: Thumbs down
  const thumb = landmarks[4];
  const wrist = landmarks[0];
  
  return thumb.y > wrist.y && thumb.y > landmarks[3].y;
}

function detectHelpGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Help: Open hand raised up
  const fingers = [8, 12, 16, 20]; // fingertips
  const wrist = landmarks[0];
  
  const fingersUp = fingers.map(i => landmarks[i].y < landmarks[i - 2].y);
  return fingersUp.filter(f => f).length >= 4 && wrist.y < 0.6;
}

function detectWaterGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Water: Cup gesture (curved fingers)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  // Fingers slightly curved, forming cup shape
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         Math.abs(index.x - thumb.x) < 0.15;
}

function detectFoodGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Food: Bringing hand to mouth motion (simplified: hand near face level)
  const wrist = landmarks[0];
  const index = landmarks[8];
  
  return wrist.y < 0.4 && index.y < landmarks[6].y;
}

function detectHomeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Home: House shape with hands (simplified: triangular finger position)
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         ring.y < landmarks[14].y && Math.abs(index.x - ring.x) > 0.2;
}

function detectLoveGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Love: Heart shape or hand on heart
  const wrist = landmarks[0];
  const middle = landmarks[12];
  
  return wrist.x < 0.6 && wrist.x > 0.4 && wrist.y > 0.3 && wrist.y < 0.7;
}

function detectFamilyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Family: Fingers together (unity gesture)
  const fingers = [8, 12, 16, 20];
  const fingerPositions = fingers.map(i => landmarks[i]);
  
  // Check if fingers are close together
  const distances = [];
  for (let i = 0; i < fingerPositions.length - 1; i++) {
    const dist = Math.abs(fingerPositions[i].x - fingerPositions[i + 1].x);
    distances.push(dist);
  }
  
  return distances.every(d => d < 0.05) && fingerPositions[0].y < landmarks[6].y;
}

function detectFriendGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Friend: Two fingers extended (peace sign)
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectWorkGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Work: Hammering motion (simplified: closed fist movement)
  const fingers = [8, 12, 16, 20];
  const fingersFolded = fingers.map(i => landmarks[i].y > landmarks[i - 2].y);
  
  return fingersFolded.filter(f => f).length >= 3;
}