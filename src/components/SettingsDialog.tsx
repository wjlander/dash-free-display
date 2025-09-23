import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Settings, Calendar, MapPin, Bell, Palette, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserSettings {
  google_calendar_enabled: boolean;
  google_calendar_id: string | null;
  location_tracking_enabled: boolean;
  display_name: string | null;
  home_address: string | null;
  work_address: string | null;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState<UserSettings>({
    google_calendar_enabled: false,
    google_calendar_id: null,
    location_tracking_enabled: false,
    display_name: null,
    home_address: null,
    work_address: null
  });
  
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      loadSettings();
    }
  }, [open, user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          google_calendar_enabled: false,
          location_tracking_enabled: false,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        };
        
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error loading settings",
        description: "Could not load your preferences",
        variant: "destructive"
      });
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully"
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Could not save your preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-glass border-widget-border backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your dashboard widgets and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">
              <Monitor className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="location">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Style
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">General Preferences</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={settings.display_name || ''}
                    onChange={(e) => updateSetting('display_name', e.target.value)}
                    placeholder="How you'd like to be addressed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home-address">Home Address</Label>
                  <Input
                    id="home-address"
                    value={settings.home_address || ''}
                    onChange={(e) => updateSetting('home_address', e.target.value)}
                    placeholder="Your home address for location context"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-address">Work Address</Label>
                  <Input
                    id="work-address"
                    value={settings.work_address || ''}
                    onChange={(e) => updateSetting('work_address', e.target.value)}
                    placeholder="Your work address for location context"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Calendar Settings */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Google Calendar Integration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Google Calendar</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync your Google Calendar events
                    </p>
                  </div>
                  <Switch
                    checked={settings.google_calendar_enabled}
                    onCheckedChange={(checked) => updateSetting('google_calendar_enabled', checked)}
                  />
                </div>

                {settings.google_calendar_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="calendar-id">Calendar ID</Label>
                    <Input
                      id="calendar-id"
                      value={settings.google_calendar_id || ''}
                      onChange={(e) => updateSetting('google_calendar_id', e.target.value)}
                      placeholder="your-email@gmail.com (or specific calendar ID)"
                    />
                    <p className="text-xs text-muted-foreground">
                      Find your calendar ID in Google Calendar settings
                    </p>
                  </div>
                )}

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Setup Instructions:</h4>
                  <ol className="text-xs text-muted-foreground space-y-1">
                    <li>1. Go to Google Calendar settings</li>
                    <li>2. Select your calendar and copy the Calendar ID</li>
                    <li>3. Enable public access or use API key (coming soon)</li>
                  </ol>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Location Settings */}
          <TabsContent value="location" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Location Tracking</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Location Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track and display your current location
                    </p>
                  </div>
                  <Switch
                    checked={settings.location_tracking_enabled}
                    onCheckedChange={(checked) => updateSetting('location_tracking_enabled', checked)}
                  />
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Privacy & Data:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Location data is stored securely in your database</li>
                    <li>• Data is never shared with third parties</li>
                    <li>• You can delete your location history anytime</li>
                    <li>• Uses browser geolocation API</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Dashboard Appearance</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Theme Options:</h4>
                  <p className="text-xs text-muted-foreground">
                    Theme customization will be available in the next update. The dashboard currently uses an adaptive dark theme optimized for displays.
                  </p>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Widget Layout:</h4>
                  <p className="text-xs text-muted-foreground">
                    Use the "Edit Layout" button in the main dashboard to customize widget positions and sizes.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};