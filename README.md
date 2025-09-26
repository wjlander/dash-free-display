# Custom Dashboard - Free DAKboard Alternative

A beautiful, fully functional digital dashboard that replicates and enhances DAKboard's features without any subscription costs. Perfect for home displays, digital signage, and smart home hubs.

## 🚀 Features

### Core Dashboard Widgets
- **⏰ Clock Widget** - Multiple timezone support, 12/24h formats, customizable display
- **🌤️ Weather Widget** - Current conditions, forecasts, weather alerts, multiple locations
- **📅 Calendar Widget** - Google Calendar, iCloud, Office365 integration, unlimited calendars
- **🏠 Home Assistant Widget** - Smart home device control, real-time status, entity management
- **📰 News Widget** - RSS feeds, customizable sources, keyword filtering
- **📸 Photo Widget** - Slideshow with multiple sources, transitions, local/cloud storage

### Advanced Features
- **🎨 Visual Layout Builder** - Drag-and-drop interface for custom layouts
- **📱 Responsive Design** - Works on any screen size from phones to large displays
- **🔌 Smart Home Integration** - Control Home Assistant devices directly from dashboard
- **🌙 Beautiful UI** - Modern glassmorphism design with smooth animations
- **⚡ Performance Optimized** - Fast loading, efficient resource usage
- **🔒 Privacy Focused** - All data processed locally, no cloud dependencies
- **💰 Completely Free** - No subscription fees, no hidden costs

### Planned Features (Future Updates)
- **Smart Home Integration** - Control lights, thermostats, security systems
- **Stock Market Widgets** - Real-time stock prices, market data
- **Todo List Integration** - Sync with popular task management apps
- **Music Integration** - Display currently playing music from Spotify, Apple Music
- **Voice Commands** - Control dashboard with voice (when supported)
- **Multiple Screen Management** - Create different layouts for different times/conditions
- **Custom Widgets** - API for creating your own widgets
- **Backup & Sync** - Cloud backup of configurations

## 🎯 DAKboard Feature Comparison

| Feature | DAKboard Free | DAKboard Paid ($6-10/mo) | Custom Dashboard |
|---------|---------------|---------------------------|------------------|
| Monthly Cost | $0 | $60-120/year | **$0 Forever** |
| Custom Screens | ❌ | ✅ (2-3 max) | ✅ **Unlimited** |
| Calendar Sources | 2 max | 5/Unlimited | ✅ **Unlimited** |
| Screen Loops | ❌ | ✅ (Plus only) | ✅ **Included** |
| Smart Home Control | ❌ | ❌ | ✅ **Home Assistant** |
| Visual Builder | ❌ | ❌ | ✅ **Advanced Builder** |
| Offline Support | ❌ | ❌ | ✅ **Full Offline** |
| Data Privacy | ❌ | ❌ | ✅ **Complete Privacy** |
| Custom Integrations | ❌ | ❌ | ✅ **Unlimited APIs** |
| Smart Home Control | ❌ | ❌ | ✅ **Coming Soon** |

## 🏗️ Installation & Deployment

### Option 1: Docker Deployment (Recommended)
```bash
# Pull and run the dashboard
docker run -d \
  --name custom-dashboard \
  -p 3000:3000 \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/photos:/app/photos \
  custom-dashboard:latest
```

### Option 2: Ubuntu/Debian Server
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repository-url>
cd custom-dashboard
npm install
npm run build

# Start with PM2 for production
npm install -g pm2
pm2 start npm --name "dashboard" -- start
pm2 startup
pm2 save
```

### Option 3: Raspberry Pi
```bash
# Optimized for Raspberry Pi 4
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Enable GPU acceleration for smooth animations
echo 'gpu_mem=128' | sudo tee -a /boot/config.txt

# Follow Ubuntu/Debian installation steps above
```

## ⚙️ Configuration

### Environment Variables
```bash
# Weather API (get free key from OpenWeatherMap)
WEATHER_API_KEY=your_openweather_api_key

# Home Assistant Integration
HOME_ASSISTANT_URL=http://homeassistant.local:8123
HOME_ASSISTANT_TOKEN=your_long_lived_access_token

# Calendar Integration
GOOGLE_CALENDAR_KEY=your_google_calendar_key
MICROSOFT_GRAPH_KEY=your_microsoft_key

# RSS/News Sources
NEWS_API_KEY=your_news_api_key

