import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Home, Cloud, Wifi, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useHomeAssistant } from '@/hooks/useHomeAssistant';

interface HomeAssistantSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HomeAssistantSetup: React.FC<HomeAssistantSetupProps> = ({ open, onOpenChange }) => {
  const [haUrl, setHaUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [connectionType, setConnectionType] = useState<'local' | 'cloud'>('local');
  const [testing, setTesting] = useState(false);
  
  const { config, saveConfig, loading } = useHomeAssistant();

  const handleSave = async () => {
    setTesting(true);
    const success = await saveConfig(haUrl, accessToken, connectionType);
    setTesting(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isFormValid = haUrl && accessToken && validateUrl(haUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-glass border-widget-border backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Home className="w-5 h-5" />
            Home Assistant Setup
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Home Assistant instance to control smart home devices from your dashboard
          </DialogDescription>
        </DialogHeader>

        <Tabs value={connectionType} onValueChange={(value) => setConnectionType(value as 'local' | 'cloud')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local" className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Local Instance
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Home Assistant Cloud
            </TabsTrigger>
          </TabsList>

          <TabsContent value="local" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Local Home Assistant
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="local-url">Home Assistant URL</Label>
                  <Input
                    id="local-url"
                    value={haUrl}
                    onChange={(e) => setHaUrl(e.target.value)}
                    placeholder="http://homeassistant.local:8123"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your local Home Assistant URL (e.g., http://192.168.1.100:8123)
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Setup Instructions:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to your Home Assistant → Profile → Long-Lived Access Tokens</li>
                      <li>Click "Create Token" and give it a name (e.g., "Dashboard")</li>
                      <li>Copy the generated token and paste it below</li>
                      <li>Make sure your Home Assistant is accessible from this device</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-4">
            <Card className="p-4 bg-widget-bg border-widget-border">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                Home Assistant Cloud
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cloud-url">Remote URL</Label>
                  <Input
                    id="cloud-url"
                    value={haUrl}
                    onChange={(e) => setHaUrl(e.target.value)}
                    placeholder="https://your-instance.ui.nabu.casa"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your Home Assistant Cloud remote URL
                  </p>
                </div>

                <Alert>
                  <Cloud className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Cloud Setup:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Ensure you have Home Assistant Cloud subscription</li>
                      <li>Enable Remote Control in Cloud settings</li>
                      <li>Create a Long-Lived Access Token as described above</li>
                      <li>Use your remote URL (*.ui.nabu.casa)</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Access Token Input */}
        <div className="space-y-2">
          <Label htmlFor="access-token" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Long-Lived Access Token
          </Label>
          <Input
            id="access-token"
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Enter your Home Assistant access token"
          />
          <p className="text-xs text-muted-foreground">
            This token will be stored securely and used to communicate with your Home Assistant
          </p>
        </div>

        {/* Current Configuration */}
        {config && (
          <Card className="p-3 bg-success/10 border-success/20">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Currently Connected</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config.ha_url} ({config.connection_type})
            </p>
            <p className="text-xs text-muted-foreground">
              Last sync: {config.last_sync ? new Date(config.last_sync).toLocaleString() : 'Never'}
            </p>
          </Card>
        )}

        {/* Help Links */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Need Help?</h4>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.home-assistant.io/docs/authentication/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Authentication Docs
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.home-assistant.io/cloud/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Cloud Setup
              </a>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-widget-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid || testing || loading}
          >
            {testing ? 'Testing Connection...' : 'Save & Connect'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};