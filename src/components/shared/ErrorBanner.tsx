import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

const variantStyles = {
  error: 'bg-destructive/10 border-destructive/30 text-destructive',
  warning: 'bg-warning/10 border-warning/30 text-warning',
  info: 'bg-primary/10 border-primary/30 text-primary',
};

export function ErrorBanner({ message, onDismiss, variant = 'error' }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border-2 fade-in',
        variantStyles[variant]
      )}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-foreground/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
