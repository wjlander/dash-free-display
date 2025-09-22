import React, { useState } from 'react';
import { ClockWidget } from './widgets/ClockWidget';
import { WeatherWidget } from './widgets/WeatherWidget';
import { CalendarWidget } from './widgets/CalendarWidget';
import { NewsWidget } from './widgets/NewsWidget';
import { PhotoWidget } from './widgets/PhotoWidget';
import { DashboardControls } from './DashboardControls';
import { LayoutBuilder } from './LayoutBuilder';

interface DashboardProps {
  screenId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ screenId = 'default' }) => {
  const [editMode, setEditMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

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
          <div className="grid grid-cols-12 gap-6 auto-rows-max">
            {/* Clock Widget */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <ClockWidget 
                format24h={false}
                showDate={true}
                showSeconds={true}
                title="Current Time"
              />
            </div>

            {/* Weather Widget */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4">
              <WeatherWidget 
                location="New York"
                showDetails={true}
                title="Weather"
              />
            </div>

            {/* Calendar Widget */}
            <div className="col-span-12 lg:col-span-4 row-span-2">
              <CalendarWidget 
                maxEvents={5}
                showUpcoming={true}
                title="Upcoming Events"
              />
            </div>

            {/* News Widget */}
            <div className="col-span-12 md:col-span-8">
              <NewsWidget 
                maxItems={4}
                category="general"
                title="Latest News"
              />
            </div>

            {/* Photo Widget */}
            <div className="col-span-12 md:col-span-8">
              <PhotoWidget 
                autoPlay={true}
                interval={8000}
                showControls={true}
                title="Photo Slideshow"
              />
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