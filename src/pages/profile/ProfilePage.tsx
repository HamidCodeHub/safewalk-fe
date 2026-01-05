import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Edit2, LogOut, Trash2, Shield, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { FormTextInput } from '@/components/shared/FormTextInput';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/api/users';
import { ApiError } from '@/models/types';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format'),
});

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setError(null);
    setFieldErrors({});

    const result = profileSchema.safeParse(formData);
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
      await usersApi.updateMe(formData);
      await refreshUser();
      setIsEditing(false);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await usersApi.deleteMe();
      logout();
      navigate('/login');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Profile" />

      <div className="p-4 space-y-6">
        {error && (
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        )}

        {/* Profile Header */}
        <div className="safe-card">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="h-4 w-4 text-safe" />
                <span className="text-sm text-safe font-medium">SafeWalk Member</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="safe-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl text-primary hover:bg-accent transition-colors"
              >
                <Edit2 className="h-5 w-5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <FormTextInput
                label="Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={fieldErrors.name}
              />
              <FormTextInput
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                helpText="E.164 format"
                error={fieldErrors.phoneNumber}
              />
              <div className="flex gap-3">
                <PrimaryButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name,
                      phoneNumber: user.phoneNumber,
                    });
                    setFieldErrors({});
                  }}
                >
                  Cancel
                </PrimaryButton>
                <PrimaryButton
                  className="flex-1"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  Save
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium text-foreground">{user.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{user.phoneNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="w-full safe-card flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="font-medium text-foreground">Log Out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="w-full safe-card flex items-center justify-between hover:shadow-lg transition-shadow border-destructive/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Delete Account</span>
            </div>
            <ChevronRight className="h-5 w-5 text-destructive" />
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Log Out"
        description="Are you sure you want to log out of SafeWalk?"
        confirmText="Log Out"
        onConfirm={handleLogout}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Account"
        description="This action is irreversible. All your data, including trips, locations, and contacts will be permanently deleted."
        confirmText="Delete Forever"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
