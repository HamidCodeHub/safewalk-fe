import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Phone, Mail, Hash, Heart, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { FormTextInput } from '@/components/shared/FormTextInput';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { trustedContactsApi } from '@/api/trustedContacts';
import { TrustedContactRequest, ApiError } from '@/models/types';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  priority: z.number().min(1, 'Priority must be 1-10').max(10, 'Priority must be 1-10'),
  relationship: z.string().optional(),
});

export function ContactFormPage() {
  const navigate = useNavigate();
  const { contactId } = useParams<{ contactId: string }>();
  const isEditing = !!contactId;

  const [formData, setFormData] = useState<TrustedContactRequest>({
    name: '',
    phoneNumber: '',
    email: '',
    priority: 5,
    relationship: '',
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    try {
      const contact = await trustedContactsApi.get(contactId!);
      setFormData({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email || '',
        priority: contact.priority,
        relationship: contact.relationship || '',
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load contact');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof TrustedContactRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'priority' ? parseInt(e.target.value) || 1 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const dataToValidate = {
      ...formData,
      email: formData.email || undefined,
    };

    const result = contactSchema.safeParse(dataToValidate);
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
      const submitData = {
        ...formData,
        email: formData.email || undefined,
        relationship: formData.relationship || undefined,
      };

      if (isEditing) {
        await trustedContactsApi.update(contactId!, submitData);
      } else {
        await trustedContactsApi.create(submitData);
      }
      navigate('/contacts');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await trustedContactsApi.delete(contactId!);
      navigate('/contacts');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Contact" showBack />
        <LoadingState message="Loading contact..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={isEditing ? 'Edit Contact' : 'Add Contact'}
        showBack
        backPath="/contacts"
      />

      <div className="p-4">
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FormTextInput
              label="Name"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="John Doe"
              error={fieldErrors.name}
            />
            <User className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
              placeholder="+1234567890"
              helpText="E.164 format required"
              error={fieldErrors.phoneNumber}
            />
            <Phone className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Email (Optional)"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="john@example.com"
              error={fieldErrors.email}
            />
            <Mail className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Priority (1-10)"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={handleChange('priority')}
              helpText="1 = highest priority, notified first"
              error={fieldErrors.priority}
            />
            <Hash className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Relationship (Optional)"
              value={formData.relationship}
              onChange={handleChange('relationship')}
              placeholder="e.g., Spouse, Parent, Friend"
              error={fieldErrors.relationship}
            />
            <Heart className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="pt-4 space-y-3">
            <PrimaryButton type="submit" fullWidth size="lg" isLoading={isSaving}>
              {isEditing ? 'Save Changes' : 'Add Contact'}
            </PrimaryButton>

            {isEditing && (
              <PrimaryButton
                type="button"
                variant="destructive"
                fullWidth
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Contact
              </PrimaryButton>
            )}
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Contact"
        description="Are you sure you want to remove this trusted contact? They will no longer be notified in emergencies."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
