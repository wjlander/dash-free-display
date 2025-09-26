import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard as Edit3, Move, Maximize, Settings, Download, Upload, Monitor, Palette, RotateCcw, LogOut, User, Layers } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useScreens } from '@/hooks/useScreens';
import { EnhancedSettingsDialog } from './EnhancedSettingsDialog';
import { ScreenManager } from './ScreenManager';

interface DashboardControlsProps {
  editMode: boolean;
  onToggleEdit: () => void;
  onToggleVisualEdit?: () => void;
  onToggleFullscreen: () => void;
  onExportConfig: () => void;
  onImportConfig: () => void;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  editMode,
  onToggleEdit,
  onToggleVisualEdit,
  onToggleFullscreen,
  onExportConfig,
  onImportConfig
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showScreenManager, setShowScreenManager] = useState(false);
  const { user, signOut } = useAuth();
  const { currentScreen, screens } = useScreens();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return (
    <Card className="m-4 mb-0 bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left section - Dashboard title */}
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-primary" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {currentScreen?.name || 'Custom Dashboard'}
                </h1>
                {currentScreen?.is_public && (
                  <span className="text-xs bg-success/20 text-success px-2 py-1 rounded">Public</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {currentScreen?.description || 'Free DAKboard Alternative'}
              </p>
            </div>
          </div>

          {/* Center section - Quick actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScreenManager(true)}
              className="transition-all duration-200"
            >
              <Layers className="w-4 h-4 mr-2" />
              Screens ({screens.length})
            </Button>

            <Button
              variant={editMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleEdit}
              className="transition-all duration-200"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {editMode ? 'Exit Edit' : 'Edit Layout'}
            </Button>

            {onToggleVisualEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleVisualEdit}
                className="transition-all duration-200"
              >
                <Move className="w-4 h-4 mr-2" />
                Visual Edit
              </Button>
            )}

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
              onClick={() => setShowSettings(true)}
              className="transition-all duration-200"
            >
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="transition-all duration-200"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User info and mobile controls */}
        <div className="md:hidden mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowScreenManager(true)}
            className="flex-1 min-w-0"
          >
            <Layers className="w-4 h-4 mr-2" />
            Screens
          </Button>

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
            <span>Screen: {currentScreen?.name || 'Default'}</span>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <EnhancedSettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      
      <ScreenManager 
        open={showScreenManager} 
        onOpenChange={setShowScreenManager} 
      />
    </Card>
  );
};