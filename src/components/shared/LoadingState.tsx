import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  size = 'md',
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'py-12'
      )}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
        <Loader2 className={cn('animate-spin text-primary', sizeStyles[size])} />
      </div>
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
}
