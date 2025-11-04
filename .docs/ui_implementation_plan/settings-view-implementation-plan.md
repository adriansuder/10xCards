# Plan implementacji widoku Ustawienia

## 1. Przegląd

Widok Ustawienia umożliwia zalogowanym użytkownikom zarządzanie swoimi preferencjami profilu. W obecnej wersji MVP widok skupia się na jednym kluczowym ustawieniu: domyślnym poziomie trudności AI (`default_ai_level`), który jest wykorzystywany podczas generowania fiszek. Widok pobiera aktualne ustawienia użytkownika z API, prezentuje je w formie prostego formularza i umożliwia ich aktualizację. Zmiana wartości następuje automatycznie po wyborze nowego poziomu, co upraszcza interfejs i eliminuje konieczność ręcznego zapisywania zmian.

## 2. Routing widoku

- **Ścieżka**: `/ustawienia`
- **Typ**: Chroniona trasa wymagająca uwierzytelnienia
- **Plik**: `src/pages/ustawienia.astro`
- **Middleware**: Middleware w `src/middleware/index.ts` powinien weryfikować, czy użytkownik jest zalogowany. Jeśli nie, należy przekierować go na stronę logowania.

## 3. Struktura komponentów

```
SettingsPage (Astro)
└── SettingsForm (React)
    ├── Select (Shadcn/ui)
    │   ├── SelectTrigger
    │   ├── SelectValue
    │   └── SelectContent
    │       └── SelectItem (dla każdego poziomu)
    └── Toast (Shadcn/ui) - do wyświetlania komunikatów
```

**Podział odpowiedzialności:**
- `SettingsPage` (Astro): Strona kontenerowa, zapewnia layout, weryfikuje uwierzytelnienie, przekazuje początkowe dane do komponentu React
- `SettingsForm` (React): Główny komponent interaktywny, zarządza stanem formularza, obsługuje API, wyświetla komunikaty

## 4. Szczegóły komponentów

### SettingsPage (Astro)

- **Opis**: Strona kontenerowa Astro, która służy jako wrapper dla komponentu React `SettingsForm`. Odpowiada za weryfikację uwierzytelnienia na poziomie serwera i pobieranie początkowych danych profilu użytkownika przed renderowaniem.

- **Główne elementy**: 
  - Layout aplikacji (np. `BaseLayout`)
  - Nagłówek strony (`<h1>Ustawienia</h1>`)
  - Komponent `SettingsForm` z przekazanymi propsami
  - Opcjonalnie sekcja z opisem ustawień

- **Obsługiwane interakcje**: Brak (strona statyczna Astro)

- **Warunki walidacji**: 
  - Weryfikacja uwierzytelnienia: `if (!user)` przekieruj na `/login`
  - Weryfikacja poprawności odpowiedzi API podczas pobierania profilu

- **Typy**:
  - `UserProfileDto` (z `src/types.ts`) - dla danych pobieranych z API

