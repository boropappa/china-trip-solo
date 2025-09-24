import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Welcome to China Itinerary Planner!
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>Plan your perfect trip to China with this offline-first planner:</p>
          <ul className="space-y-2 ml-4">
            <li>• Create trips and add daily events</li>
            <li>• Drag and drop to reorder events</li>
            <li>• Switch between day list and timeline views</li>
            <li>• Export as JSON, CSV, or calendar files</li>
            <li>• Works completely offline</li>
          </ul>
          <Button onClick={onClose} className="w-full btn-travel">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};