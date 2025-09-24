import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Edit3 } from 'lucide-react';

interface NotesWidgetProps {
  title?: string;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({ title = "Quick Notes" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(`Dashboard Notes:
• Customize widgets in settings
• Use edit mode for layout changes
• Weather updates every 30 minutes
• Calendar syncs with Google Calendar

Today's Reminders:
- Check project status
- Update location settings
- Review analytics data`);

  const handleSave = () => {
    setIsEditing(false);
    // Here you could save to database
  };

  return (
    <Card className="h-full bg-gradient-glass border-widget-border shadow-widget backdrop-blur-sm">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </h3>
          <Button
            variant={isEditing ? "default" : "ghost"}
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-full resize-none bg-widget-bg/50 border-widget-border"
              placeholder="Add your notes here..."
            />
          ) : (
            <div className="w-full h-full overflow-y-auto">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {notes}
              </pre>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="mt-4 text-xs text-muted-foreground">
            Last edited: {new Date().toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};