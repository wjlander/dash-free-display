import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer, Droplets } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  description: string;
  feelsLike: number;
}

interface WeatherWidgetProps {
  location?: string;
  showForecast?: boolean;
  showDetails?: boolean;
  title?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  location = 'New York',
  showForecast = true,
  showDetails = true,
  title = 'Weather'
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock weather data for demo - replace with actual API call
  useEffect(() => {
    const mockWeatherData: WeatherData = {
      temperature: 22,
      condition: 'Partly Cloudy',
      humidity: 65,
      windSpeed: 12,
      icon: 'partly-cloudy',
      description: 'Partly cloudy with chance of rain',
      feelsLike: 24
    };

    setTimeout(() => {
      setWeather(mockWeatherData);
      setLoading(false);
    }, 1000);
  }, [location]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-12 h-12 text-warning" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-12 h-12 text-primary" />;
      case 'rainy':
      case 'rain':
        return <CloudRain className="w-12 h-12 text-primary" />;
      case 'snowy':
      case 'snow':
        return <CloudSnow className="w-12 h-12 text-primary" />;
      default:
        return <Cloud className="w-12 h-12 text-primary" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300 group">
      <div className="p-6">
        {title && (
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
            {title}
          </h3>
        )}
        
        <div className="space-y-4">
          {/* Main weather display */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-muted-foreground">
                Feels like {weather.feelsLike}°C
              </div>
            </div>
            <div className="text-center space-y-2 group-hover:scale-110 transition-transform duration-300">
              {getWeatherIcon(weather.condition)}
              <div className="text-sm font-medium text-foreground">
                {weather.condition}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="text-lg font-semibold text-foreground border-t border-widget-border pt-3">
            {location}
          </div>

          {/* Weather details */}
          {showDetails && (
            <div className="grid grid-cols-3 gap-4 text-center border-t border-widget-border pt-4">
              <div className="space-y-1">
                <Droplets className="w-5 h-5 mx-auto text-primary" />
                <div className="text-sm font-medium text-foreground">{weather.humidity}%</div>
                <div className="text-xs text-muted-foreground">Humidity</div>
              </div>
              <div className="space-y-1">
                <Wind className="w-5 h-5 mx-auto text-primary" />
                <div className="text-sm font-medium text-foreground">{weather.windSpeed} km/h</div>
                <div className="text-xs text-muted-foreground">Wind</div>
              </div>
              <div className="space-y-1">
                <Thermometer className="w-5 h-5 mx-auto text-primary" />
                <div className="text-sm font-medium text-foreground">{weather.feelsLike}°C</div>
                <div className="text-xs text-muted-foreground">Feels like</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-sm text-muted-foreground text-center italic">
            {weather.description}
          </div>
        </div>
      </div>
    </Card>
  );
};