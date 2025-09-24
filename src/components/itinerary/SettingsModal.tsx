import React from 'react';
import { Settings } from 'lucide-react';
import { AppSettings } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { clearAllData } from '@/hooks/useLocalStorage';

interface SettingsModalProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="show24h">24-hour time format</Label>
            <Switch
              id="show24h"
              checked={settings.show24h}
              onCheckedChange={(checked) => onUpdateSettings({ show24h: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="online">Enable online features</Label>
            <Switch
              id="online"
              checked={settings.enableOnlineFeatures}
              onCheckedChange={(checked) => onUpdateSettings({ enableOnlineFeatures: checked })}
            />
          </div>
          <div className="pt-4 border-t">
            <Button 
              variant="destructive" 
              onClick={handleClearData}
              className="w-full"
            >
              Clear All Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};