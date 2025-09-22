import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Image, Play, Pause, SkipForward, SkipBack } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  title?: string;
  description?: string;
  date?: string;
}

interface PhotoWidgetProps {
  photos?: Photo[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  title?: string;
}

export const PhotoWidget: React.FC<PhotoWidgetProps> = ({
  photos = [],
  autoPlay = true,
  interval = 10000,
  showControls = true,
  title = 'Photos'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [loading, setLoading] = useState(true);
  const [defaultPhotos, setDefaultPhotos] = useState<Photo[]>([]);

  // Mock photo data for demo
  useEffect(() => {
    const mockPhotos: Photo[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        title: 'Mountain Landscape',
        description: 'Beautiful mountain view at sunrise',
        date: '2024-01-15'
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
        title: 'Forest Path',
        description: 'Peaceful walk through the woods',
        date: '2024-01-10'
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
        title: 'Ocean Waves',
        description: 'Calm ocean at sunset',
        date: '2024-01-05'
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
        title: 'Desert Dunes',
        description: 'Golden sand dunes at dawn',
        date: '2024-01-01'
      }
    ];

    setTimeout(() => {
      setDefaultPhotos(mockPhotos);
      setLoading(false);
    }, 500);
  }, []);

  const displayPhotos = photos.length > 0 ? photos : defaultPhotos;

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || displayPhotos.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, displayPhotos.length]);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (displayPhotos.length === 0) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          {title && (
            <div className="flex items-center gap-2 mb-4">
              <Image className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {title}
              </h3>
            </div>
          )}
          <div className="text-center py-8 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No photos available</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentPhoto = displayPhotos[currentIndex];

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300 group overflow-hidden">
      <div className="relative">
        {title && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <Image className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
        )}

        {/* Photo Display */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.title || 'Photo'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Photo Info */}
          {(currentPhoto.title || currentPhoto.description) && (
            <div className="absolute bottom-4 left-4 right-4 text-foreground">
              {currentPhoto.title && (
                <h4 className="font-semibold text-lg mb-1">{currentPhoto.title}</h4>
              )}
              {currentPhoto.description && (
                <p className="text-sm text-foreground/80">{currentPhoto.description}</p>
              )}
              {currentPhoto.date && (
                <p className="text-xs text-muted-foreground mt-1">{currentPhoto.date}</p>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && displayPhotos.length > 1 && (
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevPhoto}
              className="p-1 hover:bg-primary/20 rounded transition-colors duration-200"
              aria-label="Previous photo"
            >
              <SkipBack className="w-4 h-4 text-foreground" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-1 hover:bg-primary/20 rounded transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-foreground" />
              ) : (
                <Play className="w-4 h-4 text-foreground" />
              )}
            </button>
            
            <button
              onClick={nextPhoto}
              className="p-1 hover:bg-primary/20 rounded transition-colors duration-200"
              aria-label="Next photo"
            >
              <SkipForward className="w-4 h-4 text-foreground" />
            </button>
          </div>
        )}

        {/* Photo Indicators */}
        {displayPhotos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {displayPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-foreground/30 hover:bg-foreground/60'
                }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};