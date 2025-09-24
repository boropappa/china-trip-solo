// Timeline view component for visualizing events by time
import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { Trip, ItineraryEvent, FavoriteLocation } from '@/types/itinerary';
import { Button } from '@/components/ui/button';

interface TimelineViewProps {
  trip: Trip;
  selectedDate: string;
  events: ItineraryEvent[];
  locations: FavoriteLocation[];
  onUpdateTrip: (tripId: string, updates: Partial<Trip>) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  trip,
  selectedDate,
  events,
  locations,
  onUpdateTrip
}) => {
  // Generate hours from 6 AM to 10 PM
  const hours = Array.from({ length: 17 }, (_, i) => i + 6);
  
  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (!event.startTime) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const calculateEventHeight = (event: ItineraryEvent) => {
    if (!event.endTime) return 60; // Default 1 hour
    
    const [startHour, startMin] = event.startTime!.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    
    return Math.max(duration, 30); // Minimum 30 minutes display
  };

  const calculateEventPosition = (event: ItineraryEvent) => {
    if (!event.startTime) return 0;
    
    const [hour, minute] = event.startTime.split(':').map(Number);
    const baseHour = hour - 6; // Offset for 6 AM start
    const pixelsPerHour = 80;
    const pixelsPerMinute = pixelsPerHour / 60;
    
    return baseHour * pixelsPerHour + minute * pixelsPerMinute;
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
      {/* Timeline Header */}
      <div className="card-travel p-4">
        <h2 className="text-xl font-semibold">Timeline - {formatDate(selectedDate)}</h2>
        <p className="text-muted-foreground">
          {events.length} event{events.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Timeline */}
      <div className="card-travel p-4">
        <div className="relative">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            
            return (
              <div key={hour} className="timeline-hour" style={{ height: '80px' }}>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0 text-sm font-medium text-muted-foreground">
                    {formatHour(hour)}
                  </div>
                  
                  <div className="flex-1 relative">
                    {hourEvents.length === 0 ? (
                      <div className="h-full flex items-center text-muted-foreground text-sm">
                        <span className="opacity-50">No events</span>
                      </div>
                    ) : (
                      hourEvents.map((event, index) => {
                        const height = calculateEventHeight(event);
                        const minutes = event.startTime ? parseInt(event.startTime.split(':')[1]) : 0;
                        const topOffset = (minutes / 60) * 80;
                        
                        return (
                          <div
                            key={event.id}
                            className="timeline-event"
                            style={{
                              height: `${Math.min(height, 240)}px`,
                              top: `${topOffset}px`,
                              left: `${index * 4}px`,
                              zIndex: 10 + index
                            }}
                          >
                            <div className="p-3">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              
                              <div className="text-xs text-muted-foreground mt-1">
                                {event.startTime}
                                {event.endTime && ` - ${event.endTime}`}
                              </div>
                              
                              {event.address && (
                                <div className="text-xs text-muted-foreground mt-1 truncate">
                                  📍 {event.address}
                                </div>
                              )}
                              
                              {event.transport && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  🚗 {event.transport}
                                </div>
                              )}
                              
                              {event.tags.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {event.tags.slice(0, 2).map(tag => (
                                    <span
                                      key={tag}
                                      className="px-1 py-0.5 bg-accent-muted text-accent-foreground text-xs rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {event.tags.length > 2 && (
                                    <span className="text-xs text-muted-foreground">
                                      +{event.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Current Time Indicator */}
        <div className="absolute left-0 right-0 pointer-events-none">
          {(() => {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            if (currentHour >= 6 && currentHour <= 22) {
              const position = ((currentHour - 6) * 80) + (currentMinute / 60 * 80);
              
              return (
                <div
                  className="absolute left-20 right-4 h-0.5 bg-primary opacity-75 z-20"
                  style={{ top: `${position}px` }}
                >
                  <div className="absolute -left-2 -top-1 w-3 h-3 bg-primary rounded-full" />
                  <div className="absolute -right-12 -top-3 text-xs text-primary font-medium">
                    Now
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* Add Event Button */}
      <Button className="btn-travel w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Event to Timeline
      </Button>

      {/* Timeline Legend */}
      <div className="card-travel p-4">
        <h4 className="font-medium mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Timeline Guide
        </h4>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Each hour slot is 80px tall</p>
          <p>• Events are positioned based on their start time</p>
          <p>• Overlapping events are offset slightly</p>
          <p>• Red line indicates current time (if within 6 AM - 10 PM)</p>
        </div>
      </div>
    </div>
  );
};