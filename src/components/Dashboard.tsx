import React, { useState } from 'react';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { PhotoWidget } from './widgets/PhotoWidget';
import { LocationWidget } from './widgets/LocationWidget';
import { GoogleCalendarWidget } from './widgets/GoogleCalendarWidget';
import { DashboardControls } from './DashboardControls';
import { LayoutBuilder } from './LayoutBuilder';
import { useCurrentTime } from '@/hooks/useCurrentTime';

interface DashboardProps {
  screenId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ screenId = 'default' }) => {
  const [editMode, setEditMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const currentTime = useCurrentTime();

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const defaultLayout = [
    { id: 'clock', component: ClockWidget, props: { format24h: false, showDate: true }, position: { x: 0, y: 0, w: 4, h: 2 } },
    { id: 'weather', component: WeatherWidget, props: { location: 'New York', showDetails: true }, position: { x: 4, y: 0, w: 4, h: 2 } },
    { id: 'calendar', component: CalendarWidget, props: { maxEvents: 5 }, position: { x: 8, y: 0, w: 4, h: 4 } },
    { id: 'news', component: NewsWidget, props: { maxItems: 4 }, position: { x: 0, y: 2, w: 6, h: 3 } },
    { id: 'photos', component: PhotoWidget, props: { autoPlay: true, interval: 8000 }, position: { x: 6, y: 2, w: 6, h: 3 } },
  ];

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Dashboard Controls */}
      {!fullscreen && (
        <DashboardControls
          editMode={editMode}
          onToggleEdit={toggleEditMode}
          onToggleFullscreen={toggleFullscreen}
          onExportConfig={() => console.log('Export config')}
          onImportConfig={() => console.log('Import config')}
        />
      )}

      {/* Main Dashboard Content */}
      <div className={`${fullscreen ? 'p-4' : 'p-6'} transition-all duration-300`}>
        {editMode ? (
          <LayoutBuilder 
            layout={defaultLayout}
            onSave={(newLayout) => {
              console.log('Save layout:', newLayout);
              setEditMode(false);
            }}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <div className="flex gap-6 h-full">
            {/* Left Sidebar - Date, Time, Location */}
            <div className="w-80 flex flex-col gap-6">
              {/* Current Date & Time */}
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

              {/* Location Widget */}
              <LocationWidget />
              
              {/* Weather Widget */}
              <WeatherWidget 
                location="New York"
                showDetails={true}
                title="Weather"
              />
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1">
              <GoogleCalendarWidget title="Calendar" />
            </div>
          </div>
        )}
      </div>

      {/* Footer with system info (hidden in fullscreen) */}
      {!fullscreen && (
        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-widget-border mt-8">
          <p>Custom Dashboard - Free DAKboard Alternative | Last updated: {new Date().toLocaleString()}</p>
        </footer>
      )}
    </div>
  );
};