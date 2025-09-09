'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GestureRecognition from '@/components/GestureRecognition';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Volume2, 
  RotateCcw, 
  Save, 
  Languages,
  Video,
  VideoOff,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

type TranslationDirection = 'isl_to_english' | 'english_to_isl' | 'isl_to_hindi' | 'hindi_to_isl';

export default function TranslatePage() {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [direction, setDirection] = useState<TranslationDirection>('isl_to_english');
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGestureMode, setIsGestureMode] = useState(false);
  const [lastGesture, setLastGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Comprehensive ISL Gesture to text mapping
  const gestureToText = {
    'hello': { english: 'Hello', hindi: 'नमस्ते', isl: '[Wave hand with open palm]' },
    'thank_you': { english: 'Thank you', hindi: 'धन्यवाद', isl: '[Touch chin, move hand forward]' },
    'yes': { english: 'Yes', hindi: 'हाँ', isl: '[Nod fist up and down]' },
    'no': { english: 'No', hindi: 'नहीं', isl: '[Point finger side to side]' },
    'please': { english: 'Please', hindi: 'कृपया', isl: '[Circular motion on chest]' },
    'sorry': { english: 'Sorry', hindi: 'माफ करें', isl: '[Circular motion on chest]' },
    'good': { english: 'Good', hindi: 'अच्छा', isl: '[Thumbs up]' },
    'bad': { english: 'Bad', hindi: 'बुरा', isl: '[Thumbs down]' },
    'help': { english: 'Help', hindi: 'मदद', isl: '[Open hand raised up]' },
    'water': { english: 'Water', hindi: 'पानी', isl: '[Cup gesture with fingers]' },
    'food': { english: 'Food', hindi: 'खाना', isl: '[Hand to mouth motion]' },
    'home': { english: 'Home', hindi: 'घर', isl: '[House shape with hands]' },
    'love': { english: 'Love', hindi: 'प्यार', isl: '[Hand on heart]' },
    'family': { english: 'Family', hindi: 'परिवार', isl: '[Fingers together]' },
    'friend': { english: 'Friend', hindi: 'दोस्त', isl: '[Peace sign]' },
    'work': { english: 'Work', hindi: 'काम', isl: '[Hammering motion]' }
  };

  useEffect(() => {
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  // Force cleanup when gesture mode changes
  useEffect(() => {
    if (!isGestureMode && streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isGestureMode]);

  // Effect to handle video display issues
  useEffect(() => {
    if (isVideoActive && videoRef.current && streamRef.current) {
      // Ensure video element is properly connected to stream
      if (!videoRef.current.srcObject) {
        videoRef.current.srcObject = streamRef.current;
      }
      
      // Try to play the video
      videoRef.current.play().catch(err => {
        console.warn("Video play error in effect:", err);
      });
    }
  }, [isVideoActive]);

  const startCamera = async () => {
    setIsVideoActive(true);
    setIsGestureMode(true);
    toast.success('Gesture recognition started!');
  };

  const stopCamera = () => {
    // Properly stop all camera streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsVideoActive(false);
    setIsGestureMode(false);
    setLastGesture('');
    toast.success('🛑 Camera properly stopped');
  };

  const handleGestureDetected = useCallback((gesture: string) => {
    if (gesture && gesture !== lastGesture) {
      setLastGesture(gesture);
      
      // Auto-translate detected gesture based on direction
      let translatedText = '';
      if (direction === 'isl_to_english') {
        translatedText = gestureToText[gesture as keyof typeof gestureToText]?.english || gesture;
      } else if (direction === 'isl_to_hindi') {
        translatedText = gestureToText[gesture as keyof typeof gestureToText]?.hindi || gesture;
      }
      
      if (translatedText) {
        setInputText(`Gesture: ${gesture}`);
        setOutputText(translatedText);
        
        // Auto-speak the translation
        setTimeout(() => {
          speakText(translatedText);
        }, 500);
        
        toast.success(`Detected: ${gesture} → ${translatedText}`);
      }
    }
  }, [lastGesture, direction]);

  const handleGestureError = (error: string) => {
    toast.error(error);
  };

  const simulateTranslation = (text: string, dir: TranslationDirection): string => {
    const translations: Record<string, Record<TranslationDirection, string>> = {
      'hello': {
        'isl_to_english': 'Hello',
        'english_to_isl': '[Gesture: Wave hand with open palm]',
        'isl_to_hindi': 'नमस्ते',
        'hindi_to_isl': '[Gesture: Join palms together and bow slightly]'
      },
      'thank you': {
        'isl_to_english': 'Thank you',
        'english_to_isl': '[Gesture: Touch chin with fingertips, then move hand forward]',
        'isl_to_hindi': 'धन्यवाद',
        'hindi_to_isl': '[Gesture: Touch heart, then extend hands forward]'
      },
      'how are you': {
        'isl_to_english': 'How are you?',
        'english_to_isl': '[Gesture: Point to person, then tap chest, then questioning expression]',
        'isl_to_hindi': 'आप कैसे हैं?',
        'hindi_to_isl': '[Gesture: Point to person, show questioning face, then thumbs up/down]'
      }
    };

    const lowerText = text.toLowerCase().trim();
    return translations[lowerText]?.[dir] || `[Translated: ${text}]`;
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to translate');
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const translated = simulateTranslation(inputText, direction);
      setOutputText(translated);
      
      toast.success('Translation completed!');
    } catch (error) {
      toast.error('Translation failed');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTranslation = async () => {
    if (!inputText.trim() || !outputText.trim() || !user) {
      toast.error('Nothing to save');
      return;
    }

    try {
      const { error } = await supabase
        .from('translation_logs')
        .insert({
          user_id: user.id,
          input_text: inputText,
          output_text: outputText,
          direction: direction
        });

      if (error) throw error;
      
      toast.success('Translation saved to history!');
    } catch (error) {
      toast.error('Failed to save translation');
      console.error('Save error:', error);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = direction.includes('hindi') ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Add event listeners for better feedback
      utterance.onstart = () => {
        toast.success('🔊 Speaking...');
      };
      
      utterance.onend = () => {
        console.log('Speech finished');
      };
      
      utterance.onerror = (event) => {
        toast.error('Speech error occurred');
        console.error('Speech error:', event);
      };
      
      speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  const startVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = direction.includes('hindi') ? 'hi-IN' : 'en-US';
      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('Listening...');
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
        toast.success('Voice input captured!');
      };
      
      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Voice recognition failed');
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      toast.error('Voice recognition not supported');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ISL Translation
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Convert between Indian Sign Language and text using AI-powered recognition
        </p>
      </div>

      {/* Translation Direction Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Translation Direction</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={direction} onValueChange={(value: TranslationDirection) => setDirection(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="isl_to_english">ISL → English</SelectItem>
              <SelectItem value="english_to_isl">English → ISL</SelectItem>
              <SelectItem value="isl_to_hindi">ISL → Hindi</SelectItem>
              <SelectItem value="hindi_to_isl">Hindi → ISL</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Camera/Gesture Input */}
        <Card>
          <CardHeader>
            <CardTitle>Gesture Recognition</CardTitle>
            <CardDescription>
              Use your camera for real-time gesture detection (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
              {isGestureMode ? (
                <GestureRecognition 
                  isActive={isVideoActive}
                  onGestureDetected={handleGestureDetected}
                  onError={handleGestureError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      AI Gesture Recognition ready
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Click "Start Camera" to begin detecting ISL gestures
                    </p>
                  </div>
                </div>
              )}
              
              {/* Gesture Status Overlay */}
              {isVideoActive && lastGesture && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  <Zap className="h-3 w-3 inline mr-1" />
                  {lastGesture.replace('_', ' ').toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={isVideoActive ? stopCamera : startCamera}
                variant={isVideoActive ? "destructive" : "default"}
                className="flex-1"
                size="lg"
              >
                {isVideoActive ? (
                  <>
                    <VideoOff className="mr-2 h-4 w-4" />
                    Stop Gesture Recognition
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Start AI Gesture Detection
                  </>
                )}
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>🤖 Live AI Detection:</strong> Advanced ISL gesture recognition with stability detection (2-second cooldown). Detects 16+ gestures!
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <strong>Supported:</strong> Hello, Thank You, Yes, No, Please, Sorry, Good, Bad, Help, Water, Food, Home, Love, Family, Friend, Work
              </div>
              {lastGesture && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  🎯 Last detected: <strong>{lastGesture.replace('_', ' ').toUpperCase()}</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Text Input/Output */}
        <Card>
          <CardHeader>
            <CardTitle>Text Translation</CardTitle>
            <CardDescription>
              Enter text or use voice input for translation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Input Text
              </label>
              <Textarea
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startVoiceRecognition}
                  disabled={isRecording}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="mr-2 h-4 w-4" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" />
                      Voice Input
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText('')}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="w-full"
            >
              {isLoading ? 'Translating...' : 'Translate'}
            </Button>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Translation Output
              </label>
              <Textarea
                placeholder="Translation will appear here..."
                value={outputText}
                readOnly
                rows={3}
                className="resize-none bg-gray-50 dark:bg-gray-800"
              />
              {outputText && (
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => speakText(outputText)}
                  >
                    <Volume2 className="mr-2 h-4 w-4" />
                    Speak
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveTranslation}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Translation Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Complete ISL Gesture Reference</span>
            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">16 Gestures</span>
          </CardTitle>
          <CardDescription>
            All supported gestures and quick demo buttons
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Complete Gestures Reference */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">
              📋 Complete Supported Gestures (16 total):
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {Object.entries(gestureToText).map(([gesture, translations]) => (
                <div key={gesture} className="p-2 bg-white dark:bg-gray-700 rounded border">
                  <div className="font-medium text-blue-600 dark:text-blue-400">
                    {gesture.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{translations.english}</div>
                  <div className="text-gray-500 dark:text-gray-500">{translations.hindi}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Demo Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.keys(gestureToText).slice(0, 8).map((gesture) => {
              const text = gestureToText[gesture as keyof typeof gestureToText];
              return (
                <Button
                  key={gesture}
                  variant="outline"
                  onClick={() => {
                    setInputText(`Gesture: ${gesture}`);
                    if (direction === 'isl_to_english') {
                      setOutputText(text.english);
                    } else if (direction === 'isl_to_hindi') {
                      setOutputText(text.hindi);
                    } else {
                      setOutputText(text.isl);
                    }
                  }}
                  className="text-left justify-start h-auto py-2 px-3"
                  size="sm"
                >
                  <div>
                    <div className="font-medium text-xs">{gesture.replace('_', ' ')}</div>
                    <div className="text-xs text-gray-500">{text.english}</div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>💡 Pro Tip:</strong> Hold gestures steady for 2 seconds for accurate detection. The system uses stability algorithms to prevent false positives!
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                <strong>🛑 Camera Issue?</strong> If camera doesn't stop properly, refresh the page. This ensures complete MediaStream cleanup.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
