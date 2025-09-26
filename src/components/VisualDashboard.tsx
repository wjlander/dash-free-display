import React, { useState, useRef, useCallback } from 'react';
import { useDashboardSettings } from '@/hooks/useDashboardSettings';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowUp, ArrowDown, Upload, X, RotateCcw } from 'lucide-react';
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

interface WidgetPosition {
  x: number;
  y: number;
  zIndex: number;
}

interface WidgetConfig {
  id: string;
  type: string;
  position: WidgetPosition;
  size: { width: number; height: number };
}

interface SavedWidgetLayout {
  id: string;
  type: string;
  position: WidgetPosition;
  size: { width: number; height: number };
}

interface VisualDashboardProps {
  editMode: boolean;
  onExitEdit: () => void;
  screenId?: string;
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

const DEFAULT_WIDGET_CONFIGS: Record<string, Omit<WidgetConfig, 'position'>> = {
  clock: { id: 'clock', type: 'clock', size: { width: 320, height: 200 } },
  weather: { id: 'weather', type: 'weather', size: { width: 300, height: 250 } },
  calendar: { id: 'calendar', type: 'calendar', size: { width: 600, height: 400 } },
  location: { id: 'location', type: 'location', size: { width: 280, height: 150 } },
  homeassistant: { id: 'homeassistant', type: 'homeassistant', size: { width: 350, height: 300 } },
  todo: { id: 'todo', type: 'todo', size: { width: 350, height: 300 } },
  notes: { id: 'notes', type: 'notes', size: { width: 350, height: 250 } },
  system: { id: 'system', type: 'system', size: { width: 300, height: 200 } }
};

export const VisualDashboard: React.FC<VisualDashboardProps> = ({ editMode, onExitEdit, screenId }) => {
  const { settings, updateSettings } = useDashboardSettings();
  const { saveScreenLayout } = useScreens();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    const savedLayout = (Array.isArray(settings.widget_order) ? settings.widget_order : []) as unknown as SavedWidgetLayout[];
    return (settings.visible_widgets || ['clock', 'weather', 'calendar']).map((widgetType, index) => {
      const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType];
      const savedWidget = Array.isArray(savedLayout) ? savedLayout.find((w: SavedWidgetLayout) => w.id === widgetType) : null;
      
      return {
        ...defaultConfig,
        position: savedWidget?.position || {
          x: 50 + (index * 50),
          y: 50 + (index * 50),
          zIndex: index + 1
        }
      };
    });
  });
  
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (!editMode) return;
    
    e.preventDefault();
    setSelectedWidget(widgetId);
    setDraggedWidget(widgetId);
    
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setDragOffset({
        x: e.clientX - widget.position.x,
        y: e.clientY - widget.position.y
      });
    }
  }, [editMode, widgets]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedWidget || !editMode) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    setWidgets(prev => prev.map(widget => 
      widget.id === draggedWidget 
        ? { ...widget, position: { ...widget.position, x: newX, y: newY } }
        : widget
    ));
  }, [draggedWidget, dragOffset, editMode]);

  const handleMouseUp = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  React.useEffect(() => {
    if (editMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [editMode, handleMouseMove, handleMouseUp]);

  const moveWidgetLayer = (widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === widgetId);
      if (!widget) return prev;
      
      const newZIndex = direction === 'up' 
        ? widget.position.zIndex + 1 
        : Math.max(1, widget.position.zIndex - 1);
        
      return prev.map(w => 
        w.id === widgetId 
          ? { ...w, position: { ...w.position, zIndex: newZIndex } }
          : w
      );
    });
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveLayout = async () => {
    const layoutData = widgets.map(widget => ({
      id: widget.id,
      type: widget.type,
      position: widget.position,
      size: widget.size
    }));
    
    if (screenId) {
      await saveScreenLayout(screenId, layoutData as any);
    } else {
      await updateSettings({ widget_order: layoutData as any });
    }
    onExitEdit();
  };

  const resetLayout = () => {
    setWidgets(prev => prev.map((widget, index) => ({
      ...widget,
      position: {
        x: 50 + (index * 50),
        y: 50 + (index * 50),
        zIndex: index + 1
      }
    })));
  };

  if (!editMode) {
    return (
      <div 
        className="relative min-h-screen overflow-hidden"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {widgets.map(widget => {
          const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS];
          if (!WidgetComponent) return null;
          
          return (
            <div
              key={widget.id}
              className="absolute"
              style={{
                left: widget.position.x,
                top: widget.position.y,
                zIndex: widget.position.zIndex,
                width: widget.size.width,
                height: widget.size.height
              }}
            >
              <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
                <WidgetComponent />
              </Card>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen overflow-hidden bg-grid"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Edit Mode Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button onClick={saveLayout} className="bg-green-600 hover:bg-green-700">
          Save Layout
        </Button>
        <Button onClick={onExitEdit} variant="outline">
          Cancel
        </Button>
        <Button onClick={resetLayout} variant="outline" size="icon">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          variant="outline" 
          size="icon"
        >
          <Upload className="h-4 w-4" />
        </Button>
        {backgroundImage && (
          <Button 
            onClick={() => setBackgroundImage(null)} 
            variant="outline" 
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Widget Layer Controls */}
      {selectedWidget && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <Button 
            onClick={() => moveWidgetLayer(selectedWidget, 'up')}
            variant="outline" 
            size="icon"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => moveWidgetLayer(selectedWidget, 'down')}
            variant="outline" 
            size="icon"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Hidden file input for background upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* Widgets */}
      {widgets.map(widget => {
        const WidgetComponent = WIDGET_COMPONENTS[widget.type as keyof typeof WIDGET_COMPONENTS];
        if (!WidgetComponent) return null;
        
        const isSelected = selectedWidget === widget.id;
        
        return (
          <div
            key={widget.id}
            className={`absolute cursor-move select-none ${
              isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
            }`}
            style={{
              left: widget.position.x,
              top: widget.position.y,
              zIndex: widget.position.zIndex,
              width: widget.size.width,
              height: widget.size.height
            }}
            onMouseDown={(e) => handleMouseDown(e, widget.id)}
          >
            <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
              <div className="relative h-full">
                {isSelected && (
                  <div className="absolute -top-6 left-0 text-xs text-primary font-medium">
                    {widget.type} (z: {widget.position.zIndex})
                  </div>
                )}
                <WidgetComponent />
              </div>
            </Card>
          </div>
        );
      })}

      {/* Grid overlay for alignment */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="grid grid-cols-12 grid-rows-8 h-full w-full">
          {Array.from({ length: 96 }).map((_, i) => (
            <div key={i} className="border border-gray-400 border-opacity-30" />
          ))}
        </div>
      </div>
    </div>
  );
};