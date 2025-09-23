import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Home, Building2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationWidgetProps {
  title?: string;
}

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  location_name: string | null;
  timestamp: string;
}

export const LocationWidget: React.FC<LocationWidgetProps> = ({ title = "Location" }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserSettings();
    loadLatestLocation();
  }, []);

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default settings
        const { data: newSettings } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            location_tracking_enabled: false,
            display_name: user.user_metadata?.full_name || 'User'
          })
          .select()
          .single();
        setUserSettings(newSettings);
      } else if (data) {
        setUserSettings(data);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const loadLatestLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('location_tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentLocation(data);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      });
    });
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using a free geocoding service (you might want to replace with Google Maps API)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.displayName || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const determineLocationName = async (address: string, lat: number, lng: number): Promise<string> => {
    if (!userSettings) return 'Unknown Location';

    // Simple distance calculation to determine if at home/work
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // For demo purposes, we'll just return based on time or use generic names
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      return 'Work';
    } else if (hour >= 18 || hour <= 8) {
      return 'Home';
    }
    
    return 'Current Location';
  };

  const trackLocation = async () => {
    if (!userSettings?.location_tracking_enabled) {
      toast({
        title: "Location tracking disabled",
        description: "Enable location tracking in settings to use this feature.",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      const address = await reverseGeocode(latitude, longitude);
      const locationName = await determineLocationName(address, latitude, longitude);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('location_tracks')
        .insert({
          user_id: user.id,
          latitude,
          longitude,
          accuracy: position.coords.accuracy,
          address,
          location_name: locationName
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentLocation(data);
      toast({
        title: "Location updated",
        description: `Current location: ${locationName}`
      });
    } catch (error: any) {
      toast({
        title: "Location error",
        description: error.message || "Failed to get location",
        variant: "destructive"
      });
    } finally {
      setIsTracking(false);
    }
  };

  const toggleLocationTracking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newEnabled = !userSettings?.location_tracking_enabled;
      const { error } = await supabase
        .from('user_settings')
        .update({ location_tracking_enabled: newEnabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserSettings(prev => ({ ...prev, location_tracking_enabled: newEnabled }));
      
      if (newEnabled) {
        trackLocation();
      }
    } catch (error) {
      console.error('Error toggling location tracking:', error);
    }
  };

  const getLocationIcon = () => {
    if (!currentLocation) return <MapPin className="w-5 h-5" />;
    
    if (currentLocation.location_name === 'Home') {
      return <Home className="w-5 h-5" />;
    } else if (currentLocation.location_name === 'Work') {
      return <Building2 className="w-5 h-5" />;
    }
    return <MapPin className="w-5 h-5" />;
  };

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            {getLocationIcon()}
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocationTracking}
            className={userSettings?.location_tracking_enabled ? "text-primary" : "text-muted-foreground"}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {currentLocation ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {userSettings?.display_name || 'User'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-primary">
                {getLocationIcon()}
                <span className="text-lg font-medium">
                  {currentLocation.location_name || 'Unknown Location'}
                </span>
              </div>
              
              {currentLocation.address && (
                <p className="text-sm text-muted-foreground">
                  {currentLocation.address}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                No location data available
              </p>
              <Button
                onClick={trackLocation}
                disabled={isTracking || !userSettings?.location_tracking_enabled}
                size="sm"
              >
                {isTracking ? 'Getting location...' : 'Get location'}
              </Button>
            </div>
          )}

          {userSettings?.location_tracking_enabled && (
            <Button
              onClick={trackLocation}
              disabled={isTracking}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isTracking ? 'Updating...' : 'Update location'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};