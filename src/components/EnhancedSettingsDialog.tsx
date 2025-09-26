import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Calendar, MapPin, Monitor, Palette, Clock, Cloud, SquareCheck as CheckSquare, FileText, Activity, Eye, EyeOff, Trash2, Save } from 'lucide-react';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { GoogleCalendarSetup } from './GoogleCalendarSetup';

interface EnhancedSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_WIDGETS = [
  { id: 'clock', name: 'Clock & Date', icon: Clock, description: 'Current time and date display' },
  { id: 'weather', name: 'Weather', icon: Cloud, description: 'Local weather information' },
  { id: 'calendar', name: 'Google Calendar', icon: Calendar, description: 'Your calendar events' },
  { id: 'location', name: 'Location', icon: MapPin, description: 'Current location tracking' },
  { id: 'todo', name: 'Tasks', icon: CheckSquare, description: 'Quick task management' },
  { id: 'notes', name: 'Notes', icon: FileText, description: 'Quick notes and reminders' },
  { id: 'system', name: 'System Stats', icon: Activity, description: 'System performance metrics' }
];

const THEME_VARIANTS = [
  { id: 'default', name: 'Default Dark', description: 'Classic dark theme with blue accents' },
  { id: 'purple', name: 'Purple Glow', description: 'Dark theme with purple gradients' },
  { id: 'green', name: 'Nature', description: 'Dark theme with green accents' },
  { id: 'orange', name: 'Sunset', description: 'Dark theme with orange/yellow accents' }
];

export const EnhancedSettingsDialog: React.FC<EnhancedSettingsDialogProps> = ({ open, onOpenChange }) => {
  const { settings, layouts, loading, updateSettings, saveLayout, loadLayout, deleteLayout } = useDashboardSettings();
  const [newLayoutName, setNewLayoutName] = useState('');
  const [showGoogleCalendarSetup, setShowGoogleCalendarSetup] = useState(false);

  const toggleWidget = (widgetId: string) => {
    const currentWidgets = settings.visible_widgets || [];
    const newWidgets = currentWidgets.includes(widgetId)
      ? currentWidgets.filter(w => w !== widgetId)
      : [...currentWidgets, widgetId];
    
    updateSettings({ visible_widgets: newWidgets });
  };

  const handleThemeChange = (themeVariant: string) => {
    updateSettings({ theme_variant: themeVariant });
  };

  const handleSaveCurrentLayout = () => {
    if (newLayoutName.trim()) {
      // This would need to get current layout from parent component
      saveLayout(newLayoutName, []);
      setNewLayoutName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gradient-glass border-widget-border backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5" />
            Dashboard Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize your dashboard widgets, layout, and appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="widgets" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="widgets">
              <Eye className="w-4 h-4 mr-2" />
              Widgets
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Monitor className="w-4 h-4 mr-2" />
              Layout
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
              Theme
            </TabsTrigger>
          </TabsList>

          {/* Widget Selection */}
          <TabsContent value="widgets" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Widget Visibility</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose which widgets appear on your dashboard
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AVAILABLE_WIDGETS.map((widget) => {
                  const Icon = widget.icon;
                  const isVisible = settings.visible_widgets?.includes(widget.id) || false;
                  
                  return (
                    <div 
                      key={widget.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isVisible 
                          ? 'border-primary bg-primary/10' 
                          : 'border-widget-border bg-widget-bg/50 hover:border-primary/50'
                      }`}
                      onClick={() => toggleWidget(widget.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isVisible}
                          onCheckedChange={() => toggleWidget(widget.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <h4 className="font-medium">{widget.name}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {widget.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Layout Management */}
          <TabsContent value="layout" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Layout Management</h3>
              
              <div className="space-y-4">
                {/* Save Current Layout */}
                <div className="p-3 bg-muted/20 rounded-lg">
                  <h4 className="font-medium mb-2">Save Current Layout</h4>
                  <div className="flex gap-2">
                    <Input
                      value={newLayoutName}
                      onChange={(e) => setNewLayoutName(e.target.value)}
                      placeholder="Enter layout name..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveCurrentLayout}
                      disabled={!newLayoutName.trim() || loading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Saved Layouts */}
                <div>
                  <h4 className="font-medium mb-3">Saved Layouts</h4>
                  {layouts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Monitor className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No saved layouts yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {layouts.map((layout) => (
                        <div 
                          key={layout.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            layout.is_active 
                              ? 'border-primary bg-primary/10' 
                              : 'border-widget-border bg-widget-bg/50'
                          }`}
                        >
                          <div>
                            <h5 className="font-medium">{layout.layout_name}</h5>
                            <p className="text-xs text-muted-foreground">
                              {layout.is_active ? 'Currently active' : 'Inactive'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!layout.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadLayout(layout.id)}
                                disabled={loading}
                              >
                                Load
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLayout(layout.id)}
                              disabled={loading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Calendar Settings */}
          <TabsContent value="calendar" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Google Calendar Integration</h3>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowGoogleCalendarSetup(true)}
                  className="w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Connect Google Calendar
                </Button>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">OAuth 2.0 Integration:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Secure access to your private calendars</li>
                    <li>• No need to make calendars public</li>
                    <li>• Automatic token refresh</li>
                    <li>• Multiple calendar support</li>
                  </ul>
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
                    checked={settings.location_tracking_enabled || false}
                    onCheckedChange={(checked) => updateSettings({ location_tracking_enabled: checked })}
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

          {/* Theme Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Theme Selection</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {THEME_VARIANTS.map((theme) => {
                  const isSelected = settings.theme_variant === theme.id;
                  
                  return (
                    <div 
                      key={theme.id}
                      className={`p-4 rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-widget-border bg-widget-bg/50 hover:border-primary/50'
                      }`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full mt-1 ${
                          isSelected ? 'bg-primary' : 'border border-widget-border'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{theme.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {theme.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Coming Soon:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Custom color schemes</li>
                  <li>• Light mode support</li>
                  <li>• Custom backgrounds</li>
                  <li>• Widget opacity controls</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-widget-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
      
      <GoogleCalendarSetup 
        open={showGoogleCalendarSetup} 
        onOpenChange={setShowGoogleCalendarSetup} 
      />
    </Dialog>
  );
};