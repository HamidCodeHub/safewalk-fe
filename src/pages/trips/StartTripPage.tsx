import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Car, Bike, Footprints, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { savedLocationsApi } from '@/api/savedLocations';
import { tripsApi } from '@/api/trips';
import { SavedLocationResponse, TransportMode, ApiError } from '@/models/types';
import { cn } from '@/lib/utils';

const transportModes: { mode: TransportMode; icon: typeof Car; label: string }[] = [
  { mode: 'WALKING', icon: Footprints, label: 'Walking' },
  { mode: 'BICYCLING', icon: Bike, label: 'Bicycling' },
  { mode: 'DRIVING', icon: Car, label: 'Driving' },
];

export function StartTripPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<SavedLocationResponse[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>('WALKING');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const data = await savedLocationsApi.list();
      setLocations(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrip = async () => {
    if (!selectedLocation) return;

    setIsStarting(true);
    setError(null);

    try {
      // Mock current location (simulated GPS)
      const currentLat = 37.7749 + (Math.random() - 0.5) * 0.01;
      const currentLng = -122.4194 + (Math.random() - 0.5) * 0.01;

      await tripsApi.start({
        destinationId: selectedLocation,
        currentLatitude: currentLat,
        currentLongitude: currentLng,
        transportMode: selectedMode,
      });

      navigate('/trips/active');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to start trip');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Start Trip" showBack />
        <LoadingState message="Loading destinations..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Start Trip" showBack backPath="/trips" />

      <div className="p-4 space-y-6">
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* Transport Mode Selection */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Transport Mode
          </h2>
          <div className="flex gap-3">
            {transportModes.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={cn(
                  'flex-1 p-4 rounded-xl border-2 transition-all',
                  selectedMode === mode
                    ? 'border-primary bg-accent shadow-primary'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <Icon className={cn(
                  'h-6 w-6 mx-auto mb-2',
                  selectedMode === mode ? 'text-primary' : 'text-muted-foreground'
                )} />
                <p className={cn(
                  'text-sm font-medium',
                  selectedMode === mode ? 'text-primary' : 'text-foreground'
                )}>
                  {label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Destination Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Select Destination
            </h2>
            <button
              onClick={() => navigate('/locations/new')}
              className="text-sm font-medium text-primary hover:underline"
            >
              + Add New
            </button>
          </div>

          {locations.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No saved locations"
              description="Add a location to start tracking your trips"
              actionLabel="Add Location"
              onAction={() => navigate('/locations/new')}
            />
          ) : (
            <div className="space-y-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left',
                    selectedLocation === location.id
                      ? 'border-primary bg-accent'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    selectedLocation === location.id
                      ? 'gradient-primary'
                      : 'bg-muted'
                  )}>
                    <MapPin className={cn(
                      'h-6 w-6',
                      selectedLocation === location.id
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {location.name}
                    </h3>
                    {location.address && (
                      <p className="text-sm text-muted-foreground truncate">
                        {location.address}
                      </p>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    'h-5 w-5 flex-shrink-0',
                    selectedLocation === location.id
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Start Button */}
        {locations.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 safe-area-bottom">
            <PrimaryButton
              fullWidth
              size="lg"
              onClick={handleStartTrip}
              disabled={!selectedLocation}
              isLoading={isStarting}
              variant="safe"
            >
              <Navigation className="mr-2 h-5 w-5" />
              Start Safe Trip
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
