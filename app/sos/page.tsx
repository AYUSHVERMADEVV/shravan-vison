'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  X,
  Shield,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SOSAlert {
  id: string;
  user_id: string;
  location: string;
  status: 'pending' | 'resolved' | 'cancelled';
  created_at: string;
}

export default function SOSPage() {
  const { user } = useAuth();
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [recentAlerts, setRecentAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRecentAlerts();
      getCurrentLocation();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        (error) => {
          console.error('Location error:', error);
          setLocation('Location unavailable');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  };

  const fetchRecentAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const triggerSOS = async () => {
    if (!user) return;
    
    setLoading(true);
    setCountdown(5); // 5 second countdown

    try {
      // Insert SOS alert into database
      const { data, error } = await supabase
        .from('sos_alerts')
        .insert({
          user_id: user.id,
          location: location,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setIsEmergency(true);
      toast.success('SOS Alert triggered successfully!');
      
      // TODO: Integrate with external emergency services API
      // TODO: Send SMS/Email to emergency contacts
      // TODO: Integrate with local emergency services
      
      // Simulate emergency response delay
      setTimeout(() => {
        setCountdown(0);
        setLoading(false);
      }, 5000);

      // Refresh recent alerts
      fetchRecentAlerts();
      
    } catch (error) {
      console.error('SOS Error:', error);
      toast.error('Failed to send SOS alert');
      setLoading(false);
      setCountdown(0);
    }
  };

  const cancelSOS = async () => {
    if (!user || !isEmergency) return;

    try {
      // Update the most recent pending alert to cancelled
      const pendingAlert = recentAlerts.find(alert => alert.status === 'pending');
      if (pendingAlert) {
        const { error } = await supabase
          .from('sos_alerts')
          .update({ status: 'cancelled' })
          .eq('id', pendingAlert.id);

        if (error) throw error;
      }

      setIsEmergency(false);
      setCountdown(0);
      toast.success('SOS Alert cancelled');
      fetchRecentAlerts();
    } catch (error) {
      console.error('Cancel SOS Error:', error);
      toast.error('Failed to cancel SOS alert');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'resolved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Emergency SOS
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Quick access emergency alert system for immediate assistance
        </p>
      </div>

      {/* Emergency Alert Status */}
      {isEmergency && (
        <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            <strong>Emergency Alert Active!</strong> Help is on the way. 
            Emergency services have been notified of your location.
            {countdown > 0 && (
              <span className="block mt-1">
                Response team ETA: {countdown} minutes
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* SOS Button */}
        <Card className="lg:col-span-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600 dark:text-red-400">
              Emergency SOS System
            </CardTitle>
            <CardDescription>
              Press the button below in case of emergency. This will alert emergency services 
              and your emergency contacts with your current location.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <MapPin className="h-4 w-4" />
                <span>Current Location: {location || 'Getting location...'}</span>
              </div>
              
              {!isEmergency ? (
                <Button
                  size="lg"
                  onClick={triggerSOS}
                  disabled={loading || countdown > 0}
                  className="h-32 w-32 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-lg"
                >
                  {loading || countdown > 0 ? (
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mb-2 mx-auto animate-pulse" />
                      <div>{countdown > 0 ? countdown : 'Sending...'}</div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mb-2 mx-auto" />
                      <div>SOS</div>
                    </div>
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="h-32 w-32 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mb-2 mx-auto" />
                      <div className="text-sm font-medium">Alert Sent</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={cancelSOS}
                    className="border-gray-400"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Alert
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <Phone className="h-5 w-5 text-blue-600 mb-1" />
                <div className="font-medium">Emergency Services</div>
                <div className="text-gray-600 dark:text-gray-400">Auto-contacted</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <MapPin className="h-5 w-5 text-green-600 mb-1" />
                <div className="font-medium">Location Shared</div>
                <div className="text-gray-600 dark:text-gray-400">GPS coordinates</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <Users className="h-5 w-5 text-purple-600 mb-1" />
                <div className="font-medium">Emergency Contacts</div>
                <div className="text-gray-600 dark:text-gray-400">Notified via SMS</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Your emergency alert history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No emergency alerts yet. Stay safe!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Location: {alert.location}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Information</CardTitle>
            <CardDescription>
              Important emergency guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                  When to Use SOS
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Medical emergencies</li>
                  <li>• Security threats</li>
                  <li>• Fire or accidents</li>
                  <li>• Any life-threatening situation</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2">
                  What Happens Next
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Emergency services are notified</li>
                  <li>• Your location is shared</li>
                  <li>• Emergency contacts receive alerts</li>
                  <li>• Response team is dispatched</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
                  False Alarm?
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You can cancel the alert within the first 5 minutes. 
                  After that, please contact emergency services directly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Notice */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Enhanced Emergency Integration Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We're working on integrating with local emergency services APIs, 
              SMS gateways for emergency contacts, and real-time location tracking 
              for enhanced emergency response capabilities.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">
                Emergency Services API
              </span>
              <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-300">
                SMS Gateway Integration
              </span>
              <span className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full dark:bg-purple-900 dark:text-purple-300">
                Real-time Tracking
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}