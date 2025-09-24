// LocalStorage hooks for persistence
import { useState, useEffect } from 'react';
import { Trip, FavoriteLocation, AppSettings, STORAGE_KEYS } from '@/types/itinerary';

// Generic localStorage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Trips management
export function useTrips() {
  const [trips, setTrips] = useLocalStorage<Trip[]>(STORAGE_KEYS.TRIPS, []);

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...trip,
      id: crypto.randomUUID(),
      days: generateDays(trip.startDate, trip.endDate)
    };
    setTrips(prev => [...prev, newTrip]);
    return newTrip;
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(trip => 
      trip.id === tripId ? { ...trip, ...updates } : trip
    ));
  };

  const deleteTrip = (tripId: string) => {
    setTrips(prev => prev.filter(trip => trip.id !== tripId));
  };

  const getTrip = (tripId: string) => {
    return trips.find(trip => trip.id === tripId);
  };

  return {
    trips,
    addTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    setTrips
  };
}

// Favorite locations management
export function useFavoriteLocations() {
  const [locations, setLocations] = useLocalStorage<FavoriteLocation[]>(
    STORAGE_KEYS.LOCATIONS, 
    []
  );

  const addLocation = (location: Omit<FavoriteLocation, 'id'>) => {
    const newLocation: FavoriteLocation = {
      ...location,
      id: crypto.randomUUID()
    };
    setLocations(prev => [...prev, newLocation]);
    return newLocation;
  };

  const updateLocation = (locationId: string, updates: Partial<FavoriteLocation>) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId ? { ...loc, ...updates } : loc
    ));
  };

  const deleteLocation = (locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  };

  return {
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    setLocations
  };
}

// App settings management
export function useAppSettings() {
  const defaultSettings: AppSettings = {
    onboarded: false,
    show24h: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferredExportFormat: 'json',
    enableOnlineFeatures: false
  };

  const [settings, setSettings] = useLocalStorage<AppSettings>(
    STORAGE_KEYS.SETTINGS, 
    defaultSettings
  );

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
    setSettings
  };
}

// Utility function to generate days array for a trip
function generateDays(startDate: string, endDate: string) {
  const days = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    days.push({
      date: date.toISOString().split('T')[0],
      events: []
    });
  }
  
  return days;
}

// Clear all data utility
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  window.location.reload();
}