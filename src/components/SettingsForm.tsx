import React, { useState } from 'react';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import type { UserProfileDto, LanguageLevel, UpdateProfileDto } from '../types';

interface SettingsFormProps {
  initialProfile: UserProfileDto;
}

interface LanguageLevelOption {
  value: LanguageLevel;
  label: string;
  description: string;
}

const languageLevelOptions: LanguageLevelOption[] = [
  { value: 'a1', label: 'A1', description: 'Początkujący' },
  { value: 'a2', label: 'A2', description: 'Podstawowy' },
  { value: 'b1', label: 'B1', description: 'Średniozaawansowany' },
  { value: 'b2', label: 'B2', description: 'Średniozaawansowany wyższy' },
  { value: 'c1', label: 'C1', description: 'Zaawansowany' },
  { value: 'c2', label: 'C2', description: 'Biegły' },
];

/**
 * SettingsForm component
 * 
 * Manages user profile settings, specifically the default AI difficulty level.
 * Automatically saves changes when user selects a new level from the dropdown.
 */
const SettingsForm: React.FC<SettingsFormProps> = React.memo(({ initialProfile }) => {
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>(
    initialProfile.default_ai_level as LanguageLevel
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles changes to the language level selection.
   * Automatically triggers API call to update the profile.
   * Implements optimistic UI update with rollback on error.
   * 
   * @param e - Change event from the select element
   */
  const handleLevelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = e.target.value as LanguageLevel;
    
    // Guard clause: No change needed
    if (newLevel === selectedLevel) {
      return;
    }

    // Guard clause: Already loading
    if (isLoading) {
      return;
    }
    
    // Store previous value for rollback on error
    const previousLevel = selectedLevel;
    
    // Optimistically update UI
    setSelectedLevel(newLevel);
    setIsLoading(true);

    try {
      const requestBody: UpdateProfileDto = {
        default_ai_level: newLevel,
      };

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Handle error responses with early returns
      if (response.status === 401) {
        throw new Error('Sesja wygasła. Zaloguj się ponownie.');
      }
      
      if (response.status === 404) {
        throw new Error('Nie znaleziono profilu. Spróbuj się wylogować i zalogować ponownie.');
      }
      
      if (response.status === 422) {
        throw new Error('Nieprawidłowa wartość poziomu. Odśwież stronę i spróbuj ponownie.');
      }
      
      if (response.status >= 500) {
        throw new Error('Wystąpił błąd serwera. Spróbuj ponownie później.');
      }
      
      if (!response.ok) {
        throw new Error('Nie udało się zapisać zmian.');
      }

      const updatedProfile: UserProfileDto = await response.json();
      
      // Success toast
      toast.success('Zapisano zmiany', {
        description: `Domyślny poziom trudności został zmieniony na ${languageLevelOptions.find(opt => opt.value === newLevel)?.label}.`,
      });

    } catch (error) {
      // Rollback to previous value on error
      setSelectedLevel(previousLevel);

      const message = error instanceof Error 
        ? error.message 
        : 'Wystąpił nieoczekiwany błąd.';

      toast.error('Błąd', {
        description: message,
      });

      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Preferencje generowania fiszek</CardTitle>
        <CardDescription>
          Ustaw domyślny poziom trudności dla fiszek generowanych przez AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="default-ai-level" className="text-base">
              Domyślny poziom trudności AI
            </Label>
            <div className="relative">
              <Select
                id="default-ai-level"
                value={selectedLevel}
                onChange={handleLevelChange}
                disabled={isLoading}
                aria-label="Wybierz domyślny poziom trudności AI"
                aria-describedby="level-description"
                className={`w-full sm:max-w-xs ${isLoading ? 'pr-10' : ''}`}
              >
                {languageLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </Select>
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
                  <span className="sr-only">Zapisywanie...</span>
                </div>
              )}
            </div>
            <p id="level-description" className="text-sm text-muted-foreground">
              Ten poziom będzie używany podczas generowania fiszek przez AI. 
              Możesz go zmienić w dowolnym momencie podczas tworzenia fiszek.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

SettingsForm.displayName = 'SettingsForm';

export default SettingsForm;
