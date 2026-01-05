import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { tripsApi } from '@/api/trips';
import { TripResponse, ApiError } from '@/models/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;

  // Normalize microseconds to milliseconds:
  // "2025-12-31T14:25:11.067278" -> "2025-12-31T14:25:11.067"
  const normalized = value.replace(/\.(\d{3})\d+$/, '.$1');

  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatTripDate(value?: string | null): string {
  const d = parseApiDate(value);
  return d ? format(d, 'MMM d, yyyy • h:mm a') : '—';
}

export function TripsPage() {
  const navigate = useNavigate();
  const [activeTrip, setActiveTrip] = useState<TripResponse | null>(null);
  const [history, setHistory] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [active, historyData] = await Promise.all([
        tripsApi.getActive().catch(() => null),
        tripsApi.getHistory().catch(() => []),
      ]);

      setActiveTrip(active);
      setHistory(historyData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-safe" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-safe/10 text-safe';
      case 'CANCELLED':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Trips" />
        <LoadingState message="Loading your trips..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Trips" subtitle="Track your journeys safely" />

      <div className="p-4 space-y-6">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Active Trip Card */}
        {activeTrip ? (
          <div
            onClick={() => navigate('/trips/active')}
            className="safe-card cursor-pointer border-2 border-primary/30 bg-accent/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary pulse-safe" />
                <span className="text-sm font-semibold text-primary">TRIP ACTIVE</span>
              </div>

              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                {activeTrip.transportMode ?? '—'}
              </span>
            </div>

            <h3 className="font-bold text-foreground text-lg mb-1">
              {activeTrip.destinationName ?? '—'}
            </h3>

            <p className="text-sm text-muted-foreground">
              {(activeTrip.estimatedDistanceKm ?? 0).toFixed(1)} km • ~{activeTrip.estimatedTimeMinutes ?? 0} min
            </p>

            <div className="mt-4">
              <PrimaryButton variant="safe" fullWidth>
                View Active Trip
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <div className="safe-card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-primary">
                <Play className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Start a Trip</h3>
                <p className="text-sm text-muted-foreground">Stay safe on your journey</p>
              </div>
            </div>

            <PrimaryButton fullWidth size="lg" onClick={() => navigate('/trips/start')}>
              Start New Trip
            </PrimaryButton>
          </div>
        )}

        {/* Trip History */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3">Trip History</h2>

          {history.length === 0 ? (
            <EmptyState icon={Route} title="No trip history" description="Your completed trips will appear here" />
          ) : (
            <div className="space-y-3">
              {history.slice(0, 10).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="safe-card cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(trip.status)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {trip.destinationName ?? '—'}
                        </h3>

                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0',
                            getStatusStyle(trip.status)
                          )}
                        >
                          {trip.status}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {/* API field is startTime */}
                        {formatTripDate((trip as any).startTime ?? (trip as any).startedAt)}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {(trip.estimatedDistanceKm ?? 0).toFixed(1)} km • {(trip.transportMode ?? '—').toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
