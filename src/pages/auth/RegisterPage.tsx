import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton } from '@/components/shared/PrimaryButton';
import { FormTextInput } from '@/components/shared/FormTextInput';
import { ErrorBanner } from '@/components/shared/ErrorBanner';
import { ApiError } from '@/models/types';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = registerSchema.safeParse(formData);
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
      await register(formData.name, formData.email, formData.phoneNumber, formData.password);
      navigate('/trips');
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.status === 409) {
        setError('An account with this email already exists.');
      } else {
        setError(apiError.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="gradient-hero text-primary-foreground px-6 pt-10 pb-12 text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Join SafeWalk</h1>
        <p className="text-white/80 text-sm">Start your safety journey</p>
      </div>

      {/* Form Section */}
      <div className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-6 pb-6">
        <h2 className="text-xl font-bold text-foreground mb-5">Create account</h2>

        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FormTextInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="Enter your full name"
              error={fieldErrors.name}
              autoComplete="name"
            />
            <User className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              placeholder="Enter your email"
              error={fieldErrors.email}
              autoComplete="email"
            />
            <Mail className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange('phoneNumber')}
              placeholder="+1234567890"
              error={fieldErrors.phoneNumber}
              helpText="E.164 format required"
              autoComplete="tel"
            />
            <Phone className="absolute right-4 top-10 h-5 w-5 text-muted-foreground" />
          </div>

          <div className="relative">
            <FormTextInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              placeholder="Create a strong password"
              error={fieldErrors.password}
              autoComplete="new-password"
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
            Create Account
          </PrimaryButton>
        </form>

        <p className="text-center text-muted-foreground mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
