'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  MessageSquare, 
  BookOpen, 
  AlertTriangle, 
  Settings,
  TrendingUp,
  Clock,
  Users,
  Accessibility
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Start Translation',
      description: 'Convert ISL to text or vice versa',
      href: '/translate',
      icon: MessageSquare,
      color: 'bg-blue-500',
    },
    {
      title: 'Learn ISL',
      description: 'Practice with AR-powered lessons',
      href: '/learn',
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Emergency SOS',
      description: 'Quick access to emergency alerts',
      href: '/sos',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Settings',
      description: 'Manage your preferences',
      href: '/settings',
      icon: Settings,
      color: 'bg-gray-500',
    },
  ];

  const stats = [
    { label: 'Translations Today', value: '12', icon: MessageSquare },
    { label: 'Learning Streak', value: '5 days', icon: TrendingUp },
    { label: 'Total Sessions', value: '48', icon: Clock },
    { label: 'Community Rank', value: '#127', icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Accessibility className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back!
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Hello {user?.email}, ready to break some communication barriers today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${action.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg mb-1">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Translations</CardTitle>
            <CardDescription>Your latest translation history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { input: 'Hello', output: 'हैलो', time: '2 minutes ago' },
                { input: 'Thank you', output: 'धन्यवाद', time: '1 hour ago' },
                { input: 'How are you?', output: 'आप कैसे हैं?', time: '3 hours ago' },
              ].map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      "{item.input}" → "{item.output}"
                    </p>
                    <p className="text-sm text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/translate">
              <Button variant="outline" className="w-full mt-4">
                View All Translations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Continue your ISL learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Basic Gestures</span>
                  <span className="text-sm text-gray-500">80%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Common Phrases</span>
                  <span className="text-sm text-gray-500">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Numbers</span>
                  <span className="text-sm text-gray-500">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
            <Link href="/learn">
              <Button className="w-full mt-4">
                Continue Learning
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}