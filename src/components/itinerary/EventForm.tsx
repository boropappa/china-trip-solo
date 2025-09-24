// Event form component for adding/editing events
import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, Car, Tag } from 'lucide-react';
import { ItineraryEvent, FavoriteLocation, TRANSPORT_TYPES, EVENT_TAGS } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventFormProps {
  event?: ItineraryEvent | null;
  locations: FavoriteLocation[];
  onSave: (event: ItineraryEvent | Omit<ItineraryEvent, 'id' | 'orderIndex'>) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  locations,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    address: '',
    notes: '',
    transport: '',
    tags: [] as string[],
    duration: 60
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        address: event.address,
        notes: event.notes,
        transport: event.transport,
        tags: event.tags,
        duration: event.duration || 60
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    const eventData = {
      title: formData.title.trim(),
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      transport: formData.transport,
      tags: formData.tags,
      duration: formData.duration
    };

    if (event) {
      onSave({ ...event, ...eventData });
    } else {
      onSave(eventData);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setFormData(prev => ({
        ...prev,
        address: location.address,
        notes: prev.notes ? `${prev.notes}\n${location.notes}` : location.notes
      }));
    }
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return '';
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (startTime: string) => {
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime: startTime ? calculateEndTime(startTime, prev.duration) : ''
    }));
  };

  const handleDurationChange = (duration: number) => {
    setFormData(prev => ({
      ...prev,
      duration,
      endTime: prev.startTime ? calculateEndTime(prev.startTime, duration) : prev.endTime
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Visit Great Wall of China"
              className="form-input"
              required
            />
          </div>

          {/* Time Section */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="startTime" className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="720"
                step="15"
                value={formData.duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 60)}
                className="form-input"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          {/* Location Section */}
          <div>
            <Label htmlFor="address" className="flex items-center justify-between">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                Address/Location
              </span>
              {locations.length > 0 && (
                <Select onValueChange={handleLocationSelect}>
                  <SelectTrigger className="w-32 h-6 text-xs">
                    <SelectValue placeholder="Quick add" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="e.g., Mutianyu Section, Huairou District, Beijing"
              className="form-input"
            />
          </div>

          {/* Transport */}
          <div>
            <Label htmlFor="transport" className="flex items-center">
              <Car className="w-3 h-3 mr-1" />
              Transportation
            </Label>
            <Select
              value={formData.transport}
              onValueChange={(value) => setFormData(prev => ({ ...prev, transport: value }))}
            >
              <SelectTrigger className="form-select">
                <SelectValue placeholder="Select transportation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No transportation specified</SelectItem>
                {TRANSPORT_TYPES.map((transport) => (
                  <SelectItem key={transport} value={transport}>
                    {transport.charAt(0).toUpperCase() + transport.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <Label className="flex items-center mb-2">
              <Tag className="w-3 h-3 mr-1" />
              Event Tags
            </Label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes, tips, or reminders..."
              className="form-input min-h-[80px] resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="btn-travel flex-1">
              {event ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};