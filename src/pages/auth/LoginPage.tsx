import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { FormTextInput } from '@/components/shared/FormTextInput';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ApiError } from '@/models/types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = loginSchema.safeParse({ email, password });
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

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/trips');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground px-6 pt-12 pb-16 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Shield className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">SafeWalk</h1>
        <p className="text-white/80">Your personal safety companion</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 -mt-8 bg-background rounded-t-3xl px-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">Welcome back</h2>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FormTextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Mail className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <PrimaryButton
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
          >
            Sign In
          </PrimaryButton>
        </form>

        <p className="text-center text-muted-foreground mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
