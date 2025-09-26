import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { DashboardScreen, WidgetLayoutItem } from '@/types/screen';

export const useScreens = () => {
  const [screens, setScreens] = useState<DashboardScreen[]>([]);
  const [currentScreen, setCurrentScreen] = useState<DashboardScreen | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadScreens();
    }
  }, [user]);

  const loadScreens = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_screens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedScreens = (data || []).map(screen => ({
        ...screen,
        layout_data: Array.isArray(screen.layout_data) ? screen.layout_data : []
      }));

      setScreens(formattedScreens);

      // Set first screen as current if none selected
      if (formattedScreens.length > 0 && !currentScreen) {
        setCurrentScreen(formattedScreens[0]);
      }
    } catch (error) {
      console.error('Error loading screens:', error);
      toast({
        title: "Error loading screens",
        description: "Could not load your dashboard screens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createScreen = async (name: string, description?: string) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_screens')
        .insert({
          user_id: user.id,
          name,
          description,
          layout_data: [],
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      const newScreen = {
        ...data,
        layout_data: Array.isArray(data.layout_data) ? data.layout_data : []
      };

      setScreens(prev => [newScreen, ...prev]);
      setCurrentScreen(newScreen);

      toast({
        title: "Screen created",
        description: `Screen "${name}" has been created successfully`
      });

      return newScreen;
    } catch (error) {
      console.error('Error creating screen:', error);
      toast({
        title: "Error creating screen",
        description: "Could not create the new screen",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateScreen = async (screenId: string, updates: Partial<DashboardScreen>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_screens')
        .update(updates)
        .eq('id', screenId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedScreen = {
        ...data,
        layout_data: Array.isArray(data.layout_data) ? data.layout_data : []
      };

      setScreens(prev => prev.map(screen => 
        screen.id === screenId ? updatedScreen : screen
      ));

      if (currentScreen?.id === screenId) {
        setCurrentScreen(updatedScreen);
      }

      toast({
        title: "Screen updated",
        description: "Screen has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating screen:', error);
      toast({
        title: "Error updating screen",
        description: "Could not update the screen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScreen = async (screenId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('dashboard_screens')
        .delete()
        .eq('id', screenId)
        .eq('user_id', user.id);

      if (error) throw error;

      setScreens(prev => prev.filter(screen => screen.id !== screenId));

      if (currentScreen?.id === screenId) {
        const remainingScreens = screens.filter(s => s.id !== screenId);
        setCurrentScreen(remainingScreens.length > 0 ? remainingScreens[0] : null);
      }

      toast({
        title: "Screen deleted",
        description: "Screen has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting screen:', error);
      toast({
        title: "Error deleting screen",
        description: "Could not delete the screen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePublicAccess = async (screenId: string) => {
    if (!user) return;

    const screen = screens.find(s => s.id === screenId);
    if (!screen) return;

    const newPublicState = !screen.is_public;
    const publicToken = newPublicState ? generatePublicToken() : null;

    await updateScreen(screenId, {
      is_public: newPublicState,
      public_token: publicToken
    });
  };

  const generatePublicToken = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const getPublicUrl = (screen: DashboardScreen) => {
    if (!screen.is_public || !screen.public_token) return null;
    return `${window.location.origin}/screen/${screen.public_token}`;
  };

  const loadPublicScreen = async (token: string): Promise<DashboardScreen | null> => {
    try {
      const { data, error } = await supabase
        .from('dashboard_screens')
        .select('*')
        .eq('public_token', token)
        .eq('is_public', true)
        .single();

      if (error) throw error;

      return {
        ...data,
        layout_data: Array.isArray(data.layout_data) ? data.layout_data : []
      };
    } catch (error) {
      console.error('Error loading public screen:', error);
      return null;
    }
  };

  const saveScreenLayout = async (screenId: string, layout: WidgetLayoutItem[]) => {
    await updateScreen(screenId, { layout_data: layout });
  };

  return {
    screens,
    currentScreen,
    loading,
    setCurrentScreen,
    createScreen,
    updateScreen,
    deleteScreen,
    togglePublicAccess,
    getPublicUrl,
    loadPublicScreen,
    saveScreenLayout,
    loadScreens
  };
};