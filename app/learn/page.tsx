'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Star, 
  CheckCircle, 
  Lock,
  Zap,
  Trophy,
  Target
} from 'lucide-react';
import Image from 'next/image';

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

  // Sample ISL learning cards with placeholder images from Pexels
  const islCards: ISLCard[] = [
    {
      id: 1,
      word: 'Hello',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/708392/pexels-photo-708392.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Basic greeting gesture - wave your hand',
      completed: true,
      locked: false
    },
    {
      id: 2,
      word: 'Thank You',
      category: 'greetings',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Touch chin with fingertips, then move hand forward',
      completed: true,
      locked: false
    },
    {
      id: 3,
      word: 'Water',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make W sign and touch it to your mouth',
      completed: false,
      locked: false
    },
    {
      id: 4,
      word: 'Food',
      category: 'needs',
      difficulty: 'beginner',
      imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Touch fingertips to mouth repeatedly',
      completed: false,
      locked: false
    },
    {
      id: 5,
      word: 'Help',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/339620/pexels-photo-339620.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Place one hand on top of the other, lift both up',
      completed: false,
      locked: false
    },
    {
      id: 6,
      word: 'Emergency',
      category: 'emergency',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Wave both hands frantically above head',
      completed: false,
      locked: true
    },
    {
      id: 7,
      word: 'Family',
      category: 'people',
      difficulty: 'intermediate',
      imageUrl: 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Make F sign and move in circle motion',
      completed: false,
      locked: true
    },
    {
      id: 8,
      word: 'Love',
      category: 'emotions',
      difficulty: 'advanced',
      imageUrl: 'https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Cross arms over chest with hands on shoulders',
      completed: false,
      locked: true
    }
  ];

  const categories = [
    { id: 'all', label: 'All Categories', count: islCards.length },
    { id: 'greetings', label: 'Greetings', count: islCards.filter(card => card.category === 'greetings').length },
    { id: 'needs', label: 'Basic Needs', count: islCards.filter(card => card.category === 'needs').length },
    { id: 'emergency', label: 'Emergency', count: islCards.filter(card => card.category === 'emergency').length },
    { id: 'people', label: 'People', count: islCards.filter(card => card.category === 'people').length },
    { id: 'emotions', label: 'Emotions', count: islCards.filter(card => card.category === 'emotions').length }
  ];

  const filteredCards = selectedCategory === 'all' 
    ? islCards 
    : islCards.filter(card => card.category === selectedCategory);

  const completedCards = islCards.filter(card => card.completed).length;
  const progressPercentage = (completedCards / islCards.length) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
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
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            You've completed {completedCards} out of {islCards.length} lessons
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center space-x-1"
              >
                <span>{category.label}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ISL Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {filteredCards.map((card) => (
          <Card key={card.id} className={`overflow-hidden ${card.locked ? 'opacity-60' : 'hover:shadow-lg'} transition-all`}>
            <div className="relative">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                <Image
                  src={card.imageUrl}
                  alt={`ISL gesture for ${card.word}`}
                  fill
                  className="object-cover"
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
            <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto">
              We're working on integrating ARCore and 3D gesture visualization to provide an immersive 
              learning experience. Soon you'll be able to practice ISL gestures in augmented reality 
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