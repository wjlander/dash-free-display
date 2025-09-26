import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Plus, CreditCard as Edit3, Trash2, Eye, EyeOff, Copy, ExternalLink, Settings, Globe } from 'lucide-react';
import { useScreens } from '@/hooks/useScreens';
import { DashboardScreen } from '@/types/screen';

interface ScreenManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScreenManager: React.FC<ScreenManagerProps> = ({ open, onOpenChange }) => {
  const { 
    screens, 
    currentScreen, 
    loading, 
    setCurrentScreen, 
    createScreen, 
    updateScreen, 
    deleteScreen, 
    togglePublicAccess, 
    getPublicUrl 
  } = useScreens();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingScreen, setEditingScreen] = useState<DashboardScreen | null>(null);
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenDescription, setNewScreenDescription] = useState('');

  const handleCreateScreen = async () => {
    if (!newScreenName.trim()) return;

    const screen = await createScreen(newScreenName, newScreenDescription);
    if (screen) {
      setNewScreenName('');
      setNewScreenDescription('');
      setShowCreateForm(false);
    }
  };

  const handleUpdateScreen = async () => {
    if (!editingScreen || !newScreenName.trim()) return;

    await updateScreen(editingScreen.id, {
      name: newScreenName,
      description: newScreenDescription
    });

    setEditingScreen(null);
    setNewScreenName('');
    setNewScreenDescription('');
  };

  const copyPublicUrl = async (screen: DashboardScreen) => {
    const url = getPublicUrl(screen);
    if (url) {
      await navigator.clipboard.writeText(url);
      // Toast notification would be handled by the hook
    }
  };

  const startEdit = (screen: DashboardScreen) => {
    setEditingScreen(screen);
    setNewScreenName(screen.name);
    setNewScreenDescription(screen.description || '');
  };

  const cancelEdit = () => {
    setEditingScreen(null);
    setNewScreenName('');
    setNewScreenDescription('');
    setShowCreateForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gradient-glass border-widget-border backdrop-blur-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Monitor className="w-5 h-5" />
            Screen Manager
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Screen */}
          <Card className="p-4 bg-widget-bg border-widget-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Dashboard Screens</h3>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                size="sm"
                disabled={showCreateForm || editingScreen}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Screen
              </Button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <div className="mb-6 p-4 bg-muted/20 rounded-lg border border-widget-border">
                <h4 className="font-medium mb-3">Create New Screen</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="screen-name">Screen Name</Label>
                    <Input
                      id="screen-name"
                      value={newScreenName}
                      onChange={(e) => setNewScreenName(e.target.value)}
                      placeholder="e.g., Living Room Display, Office Dashboard"
                    />
                  </div>
                  <div>
                    <Label htmlFor="screen-description">Description (Optional)</Label>
                    <Textarea
                      id="screen-description"
                      value={newScreenDescription}
                      onChange={(e) => setNewScreenDescription(e.target.value)}
                      placeholder="Describe the purpose of this screen..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateScreen} disabled={loading || !newScreenName.trim()}>
                      Create Screen
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Screens List */}
            <div className="space-y-3">
              {screens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg mb-2">No screens created yet</p>
                  <p className="text-sm">Create your first dashboard screen to get started</p>
                </div>
              ) : (
                screens.map((screen) => (
                  <div 
                    key={screen.id}
                    className={`p-4 rounded-lg border transition-all ${
                      currentScreen?.id === screen.id 
                        ? 'border-primary bg-primary/10' 
                        : 'border-widget-border bg-widget-bg/50 hover:border-primary/50'
                    }`}
                  >
                    {editingScreen?.id === screen.id ? (
                      /* Edit Form */
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="edit-screen-name">Screen Name</Label>
                          <Input
                            id="edit-screen-name"
                            value={newScreenName}
                            onChange={(e) => setNewScreenName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-screen-description">Description</Label>
                          <Textarea
                            id="edit-screen-description"
                            value={newScreenDescription}
                            onChange={(e) => setNewScreenDescription(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleUpdateScreen} disabled={loading}>
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-foreground">{screen.name}</h4>
                            {currentScreen?.id === screen.id && (
                              <Badge variant="default" className="text-xs">Current</Badge>
                            )}
                            {screen.is_public && (
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                Public
                              </Badge>
                            )}
                          </div>
                          
                          {screen.description && (
                            <p className="text-sm text-muted-foreground mb-2">{screen.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{screen.layout_data.length} widgets</span>
                            <span>Created {new Date(screen.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Public URL */}
                          {screen.is_public && screen.public_token && (
                            <div className="mt-3 p-2 bg-muted/30 rounded border">
                              <div className="flex items-center gap-2 mb-1">
                                <ExternalLink className="w-3 h-3" />
                                <span className="text-xs font-medium">Public URL:</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                                  {getPublicUrl(screen)}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyPublicUrl(screen)}
                                  className="p-1 h-auto"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {/* Select Screen */}
                          {currentScreen?.id !== screen.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentScreen(screen)}
                            >
                              Select
                            </Button>
                          )}

                          {/* Toggle Public Access */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublicAccess(screen.id)}
                            disabled={loading}
                            title={screen.is_public ? "Make private" : "Make public"}
                          >
                            {screen.is_public ? (
                              <Eye className="w-4 h-4 text-success" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>

                          {/* Edit Screen */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(screen)}
                            disabled={loading || editingScreen !== null}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>

                          {/* Delete Screen */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteScreen(screen.id)}
                            disabled={loading || screens.length === 1}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Usage Instructions */}
          <Card className="p-4 bg-widget-bg border-widget-border">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              How to Use Multiple Screens
            </h3>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Create Multiple Screens</p>
                  <p>Create different screens for different purposes (home display, office dashboard, etc.)</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Customize Each Layout</p>
                  <p>Select a screen and use the layout builder to configure widgets for that specific screen</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Enable Public Access</p>
                  <p>Click the eye icon to make a screen public and get a shareable URL for remote displays</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">4</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Display on Remote Screens</p>
                  <p>Use the public URL on any device or browser - no login required for viewing</p>
                </div>
              </div>
            </div>
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