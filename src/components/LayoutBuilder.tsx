import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save, X, Plus, Trash2, Move, Clock, CloudSun, Calendar, Newspaper, Image as ImageIcon, Grid3x3 as Grid3X3 } from 'lucide-react';

interface WidgetLayoutItem {
  id: string;
  component: React.ComponentType<any>;
  props: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface LayoutBuilderProps {
  layout: WidgetLayoutItem[];
  screenId?: string;
  onSave: (layout: WidgetLayoutItem[]) => void;
  onCancel: () => void;
}

export const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  layout,
  screenId,
  onSave,
  onCancel
}) => {
  const [currentLayout, setCurrentLayout] = useState<WidgetLayoutItem[]>(layout);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const availableWidgets = [
    {
      id: 'clock',
      name: 'Clock Widget',
      icon: Clock,
      description: 'Display current time and date',
      defaultProps: { format24h: false, showDate: true, showSeconds: true }
    },
    {
      id: 'weather',
      name: 'Weather Widget',
      icon: CloudSun,
      description: 'Current weather and forecast',
      defaultProps: { location: 'New York', showDetails: true }
    },
    {
      id: 'calendar',
      name: 'Calendar Widget',
      icon: Calendar,
      description: 'Upcoming events and appointments',
      defaultProps: { maxEvents: 5, showUpcoming: true }
    },
    {
      id: 'homeassistant',
      name: 'Home Assistant Widget',
      icon: Settings,
      description: 'Smart home device control',
      defaultProps: { maxItems: 6, showControls: true }
    },
    {
      id: 'news',
      name: 'News Widget',
      icon: Newspaper,
      description: 'Latest news and RSS feeds',
      defaultProps: { maxItems: 4, category: 'general' }
    },
    {
      id: 'photos',
      name: 'Photo Widget',
      icon: ImageIcon,
      description: 'Photo slideshow display',
      defaultProps: { autoPlay: true, interval: 8000, showControls: true }
    }
  ];

  const addWidget = (widgetType: string) => {
    const widgetTemplate = availableWidgets.find(w => w.id === widgetType);
    if (!widgetTemplate) return;

    const newWidget: WidgetLayoutItem = {
      id: `${widgetType}-${Date.now()}`,
      component: widgetTemplate.name as any, // This would be the actual component in real implementation
      props: { ...widgetTemplate.defaultProps, title: widgetTemplate.name },
      position: {
        x: 0,
        y: 0,
        w: 4,
        h: 2
      }
    };

    setCurrentLayout([...currentLayout, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setCurrentLayout(currentLayout.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
  };

  const updateWidgetPosition = (widgetId: string, newPosition: { x: number; y: number; w: number; h: number }) => {
    setCurrentLayout(currentLayout.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    ));
  };

  const getGridClass = (position: { x: number; y: number; w: number; h: number }) => {
    return `col-span-${Math.min(position.w, 12)} row-span-${position.h}`;
  };

  return (
    <div className="space-y-6">
      {/* Layout Builder Header */}
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-6 h-6 text-primary" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Layout Builder {screenId && '- Screen Layout'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {screenId ? 'Configure widgets for this screen' : 'Drag widgets to arrange your dashboard layout'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button onClick={onCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => onSave(currentLayout)} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Widget Palette */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Available Widgets
              </h3>
              
              <div className="space-y-3">
                {availableWidgets.map((widget) => {
                  const IconComponent = widget.icon;
                  return (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="w-full p-3 text-left bg-muted/30 hover:bg-muted/50 rounded-lg transition-colors duration-200 group"
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 text-primary mt-0.5 group-hover:scale-110 transition-transform duration-200" />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">{widget.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">{widget.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Layout Preview */}
        <div className="lg:col-span-3">
          <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  Dashboard Preview
                </h3>
                <span className="text-sm text-muted-foreground">
                  {currentLayout.length} widgets
                </span>
              </div>

              {currentLayout.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Grid3X3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No widgets added yet</p>
                  <p className="text-sm">Choose widgets from the palette to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4">
                  {currentLayout.map((widget) => (
                    <div
                      key={widget.id}
                      className={`${getGridClass(widget.position)} ${
                        selectedWidget === widget.id ? 'ring-2 ring-primary' : ''
                      } relative group cursor-pointer`}
                      onClick={() => setSelectedWidget(widget.id)}
                    >
                      <div className="h-24 bg-widget-bg border border-widget-border rounded-lg p-3 hover:border-primary/50 transition-colors duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground truncate">
                            {widget.props?.title || widget.id}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeWidget(widget.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Position: {widget.position.x}, {widget.position.y}<br />
                          Size: {widget.position.w} × {widget.position.h}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Widget Properties */}
          {selectedWidget && (
            <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm mt-4">
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-4">Widget Properties</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">X Position</label>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      className="w-full mt-1 px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      value={currentLayout.find(w => w.id === selectedWidget)?.position.x || 0}
                      onChange={(e) => {
                        const widget = currentLayout.find(w => w.id === selectedWidget);
                        if (widget) {
                          updateWidgetPosition(selectedWidget, {
                            ...widget.position,
                            x: parseInt(e.target.value)
                          });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Y Position</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full mt-1 px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      value={currentLayout.find(w => w.id === selectedWidget)?.position.y || 0}
                      onChange={(e) => {
                        const widget = currentLayout.find(w => w.id === selectedWidget);
                        if (widget) {
                          updateWidgetPosition(selectedWidget, {
                            ...widget.position,
                            y: parseInt(e.target.value)
                          });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Width</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      className="w-full mt-1 px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      value={currentLayout.find(w => w.id === selectedWidget)?.position.w || 4}
                      onChange={(e) => {
                        const widget = currentLayout.find(w => w.id === selectedWidget);
                        if (widget) {
                          updateWidgetPosition(selectedWidget, {
                            ...widget.position,
                            w: parseInt(e.target.value)
                          });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Height</label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      className="w-full mt-1 px-3 py-1 bg-input border border-border rounded text-sm text-foreground"
                      value={currentLayout.find(w => w.id === selectedWidget)?.position.h || 2}
                      onChange={(e) => {
                        const widget = currentLayout.find(w => w.id === selectedWidget);
                        if (widget) {
                          updateWidgetPosition(selectedWidget, {
                            ...widget.position,
                            h: parseInt(e.target.value)
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};