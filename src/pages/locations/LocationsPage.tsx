import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { savedLocationsApi } from '@/api/savedLocations';
import { SavedLocationResponse, ApiError } from '@/models/types';

export function LocationsPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<SavedLocationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Saved Locations" />
        <LoadingState message="Loading locations..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Saved Locations"
        subtitle={`${locations.length} location${locations.length !== 1 ? 's' : ''}`}
        rightAction={
          <button
            onClick={() => navigate('/locations/new')}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="p-4">
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {locations.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No saved locations"
            description="Add your frequent destinations for quick trip setup"
            actionLabel="Add Location"
            onAction={() => navigate('/locations/new')}
          />
        ) : (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                onClick={() => navigate(`/locations/${location.id}`)}
                className="safe-card cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-primary">
                    <MapPin className="h-6 w-6 text-primary-foreground" />
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {location.radiusMeters}m radius
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {locations.length > 0 && (
          <div className="mt-6">
            <PrimaryButton
              fullWidth
              variant="outline"
              onClick={() => navigate('/locations/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Location
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
