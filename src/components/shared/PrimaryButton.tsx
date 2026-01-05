import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'default' | 'secondary' | 'destructive' | 'warning' | 'safe' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  default: 'gradient-primary text-primary-foreground shadow-primary hover:opacity-90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
  destructive: 'gradient-danger text-destructive-foreground shadow-danger hover:opacity-90',
  warning: 'gradient-warning text-warning-foreground shadow-warning hover:opacity-90',
  safe: 'gradient-safe text-safe-foreground shadow-primary hover:opacity-90',
  outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
};

export function PrimaryButton({
  isLoading,
  variant = 'default',
  size = 'default',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <Button
      className={cn(
        'font-semibold transition-all duration-200 rounded-xl',
        variantStyles[variant],
        fullWidth && 'w-full',
        size === 'lg' && 'h-14 px-8 text-base',
        className
      )}
      size={size}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
