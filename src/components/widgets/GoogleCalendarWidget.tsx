import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Settings, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GoogleCalendarWidgetProps {
  title?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  color?: string;
}

export const GoogleCalendarWidget: React.FC<GoogleCalendarWidgetProps> = ({ title = "Calendar" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  useEffect(() => {
    if (userSettings?.google_calendar_enabled && userSettings?.google_calendar_id) {
      fetchCalendarEvents();
    } else {
      // Show demo events if not configured
      setEvents([
        {
          id: '1',
          title: 'Shift at Staff',
          start: new Date(2025, 8, 23, 9, 0),
          end: new Date(2025, 8, 23, 17, 0),
          location: 'Remote Development at PCC',
          color: 'bg-orange-500'
        },
        {
          id: '2',
          title: 'Council list due',
          start: new Date(2025, 8, 25, 10, 0),
          end: new Date(2025, 8, 25, 11, 0),
          color: 'bg-red-500'
        },
        {
          id: '3',
          title: 'Charlie training and trip',
          start: new Date(2025, 8, 15, 14, 0),
          end: new Date(2025, 8, 15, 16, 0),
          color: 'bg-purple-500'
        }
      ]);
    }
  }, [userSettings]);

  const loadUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (data) {
        setUserSettings(data);
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const fetchCalendarEvents = async () => {
    if (!userSettings?.google_calendar_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-calendar-events', {
        body: { calendarId: userSettings.google_calendar_id }
      });

      if (error) throw error;

      const formattedEvents = data.events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));

      setEvents(formattedEvents);
      toast({
        title: "Calendar synced",
        description: `Loaded ${formattedEvents.length} events from Google Calendar`
      });
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      toast({
        title: "Calendar sync failed",
        description: error.message || "Could not sync with Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      isSameDay(event.start, day) || 
      (event.start <= day && event.end >= day)
    );
  };

  const getDayClass = (day: Date) => {
    let classes = "relative p-2 text-sm min-h-[80px] border border-widget-border/30 ";
    
    if (!isSameMonth(day, currentDate)) {
      classes += "text-muted-foreground bg-muted/20 ";
    } else {
      classes += "text-foreground bg-widget-bg/50 hover:bg-widget-bg ";
    }
    
    if (isToday(day)) {
      classes += "ring-2 ring-primary bg-primary/10 ";
    }
    
    return classes;
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm h-full">
      <div className="p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {title}
          </h3>
          
          <div className="flex items-center gap-2">
            {userSettings?.google_calendar_enabled && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchCalendarEvents}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={previousMonth} className="p-2">
            ‹
          </Button>
          
          <h4 className="text-xl font-bold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h4>
          
          <Button variant="ghost" onClick={nextMonth} className="p-2">
            ›
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            
            return (
              <div key={`${day.toISOString()}-${index}`} className={getDayClass(day)}>
                <div className="font-medium mb-1">
                  {format(day, 'd')}
                  {isToday(day) && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-1 inline-block"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={`${event.id}-${eventIndex}`}
                      className={`text-xs p-1 rounded text-white truncate ${event.color || 'bg-primary'}`}
                      title={`${event.title} - ${format(event.start, 'HH:mm')}`}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Today's Events Summary */}
        <div className="mt-4 pt-4 border-t border-widget-border">
          <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Events
            {!userSettings?.google_calendar_enabled && (
              <span className="text-xs text-muted-foreground">(Demo)</span>
            )}
          </h5>
          
          {getEventsForDay(new Date()).length > 0 ? (
            <div className="space-y-2">
              {getEventsForDay(new Date()).map((event) => (
                <div key={event.id} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${event.color || 'bg-primary'}`}></div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{event.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                      {event.location && (
                        <span className="ml-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">No events today</p>
              {!userSettings?.google_calendar_enabled && (
                <p className="text-xs text-muted-foreground">
                  Enable Google Calendar in settings to sync real events
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};