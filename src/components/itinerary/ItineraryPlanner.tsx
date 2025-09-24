// Main Itinerary Planner Component
import React, { useState, useEffect } from 'react';
import { Search, Settings, Plus, Download, Upload } from 'lucide-react';
import { useTrips, useFavoriteLocations, useAppSettings } from '@/hooks/useLocalStorage';
import { Trip, ViewMode } from '@/types/itinerary';
import { TripHeader } from './TripHeader';
import { DaySelector } from './DaySelector';
import { EventsList } from './EventsList';
import { TimelineView } from './TimelineView';
import { ExportModal } from './ExportModal';
import { ImportModal } from './ImportModal';
import { SettingsModal } from './SettingsModal';
import { OnboardingModal } from './OnboardingModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ItineraryPlanner: React.FC = () => {
  const { trips, addTrip, updateTrip, deleteTrip } = useTrips();
  const { locations } = useFavoriteLocations();
  const { settings, updateSettings } = useAppSettings();
  const { toast } = useToast();
  
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('day-list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Set first trip as active on load
  useEffect(() => {
    if (trips.length > 0 && !activeTrip) {
      setActiveTrip(trips[0]);
    }
  }, [trips, activeTrip]);
  
  // Set first day as selected when trip changes
  useEffect(() => {
    if (activeTrip && activeTrip.days.length > 0 && !selectedDate) {
      setSelectedDate(activeTrip.days[0].date);
    }
  }, [activeTrip, selectedDate]);
  
  // Show onboarding for new users
  useEffect(() => {
    if (!settings.onboarded) {
      updateSettings({ onboarded: true });
    }
  }, [settings.onboarded, updateSettings]);

  const handleCreateTrip = () => {
    const newTrip = addTrip({
      title: 'New Trip to China',
      destination: 'China', 
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days: []
    });
    setActiveTrip(newTrip);
    setSelectedDate(newTrip.days[0]?.date || '');
    toast({
      title: "Trip Created",
      description: "Your new trip has been created successfully!"
    });
  };

  const filteredEvents = activeTrip?.days
    .find(day => day.date === selectedDate)?.events
    .filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.notes.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'p':
            event.preventDefault();
            window.print();
            break;
          case 'e':
            event.preventDefault();
            setShowExportModal(true);
            break;
          case 's':
            event.preventDefault();
            setShowExportModal(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gradient mb-2">
              China Itinerary Planner
            </h1>
            <p className="text-muted-foreground text-lg">
              Plan your perfect trip to China with an offline-first itinerary planner
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={handleCreateTrip} 
              className="btn-travel w-full py-3"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Trip
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowImportModal(true)}
              className="w-full"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import Existing Trip
            </Button>
          </div>
        </div>
        
        {showImportModal && (
          <ImportModal 
            onClose={() => setShowImportModal(false)}
            onImport={(trip) => {
              setActiveTrip(trip);
              setSelectedDate(trip.days[0]?.date || '');
              setShowImportModal(false);
            }}
          />
        )}
        
        {!settings.onboarded && (
          <OnboardingModal onClose={() => updateSettings({ onboarded: true })} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="travel-gradient p-4 text-white no-print">
        <TripHeader 
          trips={trips}
          activeTrip={activeTrip}
          onTripChange={setActiveTrip}
          onCreateTrip={handleCreateTrip}
          onUpdateTrip={updateTrip}
          onDeleteTrip={deleteTrip}
        />
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Days & Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search & Controls */}
          <div className="card-travel p-4 no-print">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 form-input"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'day-list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('day-list')}
                  className="flex-1 text-xs"
                >
                  Day List
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  onClick={() => setViewMode('timeline')}
                  className="flex-1 text-xs"
                >
                  Timeline
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Day Selector */}
          {activeTrip && (
            <DaySelector
              trip={activeTrip}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeTrip && selectedDate && (
            <>
              {viewMode === 'day-list' ? (
                <EventsList
                  trip={activeTrip}
                  selectedDate={selectedDate}
                  events={filteredEvents}
                  locations={locations}
                  onUpdateTrip={updateTrip}
                />
              ) : (
                <TimelineView
                  trip={activeTrip}
                  selectedDate={selectedDate}
                  events={filteredEvents}
                  locations={locations}
                  onUpdateTrip={updateTrip}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showExportModal && activeTrip && (
        <ExportModal
          trip={activeTrip}
          onClose={() => setShowExportModal(false)}
        />
      )}
      
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={(trip) => {
            setActiveTrip(trip);
            setSelectedDate(trip.days[0]?.date || '');
            setShowImportModal(false);
          }}
        />
      )}
      
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default ItineraryPlanner;