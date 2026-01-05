import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertTriangle, CheckCircle, XCircle, Navigation2, Clock, Route } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { tripsApi } from '@/api/trips';
import { alertsApi } from '@/api/alerts';
import { TripResponse, LocationUpdateResponse, AlertResponse, ApiError } from '@/models/types';
import { cn } from '@/lib/utils';

export function ActiveTripPage() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [locationUpdate, setLocationUpdate] = useState<LocationUpdateResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isActioning, setIsActioning] = useState(false);

  const locationIntervalRef = useRef<number | null>(null);
  const simulatedPositionRef = useRef({ lat: 37.7749, lng: -122.4194 });

  const loadTrip = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const activeTrip = await tripsApi.getActive();

      if (!activeTrip) {
        navigate('/trips');
        return;
      }

      setTrip(activeTrip);

      // Load alerts
      const tripAlerts = await alertsApi.listForTrip(activeTrip.id).catch(() => []);
      setAlerts(tripAlerts.filter((a) => a.status === 'PENDING'));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load trip');
    } finally {
      setIsLoading(false);
    }
  };

  const sendLocationUpdate = useCallback(async () => {
    if (!trip) return;

    // Simulate GPS movement towards destination
    const targetLat = trip.destinationLatitude;
    const targetLng = trip.destinationLongitude;
    const speed = 0.0001; // Movement per update

    simulatedPositionRef.current = {
      lat: simulatedPositionRef.current.lat + (targetLat - simulatedPositionRef.current.lat) * speed * 10,
      lng: simulatedPositionRef.current.lng + (targetLng - simulatedPositionRef.current.lng) * speed * 10,
    };

    try {
      const update = await tripsApi.updateLocation(trip.id, {
        latitude: simulatedPositionRef.current.lat,
        longitude: simulatedPositionRef.current.lng,
        accuracy: 10 + Math.random() * 20,
        timestamp: new Date().toISOString(),
        speed: 1.2 + Math.random() * 0.5,
      });

      setLocationUpdate(update);

      // Check for new alerts
      const tripAlerts = await alertsApi.listForTrip(trip.id).catch(() => []);
      setAlerts(tripAlerts.filter((a) => a.status === 'PENDING'));
    } catch (err) {
      console.error('Location update failed:', err);
    }
  }, [trip]);

  useEffect(() => {
    loadTrip();
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (trip && trip.status === 'ACTIVE') {
      locationIntervalRef.current = window.setInterval(sendLocationUpdate, 10000);
      sendLocationUpdate();
    }

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [trip, sendLocationUpdate]);

  const handleComplete = async () => {
    if (!trip) return;
    setIsActioning(true);

    try {
      await tripsApi.complete(trip.id);
      navigate('/trips');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to complete trip');
    } finally {
      setIsActioning(false);
      setShowCompleteDialog(false);
    }
  };

  const handleCancel = async () => {
    if (!trip) return;
    setIsActioning(true);

    try {
      await tripsApi.cancel(trip.id);
      navigate('/trips');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to cancel trip');
    } finally {
      setIsActioning(false);
      setShowCancelDialog(false);
    }
  };

  const handleRespondToAlert = async (alertId: string, isOk: boolean) => {
    try {
      await alertsApi.respond(alertId, { isOk, message: isOk ? "I'm okay!" : 'Need help!' });
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (err) {
      console.error('Failed to respond to alert:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Active Trip" gradient />
        <LoadingState message="Loading trip details..." />
      </div>
    );
  }

  if (!trip) return null;

  const isOnTrack = locationUpdate?.onTrack ?? true;

  // Safe derived values (prevents crashes)
  const transportModeLabel = (trip.transportMode ?? 'unknown').toLowerCase();
  const estimatedDistanceLabel = (trip.estimatedDistanceKm ?? 0).toFixed(1);
  const remainingDistanceLabel =
    locationUpdate?.distanceRemainingKm != null
      ? locationUpdate.distanceRemainingKm.toFixed(1)
      : estimatedDistanceLabel;

  return (
    <div className="min-h-screen bg-background">
      {/* Active Trip Header */}
      <div
        className={cn(
          'pt-6 pb-8 px-4 text-primary-foreground safe-area-top',
          isOnTrack ? 'gradient-safe' : 'gradient-warning'
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className={cn(
              'w-3 h-3 rounded-full',
              isOnTrack ? 'bg-white pulse-safe' : 'bg-white animate-pulse'
            )}
          />
          <span className="font-semibold text-sm uppercase tracking-wide">Trip Active</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">{trip.destinationName ?? 'Destination'}</h1>

        <div className="flex items-center gap-4 text-white/90">
          <div className="flex items-center gap-1.5">
            <Route className="h-4 w-4" />
            <span className="text-sm">
              {locationUpdate ? `${remainingDistanceLabel} km left` : `${estimatedDistanceLabel} km`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span className="text-sm">
              {locationUpdate?.estimatedTimeRemainingMinutes != null
                ? `~${locationUpdate.estimatedTimeRemainingMinutes} min`
                : `~${trip.estimatedTimeMinutes ?? 0} min`}
            </span>
          </div>
        </div>
      </div>

      <div className="-mt-4 bg-background rounded-t-3xl">
        <div className="p-4 space-y-4">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {/* Warning Message */}
          {locationUpdate?.warningMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border-2 border-warning/30">
              <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Warning</h3>
                <p className="text-sm text-muted-foreground">{locationUpdate.warningMessage}</p>
              </div>
            </div>
          )}

          {/* Pending Alerts */}
          {alerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">{alert.type}</h3>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <PrimaryButton
                  variant="safe"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRespondToAlert(alert.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  I'm OK
                </PrimaryButton>
                <PrimaryButton
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRespondToAlert(alert.id, false)}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Need Help
                </PrimaryButton>
              </div>
            </div>
          ))}

          {/* Trip Info Card */}
          <div className="safe-card">
            <h3 className="font-semibold text-foreground mb-3">Trip Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-medium text-foreground">{trip.destinationName ?? '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Navigation2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transport Mode</p>
                  <p className="font-medium text-foreground capitalize">{transportModeLabel}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div
            className={cn(
              'safe-card border-2',
              isOnTrack ? 'border-safe/30 bg-safe/5' : 'border-warning/30 bg-warning/5'
            )}
          >
            <div className="flex items-center gap-3">
              {isOnTrack ? <CheckCircle className="h-8 w-8 text-safe" /> : <AlertTriangle className="h-8 w-8 text-warning" />}
              <div>
                <h3 className={cn('font-bold', isOnTrack ? 'text-safe' : 'text-warning')}>
                  {isOnTrack ? 'On Track' : 'Off Route'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isOnTrack ? 'Everything looks good!' : 'You may have deviated from your route'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="flex gap-3">
            <PrimaryButton variant="outline" className="flex-1" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="h-4 w-4 mr-2" />
              Cancel
            </PrimaryButton>
            <PrimaryButton variant="safe" className="flex-1" onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        title="Complete Trip"
        description="Are you sure you've safely arrived at your destination?"
        confirmText="Yes, I've Arrived"
        onConfirm={handleComplete}
        isLoading={isActioning}
      />

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Trip"
        description="Are you sure you want to cancel this trip? Your trusted contacts may be notified."
        confirmText="Cancel Trip"
        onConfirm={handleCancel}
        variant="destructive"
        isLoading={isActioning}
      />
    </div>
  );
}
