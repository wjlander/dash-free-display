import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';
import { GoogleCalendarAPI } from '@/lib/googleCalendar';
import { CalendarEvent, GoogleCalendarConfig, GoogleCalendarList } from '@/types/calendar';

export const useGoogleCalendar = () => {
  const [config, setConfig] = useState<GoogleCalendarConfig | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<GoogleCalendarList[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const api = GoogleCalendarAPI.getInstance();

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;

    try {
      await api.initializeConfig(user.id);
      
      // Only proceed if configuration was successfully loaded
      if (api.config) {
        setConnected(true);
        await loadCalendars();
        await loadEvents();
      } else {
        setConnected(false);
      }
    } catch (error) {
      console.error('Error loading Google Calendar config:', error);
      setConnected(false);
    }
  };

  const startOAuthFlow = async (): Promise<string> => {
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    return await api.getAuthUrl(redirectUri);
  };

  const completeOAuthFlow = async (code: string): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const tokenData = await api.exchangeCodeForTokens(code, redirectUri);

      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

      const configData: Omit<GoogleCalendarConfig, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        scope: tokenData.scope || 'https://www.googleapis.com/auth/calendar.readonly',
        is_connected: true
      };

      const savedConfig = await api.saveConfig(configData);
      setConfig(savedConfig);
      setConnected(true);

      await loadCalendars();
      await loadEvents();

      toast({
        title: "Google Calendar connected",
        description: "Successfully connected to your Google Calendar"
      });

      return true;
    } catch (error: any) {
      console.error('Error completing OAuth flow:', error);
      toast({
        title: "Connection failed",
        description: error.message || "Could not connect to Google Calendar",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadCalendars = async () => {
    try {
      const calendarList = await api.getCalendarList();
      setCalendars(calendarList);
    } catch (error: any) {
      console.error('Error loading calendars:', error);
      toast({
        title: "Failed to load calendars",
        description: error.message || "Could not load calendar list",
        variant: "destructive"
      });
    }
  };

  const loadEvents = async (calendarId: string = 'primary') => {
    setLoading(true);
    try {
      const calendarEvents = await api.getEvents(calendarId);
      setEvents(calendarEvents);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast({
        title: "Failed to load events",
        description: error.message || "Could not load calendar events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshEvents = async () => {
    if (!connected) return;
    await loadEvents();
  };

  const disconnect = async () => {
    if (!user) return;

    try {
      await api.disconnect(user.id);
      setConfig(null);
      setConnected(false);
      setEvents([]);
      setCalendars([]);

      toast({
        title: "Google Calendar disconnected",
        description: "Your Google Calendar has been disconnected"
      });
    } catch (error: any) {
      toast({
        title: "Disconnect failed",
        description: error.message || "Could not disconnect Google Calendar",
        variant: "destructive"
      });
    }
  };

  return {
    config,
    events,
    calendars,
    loading,
    connected,
    startOAuthFlow,
    completeOAuthFlow,
    loadEvents,
    refreshEvents,
    disconnect,
    loadConfig
  };
};