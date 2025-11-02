import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../db/supabase.client';
import { mapSupabaseError } from '../lib/auth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  message: string;
  code?: string;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC = React.memo(() => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          // User is already logged in, redirect to home
          window.location.href = '/';
          return;
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Adres e-mail jest wymagany.';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Wprowadź prawidłowy adres e-mail.';
        }
        break;
      case 'password':
        if (!value.trim()) {
          return 'Hasło jest wymagane.';
        }
        if (value.length < 6) {
          return 'Hasło musi mieć co najmniej 6 znaków.';
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof LoginFormData]);
      if (error) {
        errors[key as keyof FieldErrors] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear general error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        throw authError;
      }

      // Success - redirect to home page
      window.location.href = '/';
    } catch (err: any) {
      setError({
        message: mapSupabaseError(err),
        code: err.code
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Sprawdzanie sesji...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm" role="main" aria-labelledby="login-title">
      <CardHeader className="pb-4">
        <CardTitle id="login-title" className="text-xl font-semibold text-center text-gray-800">
          Logowanie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Adres e-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder="twoj@email.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Hasło
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={`h-11 transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                fieldErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
              }`}
              placeholder="••••••••"
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <p id="password-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error.message}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="pt-4">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Logowanie...</span>
            </div>
          ) : (
            'Zaloguj się'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});

export default LoginForm;