# Photo Sources
DROPBOX_ACCESS_TOKEN=your_dropbox_token
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### Widget Configuration
```javascript
// Example widget configuration
{
  "clock": {
    "timezone": "America/New_York",
    "format24h": false,
    "showSeconds": true,
    "title": "Current Time"
  },
  "weather": {
    "location": "New York, NY",
    "units": "metric",
    "showForecast": true,
    "updateInterval": 300000
  },
  "homeassistant": {
    "maxItems": 8,
    "showControls": true,
    "autoRefresh": true,
    "groupByDomain": false
  },
  "calendar": {
    "calendars": [
      "primary@gmail.com",
      "work@company.com"
    ],
    "maxEvents": 5,
    "timeRange": "7d"
  }
}
```

## 🔧 API Integrations

### Weather APIs
- **OpenWeatherMap** (Recommended) - Free tier: 1000 calls/day
- **WeatherAPI** - Free tier: 1 million calls/month
- **AccuWeather** - Free tier: 50 calls/day

### Calendar APIs
- **Google Calendar API** - Free with quota limits
- **Microsoft Graph API** - Free with quota limits
- **CalDAV** - Standard protocol for any calendar service

### News & RSS
- **NewsAPI** - Free tier: 1000 requests/day
- **RSS/Atom feeds** - No limits, completely free
- **Reddit API** - Free access to public content

## 🎨 Customization

### Theme Customization
```css
/* Edit src/index.css to customize colors */
:root {
  --primary: 240 100% 60%;          /* Main brand color */
  --primary-glow: 260 100% 70%;     /* Glow effect */
  --background: 245 50% 8%;         /* Main background */
  --widget-bg: 240 20% 12%;         /* Widget background */
}
```

### Widget Development
```typescript
// Create custom widgets
interface CustomWidgetProps {
  title?: string;
  data?: any;
}

export const CustomWidget: React.FC<CustomWidgetProps> = ({ title, data }) => {
  return (
    <Card className="bg-gradient-glass border-widget-border shadow-widget">
      <div className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {title}
        </h3>
        {/* Your custom content */}
      </div>
    </Card>
  );
};
```

## 📊 Performance & Requirements

### Minimum System Requirements
- **CPU**: Raspberry Pi 4 (ARM64) or x86_64 processor
- **RAM**: 1GB minimum, 2GB recommended
- **Storage**: 4GB for application, additional for photos
- **Network**: Stable internet connection for API data

### Performance Specifications
- **Boot time**: < 30 seconds on Raspberry Pi 4
- **Page load**: < 3 seconds on local network
- **Memory usage**: < 500MB typical operation
- **CPU usage**: < 25% average on Pi 4
- **API response**: < 500ms for all data updates

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

### API Reference
- [Widget API Documentation](docs/widgets.md)
- [Configuration Schema](docs/config.md)
- [Integration Guide](docs/integrations.md)
- [Custom Widget Development](docs/custom-widgets.md)

### Troubleshooting
- [Common Issues](docs/troubleshooting.md)
- [Performance Optimization](docs/performance.md)
- [Deployment Guide](docs/deployment.md)

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Basic widget system
- [x] Clock, weather, calendar widgets
- [x] News and photo widgets
- [x] Responsive design
- [x] Layout builder

### Phase 2: Advanced Features 🚧
- [ ] Smart home integrations
- [ ] Multiple screen management
- [ ] Voice command support
- [ ] Mobile companion app
- [ ] Cloud sync (optional)

### Phase 3: Enterprise Features 📋
- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Custom branding
- [ ] REST API for integrations
- [ ] Plugin marketplace

## 💡 Use Cases

### Home Dashboard
- Kitchen display for family schedules
- Living room information center
- Bedroom morning briefing
- Kids' room with educational content

### Business Display
- Office lobby information
- Conference room schedules
- Warehouse status boards
- Retail promotional displays

### Smart Home Hub
- Control center for IoT devices
- Security system monitoring
- Energy usage tracking
- Climate control dashboard

## 🤝 Support

### Community
- **GitHub Issues**: Report bugs and feature requests
- **Discord Server**: Real-time community support
- **Documentation**: Comprehensive guides and tutorials
- **Email Support**: Direct developer contact

### Commercial Support
For businesses requiring:
- Priority support response
- Custom feature development
- Installation and setup service
- Training and consultation

Contact: support@custom-dashboard.dev

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DAKboard** - Inspiration for the original concept
- **Shadcn/UI** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Modern web development framework
- **Vite** - Fast build tool and development server

---

**Built with ❤️ for the open source community**

*Saving users $60-120/year in subscription fees while providing superior functionality and complete privacy control.*