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
  const DETECTION_COOLDOWN = 8000; // 8 seconds between detections (increased to prevent spam)
  const STABILITY_THRESHOLD = 8; // Need 8 consistent detections (increased for better accuracy)
  const CONFIDENCE_THRESHOLD = 0.85; // Increased confidence threshold

  // Comprehensive ISL gesture patterns mapping - Expanded
  const gesturePatterns = {
    // Greetings
    'hello': detectHelloGesture,
    'thank_you': detectThankYouGesture,
    'good_morning': detectGoodMorningGesture,
    'good_night': detectGoodNightGesture,
    'please': detectPleaseGesture,
    'sorry': detectSorryGesture,
    'welcome': detectWelcomeGesture,
    'goodbye': detectGoodbyeGesture,

    // Basic Needs
    'water': detectWaterGesture,
    'food': detectFoodGesture,
    'bathroom': detectBathroomGesture,
    'medicine': detectMedicineGesture,
    'sleep': detectSleepGesture,
    'hungry': detectHungryGesture,
    'thirsty': detectThirstyGesture,
    'tired': detectTiredGesture,

    // Emergency
    'help': detectHelpGesture,
    'emergency': detectEmergencyGesture,
    'police': detectPoliceGesture,
    'doctor': detectDoctorGesture,
    'hospital': detectHospitalGesture,
    'fire': detectFireGesture,
    'danger': detectDangerGesture,

    // People
    'family': detectFamilyGesture,
    'friend': detectFriendGesture,
    'mother': detectMotherGesture,
    'father': detectFatherGesture,
    'brother': detectBrotherGesture,
    'sister': detectSisterGesture,
    'child': detectChildGesture,
    'baby': detectBabyGesture,

    // Emotions
    'love': detectLoveGesture,
    'happy': detectHappyGesture,
    'sad': detectSadGesture,
    'angry': detectAngryGesture,
    'scared': detectScaredGesture,
    'excited': detectExcitedGesture,
    'surprised': detectSurprisedGesture,
    'worried': detectWorriedGesture,

    // Numbers
    'one': detectOneGesture,
    'two': detectTwoGesture,
    'three': detectThreeGesture,
    'four': detectFourGesture,
    'five': detectFiveGesture,
    'six': detectSixGesture,
    'seven': detectSevenGesture,
    'eight': detectEightGesture,
    'nine': detectNineGesture,
    'ten': detectTenGesture,

    // Colors
    'red': detectRedGesture,
    'blue': detectBlueGesture,
    'green': detectGreenGesture,
    'yellow': detectYellowGesture,
    'black': detectBlackGesture,
    'white': detectWhiteGesture,
    'purple': detectPurpleGesture,
    'orange': detectOrangeGesture,

    // Common Words
    'yes': detectYesGesture,
    'no': detectNoGesture,
    'good': detectGoodGesture,
    'bad': detectBadGesture,
    'home': detectHomeGesture,
    'work': detectWorkGesture,
    'school': detectSchoolGesture,
    'money': detectMoneyGesture,
    'time': detectTimeGesture,
    'today': detectTodayGesture,
    'tomorrow': detectTomorrowGesture,
    'yesterday': detectYesterdayGesture
  };

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeMediaPipe();
    } else if (!isActive) {
      cleanup();
    }
  }, [isActive, isInitialized]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (camera) {
      camera.stop();
      setCamera(null);
    }
    if (hands) {
      hands.close();
      setHands(null);
    }
    setIsInitialized(false);
    setCurrentGesture(null);
    setGestureHistory([]);
  };

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
        } else if (gestureHistory.length > 0) {
          // Show learning progress
          const currentLearningGesture = gestureHistory[gestureHistory.length - 1];
          const progress = gestureHistory.filter(g => g === currentLearningGesture).length;
          const percentage = Math.round((progress / STABILITY_THRESHOLD) * 100);
          
          ctx.fillStyle = '#FFA500';
          ctx.font = 'bold 20px Arial';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeText(`Learning: ${currentLearningGesture.replace('_', ' ').toUpperCase()}`, 10, 40);
          ctx.fillText(`Learning: ${currentLearningGesture.replace('_', ' ').toUpperCase()}`, 10, 40);
          
          // Show progress bar
          ctx.fillStyle = '#FFA500';
          ctx.font = '14px Arial';
          ctx.fillText(`Progress: ${percentage}% (${progress}/${STABILITY_THRESHOLD})`, 10, 65);
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
      
      // Additional validation: gesture must be detected at least 80% of the time
      const gesturePercentage = consistentGestures / newHistory.length;
      
      if (consistentGestures >= STABILITY_THRESHOLD && 
          gesturePercentage >= 0.8 &&
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

// Additional Greeting Gestures
function detectGoodMorningGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Good Morning: G sign then M sign (simplified: G sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y > landmarks[10].y;
}

function detectGoodNightGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Good Night: G sign then N sign (simplified: G sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y > landmarks[10].y;
}

function detectWelcomeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Welcome: Open arms gesture (simplified: both hands extended)
  const fingers = [8, 12, 16, 20];
  const fingersExtended = fingers.map(i => landmarks[i].y < landmarks[i - 2].y);
  
  return fingersExtended.filter(f => f).length >= 3;
}

function detectGoodbyeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Goodbye: Wave hand (similar to hello)
  const fingers = [8, 12, 16, 20];
  const fingersExtended = fingers.map(i => landmarks[i].y < landmarks[i - 2].y);
  
  return fingersExtended.filter(f => f).length >= 3;
}

