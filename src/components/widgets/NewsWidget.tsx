import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Rss, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface NewsWidgetProps {
  maxItems?: number;
  category?: string;
  title?: string;
  showImages?: boolean;
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({
  maxItems = 5,
  category = 'general',
  title = 'Latest News',
  showImages = false
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock news data for demo - replace with actual RSS/API integration
  useEffect(() => {
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Latest Technology Advances in AI Development',
        summary: 'Researchers have made significant breakthroughs in artificial intelligence, opening new possibilities for automation and machine learning.',
        url: '#',
        publishedAt: '2 hours ago',
        source: 'Tech News',
        category: 'technology'
      },
      {
        id: '2',
        title: 'Global Climate Summit Announces New Initiatives',
        summary: 'World leaders gather to discuss comprehensive strategies for addressing climate change and sustainable development goals.',
        url: '#',
        publishedAt: '4 hours ago',
        source: 'Global News',
        category: 'environment'
      },
      {
        id: '3',
        title: 'Market Analysis: Technology Sector Shows Strong Growth',
        summary: 'Financial experts report continued expansion in tech markets with particular strength in cloud computing and renewable energy.',
        url: '#',
        publishedAt: '6 hours ago',
        source: 'Business Today',
        category: 'business'
      },
      {
        id: '4',
        title: 'Space Exploration Mission Reaches New Milestone',
        summary: 'International space agencies celebrate successful deployment of advanced research equipment on the International Space Station.',
        url: '#',
        publishedAt: '8 hours ago',
        source: 'Science Daily',
        category: 'science'
      },
      {
        id: '5',
        title: 'Renewable Energy Projects Accelerate Worldwide',
        summary: 'Countries increase investment in solar and wind power infrastructure, aiming for carbon neutrality by 2050.',
        url: '#',
        publishedAt: '12 hours ago',
        source: 'Environmental Report',
        category: 'environment'
      }
    ];

    setTimeout(() => {
      setNews(mockNews.slice(0, maxItems));
      setLoading(false);
    }, 1200);
  }, [maxItems, category]);

  if (loading) {
    return (
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-4/5"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm hover:shadow-glow transition-all duration-300">
      <div className="p-6">
        {title && (
          <div className="flex items-center gap-2 mb-4">
            <Rss className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
        )}

        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Rss className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No news available</p>
            </div>
          ) : (
            news.map((item, index) => (
              <article key={item.id} className="group hover:bg-muted/30 rounded-lg p-3 transition-all duration-200 cursor-pointer border-l-2 border-transparent hover:border-primary">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors duration-200">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                        {item.source}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.publishedAt}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="mt-4 text-center border-t border-widget-border pt-4">
          <button className="text-sm text-primary hover:text-primary-glow transition-colors duration-200 flex items-center gap-1 mx-auto">
            <Rss className="w-4 h-4" />
            View more news
          </button>
        </div>
      </div>
    </Card>
  );
};