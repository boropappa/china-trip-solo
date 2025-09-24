import React from 'react';
import { Download, Copy } from 'lucide-react';
import { Trip } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportTripAsJSON, exportTripAsCSV, exportTripAsICS, exportTripAsText, downloadFile, copyToClipboard } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  trip: Trip;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ trip, onClose }) => {
  const { toast } = useToast();

  const handleExport = (format: string) => {
    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (format) {
        case 'json':
          content = exportTripAsJSON(trip);
          filename = `${trip.title.replace(/[^a-z0-9]/gi, '_')}.json`;
          mimeType = 'application/json';
          break;
        case 'csv':
          content = exportTripAsCSV(trip);
          filename = `${trip.title.replace(/[^a-z0-9]/gi, '_')}.csv`;
          mimeType = 'text/csv';
          break;
        case 'ics':
          content = exportTripAsICS(trip);
          filename = `${trip.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
          mimeType = 'text/calendar';
          break;
        default:
          return;
      }

      downloadFile(content, filename, mimeType);
      toast({ title: "Export Successful", description: `Trip exported as ${format.toUpperCase()}` });
    } catch (error) {
      toast({ title: "Export Failed", description: "Failed to export trip", variant: "destructive" });
    }
  };

  const handleCopyText = async () => {
    try {
      const text = exportTripAsText(trip);
      const success = await copyToClipboard(text);
      if (success) {
        toast({ title: "Copied!", description: "Itinerary copied to clipboard" });
      }
    } catch (error) {
      toast({ title: "Copy Failed", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Itinerary</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button onClick={() => handleExport('json')} className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button onClick={() => handleExport('csv')} className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
          <Button onClick={() => handleExport('ics')} className="w-full justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export as Calendar (ICS)
          </Button>
          <Button onClick={handleCopyText} className="w-full justify-start">
            <Copy className="w-4 h-4 mr-2" />
            Copy as Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};