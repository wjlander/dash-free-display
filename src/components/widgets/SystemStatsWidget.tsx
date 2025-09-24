import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Monitor, Cpu, HardDrive, Wifi, Battery } from 'lucide-react';

interface SystemStatsWidgetProps {
  title?: string;
}

interface SystemStats {
  cpu: number;
  memory: number;
  storage: number;
  network: 'online' | 'offline';
  uptime: string;
}

export const SystemStatsWidget: React.FC<SystemStatsWidgetProps> = ({ title = "System Status" }) => {
  const [stats, setStats] = useState<SystemStats>({
    cpu: 45,
    memory: 62,
    storage: 78,
    network: 'online',
    uptime: '2d 14h 23m'
  });

  useEffect(() => {
    // Simulate real-time stats updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.random() > 0.95 ? 'offline' : 'online'
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-success';
    if (value < 80) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            {title}
          </h3>
          <div className={`w-2 h-2 rounded-full ${
            stats.network === 'online' ? 'bg-success animate-pulse' : 'bg-destructive'
          }`} />
        </div>

        <div className="space-y-4">
          {/* CPU Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{stats.cpu.toFixed(0)}%</span>
            </div>
            <Progress value={stats.cpu} className="h-2" />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Memory</span>
              </div>
              <span className="text-sm text-muted-foreground">{stats.memory.toFixed(0)}%</span>
            </div>
            <Progress value={stats.memory} className="h-2" />
          </div>

          {/* Storage Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <span className="text-sm text-muted-foreground">{stats.storage}%</span>
            </div>
            <Progress value={stats.storage} className="h-2" />
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between p-2 bg-widget-bg/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${
                stats.network === 'online' ? 'text-success' : 'text-destructive'
              }`} />
              <span className="text-sm font-medium">Network</span>
            </div>
            <span className={`text-sm font-medium ${
              stats.network === 'online' ? 'text-success' : 'text-destructive'
            }`}>
              {stats.network === 'online' ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between p-2 bg-widget-bg/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Battery className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Uptime</span>
            </div>
            <span className="text-sm text-muted-foreground">{stats.uptime}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};