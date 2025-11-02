import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabaseClient } from '../db/supabase.client';
import { mapSupabaseError } from '../lib/auth';
import type { RegisterFormData, RegisterFormErrors } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Toaster } from './ui/sonner';

/**
 * RegisterForm Component
 * 
 * A fully interactive React component that handles user registration.
 * Manages form state, validation, API communication with Supabase Auth,
 * and provides user feedback through toast notifications.
 */
const RegisterForm: React.FC = React.memo(() => {
  // Form data state
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  // Loading state during registration
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Session checking state
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(false);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /**
   * Validates a single form field
   * @param name - Field name (email or password)
   * @param value - Field value to validate
   * @returns Error message if validation fails, undefined otherwise
   */
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) {
          return 'Adres e-mail jest wymagany';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Podaj poprawny adres e-mail';
        }
        break;
      case 'password':
        if (!value.trim()) {
          return 'Hasło jest wymagane';
        }
        if (value.length < 8) {
          return 'Hasło musi mieć minimum 8 znaków';
        }
        break;
    }
    return undefined;
  };

  /**
   * Validates the entire form
   * @returns True if form is valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof RegisterFormData]);
      if (error) {
        newErrors[key as keyof RegisterFormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Checks if the form is valid (all fields filled and no errors)
   * @returns True if form can be submitted, false otherwise
   */
  const isFormValid = (): boolean => {
    return (
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      Object.keys(errors).length === 0
    );
  };

  /**
   * Handles input field changes
   * Updates form data and clears field-specific errors
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (errors[name as keyof RegisterFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Handles input field blur event
   * Triggers validation for the specific field
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  /**
   * Handles form submission
   * Validates form, calls Supabase Auth API, and handles the response
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: authError } = await supabaseClient.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        throw authError;
      }

      // Success - show success toast
      toast.success('Konto zostało utworzone pomyślnie!', {
        description: 'Za chwilę zostaniesz przekierowany...',
        duration: 3000,
      });

      // Redirect to home page after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (err: any) {
      // Handle registration error
      const errorMessage = mapSupabaseError(err);
      toast.error('Błąd rejestracji', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card 
        className="shadow-lg border-0 bg-white/80 backdrop-blur-sm" 
        role="main" 
        aria-labelledby="register-title"
      >
        <CardHeader className="pb-4">
          <CardTitle id="register-title" className="text-xl font-semibold text-center text-gray-800">
            Zarejestruj się
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Utwórz konto, aby korzystać z AI Fiszki
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
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
                onBlur={handleBlur}
                disabled={isLoading}
                className={`h-11 transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder="twoj@email.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Hasło
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isLoading}
                  className={`h-11 pr-10 transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
                  aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 mt-1" role="alert">
                  {errors.password}
                </p>
              )}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-4">
          {/* Submit Button */}
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid()}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rejestrowanie...</span>
              </div>
            ) : (
              'Zarejestruj się'
            )}
          </Button>

          {/* Login Link */}
          <p className="text-sm text-center text-gray-600">
            Masz już konto?{' '}
            <a 
              href="/logowanie" 
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
            >
              Zaloguj się
            </a>
          </p>
        </CardFooter>
      </Card>

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
});

RegisterForm.displayName = 'RegisterForm';

export default RegisterForm;
