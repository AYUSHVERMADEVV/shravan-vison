'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Play, 
  Star, 
  CheckCircle, 
  Lock,
  Trophy,
  Target
} from 'lucide-react';
import { Zap } from 'lucide-react';

interface ISLCard {
  id: number;
  word: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  description: string;
  completed: boolean;
  locked: boolean;
}

export default function LearnPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Comprehensive ISL learning cards with enhanced content
  const islCards: ISLCard[] = [
    // Greetings Category
    {
      id: 1,
      word: 'Hello',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Wave your hand with open palm facing forward',
      completed: true,
      locked: false
    },
    {
      id: 2,
      word: 'Thank You',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/708392/pexels-photo-708392.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Touch chin with fingertips, then move hand forward',
      completed: true,
      locked: false
    },
    {
      id: 3,
      word: 'Good Morning',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "G" sign, then "M" sign with both hands',
      completed: false,
      locked: false
    },
    {
      id: 4,
      word: 'Good Night',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "G" sign, then "N" sign with both hands',
      completed: false,
      locked: false
    },
    {
      id: 5,
      word: 'Please',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make circular motion on chest with flat hand',
      completed: false,
      locked: false
    },
    {
      id: 6,
      word: 'Sorry',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make circular motion on chest with closed fist',
      completed: false,
      locked: false
    },

    // Basic Needs Category
    {
      id: 7,
      word: 'Water',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make W sign and touch it to your mouth',
      completed: false,
      locked: false
    },
    {
      id: 8,
      word: 'Food',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Touch fingertips to mouth repeatedly',
      completed: false,
      locked: false
    },
    {
      id: 9,
      word: 'Bathroom',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "T" sign and tap twice',
      completed: false,
      locked: false
    },
    {
      id: 10,
      word: 'Medicine',
      category: 'needs',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "M" sign and tap on opposite wrist',
      completed: false,
      locked: false
    },
    {
      id: 11,
      word: 'Sleep',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Place both hands together under tilted head',
      completed: false,
      locked: false
    },

    // Emergency Category
    {
      id: 12,
      word: 'Help',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Place one hand on top of the other, lift both up',
      completed: false,
      locked: false
    },
    {
      id: 13,
      word: 'Emergency',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Wave both hands frantically above head',
      completed: false,
      locked: true
    },
    {
      id: 14,
      word: 'Police',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "P" sign and tap on shoulder',
      completed: false,
      locked: true
    },
    {
      id: 15,
      word: 'Doctor',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "D" sign and tap on chest',
      completed: false,
      locked: true
    },

    // People Category
    {
      id: 16,
      word: 'Family',
      category: 'people',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make F sign and move in circle motion',
      completed: false,
      locked: true
    },
    {
      id: 17,
      word: 'Friend',
      category: 'people',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make peace sign and tap twice',
      completed: false,
      locked: true
    },
    {
      id: 18,
      word: 'Mother',
      category: 'people',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "M" sign and tap on chin',
      completed: false,
      locked: true
    },
    {
      id: 19,
      word: 'Father',
      category: 'people',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "F" sign and tap on forehead',
      completed: false,
      locked: true
    },

    // Emotions Category
    {
      id: 20,
      word: 'Love',
      category: 'emotions',
      difficulty: 'advanced',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Cross arms over chest with hands on shoulders',
      completed: false,
      locked: true
    },
    {
      id: 21,
      word: 'Happy',
      category: 'emotions',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "H" sign and move up and down',
      completed: false,
      locked: true
    },
    {
      id: 22,
      word: 'Sad',
      category: 'emotions',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "S" sign and move down',
      completed: false,
      locked: true
    },
    {
      id: 23,
      word: 'Angry',
      category: 'emotions',
      difficulty: 'advanced',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "A" sign and shake hand',
      completed: false,
      locked: true
    },

    // Numbers Category
    {
      id: 24,
      word: 'One',
      category: 'numbers',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Hold up one finger',
      completed: false,
      locked: false
    },
    {
      id: 25,
      word: 'Two',
      category: 'numbers',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Hold up two fingers',
      completed: false,
      locked: false
    },
    {
      id: 26,
      word: 'Three',
      category: 'numbers',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Hold up three fingers',
      completed: false,
      locked: false
    },
    {
      id: 27,
      word: 'Five',
      category: 'numbers',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Hold up all five fingers',
      completed: false,
      locked: false
    },

    // Colors Category
    {
      id: 28,
      word: 'Red',
      category: 'colors',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "R" sign and tap on lips',
      completed: false,
      locked: false
    },
    {
      id: 29,
      word: 'Blue',
      category: 'colors',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "B" sign and tap on lips',
      completed: false,
      locked: false
    },
    {
      id: 30,
      word: 'Green',
      category: 'colors',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make "G" sign and tap on lips',
      completed: false,
      locked: false
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', count: islCards.length },
    { id: 'greetings', label: 'Greetings', count: islCards.filter(card => card.category === 'greetings').length },
    { id: 'needs', label: 'Basic Needs', count: islCards.filter(card => card.category === 'needs').length },
    { id: 'emergency', label: 'Emergency', count: islCards.filter(card => card.category === 'emergency').length },
    { id: 'people', label: 'People', count: islCards.filter(card => card.category === 'people').length },
    { id: 'emotions', label: 'Emotions', count: islCards.filter(card => card.category === 'emotions').length },
    { id: 'numbers', label: 'Numbers', count: islCards.filter(card => card.category === 'numbers').length },
    { id: 'colors', label: 'Colors', count: islCards.filter(card => card.category === 'colors').length }
  ];

  const filteredCards = selectedCategory === 'all' 
    ? islCards 
    : islCards.filter(card => card.category === selectedCategory);

  const completedCards = islCards.filter(card => card.completed).length;
  const progressPercentage = (completedCards / islCards.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner': return `bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
        case 'intermediate': return `bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
        case 'advanced': return `bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
        default: return `bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
      }
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setScore(0);
  };

  const startQuiz = () => {
    setQuizMode(true);
    setCurrentCardIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setQuizCompleted(false);
  };

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setSelectedAnswer('');
    } else {
      setPracticeMode(false);
      setQuizMode(false);
      setQuizCompleted(true);
    }
  };

  const previousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setSelectedAnswer('');
    }
  };

  const checkAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const currentCard = filteredCards[currentCardIndex];
    if (answer.toLowerCase() === currentCard.word.toLowerCase()) {
      setScore(score + 1);
    }
  };

  const resetLearning = () => {
    setPracticeMode(false);
    setQuizMode(false);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setScore(0);
    setSelectedAnswer('');
    setQuizCompleted(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          AR Learning Lab
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Learn Indian Sign Language through interactive AR experiences and guided lessons
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedCards}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {islCards.length - completedCards}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  5
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Day Streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  127
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  XP Points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Overall Progress</h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You&apos;ve completed {completedCards} out of {islCards.length} lessons
          </p>
        </CardContent>
      </Card>

      {/* Learning Mode Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-1"
                  disabled={practiceMode || quizMode}
                >
                  <span>{category.label}</span>
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={startPractice}
                variant="outline"
                disabled={practiceMode || quizMode || filteredCards.length === 0}
              >
                <Play className="mr-2 h-4 w-4" />
                Practice Mode
              </Button>
              <Button
                onClick={startQuiz}
                variant="outline"
                disabled={practiceMode || quizMode || filteredCards.length === 0}
              >
                <Star className="mr-2 h-4 w-4" />
                Quiz Mode
              </Button>
              {(practiceMode || quizMode) && (
                <Button
                  onClick={resetLearning}
                  variant="destructive"
                  size="sm"
                >
                  Exit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Mode */}
      {practiceMode && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Practice Mode</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Card {currentCardIndex + 1} of {filteredCards.length}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {filteredCards[currentCardIndex] && (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto max-w-md relative overflow-hidden">
                    <img
                      src={filteredCards[currentCardIndex].imageUrl}
                      alt={`ISL gesture for ${filteredCards[currentCardIndex].word}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold">
                      {showAnswer ? filteredCards[currentCardIndex].word : 'What is this gesture?'}
                    </h4>
                    {showAnswer && (
                      <p className="text-gray-600 dark:text-gray-300">
                        {filteredCards[currentCardIndex].description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant="outline"
                    >
                      {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </Button>
                    <Button
                      onClick={previousCard}
                      disabled={currentCardIndex === 0}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={nextCard}
                      disabled={currentCardIndex === filteredCards.length - 1}
                    >
                      {currentCardIndex === filteredCards.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Mode */}
      {quizMode && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Quiz Mode</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentCardIndex + 1} of {filteredCards.length} | Score: {score}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
                  />
                </div>
              </div>
              
              {filteredCards[currentCardIndex] && (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto max-w-md relative overflow-hidden">
                    <img
                      src={filteredCards[currentCardIndex].imageUrl}
                      alt={`ISL gesture for ${filteredCards[currentCardIndex].word}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold">What is this gesture?</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      {filteredCards[currentCardIndex].description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                    {(() => {
                      const currentCard = filteredCards[currentCardIndex];
                      const correctAnswer = currentCard.word;
                      
                      // Create options array with correct answer and 3 random wrong answers
                      const allWords = filteredCards.map(card => card.word).filter(word => word !== correctAnswer);
                      const wrongAnswers = allWords.sort(() => 0.5 - Math.random()).slice(0, 3);
                      const options = [correctAnswer, ...wrongAnswers].sort(() => 0.5 - Math.random());
                      
                      return options.map((option) => (
                        <Button
                          key={option}
                          onClick={() => checkAnswer(option)}
                          variant={selectedAnswer === option ? "default" : "outline"}
                          className={`${
                            selectedAnswer === option 
                              ? option.toLowerCase() === correctAnswer.toLowerCase()
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-red-500 hover:bg-red-600'
                              : ''
                          }`}
                        >
                          {option}
                        </Button>
                      ));
                    })()}
                  </div>
                  
                  {selectedAnswer && (
                    <div className="mt-4">
                      <p className={`font-semibold ${
                        selectedAnswer.toLowerCase() === filteredCards[currentCardIndex].word.toLowerCase()
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedAnswer.toLowerCase() === filteredCards[currentCardIndex].word.toLowerCase()
                          ? 'Correct! 🎉' : `Incorrect. The answer is: ${filteredCards[currentCardIndex].word}`}
                      </p>
                      <Button
                        onClick={nextCard}
                        className="mt-2"
                      >
                        {currentCardIndex === filteredCards.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quiz Results */}
      {quizCompleted && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Quiz Completed! 🎉</h3>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-blue-600">
                  {score}/{filteredCards.length}
                </div>
                <p className="text-lg">
                  You scored {Math.round((score / filteredCards.length) * 100)}%!
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={startQuiz} variant="outline">
                    Retake Quiz
                  </Button>
                  <Button onClick={resetLearning}>
                    Back to Learning
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ISL Cards Grid */}
      {!practiceMode && !quizMode && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filteredCards.map((card) => (
          <Card key={card.id} className={`overflow-hidden ${card.locked ? "opacity-60" : "hover:shadow-lg"} transition-all`}>
            <div className="relative">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={`ISL gesture for ${card.word}`}
                  className="w-full h-full object-cover"
                />
                {card.locked && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                )}
                {card.completed && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-600 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {card.word}
                </h3>
                <Badge className={getDifficultyColor(card.difficulty)}>
                  {card.difficulty}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {card.description}
              </p>
              
              <Button 
                size="sm" 
                disabled={card.locked}
                className="w-full"
              >
                {card.locked ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Locked
                  </>
                ) : card.completed ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Review
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Learn
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* AR Feature Coming Soon */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Augmented Reality Coming Soon!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
              We&apos;re working on integrating ARCore and 3D gesture visualization to provide an immersive 
              learning experience. Soon you&apos;ll be able to practice ISL gestures in augmented reality 
              with real-time feedback and guidance.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">ARCore Integration</Badge>
              <Badge variant="outline">3D Hand Tracking</Badge>
              <Badge variant="outline">Real-time Feedback</Badge>
              <Badge variant="outline">Interactive Lessons</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}