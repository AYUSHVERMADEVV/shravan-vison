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

  // Comprehensive ISL Gesture to text mapping - Expanded dataset
  const gestureToText = {
    // Greetings
    'hello': { english: 'Hello', hindi: 'नमस्ते', isl: '[Wave hand with open palm]' },
    'thank_you': { english: 'Thank you', hindi: 'धन्यवाद', isl: '[Touch chin, move hand forward]' },
    'good_morning': { english: 'Good Morning', hindi: 'सुप्रभात', isl: '[G sign, then M sign with both hands]' },
    'good_night': { english: 'Good Night', hindi: 'शुभ रात्रि', isl: '[G sign, then N sign with both hands]' },
    'please': { english: 'Please', hindi: 'कृपया', isl: '[Circular motion on chest]' },
    'sorry': { english: 'Sorry', hindi: 'माफ करें', isl: '[Circular motion on chest]' },
    'welcome': { english: 'Welcome', hindi: 'स्वागत', isl: '[Open arms gesture]' },
    'goodbye': { english: 'Goodbye', hindi: 'अलविदा', isl: '[Wave hand]' },

    // Basic Needs
    'water': { english: 'Water', hindi: 'पानी', isl: '[W sign and touch to mouth]' },
    'food': { english: 'Food', hindi: 'खाना', isl: '[Hand to mouth motion]' },
    'bathroom': { english: 'Bathroom', hindi: 'शौचालय', isl: '[T sign and tap twice]' },
    'medicine': { english: 'Medicine', hindi: 'दवा', isl: '[M sign and tap on wrist]' },
    'sleep': { english: 'Sleep', hindi: 'नींद', isl: '[Hands together under tilted head]' },
    'hungry': { english: 'Hungry', hindi: 'भूखा', isl: '[Hand to stomach]' },
    'thirsty': { english: 'Thirsty', hindi: 'प्यासा', isl: '[W sign to mouth]' },
    'tired': { english: 'Tired', hindi: 'थका', isl: '[Hand on forehead]' },

    // Emergency
    'help': { english: 'Help', hindi: 'मदद', isl: '[Open hand raised up]' },
    'emergency': { english: 'Emergency', hindi: 'आपातकाल', isl: '[Wave both hands frantically]' },
    'police': { english: 'Police', hindi: 'पुलिस', isl: '[P sign and tap on shoulder]' },
    'doctor': { english: 'Doctor', hindi: 'डॉक्टर', isl: '[D sign and tap on chest]' },
    'hospital': { english: 'Hospital', hindi: 'अस्पताल', isl: '[H sign and tap on chest]' },
    'fire': { english: 'Fire', hindi: 'आग', isl: '[F sign and wave]' },
    'danger': { english: 'Danger', hindi: 'खतरा', isl: '[D sign and shake]' },

    // People
    'family': { english: 'Family', hindi: 'परिवार', isl: '[F sign and circle motion]' },
    'friend': { english: 'Friend', hindi: 'दोस्त', isl: '[Peace sign and tap twice]' },
    'mother': { english: 'Mother', hindi: 'माँ', isl: '[M sign and tap on chin]' },
    'father': { english: 'Father', hindi: 'पिता', isl: '[F sign and tap on forehead]' },
    'brother': { english: 'Brother', hindi: 'भाई', isl: '[B sign and tap on chest]' },
    'sister': { english: 'Sister', hindi: 'बहन', isl: '[S sign and tap on chest]' },
    'child': { english: 'Child', hindi: 'बच्चा', isl: '[C sign and tap on head]' },
    'baby': { english: 'Baby', hindi: 'शिशु', isl: '[Cradle arms motion]' },

    // Emotions
    'love': { english: 'Love', hindi: 'प्यार', isl: '[Hand on heart]' },
    'happy': { english: 'Happy', hindi: 'खुश', isl: '[H sign and move up and down]' },
    'sad': { english: 'Sad', hindi: 'दुखी', isl: '[S sign and move down]' },
    'angry': { english: 'Angry', hindi: 'गुस्सा', isl: '[A sign and shake hand]' },
    'scared': { english: 'Scared', hindi: 'डरा हुआ', isl: '[S sign and shake]' },
    'excited': { english: 'Excited', hindi: 'उत्साहित', isl: '[E sign and wave]' },
    'surprised': { english: 'Surprised', hindi: 'आश्चर्यचकित', isl: '[S sign and open mouth]' },
    'worried': { english: 'Worried', hindi: 'चिंतित', isl: '[W sign and tap forehead]' },

    // Numbers
    'one': { english: 'One', hindi: 'एक', isl: '[Hold up one finger]' },
    'two': { english: 'Two', hindi: 'दो', isl: '[Hold up two fingers]' },
    'three': { english: 'Three', hindi: 'तीन', isl: '[Hold up three fingers]' },
    'four': { english: 'Four', hindi: 'चार', isl: '[Hold up four fingers]' },
    'five': { english: 'Five', hindi: 'पांच', isl: '[Hold up all five fingers]' },
    'six': { english: 'Six', hindi: 'छह', isl: '[Six fingers gesture]' },
    'seven': { english: 'Seven', hindi: 'सात', isl: '[Seven fingers gesture]' },
    'eight': { english: 'Eight', hindi: 'आठ', isl: '[Eight fingers gesture]' },
    'nine': { english: 'Nine', hindi: 'नौ', isl: '[Nine fingers gesture]' },
    'ten': { english: 'Ten', hindi: 'दस', isl: '[Ten fingers gesture]' },

    // Colors
    'red': { english: 'Red', hindi: 'लाल', isl: '[R sign and tap on lips]' },
    'blue': { english: 'Blue', hindi: 'नीला', isl: '[B sign and tap on lips]' },
    'green': { english: 'Green', hindi: 'हरा', isl: '[G sign and tap on lips]' },
    'yellow': { english: 'Yellow', hindi: 'पीला', isl: '[Y sign and tap on lips]' },
    'black': { english: 'Black', hindi: 'काला', isl: '[B sign and tap on forehead]' },
    'white': { english: 'White', hindi: 'सफेद', isl: '[W sign and tap on chest]' },
    'purple': { english: 'Purple', hindi: 'बैंगनी', isl: '[P sign and tap on lips]' },
    'orange': { english: 'Orange', hindi: 'नारंगी', isl: '[O sign and tap on lips]' },

    // Common Words
    'yes': { english: 'Yes', hindi: 'हाँ', isl: '[Nod fist up and down]' },
    'no': { english: 'No', hindi: 'नहीं', isl: '[Point finger side to side]' },
    'good': { english: 'Good', hindi: 'अच्छा', isl: '[Thumbs up]' },
    'bad': { english: 'Bad', hindi: 'बुरा', isl: '[Thumbs down]' },
    'home': { english: 'Home', hindi: 'घर', isl: '[House shape with hands]' },
    'work': { english: 'Work', hindi: 'काम', isl: '[Hammering motion]' },
    'school': { english: 'School', hindi: 'स्कूल', isl: '[S sign and tap on head]' },
    'money': { english: 'Money', hindi: 'पैसा', isl: '[M sign and rub fingers]' },
    'time': { english: 'Time', hindi: 'समय', isl: '[T sign and tap on wrist]' },
    'today': { english: 'Today', hindi: 'आज', isl: '[T sign and point down]' },
    'tomorrow': { english: 'Tomorrow', hindi: 'कल', isl: '[T sign and point forward]' },
    'yesterday': { english: 'Yesterday', hindi: 'कल', isl: '[Y sign and point back]' }
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
      // Greetings
      'hello': {
        'isl_to_english': 'Hello',
        'english_to_isl': '👋 Wave your hand with open palm facing forward',
        'isl_to_hindi': 'नमस्ते',
        'hindi_to_isl': '👋 Wave your hand with open palm facing forward'
      },
      'thank you': {
        'isl_to_english': 'Thank you',
        'english_to_isl': '🤝 Touch chin with fingertips, then move hand forward',
        'isl_to_hindi': 'धन्यवाद',
        'hindi_to_isl': '🤝 Touch chin with fingertips, then move hand forward'
      },
      'good morning': {
        'isl_to_english': 'Good Morning',
        'english_to_isl': '🌅 Make "G" sign, then "M" sign with both hands',
        'isl_to_hindi': 'सुप्रभात',
        'hindi_to_isl': '🌅 Make "G" sign, then "M" sign with both hands'
      },
      'good night': {
        'isl_to_english': 'Good Night',
        'english_to_isl': '🌙 Make "G" sign, then "N" sign with both hands',
        'isl_to_hindi': 'शुभ रात्रि',
        'hindi_to_isl': '🌙 Make "G" sign, then "N" sign with both hands'
      },
      'please': {
        'isl_to_english': 'Please',
        'english_to_isl': '🙏 Make circular motion on chest with flat hand',
        'isl_to_hindi': 'कृपया',
        'hindi_to_isl': '🙏 Make circular motion on chest with flat hand'
      },
      'sorry': {
        'isl_to_english': 'Sorry',
        'english_to_isl': '😔 Make circular motion on chest with closed fist',
        'isl_to_hindi': 'माफ करें',
        'hindi_to_isl': '😔 Make circular motion on chest with closed fist'
      },

      // Basic Needs
      'water': {
        'isl_to_english': 'Water',
        'english_to_isl': '💧 Make "W" sign and touch to mouth',
        'isl_to_hindi': 'पानी',
        'hindi_to_isl': '💧 Make "W" sign and touch to mouth'
      },
      'food': {
        'isl_to_english': 'Food',
        'english_to_isl': '🍽️ Touch fingertips to mouth repeatedly',
        'isl_to_hindi': 'खाना',
        'hindi_to_isl': '🍽️ Touch fingertips to mouth repeatedly'
      },
      'bathroom': {
        'isl_to_english': 'Bathroom',
        'english_to_isl': '🚽 Make "T" sign and tap twice',
        'isl_to_hindi': 'शौचालय',
        'hindi_to_isl': '🚽 Make "T" sign and tap twice'
      },
      'help': {
        'isl_to_english': 'Help',
        'english_to_isl': '🆘 Place one hand on top of the other, lift both up',
        'isl_to_hindi': 'मदद',
        'hindi_to_isl': '🆘 Place one hand on top of the other, lift both up'
      },

      // People
      'family': {
        'isl_to_english': 'Family',
        'english_to_isl': '[Gesture: F sign and circle motion]',
        'isl_to_hindi': 'परिवार',
        'hindi_to_isl': '[Gesture: F sign and circle motion]'
      },
      'friend': {
        'isl_to_english': 'Friend',
        'english_to_isl': '[Gesture: Peace sign and tap twice]',
        'isl_to_hindi': 'दोस्त',
        'hindi_to_isl': '[Gesture: Peace sign and tap twice]'
      },
      'mother': {
        'isl_to_english': 'Mother',
        'english_to_isl': '[Gesture: M sign and tap on chin]',
        'isl_to_hindi': 'माँ',
        'hindi_to_isl': '[Gesture: M sign and tap on chin]'
      },
      'father': {
        'isl_to_english': 'Father',
        'english_to_isl': '[Gesture: F sign and tap on forehead]',
        'isl_to_hindi': 'पिता',
        'hindi_to_isl': '[Gesture: F sign and tap on forehead]'
      },

      // Emotions
      'love': {
        'isl_to_english': 'Love',
        'english_to_isl': '[Gesture: Hand on heart]',
        'isl_to_hindi': 'प्यार',
        'hindi_to_isl': '[Gesture: Hand on heart]'
      },
      'happy': {
        'isl_to_english': 'Happy',
        'english_to_isl': '[Gesture: H sign and move up and down]',
        'isl_to_hindi': 'खुश',
        'hindi_to_isl': '[Gesture: H sign and move up and down]'
      },
      'sad': {
        'isl_to_english': 'Sad',
        'english_to_isl': '[Gesture: S sign and move down]',
        'isl_to_hindi': 'दुखी',
        'hindi_to_isl': '[Gesture: S sign and move down]'
      },

      // Numbers
      'one': {
        'isl_to_english': 'One',
        'english_to_isl': '[Gesture: Hold up one finger]',
        'isl_to_hindi': 'एक',
        'hindi_to_isl': '[Gesture: Hold up one finger]'
      },
      'two': {
        'isl_to_english': 'Two',
        'english_to_isl': '[Gesture: Hold up two fingers]',
        'isl_to_hindi': 'दो',
        'hindi_to_isl': '[Gesture: Hold up two fingers]'
      },
      'three': {
        'isl_to_english': 'Three',
        'english_to_isl': '[Gesture: Hold up three fingers]',
        'isl_to_hindi': 'तीन',
        'hindi_to_isl': '[Gesture: Hold up three fingers]'
      },
      'five': {
        'isl_to_english': 'Five',
        'english_to_isl': '[Gesture: Hold up all five fingers]',
        'isl_to_hindi': 'पांच',
        'hindi_to_isl': '[Gesture: Hold up all five fingers]'
      },

      // Colors
      'red': {
        'isl_to_english': 'Red',
        'english_to_isl': '[Gesture: R sign and tap on lips]',
        'isl_to_hindi': 'लाल',
        'hindi_to_isl': '[Gesture: R sign and tap on lips]'
      },
      'blue': {
        'isl_to_english': 'Blue',
        'english_to_isl': '[Gesture: B sign and tap on lips]',
        'isl_to_hindi': 'नीला',
        'hindi_to_isl': '[Gesture: B sign and tap on lips]'
      },
      'green': {
        'isl_to_english': 'Green',
        'english_to_isl': '[Gesture: G sign and tap on lips]',
        'isl_to_hindi': 'हरा',
        'hindi_to_isl': '[Gesture: G sign and tap on lips]'
      },

      // Common Words
      'yes': {
        'isl_to_english': 'Yes',
        'english_to_isl': '[Gesture: Nod fist up and down]',
        'isl_to_hindi': 'हाँ',
        'hindi_to_isl': '[Gesture: Nod fist up and down]'
      },
      'no': {
        'isl_to_english': 'No',
        'english_to_isl': '[Gesture: Point finger side to side]',
        'isl_to_hindi': 'नहीं',
        'hindi_to_isl': '[Gesture: Point finger side to side]'
      },
      'good': {
        'isl_to_english': 'Good',
        'english_to_isl': '[Gesture: Thumbs up]',
        'isl_to_hindi': 'अच्छा',
        'hindi_to_isl': '[Gesture: Thumbs up]'
      },
      'bad': {
        'isl_to_english': 'Bad',
        'english_to_isl': '[Gesture: Thumbs down]',
        'isl_to_hindi': 'बुरा',
        'hindi_to_isl': '[Gesture: Thumbs down]'
      },
      'home': {
        'isl_to_english': 'Home',
        'english_to_isl': '[Gesture: House shape with hands]',
        'isl_to_hindi': 'घर',
        'hindi_to_isl': '[Gesture: House shape with hands]'
      },
      'work': {
        'isl_to_english': 'Work',
        'english_to_isl': '[Gesture: Hammering motion]',
        'isl_to_hindi': 'काम',
        'hindi_to_isl': '[Gesture: Hammering motion]'
      },

      // Common phrases
      'how are you': {
        'isl_to_english': 'How are you?',
        'english_to_isl': '[Gesture: Point to person, then tap chest, then questioning expression]',
        'isl_to_hindi': 'आप कैसे हैं?',
        'hindi_to_isl': '[Gesture: Point to person, show questioning face, then thumbs up/down]'
      },
      'i love you': {
        'isl_to_english': 'I love you',
        'english_to_isl': '[Gesture: Point to self, then hand on heart, then point to person]',
        'isl_to_hindi': 'मैं तुमसे प्यार करता हूँ',
        'hindi_to_isl': '[Gesture: Point to self, then hand on heart, then point to person]'
      },
      'what is your name': {
        'isl_to_english': 'What is your name?',
        'english_to_isl': '[Gesture: Questioning face, then point to person, then N sign]',
        'isl_to_hindi': 'आपका नाम क्या है?',
        'hindi_to_isl': '[Gesture: Questioning face, then point to person, then N sign]'
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
                <strong>🤖 Live AI Detection:</strong> Advanced ISL gesture recognition with stability detection (8-second cooldown). Detects 60+ gestures!
              </p>
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                <strong>Supported:</strong> Greetings, Basic Needs, Emergency, People, Emotions, Numbers, Colors, and more!
              </div>
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                <strong>💡 Tip:</strong> Hold gestures steady for 8 seconds for accurate detection. Watch the progress indicator!
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
