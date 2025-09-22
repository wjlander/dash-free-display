import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ClockWidgetProps {
  timezone?: string;
  format24h?: boolean;
  showSeconds?: boolean;
  showDate?: boolean;
  title?: string;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  timezone = 'local',
  format24h = false,
  showSeconds = true,
  showDate = true,
  title = 'Current Time'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    if (timezone === 'local') {
      return date.toLocaleTimeString([], {
        hour12: !format24h,
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
      });
    }
    
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: !format24h,
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
    });
  };

  const formatDate = (date: Date) => {
    if (timezone === 'local') {
      return date.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300 group">
      <div className="p-6">
        {title && (
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            {title}
          </h3>
        )}
        <div className="text-center space-y-2">
          <div className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent font-mono tracking-tight group-hover:scale-105 transition-transform duration-300">
            {formatTime(currentTime)}
          </div>
          {showDate && (
            <div className="text-lg md:text-xl text-foreground/80 font-medium">
              {formatDate(currentTime)}
            </div>
          )}
          {timezone !== 'local' && (
            <div className="text-sm text-muted-foreground">
              {timezone}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};