- **Logika serwera**:
  ```typescript
  const { supabase, user } = Astro.locals;
  
  if (!user) {
    return Astro.redirect('/logowanie');
  }
  
  // Pobranie profilu użytkownika
  const response = await fetch(`${Astro.url.origin}/api/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  
  const profile: UserProfileDto = await response.json();
  ```

### SettingsForm (React)

- **Opis**: Główny komponent interaktywny formularza ustawień. Wyświetla pole wyboru poziomu AI i obsługuje automatyczną aktualizację ustawień po zmianie wartości. Zarządza stanem ładowania i wyświetla komunikaty zwrotne użytkownikowi.

- **Główne elementy**:
  - Kontener formularza (`<form>`)
  - Label dla pola wyboru: "Domyślny poziom trudności AI"
  - Komponent `Select` z Shadcn/ui zawierający opcje poziomów
  - Tekst pomocniczy wyjaśniający, do czego służy ustawienie
  - Wskaźnik ładowania podczas zapisywania (np. spinner przy `Select`)
  - Toast do wyświetlania komunikatów sukcesu/błędu

- **Obsługiwane interakcje**:
  - `onChange` na komponencie `Select` - automatyczne wywołanie API przy zmianie wartości
  - Wyświetlanie toastów po zakończeniu operacji (sukces/błąd)

- **Warunki walidacji**:
  - Wartość `default_ai_level` musi być jedną z dozwolonych wartości typu `LanguageLevel` ('a1', 'a2', 'b1', 'b2', 'c1', 'c2')
  - Walidacja odbywa się przez TypeScript i schemat Zod na poziomie API
  - Frontend nie wymaga dodatkowej walidacji, ponieważ `Select` ogranicza wybór do prawidłowych wartości

- **Typy**:
  - `LanguageLevel` - typ enum dla poziomów języka
  - `UserProfileDto` - dla danych profilu
  - `UpdateProfileDto` - dla payload wysyłanego do API
  - `SettingsFormProps` - interfejs propsów komponentu

- **Propsy (SettingsFormProps)**:
  ```typescript
  interface SettingsFormProps {
    initialProfile: UserProfileDto;
  }
  ```

## 5. Typy

### Istniejące typy (z `src/types.ts`)

Wszystkie niezbędne typy są już zdefiniowane w `src/types.ts`:

```typescript
// Enum dla poziomów językowych
export type LanguageLevel = Enums<'language_level'>;
// Wartości: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

// DTO dla profilu użytkownika (odpowiedź GET /api/profile)
export type UserProfileDto = ProfileRow;
// Pola:
// - id: string (uuid)
// - default_ai_level: LanguageLevel
// - created_at: string (ISO 8601)

// DTO dla aktualizacji profilu (payload PATCH /api/profile)
export type UpdateProfileDto = {
  default_ai_level: LanguageLevel;
};
```

### Nowe typy ViewModel

```typescript
// Interfejs propsów dla komponentu SettingsForm
interface SettingsFormProps {
  initialProfile: UserProfileDto;
}

// Opcja w komponencie Select
interface LanguageLevelOption {
  value: LanguageLevel;
  label: string;
  description?: string;
}

// Stan komponentu (używany wewnętrznie)
interface SettingsFormState {
  selectedLevel: LanguageLevel;
  isLoading: boolean;
  error: string | null;
}
```

### Mapowanie poziomów na etykiety

```typescript
const languageLevelOptions: LanguageLevelOption[] = [
  { value: 'a1', label: 'A1', description: 'Początkujący' },
  { value: 'a2', label: 'A2', description: 'Podstawowy' },
  { value: 'b1', label: 'B1', description: 'Średniozaawansowany' },
  { value: 'b2', label: 'B2', description: 'Średniozaawansowany wyższy' },
  { value: 'c1', label: 'C1', description: 'Zaawansowany' },
  { value: 'c2', label: 'C2', description: 'Biegły' },
];
```

## 6. Zarządzanie stanem

### Stan lokalny komponentu SettingsForm

Stan jest zarządzany za pomocą hooków React (`useState`):

```typescript
const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>(initialProfile.default_ai_level);
const [isLoading, setIsLoading] = useState(false);
```

### Przepływ stanu

1. **Inicjalizacja**: Komponent otrzymuje `initialProfile` jako props i ustawia początkową wartość `selectedLevel`
2. **Zmiana wartości**: Użytkownik wybiera nowy poziom z listy rozwijanej
3. **Wywołanie API**: Automatycznie uruchamiana jest funkcja `handleLevelChange`, która:
   - Ustawia `isLoading = true`
   - Wywołuje `PATCH /api/profile` z nową wartością
   - Po sukcesie: aktualizuje `selectedLevel`, wyświetla toast sukcesu
   - Po błędzie: przywraca poprzednią wartość, wyświetla toast błędu
   - Ustawia `isLoading = false`

### Nie jest wymagany custom hook

Logika jest wystarczająco prosta, aby zmieścić się w komponencie bez potrzeby tworzenia dedykowanego hooka. Jeśli jednak w przyszłości dodane zostaną dodatkowe ustawienia, warto rozważyć ekstrakcję logiki API do custom hooka typu `useProfileUpdate`.

## 7. Integracja API

### Pobieranie profilu (GET)

**Endpoint**: `GET /api/profile`

**Kiedy**: Na poziomie serwera Astro, przed renderowaniem strony

**Request**:
- Headers: `Authorization: Bearer <token>`
- Body: Brak

**Response** (typ: `UserProfileDto`):
```typescript
{
  id: string;
  default_ai_level: LanguageLevel;
  created_at: string; // ISO 8601
}
```

**Kody odpowiedzi**:
- `200 OK` - sukces
- `401 Unauthorized` - użytkownik niezalogowany (przekieruj na login)
- `404 Not Found` - profil nie istnieje (nieoczekiwany błąd)

### Aktualizacja profilu (PATCH)

**Endpoint**: `PATCH /api/profile`

**Kiedy**: Po zmianie wartości w komponencie `Select`

**Request**:
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`
- Body (typ: `UpdateProfileDto`):
```typescript
{
  default_ai_level: LanguageLevel; // np. "c1"
}
```

