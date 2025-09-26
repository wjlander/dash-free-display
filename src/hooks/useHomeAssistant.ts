import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { HomeAssistantAPI } from '@/lib/homeassistant';
import { HomeAssistantEntity, HomeAssistantConfig, HomeAssistantWidgetItem } from '@/types/homeassistant';

export const useHomeAssistant = () => {
  const [config, setConfig] = useState<HomeAssistantConfig | null>(null);
  const [entities, setEntities] = useState<HomeAssistantEntity[]>([]);
  const [widgetItems, setWidgetItems] = useState<HomeAssistantWidgetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [api, setApi] = useState<HomeAssistantAPI | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadConfig();
      loadWidgetItems();
    }
  }, [user]);

  useEffect(() => {
    if (config && config.is_connected) {
      initializeAPI();
    }
  }, [config]);

  const loadConfig = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('home_assistant_configs')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setConfig(data);
    } catch (error) {
      console.error('Error loading Home Assistant config:', error);
    }
  };

  const loadWidgetItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('home_assistant_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWidgetItems(data || []);
    } catch (error) {
      console.error('Error loading widget items:', error);
    }
  };

  const initializeAPI = async () => {
    if (!config) return;

    try {
      const haApi = new HomeAssistantAPI(config.ha_url, config.access_token);
      
      // Test connection
      const isConnected = await haApi.testConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to Home Assistant');
      }

      setApi(haApi);
      setConnected(true);

      // Load entities
      const entitiesData = await haApi.getStates();
      setEntities(entitiesData);

      // Connect WebSocket for real-time updates
      await haApi.connectWebSocket((entity) => {
        setEntities(prev => prev.map(e => 
          e.entity_id === entity.entity_id ? entity : e
        ));
      });

      toast({
        title: "Home Assistant connected",
        description: `Loaded ${entitiesData.length} entities`
      });
    } catch (error: any) {
      console.error('Error initializing Home Assistant API:', error);
      setConnected(false);
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to Home Assistant",
        variant: "destructive"
      });
    }
  };

  const saveConfig = async (haUrl: string, accessToken: string, connectionType: 'local' | 'cloud') => {
    if (!user) return false;

    setLoading(true);
    try {
      // Test connection first
      const testApi = new HomeAssistantAPI(haUrl, accessToken);
      const isConnected = await testApi.testConnection();
      
      if (!isConnected) {
        throw new Error('Could not connect to Home Assistant. Please check your URL and access token.');
      }

      const configData = {
        user_id: user.id,
        ha_url: haUrl,
        access_token: accessToken,
        connection_type: connectionType,
        is_connected: true,
        last_sync: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('home_assistant_configs')
        .upsert(configData)
        .select()
        .single();

      if (error) throw error;

      setConfig(data);
      
      toast({
        title: "Home Assistant configured",
        description: "Successfully connected to your Home Assistant instance"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Configuration failed",
        description: error.message || "Could not save Home Assistant configuration",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addWidgetItem = async (entity: HomeAssistantEntity, widgetType: HomeAssistantWidgetItem['widget_type']) => {
    if (!user) return;

    try {
      const widgetItem: Omit<HomeAssistantWidgetItem, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        entity_id: entity.entity_id,
        display_name: entity.attributes.friendly_name || entity.entity_id,
        widget_type: widgetType,
        position: {
          x: 0,
          y: 0,
          w: 2,
          h: 1
        },
        config: {
          show_icon: true,
          show_state: true,
          show_attributes: []
        }
      };

      const { data, error } = await supabase
        .from('home_assistant_widgets')
        .insert(widgetItem)
        .select()
        .single();

      if (error) throw error;

      setWidgetItems(prev => [data, ...prev]);
      
      toast({
        title: "Widget added",
        description: `Added ${entity.attributes.friendly_name || entity.entity_id} to dashboard`
      });
    } catch (error: any) {
      toast({
        title: "Failed to add widget",
        description: error.message || "Could not add widget to dashboard",
        variant: "destructive"
      });
    }
  };

  const removeWidgetItem = async (widgetId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('home_assistant_widgets')
        .delete()
        .eq('id', widgetId)
        .eq('user_id', user.id);

      if (error) throw error;

      setWidgetItems(prev => prev.filter(item => item.id !== widgetId));
      
      toast({
        title: "Widget removed",
        description: "Widget has been removed from dashboard"
      });
    } catch (error: any) {
      toast({
        title: "Failed to remove widget",
        description: error.message || "Could not remove widget",
        variant: "destructive"
      });
    }
  };

  const updateWidgetItem = async (widgetId: string, updates: Partial<HomeAssistantWidgetItem>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('home_assistant_widgets')
        .update(updates)
        .eq('id', widgetId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setWidgetItems(prev => prev.map(item => 
        item.id === widgetId ? data : item
      ));
    } catch (error: any) {
      toast({
        title: "Failed to update widget",
        description: error.message || "Could not update widget",
        variant: "destructive"
      });
    }
  };

  const callEntityService = async (entityId: string, action: string, serviceData?: Record<string, any>) => {
    if (!api) return;

    try {
      const domain = entityId.split('.')[0];
      await api.callService({
        domain,
        service: action,
        target: { entity_id: entityId },
        service_data: serviceData
      });

      // Refresh entity state
      const updatedEntity = await api.getState(entityId);
      setEntities(prev => prev.map(e => 
        e.entity_id === entityId ? updatedEntity : e
      ));
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.message || "Could not execute action",
        variant: "destructive"
      });
    }
  };

  const refreshEntities = async () => {
    if (!api) return;

    setLoading(true);
    try {
      const entitiesData = await api.getStates();
      setEntities(entitiesData);
      
      // Update last sync time
      if (config) {
        await supabase
          .from('home_assistant_configs')
          .update({ last_sync: new Date().toISOString() })
          .eq('id', config.id);
      }
    } catch (error: any) {
      toast({
        title: "Refresh failed",
        description: error.message || "Could not refresh entities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (api) {
      api.disconnectWebSocket();
      setApi(null);
    }
    
    setConnected(false);
    setEntities([]);

    if (config) {
      await supabase
        .from('home_assistant_configs')
        .update({ is_connected: false })
        .eq('id', config.id);
      
      setConfig(prev => prev ? { ...prev, is_connected: false } : null);
    }
  };

  return {
    config,
    entities,
    widgetItems,
    loading,
    connected,
    api,
    saveConfig,
    addWidgetItem,
    removeWidgetItem,
    updateWidgetItem,
    callEntityService,
    refreshEntities,
    disconnect,
    loadConfig,
    loadWidgetItems
  };
};