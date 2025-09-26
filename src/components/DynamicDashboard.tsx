import React, { useState, useEffect } from 'react';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { DashboardScreen } from '@/types/screen';
import { 
  ClockWidget, 
  WeatherWidget, 
  GoogleCalendarWidget, 
  LocationWidget,
  HomeAssistantWidget,
  TodoWidget,
  NotesWidget,
  SystemStatsWidget
} from './widgets';

interface DynamicDashboardProps {
  editMode: boolean;
  screen?: DashboardScreen | null;
}

const WIDGET_COMPONENTS = {
  clock: ClockWidget,
  weather: WeatherWidget,
  calendar: GoogleCalendarWidget,
  location: LocationWidget,
  homeassistant: HomeAssistantWidget,
  todo: TodoWidget,
  notes: NotesWidget,
  system: SystemStatsWidget
};

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({ editMode, screen }) => {
  const { settings } = useDashboardSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Use screen-specific layout if available, otherwise fall back to user settings
  const visibleWidgets = screen?.layout_data?.map(w => w.type) || settings.visible_widgets || ['clock', 'weather', 'calendar', 'location'];

  if (editMode) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">
          <p>Edit mode is active. Use the layout builder to customize your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Left Sidebar - Date, Time, Location */}
      <div className="w-80 flex flex-col gap-6">
        {/* Show clock if included in layout or as default */}
        {(visibleWidgets.includes('clock') || !screen) && (
          <div className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm rounded-lg p-6">
            <div className="text-6xl font-bold text-foreground mb-2">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="text-2xl font-medium text-primary mb-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long' })} {currentTime.getDate()}
            </div>
            <div className="text-lg text-muted-foreground">
              {currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}

        {/* Conditional widgets based on settings */}
        {visibleWidgets.includes('location') && <LocationWidget settings={settings} />}
        {visibleWidgets.includes('weather') && (
          <WeatherWidget 
            location="New York"
            showDetails={true}
            title="Weather"
          />
        )}
        {visibleWidgets.includes('homeassistant') && <HomeAssistantWidget />}
        {visibleWidgets.includes('todo') && <TodoWidget />}
        {visibleWidgets.includes('system') && <SystemStatsWidget />}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Calendar - Main widget */}
        {visibleWidgets.includes('calendar') && (
          <div className="flex-1">
            <GoogleCalendarWidget title="Calendar" />
          </div>
        )}
        
        {/* Notes widget if enabled */}
        {visibleWidgets.includes('notes') && (
          <div className="h-80">
            <NotesWidget />
          </div>
        )}

        {/* Show a message if no widgets are enabled */}
        {visibleWidgets.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">No widgets enabled</p>
              <p>Go to Settings to enable widgets for your dashboard</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};