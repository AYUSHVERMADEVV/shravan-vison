'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Moon, 
  Sun, 
  Globe, 
  Bell, 
  Shield, 
  Download,
  LogOut,
  Settings as SettingsIcon,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserPreferences {
  language: 'english' | 'hindi';
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'english',
    theme: 'light',
    notifications: true,
    autoSave: true,
  });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      fetchUserPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (mounted) {
      setPreferences(prev => ({ ...prev, theme: (theme as 'light' | 'dark') || 'light' }));
    }
  }, [theme, mounted]);

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', user!.id)
        .single();

      if (error) throw error;

      if (data?.preferences) {
        setPreferences({
          language: data.preferences.language || 'english',
          theme: data.preferences.theme || 'light',
          notifications: data.preferences.notifications ?? true,
          autoSave: data.preferences.autoSave ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    setLoading(true);
    const updatedPrefs = { ...preferences, ...newPreferences };

    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPrefs
        })
        .eq('id', user.id);

      if (error) throw error;

      setPreferences(updatedPrefs);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  const handleLanguageChange = (language: 'english' | 'hindi') => {
    updatePreferences({ language });
  };

  const exportUserData = async () => {
    if (!user) return;

    try {
      // Fetch user's translation logs
      const { data: translations, error: translationError } = await supabase
        .from('translation_logs')
        .select('*')
        .eq('user_id', user.id);

      if (translationError) throw translationError;

      // Fetch user's SOS alerts
      const { data: sosAlerts, error: sosError } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', user.id);

      if (sosError) throw sosError;

      // Create export data
      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        preferences,
        translation_logs: translations || [],
        sos_alerts: sosAlerts || [],
        exported_at: new Date().toISOString()
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shravan-vision-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('User data exported successfully!');
    } catch (error) {
      toast.error('Failed to export user data');
      console.error('Export error:', error);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Profile</span>
            </CardTitle>
            <CardDescription>
              Your account information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-lg text-white font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-500">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Profile customization features like name, avatar, and emergency contacts will be available soon.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language & Localization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Language & Localization</span>
            </CardTitle>
            <CardDescription>
              Set your preferred language for translations and interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="language">Primary Language</Label>
              <Select
                value={preferences.language}
                onValueChange={handleLanguageChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This affects translation defaults and text-to-speech language
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </CardTitle>
            <CardDescription>
              Manage your privacy settings and data preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Translations</Label>
                <p className="text-sm text-gray-500">
                  Automatically save your translations to history
                </p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) => updatePreferences({ autoSave: checked })}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications for important updates
                </p>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => updatePreferences({ notifications: checked })}
                disabled={loading}
              />
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={exportUserData}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Export My Data
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Download all your data in JSON format
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Detailed notification settings for learning reminders, SOS alerts, 
                and system updates will be available in future updates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Account Actions
            </CardTitle>
            <CardDescription>
              Manage your account and session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Account deletion and data management features will be available soon. 
                Contact support if you need immediate assistance.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}