**Response** (typ: `UserProfileDto`):
```typescript
{
  id: string;
  default_ai_level: LanguageLevel;
  updated_at: string; // ISO 8601
}
```

**Kody odpowiedzi**:
- `200 OK` - sukces
- `400 Bad Request` - nieprawidłowy format JSON
- `401 Unauthorized` - użytkownik niezalogowany
- `404 Not Found` - profil nie istnieje
- `422 Unprocessable Entity` - błąd walidacji (np. nieprawidłowa wartość poziomu)

### Implementacja wywołania API

```typescript
const handleLevelChange = async (newLevel: LanguageLevel) => {
  const previousLevel = selectedLevel;
  setSelectedLevel(newLevel);
  setIsLoading(true);

  try {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        default_ai_level: newLevel,
      } as UpdateProfileDto),
    });

    if (!response.ok) {
      throw new Error('Nie udało się zaktualizować ustawień');
    }

    const updatedProfile: UserProfileDto = await response.json();
    
    // Wyświetl toast sukcesu
    toast({
      title: 'Zapisano zmiany',
      description: 'Twoje ustawienia zostały zaktualizowane.',
    });
  } catch (error) {
    // Przywróć poprzednią wartość
    setSelectedLevel(previousLevel);
    
    // Wyświetl toast błędu
    toast({
      title: 'Błąd',
      description: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd.',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
```

## 8. Interakcje użytkownika

### 1. Wejście na stronę ustawień

**Akcja**: Użytkownik klika link "Ustawienia" w nawigacji lub wpisuje `/ustawienia` w pasku adresu

**Oczekiwany wynik**:
- Jeśli użytkownik jest zalogowany: strona się ładuje, wyświetlany jest formularz z aktualną wartością `default_ai_level`
- Jeśli użytkownik nie jest zalogowany: przekierowanie na stronę logowania

### 2. Zmiana poziomu trudności AI

**Akcja**: Użytkownik klika na komponent `Select` i wybiera nowy poziom z listy rozwijanej

**Oczekiwany wynik**:
- Lista rozwija się, pokazując wszystkie dostępne poziomy (A1, A2, B1, B2, C1, C2) z opisami
- Po wybraniu nowego poziomu:
  - Wartość w `Select` zmienia się natychmiast
  - Pojawia się wskaźnik ładowania (np. spinner przy komponencie lub disabled state)
  - Wysyłane jest żądanie do API
  - Po sukcesie: wyświetlany jest toast "Zapisano zmiany"
  - Po błędzie: wartość wraca do poprzedniej, wyświetlany jest toast błędu

### 3. Obsługa błędów sieci

**Akcja**: Podczas zapisu wystąpił błąd sieci (np. brak połączenia)

**Oczekiwany wynik**:
- Wartość w `Select` wraca do poprzedniej
- Wyświetlany jest toast z komunikatem błędu
- Użytkownik może ponownie spróbować zmienić wartość

