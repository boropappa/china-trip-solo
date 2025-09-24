// Events list component for day view
import React, { useState } from 'react';
import { Plus, GripVertical, Edit, Trash2, Clock, MapPin, Car } from 'lucide-react';
import { Trip, ItineraryEvent, FavoriteLocation } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { EventForm } from './EventForm';
import { useToast } from '@/hooks/use-toast';

interface EventsListProps {
  trip: Trip;
  selectedDate: string;
  events: ItineraryEvent[];
  locations: FavoriteLocation[];
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  trip,
  selectedDate,
  events,
  locations,
  onUpdateTrip
}) => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ItineraryEvent | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<ItineraryEvent | null>(null);
  const { toast } = useToast();

  const sortedEvents = events.sort((a, b) => {
    if (!a.startTime && !b.startTime) return a.orderIndex - b.orderIndex;
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return a.startTime.localeCompare(b.startTime);
  });

  const updateDayEvents = (updatedEvents: ItineraryEvent[]) => {
    const updatedDays = trip.days.map(day => 
      day.date === selectedDate 
        ? { ...day, events: updatedEvents }
        : day
    );
    
    onUpdateTrip(trip.id, { days: updatedDays });
  };

  const handleAddEvent = (newEvent: Omit<ItineraryEvent, 'id' | 'orderIndex'>) => {
    const event: ItineraryEvent = {
      ...newEvent,
      id: crypto.randomUUID(),
      orderIndex: events.length
    };
    
    updateDayEvents([...events, event]);
    setShowAddEvent(false);
    
    toast({
      title: "Event Added",
      description: "New event has been added to your itinerary!"
    });
  };

  const handleEditEvent = (updatedEvent: ItineraryEvent) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    
    updateDayEvents(updatedEvents);
    setEditingEvent(null);
    
    toast({
      title: "Event Updated",
      description: "Event has been updated successfully!"
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      updateDayEvents(updatedEvents);
      
      toast({
        title: "Event Deleted",
        description: "Event has been removed from your itinerary."
      });
    }
  };

  const handleDragStart = (event: ItineraryEvent) => {
    setDraggedEvent(event);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetEvent: ItineraryEvent) => {
    if (!draggedEvent || draggedEvent.id === targetEvent.id) return;

    const reorderedEvents = [...events];
    const draggedIndex = reorderedEvents.findIndex(e => e.id === draggedEvent.id);
    const targetIndex = reorderedEvents.findIndex(e => e.id === targetEvent.id);

    reorderedEvents.splice(draggedIndex, 1);
    reorderedEvents.splice(targetIndex, 0, draggedEvent);

    // Update order indices
    const updatedEvents = reorderedEvents.map((event, index) => ({
      ...event,
      orderIndex: index
    }));

    updateDayEvents(updatedEvents);
    setDraggedEvent(null);

    toast({
      title: "Events Reordered",
      description: "Event order has been updated!"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="card-travel p-4">
        <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
        <p className="text-muted-foreground">
          {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} planned
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="card-travel p-8 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No events planned</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start planning your day by adding your first event
            </p>
            <Button onClick={() => setShowAddEvent(true)} className="btn-travel">
              <Plus className="w-4 h-4 mr-2" />
              Add First Event
            </Button>
          </div>
        ) : (
          <>
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                draggable
                onDragStart={() => handleDragStart(event)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(event)}
                className={`event-card ${draggedEvent?.id === event.id ? 'dragging' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button className="drag-handle mt-1">
                    <GripVertical className="w-4 h-4" />
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {event.startTime && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </div>
                          )}
                          
                          {event.address && (
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.address}
                            </div>
                          )}
                          
                          {event.transport && (
                            <div className="flex items-center">
                              <Car className="w-3 h-3 mr-1" />
                              {event.transport}
                            </div>
                          )}
                        </div>
                        
                        {event.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.notes}
                          </p>
                        )}
                        
                        {event.tags.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {event.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-accent-muted text-accent-foreground text-xs rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button
              onClick={() => setShowAddEvent(true)}
              className="btn-travel w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </>
        )}
      </div>

      {/* Add/Edit Event Form */}
      {(showAddEvent || editingEvent) && (
        <EventForm
          event={editingEvent}
          locations={locations}
          onSave={editingEvent ? handleEditEvent : handleAddEvent}
          onCancel={() => {
            setShowAddEvent(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};