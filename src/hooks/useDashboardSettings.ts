import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface DashboardSettings {
  visible_widgets: string[];
  theme_variant: string;
  widget_order: string[];
  google_calendar_enabled: boolean;
  location_tracking_enabled: boolean;
  display_name: string | null;
  [key: string]: any; // Allow additional properties from database
}

export interface DashboardLayout {
  id: string;
  layout_name: string;
  layout_data: any[];
  is_active: boolean;
  [key: string]: any; // Allow additional properties from database
}

export const useDashboardSettings = () => {
  const [settings, setSettings] = useState<DashboardSettings>({
    visible_widgets: ['clock', 'weather', 'calendar', 'location'],
    theme_variant: 'default',
    widget_order: [],
    google_calendar_enabled: false,
    location_tracking_enabled: false,
    display_name: null
  });

  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSettings();
      loadLayouts();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create default settings
        const defaultSettings = {
          user_id: user.id,
          visible_widgets: ['clock', 'weather', 'calendar', 'location'],
          theme_variant: 'default',
          widget_order: [],
          google_calendar_enabled: false,
          location_tracking_enabled: false,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        };
        
        try {
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (insertError) throw insertError;
          const formattedNewSettings = {
            ...newSettings,
            visible_widgets: Array.isArray(newSettings.visible_widgets) ? newSettings.visible_widgets as string[] : ['clock', 'weather', 'calendar', 'location'],
            widget_order: Array.isArray(newSettings.widget_order) ? newSettings.widget_order as string[] : []
          };
          setSettings(formattedNewSettings);
        } catch (insertError: any) {
          // If insert fails due to duplicate key (race condition), retry fetching
          if (insertError.code === '23505') {
            const { data: retryData, error: retryError } = await supabase
              .from('user_settings')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (retryError) throw retryError;
            if (retryData) {
              const formattedRetrySettings = {
                ...retryData,
                visible_widgets: Array.isArray(retryData.visible_widgets) ? retryData.visible_widgets as string[] : ['clock', 'weather', 'calendar', 'location'],
                widget_order: Array.isArray(retryData.widget_order) ? retryData.widget_order as string[] : []
              };
              setSettings(formattedRetrySettings);
            }
          } else {
            throw insertError;
          }
        }
      } else if (data) {
        // Ensure arrays are properly typed
        const formattedSettings = {
          ...data,
          visible_widgets: Array.isArray(data.visible_widgets) ? data.visible_widgets as string[] : ['clock', 'weather', 'calendar', 'location'],
          widget_order: Array.isArray(data.widget_order) ? data.widget_order as string[] : []
        };
        setSettings(formattedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadLayouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Ensure layout_data is properly typed
      const formattedLayouts = (data || []).map(layout => ({
        ...layout,
        layout_data: Array.isArray(layout.layout_data) ? layout.layout_data : []
      }));
      setLayouts(formattedLayouts);
    } catch (error) {
      console.error('Error loading layouts:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<DashboardSettings>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('user_settings')
        .update(updatedSettings)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSettings(updatedSettings);
      
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully"
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: "Could not save your preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveLayout = async (layoutName: string, layoutData: any[]) => {
    if (!user) return;

    setLoading(true);
    try {
      // Deactivate current active layout
      await supabase
        .from('dashboard_layouts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Save new layout
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert({
          user_id: user.id,
          layout_name: layoutName,
          layout_data: layoutData,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await loadLayouts();
      
      toast({
        title: "Layout saved",
        description: `Layout "${layoutName}" has been saved successfully`
      });
    } catch (error) {
      console.error('Error saving layout:', error);
      toast({
        title: "Error saving layout",
        description: "Could not save your layout",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLayout = async (layoutId: string) => {
    if (!user) return null;

    try {
      // Deactivate current active layout
      await supabase
        .from('dashboard_layouts')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Activate selected layout
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .update({ is_active: true })
        .eq('id', layoutId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await loadLayouts();
      
      toast({
        title: "Layout loaded",
        description: `Layout "${data.layout_name}" has been activated`
      });

      return data.layout_data;
    } catch (error) {
      console.error('Error loading layout:', error);
      toast({
        title: "Error loading layout",
        description: "Could not load the selected layout",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteLayout = async (layoutId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .delete()
        .eq('id', layoutId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadLayouts();
      
      toast({
        title: "Layout deleted",
        description: "Layout has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting layout:', error);
      toast({
        title: "Error deleting layout",
        description: "Could not delete the layout",
        variant: "destructive"
      });
    }
  };

  return {
    settings,
    layouts,
    loading,
    updateSettings,
    saveLayout,
    loadLayout,
    deleteLayout,
    loadSettings,
    loadLayouts
  };
};