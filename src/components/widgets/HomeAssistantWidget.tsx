import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Home, 
  Lightbulb, 
  Power, 
  Thermometer, 
  Gauge, 
  Settings, 
  RefreshCw,
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useHomeAssistant } from '@/hooks/useHomeAssistant';
import { HomeAssistantEntity } from '@/types/homeassistant';
import { getEntityDomain, formatEntityState, isControllableEntity } from '@/lib/homeassistant';

interface HomeAssistantWidgetProps {
  title?: string;
  maxItems?: number;
  showControls?: boolean;
}

export const HomeAssistantWidget: React.FC<HomeAssistantWidgetProps> = ({
  title = "Home Assistant",
  maxItems = 6,
  showControls = true
}) => {
  const { 
    config, 
    entities, 
    widgetItems, 
    loading, 
    connected, 
    callEntityService, 
    refreshEntities,
    addWidgetItem,
    removeWidgetItem
  } = useHomeAssistant();

  const [showAllEntities, setShowAllEntities] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  // Get entities that are added to dashboard
  const dashboardEntities = entities.filter(entity => 
    widgetItems.some(item => item.entity_id === entity.entity_id)
  );

  // Get available entities for adding
  const availableEntities = entities.filter(entity => 
    !widgetItems.some(item => item.entity_id === entity.entity_id) &&
    (selectedDomain === 'all' || getEntityDomain(entity.entity_id) === selectedDomain)
  );

  const domains = [...new Set(entities.map(e => getEntityDomain(e.entity_id)))].sort();

  const getEntityIcon = (entity: HomeAssistantEntity) => {
    const domain = getEntityDomain(entity.entity_id);
    
    switch (domain) {
      case 'light':
        return <Lightbulb className={`w-4 h-4 ${entity.state === 'on' ? 'text-yellow-400' : 'text-muted-foreground'}`} />;
      case 'switch':
        return <Power className={`w-4 h-4 ${entity.state === 'on' ? 'text-green-400' : 'text-muted-foreground'}`} />;
      case 'climate':
        return <Thermometer className="w-4 h-4 text-blue-400" />;
      case 'sensor':
      case 'binary_sensor':
        return <Gauge className="w-4 h-4 text-purple-400" />;
      default:
        return <Home className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleEntityAction = async (entity: HomeAssistantEntity) => {
    const domain = getEntityDomain(entity.entity_id);
    
    switch (domain) {
      case 'light':
      case 'switch':
        await callEntityService(entity.entity_id, 'toggle');
        break;
      case 'climate':
        // For climate, we might want to show a temperature control
        break;
      default:
        // For sensors, just refresh
        await refreshEntities();
    }
  };

  const handleBrightnessChange = async (entity: HomeAssistantEntity, brightness: number[]) => {
    if (getEntityDomain(entity.entity_id) === 'light') {
      await callEntityService(entity.entity_id, 'turn_on', { brightness: brightness[0] });
    }
  };

  if (!config) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="mb-2">Home Assistant not configured</p>
            <p className="text-xs">Configure in Settings to get started</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!connected) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-destructive" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
          
          <div className="text-center py-8 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="mb-2">Connection failed</p>
            <p className="text-xs">Check your Home Assistant configuration</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshEntities}
              disabled={loading}
              className="mt-3"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
            <Badge variant="secondary" className="text-xs">
              {entities.length} entities
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllEntities(!showAllEntities)}
            >
              {showAllEntities ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshEntities}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Dashboard Entities */}
        {!showAllEntities && (
          <div className="space-y-3 mb-4">
            <h4 className="text-sm font-medium text-foreground">Dashboard Items</h4>
            {dashboardEntities.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No items added to dashboard</p>
                <p className="text-xs">Click the eye icon to browse and add entities</p>
              </div>
            ) : (
              dashboardEntities.slice(0, maxItems).map((entity) => {
                const widgetItem = widgetItems.find(item => item.entity_id === entity.entity_id);
                const domain = getEntityDomain(entity.entity_id);
                const isControllable = isControllableEntity(entity);
                
                return (
                  <div key={entity.entity_id} className="group p-3 bg-widget-bg/50 rounded-lg border border-widget-border hover:border-primary/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getEntityIcon(entity)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {entity.attributes.friendly_name || entity.entity_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatEntityState(entity)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Control based on entity type */}
                        {isControllable && domain === 'light' && entity.state === 'on' && entity.attributes.brightness && (
                          <div className="w-20">
                            <Slider
                              value={[entity.attributes.brightness || 0]}
                              max={255}
                              step={1}
                              onValueChange={(value) => handleBrightnessChange(entity, value)}
                              className="w-full"
                            />
                          </div>
                        )}
                        
                        {isControllable && (domain === 'light' || domain === 'switch') && (
                          <Switch
                            checked={entity.state === 'on'}
                            onCheckedChange={() => handleEntityAction(entity)}
                          />
                        )}
                        
                        {isControllable && domain === 'climate' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEntityAction(entity)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => widgetItem && removeWidgetItem(widgetItem.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Entity Browser */}
        {showAllEntities && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-foreground">Browse Entities</h4>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="text-xs bg-widget-bg border border-widget-border rounded px-2 py-1"
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableEntities.slice(0, 20).map((entity) => {
                const domain = getEntityDomain(entity.entity_id);
                const widgetType = getDefaultWidgetType(domain);
                
                return (
                  <div key={entity.entity_id} className="flex items-center justify-between p-2 bg-widget-bg/30 rounded border border-widget-border/50 hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getEntityIcon(entity)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {entity.attributes.friendly_name || entity.entity_id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {domain} • {formatEntityState(entity)}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addWidgetItem(entity, widgetType)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
              
              {availableEntities.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No entities available to add</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="mt-4 pt-4 border-t border-widget-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
              <span>{connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div>
              {config.last_sync && (
                <span>Last sync: {new Date(config.last_sync).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Helper function to determine default widget type based on domain
const getDefaultWidgetType = (domain: string): 'toggle' | 'sensor' | 'climate' | 'light' | 'cover' | 'media_player' => {
  switch (domain) {
    case 'light':
      return 'light';
    case 'switch':
    case 'input_boolean':
      return 'toggle';
    case 'climate':
      return 'climate';
    case 'cover':
      return 'cover';
    case 'media_player':
      return 'media_player';
    default:
      return 'sensor';
  }
};