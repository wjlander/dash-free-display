import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Calendar, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react';

export const GoogleOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthFlow } = useGoogleCalendar();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        setTimeout(() => {
          window.close();
        }, 3000);
        return;
      }

      try {
        const success = await completeOAuthFlow(code);
        
        if (success) {
          setStatus('success');
          setMessage('Google Calendar connected successfully!');
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Failed to complete authorization');
          setTimeout(() => {
            window.close();
          }, 3000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An unexpected error occurred');
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, completeOAuthFlow]);

  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
      <Card className="bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm max-w-md w-full">
        <div className="p-8 text-center">
          <div className="mb-6">
            {status === 'processing' && (
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            )}
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Google Calendar
            </h1>
          </div>

          <p className="text-muted-foreground mb-4">
            {message}
          </p>

          {status === 'success' && (
            <p className="text-sm text-success">
              This window will close automatically...
            </p>
          )}

          {status === 'error' && (
            <p className="text-sm text-muted-foreground">
              This window will close automatically...
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};