import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  rightAction?: React.ReactNode;
  gradient?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  showBack,
  backPath,
  rightAction,
  gradient = false,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 safe-area-top',
        gradient
          ? 'gradient-primary text-primary-foreground'
          : 'bg-background/80 backdrop-blur-lg border-b border-border'
      )}
    >
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              className={cn(
                'p-2 -ml-2 rounded-xl transition-colors',
                gradient ? 'hover:bg-white/20' : 'hover:bg-accent'
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className={cn(
              'text-lg font-bold',
              !gradient && 'text-foreground'
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                'text-sm',
                gradient ? 'text-white/80' : 'text-muted-foreground'
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  );
}
