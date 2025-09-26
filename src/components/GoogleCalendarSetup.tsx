import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Shield, Key, Globe } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface GoogleCalendarSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GoogleCalendarSetup: React.FC<GoogleCalendarSetupProps> = ({ open, onOpenChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { config, calendars, loading, connected, startOAuthFlow, disconnect } = useGoogleCalendar();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const authUrl = await startOAuthFlow();
      
      // Open OAuth popup
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          // The OAuth callback will handle the token exchange
        }
      }, 1000);

    } catch (error: any) {
      console.error('Error starting OAuth flow:', error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-glass border-widget-border backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5" />
            Google Calendar Setup
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Connect your Google Calendar to display events on your dashboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          {connected && config ? (
            <Card className="p-4 bg-success/10 border-success/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <h3 className="font-semibold text-success">Connected to Google Calendar</h3>
                    <p className="text-sm text-muted-foreground">
                      Access expires: {new Date(config.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnect} disabled={loading}>
                  Disconnect
                </Button>
              </div>
              
              {calendars.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Available Calendars:</h4>
                  <div className="flex flex-wrap gap-2">
                    {calendars.slice(0, 5).map((calendar) => (
                      <Badge key={calendar.id} variant="secondary" className="text-xs">
                        {calendar.summary}
                        {calendar.primary && " (Primary)"}
                      </Badge>
                    ))}
                    {calendars.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{calendars.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4 bg-widget-bg border-widget-border">
              <div className="text-center space-y-4">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Connect Your Google Calendar
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Securely connect your Google Calendar to display events on your dashboard
                  </p>
                </div>
                
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="w-full max-w-xs"
                >
                  {isConnecting ? 'Connecting...' : 'Connect with Google'}
                </Button>
              </div>
            </Card>
          )}

          {/* Security Information */}
          <Card className="p-4 bg-widget-bg border-widget-border">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security & Privacy
            </h3>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Key className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">OAuth 2.0 Authentication</p>
                  <p>Uses Google's secure OAuth 2.0 protocol for authentication</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Read-Only Access</p>
                  <p>Only requests permission to read your calendar events</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Secure Token Storage</p>
                  <p>Tokens are encrypted and stored securely in your database</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Setup Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Setup Requirements:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Google Cloud Console project with Calendar API enabled</li>
                <li>OAuth 2.0 Client ID configured with correct redirect URI</li>
                <li>Environment variables set in your deployment</li>
              </ol>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google Cloud Console
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Features List */}
          <Card className="p-4 bg-widget-bg border-widget-border">
            <h3 className="font-semibold text-foreground mb-3">What You Get:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Access to all your private calendars
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Real-time event synchronization
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Automatic token refresh (no re-authentication needed)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Multiple calendar support
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Event colors and details preserved
              </li>
            </ul>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-widget-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};