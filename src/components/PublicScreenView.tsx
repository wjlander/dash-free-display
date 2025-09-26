import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useScreens } from '@/hooks/useScreens';
import { DashboardScreen } from '@/types/screen';
import { 
  ClockWidget, 
  WeatherWidget, 
  GoogleCalendarWidget, 
  LocationWidget,
  TodoWidget,
  NotesWidget,
  SystemStatsWidget
} from './widgets';
import { Card } from './ui/card';
import { CircleAlert as AlertCircle, Monitor } from 'lucide-react';

const WIDGET_COMPONENTS = {
  clock: ClockWidget,
  weather: WeatherWidget,
  calendar: GoogleCalendarWidget,
  location: LocationWidget,
  todo: TodoWidget,
  notes: NotesWidget,
  system: SystemStatsWidget
};

export const PublicScreenView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { loadPublicScreen } = useScreens();
  const [screen, setScreen] = useState<DashboardScreen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadScreen();
    }
  }, [token]);

  const loadScreen = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const screenData = await loadPublicScreen(token);
      if (screenData) {
        setScreen(screenData);
      } else {
        setError('Screen not found or not publicly accessible');
      }
    } catch (err) {
      setError('Failed to load screen');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (screen) {
        // Refresh widget data
        window.location.reload();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [screen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm max-w-md">
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Screen Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This dashboard screen is not publicly accessible or does not exist.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Please check the URL or contact the dashboard owner.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Public Screen Header */}
      <div className="p-4 border-b border-widget-border bg-gradient-glass backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">{screen.name}</h1>
              {screen.description && (
                <p className="text-sm text-muted-foreground">{screen.description}</p>
              )}
            </div>
          </div>
          
          <div className="text-right text-xs text-muted-foreground">
            <p>Public Dashboard</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {screen.layout_data.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Widgets Configured</h2>
            <p className="text-muted-foreground">
              This dashboard screen hasn't been configured with any widgets yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4 auto-rows-min">
            {screen.layout_data.map((widget) => {
              const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS];
              if (!WidgetComponent) return null;

              const gridClass = `col-span-${Math.min(widget.position.w, 12)} row-span-${widget.position.h}`;

              return (
                <div key={widget.id} className={gridClass}>
                  <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
                    <WidgetComponent {...widget.props} />
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-widget-border mt-8">
        <p>Powered by Custom Dashboard - Free DAKboard Alternative</p>
      </footer>
    </div>
  );
};