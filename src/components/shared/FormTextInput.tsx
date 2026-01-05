import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: string;
}

export function FormTextInput({
  label,
  error,
  helpText,
  className,
  id,
  ...props
}: FormTextInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={inputId}
        className={cn(
          'h-12 rounded-xl border-2 transition-colors',
          error
            ? 'border-destructive focus-visible:ring-destructive'
            : 'border-border focus-visible:ring-primary',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}
    </div>
  );
}
