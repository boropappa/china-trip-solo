// Trip header component with trip selector and progress
import React, { useState } from 'react';
import { ChevronDown, Plus, Edit3, Trash2, MapPin, Calendar } from 'lucide-react';
import { Trip } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface TripHeaderProps {
  trips: Trip[];
  activeTrip: Trip | null;
  onTripChange: (trip: Trip) => void;
  onCreateTrip: () => void;
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const TripHeader: React.FC<TripHeaderProps> = ({
  trips,
  activeTrip,
  onTripChange,
  onCreateTrip,
  onUpdateTrip,
  onDeleteTrip
}) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip({ ...trip });
    setShowEditDialog(true);
  };

  const handleSaveTrip = () => {
    if (!editingTrip) return;
    
    onUpdateTrip(editingTrip.id, {
      title: editingTrip.title,
      destination: editingTrip.destination,
      startDate: editingTrip.startDate,
      endDate: editingTrip.endDate
    });
    
    setShowEditDialog(false);
    setEditingTrip(null);
  };

  const handleDeleteTrip = (tripId: string) => {
    if (confirm('Are you sure you want to delete this trip?')) {
      onDeleteTrip(tripId);
    }
  };

  const getProgressInfo = (trip: Trip) => {
    const totalDays = trip.days.length;
    const daysWithEvents = trip.days.filter(day => day.events.length > 0).length;
    return { daysWithEvents, totalDays };
  };

  if (!activeTrip) return null;

  const { daysWithEvents, totalDays } = getProgressInfo(activeTrip);
  const progressPercentage = totalDays > 0 ? (daysWithEvents / totalDays) * 100 : 0;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {/* Trip Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-left justify-start p-2 text-white hover:bg-white/10">
              <div>
                <h1 className="text-xl font-bold">{activeTrip.title}</h1>
                <div className="flex items-center text-sm text-white/80">
                  <MapPin className="w-3 h-3 mr-1" />
                  {activeTrip.destination}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="start">
            {trips.map((trip) => (
              <DropdownMenuItem
                key={trip.id}
                onClick={() => onTripChange(trip)}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <div className="font-medium">{trip.title}</div>
                  <div className="text-sm text-muted-foreground">{trip.destination}</div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTrip(trip);
                    }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  {trips.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onCreateTrip}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-4">
        {/* Trip Dates */}
        <div className="flex items-center text-sm text-white/80">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(activeTrip.startDate).toLocaleDateString()} - {new Date(activeTrip.endDate).toLocaleDateString()}
        </div>

        {/* Progress Indicator */}
        <div className="text-right">
          <div className="text-sm text-white/80">Progress</div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-white font-medium">
              {daysWithEvents}/{totalDays}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Trip Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>
          {editingTrip && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Trip Title</Label>
                <Input
                  id="title"
                  value={editingTrip.title}
                  onChange={(e) => setEditingTrip({ ...editingTrip, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={editingTrip.destination}
                  onChange={(e) => setEditingTrip({ ...editingTrip, destination: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={editingTrip.startDate}
                    onChange={(e) => setEditingTrip({ ...editingTrip, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={editingTrip.endDate}
                    onChange={(e) => setEditingTrip({ ...editingTrip, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTrip} className="btn-travel">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};