## 9. Warunki i walidacja

### Walidacja po stronie frontendu

**Komponent**: `SettingsForm`

**Warunki**:
1. **Wartość poziomu musi być z dozwolonego zakresu**: Walidacja jest wymuszana przez typ `LanguageLevel` i komponent `Select`, który oferuje tylko prawidłowe opcje. Użytkownik nie może wprowadzić nieprawidłowej wartości.

2. **Użytkownik musi być zalogowany**: Walidacja odbywa się na poziomie strony Astro przed renderowaniem. Jeśli `user === null`, następuje przekierowanie na `/login`.

**Wpływ na interfejs**:
- Przycisk/komponent `Select` jest wyłączony (`disabled`), gdy `isLoading === true`
- Podczas ładowania wyświetlany jest wizualny wskaźnik (np. spinner)

### Walidacja po stronie backendu

**Endpoint**: `PATCH /api/profile`

**Warunki weryfikowane przez API** (z `src/lib/validators.ts`):
1. `default_ai_level` jest wymagane
2. `default_ai_level` musi być jednym z: 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'

**Kody błędów**:
- `400 Bad Request` - nieprawidłowy format JSON
- `422 Unprocessable Entity` - błąd walidacji (nie powinien wystąpić, jeśli frontend działa poprawnie)
- `401 Unauthorized` - brak autoryzacji
- `404 Not Found` - profil użytkownika nie istnieje

## 10. Obsługa błędów

### Scenariusze błędów i ich obsługa

#### 1. Użytkownik niezalogowany

**Kiedy**: Brak tokena uwierzytelniającego lub token wygasł

**Obsługa**:
- Middleware w `src/middleware/index.ts` wykrywa brak uwierzytelnienia
- Automatyczne przekierowanie na `/login`
- Alternatywnie: wyświetlenie komunikatu z linkiem do logowania

#### 2. Profil użytkownika nie istnieje (404)

**Kiedy**: API zwraca `404 Not Found` podczas pobierania lub aktualizacji profilu

**Obsługa**:
- Na poziomie Astro (GET): wyświetlenie strony błędu z komunikatem "Nie znaleziono profilu użytkownika"
- Na poziomie React (PATCH): wyświetlenie toasta z komunikatem "Nie znaleziono profilu. Spróbuj się wylogować i zalogować ponownie."

#### 3. Błąd walidacji (422)

**Kiedy**: API zwraca `422 Unprocessable Entity` (nieprawidłowa wartość `default_ai_level`)

**Obsługa**:
- Przywrócenie poprzedniej wartości w `Select`
- Wyświetlenie toasta: "Nieprawidłowa wartość poziomu. Odśwież stronę i spróbuj ponownie."
- Logowanie błędu do konsoli dla debugowania

#### 4. Błąd sieci lub timeout

**Kiedy**: Brak połączenia z internetem, API nie odpowiada, timeout

**Obsługa**:
- Przywrócenie poprzedniej wartości w `Select`
- Wyświetlenie toasta: "Nie udało się zapisać zmian. Sprawdź połączenie z internetem i spróbuj ponownie."
- Wyłączenie wskaźnika ładowania

#### 5. Nieoczekiwany błąd serwera (500)

**Kiedy**: API zwraca `500 Internal Server Error`

**Obsługa**:
- Przywrócenie poprzedniej wartości w `Select`
- Wyświetlenie toasta: "Wystąpił błąd serwera. Spróbuj ponownie później."
- Logowanie błędu do konsoli i opcjonalnie do systemu monitoringu

### Wzorzec obsługi błędów w kodzie

