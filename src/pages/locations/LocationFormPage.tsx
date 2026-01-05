import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Navigation, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { FormTextInput } from '@/components/shared/FormTextInput';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { savedLocationsApi } from '@/api/savedLocations';
import { SavedLocationRequest, ApiError } from '@/models/types';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  radiusMeters: z.number().min(10, 'Minimum 10 meters').max(10000, 'Maximum 10,000 meters'),
  address: z.string().optional(),
});

export function LocationFormPage() {
  const navigate = useNavigate();
  const { locationId } = useParams<{ locationId: string }>();
  const isEditing = !!locationId;

  const [formData, setFormData] = useState<SavedLocationRequest>({
    name: '',
    latitude: 0,
    longitude: 0,
    radiusMeters: 100,
    address: '',
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadLocation();
    }
  }, [locationId]);

  const loadLocation = async () => {
    try {
      const location = await savedLocationsApi.get(locationId!);
      setFormData({
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        radiusMeters: location.radiusMeters,
        address: location.address || '',
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SavedLocationRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = ['latitude', 'longitude', 'radiusMeters'].includes(field)
      ? parseFloat(e.target.value) || 0
      : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUseCurrentLocation = () => {
    // Simulate GPS retrieval
    const mockLat = 37.7749 + (Math.random() - 0.5) * 0.1;
    const mockLng = -122.4194 + (Math.random() - 0.5) * 0.1;
    setFormData((prev) => ({
      ...prev,
      latitude: parseFloat(mockLat.toFixed(6)),
      longitude: parseFloat(mockLng.toFixed(6)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = locationSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing) {
        await savedLocationsApi.update(locationId!, formData);
      } else {
        await savedLocationsApi.create(formData);
      }
      navigate('/locations');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await savedLocationsApi.delete(locationId!);
      navigate('/locations');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete location');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Location" showBack />
        <LoadingState message="Loading location..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={isEditing ? 'Edit Location' : 'Add Location'}
        showBack
        backPath="/locations"
      />

      <div className="p-4">
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormTextInput
            label="Location Name"
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="e.g., Home, Work, Gym"
            error={fieldErrors.name}
          />

          <FormTextInput
            label="Address (Optional)"
            value={formData.address}
            onChange={handleChange('address')}
            placeholder="123 Main St, City"
            error={fieldErrors.address}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormTextInput
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude || ''}
              onChange={handleChange('latitude')}
              placeholder="37.7749"
              error={fieldErrors.latitude}
            />
            <FormTextInput
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude || ''}
              onChange={handleChange('longitude')}
              placeholder="-122.4194"
              error={fieldErrors.longitude}
            />
          </div>

          <PrimaryButton
            type="button"
            variant="outline"
            fullWidth
            onClick={handleUseCurrentLocation}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use Current Location
          </PrimaryButton>

          <FormTextInput
            label="Radius (meters)"
            type="number"
            value={formData.radiusMeters || ''}
            onChange={handleChange('radiusMeters')}
            placeholder="100"
            helpText="Safe zone radius around the location"
            error={fieldErrors.radiusMeters}
          />

          <div className="pt-4 space-y-3">
            <PrimaryButton type="submit" fullWidth size="lg" isLoading={isSaving}>
              <MapPin className="h-4 w-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Add Location'}
            </PrimaryButton>

            {isEditing && (
              <PrimaryButton
                type="button"
                variant="destructive"
                fullWidth
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Location
              </PrimaryButton>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
