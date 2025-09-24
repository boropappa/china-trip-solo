// Day selector component for choosing active day
import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Trip } from '@/types/itinerary';

interface DaySelectorProps {
  trip: Trip;
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  trip,
  selectedDate,
  onDateSelect
}) => {
  const getDayInfo = (date: string) => {
    const day = trip.days.find(d => d.date === date);
    const eventCount = day?.events.length || 0;
    const hasEvents = eventCount > 0;
    
    return { eventCount, hasEvents };
  };

  const formatDayLabel = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    return { dayName, dayNumber, monthName };
  };

  return (
    <div className="card-travel">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Trip Days
        </h3>
        <p className="text-sm text-muted-foreground">
          {trip.days.length} day{trip.days.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="p-2 space-y-1 max-h-96 overflow-y-auto">
        {trip.days.map((day, index) => {
          const { eventCount, hasEvents } = getDayInfo(day.date);
          const { dayName, dayNumber, monthName } = formatDayLabel(day.date);
          const isSelected = selectedDate === day.date;
          
          return (
            <button
              key={day.date}
              onClick={() => onDateSelect(day.date)}
              className={`day-selector w-full ${isSelected ? 'active' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      Day {index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dayName}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {monthName} {dayNumber}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasEvents && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {eventCount}
                    </div>
                  )}
                  <div className={`w-2 h-2 rounded-full ${
                    hasEvents ? 'bg-success' : 'bg-muted'
                  }`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};