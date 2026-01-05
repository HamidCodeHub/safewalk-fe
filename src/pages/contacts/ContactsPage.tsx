import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, ChevronRight, Star } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { trustedContactsApi } from '@/api/trustedContacts';
import { TrustedContactResponse, ApiError } from '@/models/types';
import { cn } from '@/lib/utils';

export function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<TrustedContactResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await trustedContactsApi.list();
      // Sort by priority
      setContacts(data.sort((a, b) => a.priority - b.priority));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-safe',
      'bg-warning',
      'bg-secondary',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title="Trusted Contacts" />
        <LoadingState message="Loading contacts..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Trusted Contacts"
        subtitle={`${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
        rightAction={
          <button
            onClick={() => navigate('/contacts/new')}
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

        {contacts.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No trusted contacts"
            description="Add people who will be notified in case of emergency"
            actionLabel="Add Contact"
            onAction={() => navigate('/contacts/new')}
          />
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => navigate(`/contacts/${contact.id}`)}
                className="safe-card cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0',
                      getAvatarColor(contact.name)
                    )}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {contact.name}
                      </h3>
                      {contact.priority <= 3 && (
                        <Star className="h-4 w-4 text-warning fill-warning flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.phoneNumber}
                    </p>
                    {contact.relationship && (
                      <p className="text-xs text-muted-foreground">
                        {contact.relationship}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-accent-foreground">
                      #{contact.priority}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {contacts.length > 0 && (
          <div className="mt-6">
            <PrimaryButton
              fullWidth
              variant="outline"
              onClick={() => navigate('/contacts/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Contact
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
