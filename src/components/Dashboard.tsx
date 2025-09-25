import React, { useState } from 'react';
import { DashboardControls } from './DashboardControls';
import { LayoutBuilder } from './LayoutBuilder';
import { DynamicDashboard } from './DynamicDashboard';
import { VisualDashboard } from './VisualDashboard';
import { ClockWidget, WeatherWidget, CalendarWidget, NewsWidget, PhotoWidget } from './widgets';

interface DashboardProps {
  screenId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ screenId = 'default' }) => {
  const [editMode, setEditMode] = useState(false);
  const [visualEditMode, setVisualEditMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setVisualEditMode(false);
  };

  const toggleVisualEditMode = () => {
    setVisualEditMode(!visualEditMode);
    setEditMode(false);
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
      {!fullscreen && !visualEditMode && (
        <DashboardControls
          editMode={editMode}
          onToggleEdit={toggleEditMode}
          onToggleVisualEdit={toggleVisualEditMode}
          onToggleFullscreen={toggleFullscreen}
          onExportConfig={() => console.log('Export config')}
          onImportConfig={() => console.log('Import config')}
        />
      )}

      {/* Main Dashboard Content */}
      {visualEditMode ? (
        <VisualDashboard 
          editMode={visualEditMode} 
          onExitEdit={() => setVisualEditMode(false)}
        />
      ) : (
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
            <DynamicDashboard editMode={editMode} />
          )}
        </div>
      )}

      {/* Footer with system info (hidden in fullscreen) */}
      {!fullscreen && (
        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-widget-border mt-8">
          <p>Custom Dashboard - Free DAKboard Alternative | Last updated: {new Date().toLocaleString()}</p>
        </footer>
      )}
    </div>
  );
};