import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Edit3, 
  Maximize, 
  Settings, 
  Download, 
  Upload, 
  Monitor,
  Palette,
  RotateCcw
} from 'lucide-react';

interface DashboardControlsProps {
  editMode: boolean;
  onToggleEdit: () => void;
  onToggleFullscreen: () => void;
  onExportConfig: () => void;
  onImportConfig: () => void;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  editMode,
  onToggleEdit,
  onToggleFullscreen,
  onExportConfig,
  onImportConfig
}) => {
  return (
    <Card className="m-4 mb-0 bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left section - Dashboard title */}
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Custom Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Free DAKboard Alternative
              </p>
            </div>
          </div>

          {/* Center section - Quick actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleEdit}
              className="transition-all duration-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {editMode ? 'Exit Edit' : 'Edit Layout'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              className="transition-all duration-200"
            >
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>

          {/* Right section - Settings and actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportConfig}
              className="hidden sm:flex transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onImportConfig}
              className="hidden sm:flex transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          <Button
            variant={editMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleEdit}
            className="flex-1 min-w-0"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {editMode ? 'Exit Edit' : 'Edit'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
            className="flex-1 min-w-0"
          >
            <Maximize className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExportConfig}
            className="flex-1 min-w-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Status indicators */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>5 Widgets Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Screen: Default</span>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};