// Additional Basic Needs Gestures
function detectBathroomGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Bathroom: T sign and tap twice (simplified: T sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectMedicineGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Medicine: M sign and tap on wrist (simplified: M sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectSleepGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Sleep: Hands together under tilted head (simplified: hands together)
  const wrist = landmarks[0];
  const middle = landmarks[9];
  
  return Math.abs(wrist.x - 0.5) < 0.1 && wrist.y > 0.5;
}

function detectHungryGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Hungry: Hand to stomach (simplified: hand position)
  const wrist = landmarks[0];
  
  return wrist.y > 0.6 && wrist.x > 0.3 && wrist.x < 0.7;
}

function detectThirstyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Thirsty: W sign to mouth (similar to water)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         Math.abs(index.x - thumb.x) < 0.15;
}

function detectTiredGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Tired: Hand on forehead
  const wrist = landmarks[0];
  const middle = landmarks[9];
  
  return wrist.y < 0.4 && middle.y < landmarks[10].y;
}

// Additional Emergency Gestures
function detectEmergencyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Emergency: Wave both hands frantically (simplified: open hands)
  const fingers = [8, 12, 16, 20];
  const fingersExtended = fingers.map(i => landmarks[i].y < landmarks[i - 2].y);
  
  return fingersExtended.filter(f => f).length >= 4;
}

function detectPoliceGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Police: P sign and tap on shoulder (simplified: P sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y > landmarks[10].y;
}

function detectDoctorGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Doctor: D sign and tap on chest (simplified: D sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectHospitalGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Hospital: H sign and tap on chest (simplified: H sign)
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectFireGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Fire: F sign and wave (simplified: F sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectDangerGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Danger: D sign and shake (simplified: D sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

// Additional People Gestures
function detectMotherGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Mother: M sign and tap on chin (simplified: M sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectFatherGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Father: F sign and tap on forehead (simplified: F sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectBrotherGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Brother: B sign and tap on chest (simplified: B sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectSisterGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Sister: S sign and tap on chest (simplified: S sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectChildGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Child: C sign and tap on head (simplified: C sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return Math.abs(thumb.x - index.x) < 0.1 && Math.abs(index.x - middle.x) < 0.1 &&
         Math.abs(middle.x - ring.x) < 0.1;
}

function detectBabyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Baby: Cradle arms motion (simplified: curved hands)
  const wrist = landmarks[0];
  const middle = landmarks[9];
  
  return wrist.y > 0.4 && wrist.y < 0.8 && middle.y < landmarks[10].y;
}

// Additional Emotion Gestures
function detectHappyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Happy: H sign and move up and down (simplified: H sign)
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectSadGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Sad: S sign and move down (simplified: S sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectAngryGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Angry: A sign and shake hand (simplified: A sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectScaredGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Scared: S sign and shake (simplified: S sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectExcitedGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Excited: E sign and wave (simplified: E sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectSurprisedGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Surprised: S sign and open mouth (simplified: S sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectWorriedGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Worried: W sign and tap forehead (simplified: W sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

// Number Gestures
function detectOneGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return index.y < landmarks[6].y && middle.y > landmarks[10].y && 
         ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectTwoGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectThreeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         ring.y < landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectFourGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return index.y < landmarks[6].y && middle.y < landmarks[10].y && 
         ring.y < landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectFiveGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectSixGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Six: Thumb tucked, other fingers extended
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectSevenGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Seven: Thumb and index tucked, others extended
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectEightGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Eight: Thumb, index, middle tucked, others extended
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y < landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectNineGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Nine: Only pinky extended
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y < landmarks[18].y;
}

function detectTenGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Ten: All fingers extended (same as five)
  return detectFiveGesture(landmarks, handLabel);
}

// Color Gestures
function detectRedGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Red: R sign and tap on lips (simplified: R sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectBlueGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Blue: B sign and tap on lips (simplified: B sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectGreenGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Green: G sign and tap on lips (simplified: G sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y > landmarks[10].y;
}

function detectYellowGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Yellow: Y sign and tap on lips (simplified: Y sign)
  const thumb = landmarks[4];
  const pinky = landmarks[20];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && pinky.y < landmarks[18].y && 
         index.y > landmarks[6].y && middle.y > landmarks[10].y && ring.y > landmarks[14].y;
}

function detectBlackGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Black: B sign and tap on forehead (simplified: B sign)
  return detectBlueGesture(landmarks, handLabel);
}

function detectWhiteGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // White: W sign and tap on chest (simplified: W sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectPurpleGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Purple: P sign and tap on lips (simplified: P sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y > landmarks[10].y;
}

function detectOrangeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Orange: O sign and tap on lips (simplified: O sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return Math.abs(thumb.x - index.x) < 0.05 && Math.abs(index.x - middle.x) < 0.05 &&
         Math.abs(middle.x - ring.x) < 0.05;
}

// Additional Common Word Gestures
function detectSchoolGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // School: S sign and tap on head (simplified: S sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  const pinky = landmarks[20];
  
  return thumb.y > landmarks[3].y && index.y > landmarks[6].y && 
         middle.y > landmarks[10].y && ring.y > landmarks[14].y && pinky.y > landmarks[18].y;
}

function detectMoneyGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Money: M sign and rub fingers (simplified: M sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  const ring = landmarks[16];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && 
         middle.y < landmarks[10].y && ring.y < landmarks[14].y;
}

function detectTimeGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Time: T sign and tap on wrist (simplified: T sign)
  const thumb = landmarks[4];
  const index = landmarks[8];
  const middle = landmarks[12];
  
  return thumb.y < landmarks[3].y && index.y < landmarks[6].y && middle.y < landmarks[10].y;
}

function detectTodayGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Today: T sign and point down (simplified: T sign)
  return detectTimeGesture(landmarks, handLabel);
}

function detectTomorrowGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Tomorrow: T sign and point forward (simplified: T sign)
  return detectTimeGesture(landmarks, handLabel);
}

function detectYesterdayGesture(landmarks: HandLandmark[], handLabel: string): boolean {
  // Yesterday: Y sign and point back (simplified: Y sign)
  return detectYellowGesture(landmarks, handLabel);
}