import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  color: string;
}

interface CalendarWidgetProps {
  maxEvents?: number;
  showUpcoming?: boolean;
  title?: string;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  maxEvents = 5,
  showUpcoming = true,
  title = 'Calendar'
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock calendar data for demo - replace with actual calendar API integration
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        startTime: '09:00',
        endTime: '10:00',
        date: 'Today',
        location: 'Conference Room A',
        color: 'bg-primary'
      },
      {
        id: '2',
        title: 'Project Review',
        startTime: '14:30',
        endTime: '15:30',
        date: 'Today',
        color: 'bg-accent'
      },
      {
        id: '3',
        title: 'Client Call',
        startTime: '11:00',
        endTime: '12:00',
        date: 'Tomorrow',
        color: 'bg-success'
      },
      {
        id: '4',
        title: 'Workshop',
        startTime: '16:00',
        endTime: '17:30',
        date: 'Tomorrow',
        location: 'Main Hall',
        color: 'bg-warning'
      },
      {
        id: '5',
        title: 'Lunch with Sarah',
        startTime: '12:30',
        endTime: '13:30',
        date: 'Friday',
        location: 'Downtown Cafe',
        color: 'bg-accent'
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents.slice(0, maxEvents));
      setLoading(false);
    }, 800);
  }, [maxEvents]);

  if (loading) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const upcomingEvents = showUpcoming 
    ? events.filter(event => event.date === 'Today' || event.date === 'Tomorrow')
    : events;

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300">
      <div className="p-6">
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
        )}

        <div className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div key={event.id} className="group hover:bg-muted/30 rounded-lg p-3 transition-colors duration-200">
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${event.color} mt-2 group-hover:scale-125 transition-transform duration-200`}></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors duration-200">
                        {event.title}
                      </h4>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {event.date}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {events.length > maxEvents && (
          <div className="mt-4 text-center">
            <button className="text-sm text-primary hover:text-primary-glow transition-colors duration-200">
              View {events.length - maxEvents} more events
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};