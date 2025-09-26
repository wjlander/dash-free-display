import { supabase } from '@/integrations/supabase/client';
import { GoogleCalendarConfig, CalendarEvent, GoogleCalendarList } from '@/types/calendar';

export class GoogleCalendarAPI {
  private static instance: GoogleCalendarAPI;
  private config: GoogleCalendarConfig | null = null;

  static getInstance(): GoogleCalendarAPI {
    if (!GoogleCalendarAPI.instance) {
      GoogleCalendarAPI.instance = new GoogleCalendarAPI();
    }
    return GoogleCalendarAPI.instance;
  }

  async initializeConfig(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('google_calendar_configs')
      .eq('user_id', userId)
      .select('*')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading Google Calendar config:', error);
      this.config = null;
      throw error;
    }

    this.config = data || null;
  }

  async saveConfig(config: Omit<GoogleCalendarConfig, 'id' | 'created_at' | 'updated_at'>): Promise<GoogleCalendarConfig> {
    const { data, error } = await supabase
      .from('google_calendar_configs')
      .upsert(config)
      .select()
      .single();

    if (error) throw error;

    this.config = data;
    return data;
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google Client ID not configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    const { data, error } = await supabase.functions.invoke('google-oauth-token', {
      body: { code, redirectUri }
    });

    if (error) throw error;
    return data;
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.config?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const { data, error } = await supabase.functions.invoke('google-oauth-refresh', {
      body: { refreshToken: this.config.refresh_token }
    });

    if (error) throw error;

    // Update stored tokens
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    
    await supabase
      .from('google_calendar_configs')
      .update({
        access_token: data.access_token,
        expires_at: expiresAt.toISOString()
      })
      .eq('id', this.config.id);

    this.config = {
      ...this.config,
      access_token: data.access_token,
      expires_at: expiresAt.toISOString()
    };

    return data.access_token;
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error('Google Calendar not configured');
    }

    const now = new Date();
    const expiresAt = new Date(this.config.expires_at);

    if (now >= expiresAt) {
      return await this.refreshAccessToken();
    }

    return this.config.access_token;
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getValidAccessToken();
    
    return fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  async getCalendarList(): Promise<GoogleCalendarList[]> {
    const response = await this.makeAuthenticatedRequest(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList'
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar list: ${response.statusText}`);
    }

    const data = await response.json();
    return data.items || [];
  }

  async getEvents(calendarId: string = 'primary', timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '50',
    });

    if (timeMin) {
      params.append('timeMin', timeMin.toISOString());
    } else {
      params.append('timeMin', new Date().toISOString());
    }

    if (timeMax) {
      params.append('timeMax', timeMax.toISOString());
    } else {
      params.append('timeMax', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    }

    const response = await this.makeAuthenticatedRequest(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
    }

    const data = await response.json();
    
    return (data.items || []).map((event: any) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
      location: event.location,
      description: event.description,
      allDay: !event.start?.dateTime,
      calendarId: calendarId,
      color: this.getEventColor(event),
    }));
  }

  private getEventColor(event: any): string {
    const colorMap: { [key: string]: string } = {
      '1': 'bg-blue-500',
      '2': 'bg-green-500',
      '3': 'bg-purple-500',
      '4': 'bg-red-500',
      '5': 'bg-yellow-500',
      '6': 'bg-orange-500',
      '7': 'bg-cyan-500',
      '8': 'bg-gray-500',
      '9': 'bg-indigo-500',
      '10': 'bg-emerald-500',
      '11': 'bg-pink-500',
    };
    
    return colorMap[event.colorId] || 'bg-primary';
  }

  async disconnect(userId: string): Promise<void> {
    await supabase
      .from('google_calendar_configs')
      .delete()
      .eq('user_id', userId);

    this.config = null;
  }
}