```typescript
try {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ default_ai_level: newLevel }),
  });

  if (!response.ok) {
    // Obsługa różnych kodów błędów
    if (response.status === 404) {
      throw new Error('Nie znaleziono profilu użytkownika.');
    } else if (response.status === 422) {
      throw new Error('Nieprawidłowa wartość poziomu.');
    } else if (response.status === 401) {
      // Przekierowanie na login
      window.location.href = '/logowanie';
      return;
    } else {
      throw new Error('Nie udało się zapisać zmian.');
    }
  }

  const updatedProfile: UserProfileDto = await response.json();
  toast({ title: 'Zapisano zmiany' });
  
} catch (error) {
  setSelectedLevel(previousLevel); // Przywróć wartość
  
  const message = error instanceof Error 
    ? error.message 
    : 'Wystąpił nieoczekiwany błąd.';
  
  toast({
    title: 'Błąd',
    description: message,
    variant: 'destructive',
  });
  
  console.error('Error updating profile:', error);
}
```

## 11. Kroki implementacji

### Krok 1: Utworzenie strony Astro

**Plik**: `src/pages/ustawienia.astro`

**Zadania**:
1. Utworzyć nowy plik `ustawienia.astro` w katalogu `src/pages`
2. Zaimportować layout aplikacji (np. `BaseLayout`)
3. Dodać sprawdzenie uwierzytelnienia:
   ```typescript
   const { user, supabase } = Astro.locals;
   if (!user) return Astro.redirect('/logowanie');
   ```
4. Pobrać profil użytkownika z API `GET /api/profile`
5. Obsłużyć potencjalne błędy (401, 404, 500)
6. Przekazać dane profilu do komponentu React jako props
7. Dodać strukturę HTML: nagłówek strony, opis, kontener na formularz

### Krok 2: Utworzenie komponentu SettingsForm

**Plik**: `src/components/SettingsForm.tsx`

**Zadania**:
1. Utworzyć nowy plik komponentu React
2. Zdefiniować interfejs `SettingsFormProps`:
   ```typescript
   interface SettingsFormProps {
     initialProfile: UserProfileDto;
   }
   ```
3. Dodać dyrektywę `'use client'` na początku pliku (jeśli wymagane przez Astro)
4. Zaimportować niezbędne komponenty z Shadcn/ui: `Select`, `Toast`
5. Zdefiniować stan komponentu:
   ```typescript
   const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>(
     initialProfile.default_ai_level
   );
   const [isLoading, setIsLoading] = useState(false);
   ```
6. Utworzyć tablicę opcji `languageLevelOptions` z mapowaniem wartości na etykiety

### Krok 3: Implementacja funkcji handleLevelChange

**Plik**: `src/components/SettingsForm.tsx`

**Zadania**:
1. Utworzyć funkcję `handleLevelChange` przyjmującą `newLevel: LanguageLevel`
2. Zapisać poprzednią wartość do zmiennej lokalnej
3. Optymistycznie zaktualizować UI (zmienić `selectedLevel`)
4. Ustawić `isLoading = true`
5. Wywołać `fetch` do `PATCH /api/profile` z odpowiednim payload
6. Obsłużyć różne kody odpowiedzi (200, 400, 401, 404, 422, 500)
7. W przypadku sukcesu: wyświetlić toast sukcesu
8. W przypadku błędu: przywrócić poprzednią wartość, wyświetlić toast błędu
9. Ustawić `isLoading = false` w bloku `finally`

### Krok 4: Implementacja UI komponentu SettingsForm

**Plik**: `src/components/SettingsForm.tsx`

**Zadania**:
1. Utworzyć strukturę JSX formularza:
   ```tsx
   <form className="space-y-6">
     <div className="space-y-2">
       <label>Domyślny poziom trudności AI</label>
       <Select 
         value={selectedLevel}
         onValueChange={handleLevelChange}
         disabled={isLoading}
       >
         {/* SelectTrigger, SelectContent, SelectItem */}
       </Select>
       <p className="text-sm text-muted-foreground">
         Ten poziom będzie używany podczas generowania fiszek przez AI.
       </p>
     </div>
   </form>
   ```
