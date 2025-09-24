// Itinerary data types and interfaces

export interface ItineraryEvent {
  id: string;
  title: string;
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  address: string;
  notes: string;
  transport: string;
  tags: string[];
  orderIndex: number;
  duration?: number; // in minutes
}

export interface ItineraryDay {
  date: string; // YYYY-MM-DD format
  events: ItineraryEvent[];
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  days: ItineraryDay[];
  timezone?: string;
}

export interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  notes: string;
}

export interface AppSettings {
  onboarded: boolean;
  show24h: boolean;
  timezone: string;
  preferredExportFormat: 'json' | 'csv' | 'ics';
  enableOnlineFeatures: boolean;
  apiKey?: string;
}

export type ViewMode = 'day-list' | 'timeline';

export interface DragEvent extends Event {
  dataTransfer: DataTransfer | null;
}

// Transport type options
export const TRANSPORT_TYPES = [
  'walk',
  'taxi',
  'subway',
  'bus',
  'train',
  'flight',
  'car',
  'bike'
] as const;

export type TransportType = typeof TRANSPORT_TYPES[number];

// Event tag options
export const EVENT_TAGS = [
  'sightseeing',
  'food',
  'shopping',
  'culture',
  'nature',
  'business',
  'rest',
  'transport'
] as const;

export type EventTag = typeof EVENT_TAGS[number];

// Storage keys
export const STORAGE_KEYS = {
  TRIPS: 'itinerary_trips',
  LOCATIONS: 'itinerary_locations',
  SETTINGS: 'itinerary_settings'
} as const;