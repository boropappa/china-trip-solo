// Export/Import utilities for itinerary data
import { Trip, ItineraryEvent } from '@/types/itinerary';

// Export trip as JSON
export function exportTripAsJSON(trip: Trip): string {
  return JSON.stringify(trip, null, 2);
}

// Export trip as CSV
export function exportTripAsCSV(trip: Trip): string {
  const headers = [
    'Date',
    'Start Time',
    'End Time', 
    'Title',
    'Address',
    'Transport',
    'Tags',
    'Notes',
    'Duration (min)'
  ];

  const rows = [];
  
  // Add header row
  rows.push(headers.join(','));
  
  // Add event rows
  trip.days.forEach(day => {
    day.events.forEach(event => {
      const row = [
        day.date,
        event.startTime || '',
        event.endTime || '',
        `"${event.title.replace(/"/g, '""')}"`,
        `"${event.address.replace(/"/g, '""')}"`,
        event.transport,
        `"${event.tags.join(';')}"`,
        `"${event.notes.replace(/"/g, '""')}"`,
        event.duration || ''
      ];
      rows.push(row.join(','));
    });
  });
  
  return rows.join('\n');
}

// Export trip as ICS calendar file
export function exportTripAsICS(trip: Trip): string {
  const now = new Date();
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//China Itinerary Planner//EN',
    `X-WR-CALNAME:${trip.title}`,
    'X-WR-TIMEZONE:' + (trip.timezone || 'Asia/Shanghai'),
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  trip.days.forEach(day => {
    day.events.forEach(event => {
      if (!event.startTime) return; // Skip events without start time
      
      const eventDate = new Date(`${day.date}T${event.startTime}:00`);
      const endDate = event.endTime 
        ? new Date(`${day.date}T${event.endTime}:00`)
        : new Date(eventDate.getTime() + (event.duration || 60) * 60000);

      ics.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@itinerary-planner.local`,
        `DTSTART:${formatDate(eventDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.notes}\\n\\nTransport: ${event.transport}\\nTags: ${event.tags.join(', ')}`,
        `LOCATION:${event.address}`,
        `CREATED:${formatDate(now)}`,
        `LAST-MODIFIED:${formatDate(now)}`,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      );
    });
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

// Export trip as plain text
export function exportTripAsText(trip: Trip): string {
  const lines = [];
  
  lines.push(`${trip.title}`);
  lines.push(`Destination: ${trip.destination}`);
  lines.push(`${trip.startDate} to ${trip.endDate}`);
  lines.push('=' .repeat(50));
  lines.push('');

  trip.days.forEach(day => {
    const dayDate = new Date(day.date);
    const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    lines.push(`${dayName}, ${dayDate.toLocaleDateString()}`);
    lines.push('-'.repeat(30));
    
    if (day.events.length === 0) {
      lines.push('  No events planned');
    } else {
      day.events
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
        .forEach(event => {
          const time = event.startTime 
            ? `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`
            : 'Time TBD';
          
          lines.push(`  ${time}: ${event.title}`);
          if (event.address) lines.push(`    📍 ${event.address}`);
          if (event.transport) lines.push(`    🚗 ${event.transport}`);
          if (event.notes) lines.push(`    📝 ${event.notes}`);
          if (event.tags.length > 0) lines.push(`    🏷️  ${event.tags.join(', ')}`);
          lines.push('');
        });
    }
    lines.push('');
  });

  return lines.join('\n');
}

// Download file utility
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    return false;
  }
}

// Import trip from JSON
export function importTripFromJSON(jsonString: string): Trip {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate required fields
    if (!data.title || !data.destination || !data.startDate || !data.endDate) {
      throw new Error('Invalid trip data: missing required fields');
    }
    
    // Ensure proper structure
    const trip: Trip = {
      id: data.id || crypto.randomUUID(),
      title: data.title,
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      timezone: data.timezone,
      days: (data.days || []).map((day: any) => ({
        date: day.date,
        events: (day.events || []).map((event: any, index: number) => ({
          id: event.id || crypto.randomUUID(),
          title: event.title || 'Untitled Event',
          startTime: event.startTime,
          endTime: event.endTime,
          address: event.address || '',
          notes: event.notes || '',
          transport: event.transport || '',
          tags: Array.isArray(event.tags) ? event.tags : [],
          orderIndex: event.orderIndex !== undefined ? event.orderIndex : index,
          duration: event.duration
        }))
      }))
    };
    
    return trip;
  } catch (error) {
    throw new Error(`Failed to import trip: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}