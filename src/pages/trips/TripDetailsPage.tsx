import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Route, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { tripsApi } from '@/api/trips';
import { alertsApi } from '@/api/alerts';
import { TripResponse, AlertResponse, ApiError } from '@/models/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function parseApiDate(value?: string | null): Date | null {
  if (!value) return null;

  // Normalize microseconds -> milliseconds:
  // "2025-12-31T14:25:11.067278" -> "2025-12-31T14:25:11.067"
  const normalized = value.replace(/\.(\d{3})\d+$/, '.$1');

  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function safeFormat(value: string | null | undefined, pattern: string, fallback = '—'): string {
  const d = parseApiDate(value);
  return d ? format(d, pattern) : fallback;
}

// If your backend uses startTime but your TS model still has startedAt,
// this lets the page work until you align the types.
function getTripStart(trip: TripResponse): string | null | undefined {
  return (trip as any).startTime ?? (trip as any).startedAt ?? null;
}

export function TripDetailsPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTrip = useCallback(async () => {
    if (!tripId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [tripData, alertsData] = await Promise.all([
        tripsApi.get(tripId),
        alertsApi.listForTrip(tripId).catch(() => []),
      ]);

      setTrip(tripData);
      setAlerts(alertsData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load trip details');
      setTrip(null);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: CheckCircle, color: 'text-safe', bg: 'bg-safe/10' };
      case 'CANCELLED':
        return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' };
      default:
        return { icon: Clock, color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Trip Details" showBack />
        <LoadingState message="Loading trip details..." />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Trip Details" showBack />
        <div className="p-4">
          <ErrorBanner message={error || 'Trip not found'} />
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(trip.status);
  const StatusIcon = statusStyle.icon;

  const tripStart = getTripStart(trip);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={trip.destinationName ?? 'Trip Details'}
        subtitle={safeFormat(tripStart, 'MMMM d, yyyy')}
        showBack
        backPath="/trips"
      />

      <div className="p-4 space-y-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Status Card */}
        <div className={cn('safe-card', statusStyle.bg)}>
          <div className="flex items-center gap-3">
            <StatusIcon className={cn('h-8 w-8', statusStyle.color)} />
            <div>
              <h3 className={cn('font-bold text-lg', statusStyle.color)}>{trip.status}</h3>
              <p className="text-sm text-muted-foreground">
                {(trip as any).completedAt
                  ? `Completed at ${safeFormat((trip as any).completedAt, 'h:mm a')}`
                  : (trip as any).cancelledAt
                  ? `Cancelled at ${safeFormat((trip as any).cancelledAt, 'h:mm a')}`
                  : 'In progress'}
              </p>
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="safe-card">
          <h3 className="font-semibold text-foreground mb-4">Trip Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium text-foreground">{trip.destinationName ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Route className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distance</p>
                <p className="font-medium text-foreground">
                  {(trip.estimatedDistanceKm ?? 0).toFixed(1)} km
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">
                  ~{trip.estimatedTimeMinutes ?? 0} minutes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="safe-card">
            <h3 className="font-semibold text-foreground mb-4">Alerts ({alerts.length})</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-xl border',
                    alert.isOk === true
                      ? 'bg-safe/5 border-safe/30'
                      : alert.isOk === false
                      ? 'bg-destructive/5 border-destructive/30'
                      : 'bg-warning/5 border-warning/30'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      className={cn(
                        'h-4 w-4 mt-0.5 flex-shrink-0',
                        alert.isOk === true
                          ? 'text-safe'
                          : alert.isOk === false
                          ? 'text-destructive'
                          : 'text-warning'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground text-sm">{alert.type}</span>
                        <span className="text-xs text-muted-foreground">
                          {safeFormat((alert as any).createdAt, 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                      {alert.responseMessage && (
                        <p className="text-sm text-foreground mt-1 italic">
                          Response: {alert.responseMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