2. Zmapować `languageLevelOptions` na komponenty `SelectItem`
3. Dodać wskaźnik ładowania (np. spinner przy `Select` lub tekst "Zapisywanie...")
4. Zastosować odpowiednie klasy Tailwind dla stylowania
5. Zapewnić dostępność: odpowiednie `aria-labels`, relacje label-input

### Krok 5: Konfiguracja Toast

**Plik**: `src/components/SettingsForm.tsx` i potencjalnie `src/components/ui/toaster.tsx`

**Zadania**:
1. Zaimportować `useToast` hook z Shadcn/ui
2. Wywołać `const { toast } = useToast()` w komponencie
3. Dodać komponent `<Toaster />` do layoutu aplikacji lub bezpośrednio do strony Astro
4. Przygotować komunikaty dla różnych scenariuszy:
   - Sukces: "Zapisano zmiany"
   - Błąd ogólny: "Nie udało się zapisać zmian"
   - Błąd konkretny: komunikaty zależne od typu błędu

### Krok 6: Integracja komponentu ze stroną Astro

**Plik**: `src/pages/ustawienia.astro`

**Zadania**:
1. Zaimportować komponent `SettingsForm`
2. Dodać komponent do struktury HTML strony:
   ```astro
   <SettingsForm client:load initialProfile={profile} />
   ```
3. Użyć dyrektywy `client:load` dla pełnej interaktywności
4. Upewnić się, że dane `profile` są poprawnie przekazywane jako props

### Krok 7: Dodanie linku w nawigacji

**Plik**: Komponent nawigacji (np. `src/components/Navigation.astro` lub `src/layouts/BaseLayout.astro`)

**Zadania**:
1. Zlokalizować komponent nawigacji
2. Dodać link do strony Ustawienia:
   ```html
   <a href="/ustawienia">Ustawienia</a>
   ```
3. Zastosować odpowiednie style (Tailwind) dla spójności z resztą nawigacji
4. Zapewnić, że link jest widoczny tylko dla zalogowanych użytkowników

### Krok 8: Testowanie manualne

**Zadania**:
1. **Test podstawowy przepływu**:
   - Zalogować się do aplikacji
   - Przejść na stronę `/ustawienia`
   - Zmienić wartość `default_ai_level`
   - Zweryfikować, że wyświetla się toast sukcesu
   - Odświeżyć stronę i sprawdzić, czy wartość została zapisana

2. **Test obsługi błędów**:
   - Symulować błąd sieci (wyłączyć Wi-Fi w trakcie zapisu)
   - Zweryfikować, że wyświetla się toast błędu i wartość zostaje przywrócona

3. **Test autoryzacji**:
   - Wylogować się z aplikacji
   - Spróbować wejść na `/ustawienia`
   - Zweryfikować przekierowanie na `/login`

4. **Test dostępności**:
   - Użyć klawiatury do nawigacji (Tab, Enter, strzałki)
   - Sprawdzić z czytnikiem ekranu (np. NVDA, JAWS)
   - Zweryfikować kontrast kolorów

5. **Test responsywności**:
   - Sprawdzić widok na różnych rozmiarach ekranu (mobile, tablet, desktop)
   - Upewnić się, że formularz jest czytelny i funkcjonalny na wszystkich urządzeniach

### Krok 9: Dokumentacja i czyszczenie kodu

**Zadania**:
1. Dodać komentarze JSDoc do funkcji `handleLevelChange` wyjaśniające logikę
2. Dodać komentarze opisujące cel komponentu `SettingsForm`
3. Usunąć nieużywane importy i zmienne
4. Sprawdzić kod pod kątem zgodności z linterem (uruchomić `npm run lint`)
5. Upewnić się, że kod spełnia wytyczne z `.github/copilot-instructions.md`

### Krok 10: Code review i merge

**Zadania**:
1. Utworzyć branch feature (np. `feature/settings-view`)
2. Commit zmian z opisowymi komunikatami
3. Otworzyć Pull Request
4. Poprosić o code review
5. Wprowadzić ewentualne poprawki na podstawie feedbacku
6. Zmerge'ować do brancha głównego po zatwierdzeniu
