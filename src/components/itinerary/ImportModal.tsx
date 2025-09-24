import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Trip } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { importTripFromJSON } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ImportModalProps {
  onClose: () => void;
  onImport: (trip: Trip) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ onClose, onImport }) => {
  const [jsonData, setJsonData] = useState('');
  const { toast } = useToast();

  const handleImport = () => {
    try {
      const trip = importTripFromJSON(jsonData);
      onImport(trip);
      toast({ title: "Import Successful", description: "Trip imported successfully!" });
    } catch (error) {
      toast({ 
        title: "Import Failed", 
        description: error instanceof Error ? error.message : "Invalid JSON data",
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Itinerary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your exported JSON data here..."
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleImport} disabled={!jsonData.trim()} className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Import Trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};