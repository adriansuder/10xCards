# Plan implementacji widoku Rejestracja

## 1. Przegląd

Widok rejestracji jest punktem wejścia dla nowych użytkowników aplikacji AI Fiszki. Umożliwia założenie konta przy użyciu adresu e-mail i hasła poprzez system uwierzytelniania Supabase. Po pomyślnej rejestracji użytkownik jest automatycznie logowany i przekierowywany na stronę główną. Widok składa się z wycentrowanego formularza z walidacją danych wejściowych i obsługą błędów za pomocą komunikatów typu Toast.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: **`/rejestracja`**

Plik do utworzenia: `src/pages/rejestracja.astro`

## 3. Struktura komponentów

```
rejestracja.astro (Astro page - layout i struktura)
└── RegisterForm.tsx (React - interaktywny formularz)
    ├── Card (Shadcn/ui - kontener formularza)
    │   ├── CardHeader
    │   │   └── CardTitle
    │   ├── CardDescription
    │   └── CardContent
    │       ├── Label (Shadcn/ui)
    │       ├── Input (Shadcn/ui - pole email)
    │       ├── Label (Shadcn/ui)
    │       ├── Input (Shadcn/ui - pole hasło)
    │       ├── Button (Shadcn/ui - przycisk rejestracji)
    │       └── Link (React Router / Astro - link do logowania)
    └── Toast/Toaster (Shadcn/ui - komunikaty błędów/sukcesu)
```

## 4. Szczegóły komponentów

### RegisterForm.tsx

**Opis komponentu:**
Główny komponent React zawierający logikę formularza rejestracji. Odpowiada za zbieranie danych użytkownika (email i hasło), walidację wprowadzonych danych, komunikację z Supabase Auth API, oraz obsługę różnych stanów formularza (loading, error, success). Komponent jest w pełni interaktywny, dlatego wymaga użycia Reacta.

**Główne elementy:**
- `<Card>` - kontener formularza z odpowiednim stylingiem (cień, padding, zaokrąglone rogi)
- `<CardHeader>` z `<CardTitle>` - nagłówek "Zarejestruj się"
- `<CardDescription>` - opis "Utwórz konto, aby korzystać z AI Fiszki"
- `<form>` - element formularza z obsługą zdarzenia `onSubmit`
- 2x `<Label>` + `<Input>` - pola na email i hasło
- `<Button>` - przycisk "Zarejestruj się" z dynamicznym stanem (disabled podczas ładowania)
- `<p>` z linkiem - "Masz już konto? Zaloguj się"
- `<Toaster>` - komponent do wyświetlania komunikatów Toast

**Obsługiwane interakcje:**
- `onChange` na polach Input - aktualizacja stanu formularza i walidacja w czasie rzeczywistym
- `onBlur` na polach Input - walidacja po opuszczeniu pola
- `onSubmit` na formularzu - wywołanie funkcji rejestracji
- `onClick` na przycisku - wysłanie formularza (domyślnie przez submit)
- `onClick` na linku "Zaloguj się" - przekierowanie do `/logowanie`

**Obsługiwana walidacja:**

1. **Email:**
   - Pole wymagane (nie może być puste)
   - Poprawny format adresu email (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
   - Komunikat błędu: "Podaj poprawny adres e-mail"
   
2. **Hasło:**
   - Pole wymagane (nie może być puste)
   - Minimalna długość: 8 znaków
   - Komunikat błędu: "Hasło musi mieć minimum 8 znaków"

3. **Walidacja formularza:**
   - Przycisk "Zarejestruj się" jest nieaktywny (`disabled`), gdy:
     - Email jest pusty lub niepoprawny
     - Hasło jest puste lub za krótkie
     - Trwa proces rejestracji (`isLoading = true`)

**Typy:**
- `RegisterFormData` - dane formularza (email, hasło)
- `RegisterFormErrors` - błędy walidacji dla poszczególnych pól
- `AuthError` (z Supabase) - błędy zwracane przez Supabase Auth

**Propsy:**
Komponent nie przyjmuje propsów - jest to standalone formularz.

### Card, CardHeader, CardTitle, CardDescription, CardContent (Shadcn/ui)

**Opis komponentów:**
Komponenty strukturalne z biblioteki Shadcn/ui, które tworzą estetyczny kontener dla formularza. Zapewniają spójny design system i właściwą hierarchię wizualną.

**Główne elementy:**
- Elementy `<div>` z odpowiednimi klasami Tailwind do stylowania
- Semantyczne tagowanie HTML dla dostępności

**Obsługiwane interakcje:**
Brak - komponenty są statyczne

**Typy:**
- `React.HTMLAttributes<HTMLDivElement>` - standardowe propsy HTML

**Propsy:**
- `className?: string` - opcjonalne dodatkowe klasy CSS
- `children: React.ReactNode` - zawartość komponentu

### Input (Shadcn/ui)

**Opis komponentu:**
Komponent pola tekstowego z biblioteki Shadcn/ui. Wykorzystywany do wprowadzania emaila i hasła. Obsługuje różne typy (`type="email"`, `type="password"`), stany (error, focus), oraz pełną integrację z formularzami React.

**Główne elementy:**
- Element `<input>` z klasami Tailwind
- Walidacja HTML5 (dla typu email)

**Obsługiwane interakcje:**
- `onChange` - aktualizacja wartości
- `onBlur` - walidacja po opuszczeniu pola
- `onFocus` - zmiana stylu na aktywny

**Obsługiwana walidacja:**
- Walidacja HTML5 dla typu `email`
- Wizualna indykacja błędów (czerwona ramka) poprzez warunkowe klasy CSS

**Typy:**
- `React.InputHTMLAttributes<HTMLInputElement>` - standardowe propsy input

**Propsy:**
- `type: "email" | "password" | "text"` - typ pola
- `value: string` - wartość pola
- `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void` - handler zmiany
- `onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void` - handler opuszczenia pola
- `placeholder?: string` - tekst placeholder
- `disabled?: boolean` - czy pole jest wyłączone
- `className?: string` - dodatkowe klasy CSS
- `aria-invalid?: boolean` - indykacja błędu dla czytników ekranu
- `aria-describedby?: string` - powiązanie z komunikatem błędu

### Label (Shadcn/ui)

**Opis komponentu:**
Etykieta dla pól formularza, zapewniająca dostępność i lepszą UX.

**Główne elementy:**
- Element `<label>` z klasami Tailwind

**Propsy:**
- `htmlFor: string` - ID powiązanego pola input
- `children: React.ReactNode` - tekst etykiety

### Button (Shadcn/ui)

**Opis komponentu:**
Przycisk do wysłania formularza, z obsługą różnych stanów (loading, disabled).

**Główne elementy:**
- Element `<button>` z klasami Tailwind
- Opcjonalny spinner/loader podczas ładowania

**Obsługiwane interakcje:**
- `onClick` - wywołanie akcji
- Domyślnie `type="submit"` dla wysłania formularza

**Typy:**
- `React.ButtonHTMLAttributes<HTMLButtonElement>`

**Propsy:**
- `type?: "submit" | "button" | "reset"` - typ przycisku
- `disabled?: boolean` - czy przycisk jest wyłączony
- `onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void` - handler kliknięcia
- `children: React.ReactNode` - zawartość przycisku
- `className?: string` - dodatkowe klasy CSS

### rejestracja.astro

**Opis komponentu:**
Strona Astro, która stanowi layout dla widoku rejestracji. Zawiera strukturę HTML, metadane strony, oraz osadza komponent React `RegisterForm`.

**Główne elementy:**
- Layout aplikacji (jeśli istnieje wspólny layout)
- Metadane strony (`<title>`, `<meta>`)
- Wycentrowany kontener dla formularza
- Komponent `<RegisterForm client:load />` - dyrektywa `client:load` zapewnia hydratację React

**Obsługiwane interakcje:**
Brak bezpośrednich interakcji - delegowane do komponentu React

**Typy:**
Astro nie używa TypeScript w szablonie, ale może importować typowane komponenty

**Propsy:**
Strona Astro nie przyjmuje propsów (to nie komponent)

## 5. Typy

### RegisterFormData
Reprezentuje dane wprowadzone przez użytkownika w formularzu rejestracji.

```typescript
type RegisterFormData = {
  email: string;
  password: string;
};
```

### RegisterFormErrors
Reprezentuje błędy walidacji dla poszczególnych pól formularza.

```typescript
type RegisterFormErrors = {
  email?: string;
  password?: string;
};
```

### RegisterFormState
Kompleksowy stan komponentu formularza rejestracji.

```typescript
type RegisterFormState = {
  formData: RegisterFormData;
  errors: RegisterFormErrors;
  isLoading: boolean;
  generalError: string | null;
};
```

### Istniejące typy z Supabase
- `AuthError` - typ błędu zwracany przez Supabase Auth (z `@supabase/supabase-js`)
- `User` - typ użytkownika zwracany po pomyślnej rejestracji (z `@supabase/supabase-js`)
- `Session` - typ sesji użytkownika (z `@supabase/supabase-js`)

**Uwaga:** Nie ma potrzeby tworzenia nowych DTO dla rejestracji, ponieważ Supabase Auth obsługuje to wewnętrznie. Komunikacja z API odbywa się poprzez SDK Supabase, które ma własne typy.

## 6. Zarządzanie stanem

Stan w komponencie `RegisterForm` będzie zarządzany za pomocą React hooks:

### useState hooks:

1. **formData: RegisterFormData**
   - Przechowuje aktualne wartości pól email i hasło
   - Inicjalizacja: `{ email: '', password: '' }`
   - Aktualizacja: przy każdej zmianie w polach Input

2. **errors: RegisterFormErrors**
   - Przechowuje komunikaty błędów walidacji dla każdego pola
   - Inicjalizacja: `{ email: undefined, password: undefined }`
   - Aktualizacja: po walidacji pól (onChange, onBlur, onSubmit)

3. **isLoading: boolean**
   - Wskazuje, czy trwa proces rejestracji
   - Inicjalizacja: `false`
   - Zmiana na `true` po wysłaniu formularza, `false` po otrzymaniu odpowiedzi

4. **generalError: string | null**
   - Przechowuje ogólny błąd zwrócony przez API (np. "Email już istnieje")
   - Inicjalizacja: `null`
   - Aktualizacja: w przypadku błędu API

### Custom Hook (opcjonalnie):

Można rozważyć utworzenie custom hooka `useRegisterForm()` w `src/components/hooks/useRegisterForm.ts`, który enkapsuluje całą logikę formularza:

```typescript
function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateEmail = (email: string): string | undefined => { /* ... */ };
  const validatePassword = (password: string): string | undefined => { /* ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... */ };

  return {
    formData,
    errors,
    isLoading,
    generalError,
    setFormData,
    handleSubmit,
    // ... inne metody pomocnicze
  };
}
```

**Zalecenie:** W pierwszej iteracji można zrezygnować z custom hooka i zarządzać stanem bezpośrednio w komponencie. Custom hook warto wprowadzić, jeśli logika będzie używana w innych miejscach lub komponent stanie się zbyt złożony.

## 7. Integracja API

### Mechanizm uwierzytelniania:
Rejestracja wykorzystuje **Supabase Auth API** poprzez SDK `@supabase/supabase-js`.

### Proces rejestracji:

1. Użytkownik wypełnia formularz i klika "Zarejestruj się"
2. Frontend wywołuje metodę `supabaseClient.auth.signUp()`
3. Supabase tworzy nowe konto użytkownika
4. Po pomyślnej rejestracji Supabase automatycznie loguje użytkownika (zwraca JWT)
5. Frontend przechowuje sesję (Supabase SDK robi to automatycznie)
6. Użytkownik jest przekierowywany na stronę główną

### Implementacja w komponencie:

```typescript
import { supabaseClient } from '@/db/supabase.client';
import type { AuthError } from '@supabase/supabase-js';

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // Walidacja przed wysłaniem
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  
  if (emailError || passwordError) {
    setErrors({ email: emailError, password: passwordError });
    return;
  }
  
  setIsLoading(true);
  setGeneralError(null);
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user && data.session) {
      // Użytkownik został automatycznie zalogowany
      // Przekierowanie na stronę główną
      window.location.href = '/';
    }
  } catch (error) {
    const authError = error as AuthError;
    setGeneralError(mapAuthErrorToMessage(authError));
    // Wyświetlenie Toast z błędem
  } finally {
    setIsLoading(false);
  }
};
```

### Typy żądania:
```typescript
// Wywołanie:
supabaseClient.auth.signUp({
  email: string,
  password: string,
})
```

### Typy odpowiedzi:
```typescript
// Sukces:
{
  data: {
    user: User | null,
    session: Session | null
  },
  error: null
}

// Błąd:
{
  data: { user: null, session: null },
  error: AuthError
}
```

### Obsługa błędów API:

Funkcja mapująca błędy Supabase na przyjazne komunikaty po polsku:

```typescript
function mapAuthErrorToMessage(error: AuthError): string {
  switch (error.message) {
    case 'User already registered':
      return 'Użytkownik o tym adresie e-mail już istnieje';
    case 'Invalid email':
      return 'Podano nieprawidłowy adres e-mail';
    case 'Password should be at least 6 characters':
      return 'Hasło musi mieć co najmniej 6 znaków';
    default:
      return 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
  }
}
```

## 8. Interakcje użytkownika

### 1. Wypełnianie formularza

**Akcja:** Użytkownik wpisuje adres e-mail w pole "Email"
**Rezultat:**
- Stan `formData.email` jest aktualizowany
- W trakcie pisania pole nie wyświetla błędów
- Po opuszczeniu pola (`onBlur`) następuje walidacja
- Jeśli email jest niepoprawny, pod polem pojawia się komunikat błędu w kolorze czerwonym

**Akcja:** Użytkownik wpisuje hasło w pole "Hasło"
**Rezultat:**
- Stan `formData.password` jest aktualizowany
- Tekst w polu jest maskowany (type="password")
- Po opuszczeniu pola następuje walidacja
- Jeśli hasło ma mniej niż 8 znaków, pod polem pojawia się komunikat błędu

### 2. Wysłanie formularza

**Akcja:** Użytkownik klika przycisk "Zarejestruj się"
**Rezultat:**
- Uruchamia się walidacja wszystkich pól
- Jeśli są błędy walidacji:
  - Komunikaty błędów pojawiają się pod odpowiednimi polami
  - Formularz NIE jest wysyłany
  - Przycisk pozostaje aktywny
- Jeśli walidacja przeszła pomyślnie:
  - Przycisk staje się nieaktywny (`disabled`)
  - Pojawia się wskaźnik ładowania (spinner) na przycisku lub obok
  - Wysyłane jest zapytanie do Supabase Auth
  - Podczas ładowania użytkownik nie może ponownie kliknąć przycisku

### 3. Pomyślna rejestracja

**Akcja:** API zwraca sukces
**Rezultat:**
- Wyświetlany jest Toast z komunikatem sukcesu: "Konto zostało utworzone pomyślnie!"
- Po 1 sekundzie użytkownik jest automatycznie przekierowany na stronę główną (`/`)
- Użytkownik jest zalogowany (sesja zapisana w Supabase)

### 4. Błąd rejestracji

**Akcja:** API zwraca błąd (np. zajęty email)
**Rezultat:**
- Wskaźnik ładowania znika
- Przycisk ponownie staje się aktywny
- Wyświetlany jest Toast z komunikatem błędu (np. "Użytkownik o tym adresie e-mail już istnieje")
- Użytkownik może poprawić dane i spróbować ponownie

### 5. Przejście do logowania

**Akcja:** Użytkownik klika link "Zaloguj się" pod formularzem
**Rezultat:**
- Użytkownik jest przekierowany na stronę `/logowanie`
- Stan formularza rejestracji nie jest zapisywany

### 6. Nawigacja poza stronę

**Akcja:** Użytkownik próbuje opuścić stronę podczas trwania rejestracji
**Rezultat:**
- (Opcjonalnie) Wyświetlane jest ostrzeżenie: "Czy na pewno chcesz opuścić stronę? Rejestracja jest w trakcie."
- Implementacja przez `beforeunload` event (opcjonalne, można pominąć w MVP)

## 9. Warunki i walidacja

### Walidacja pola Email:

**Warunek 1: Pole wymagane**
- **Sprawdzenie:** `email.trim() === ''`
- **Kiedy:** `onBlur`, `onSubmit`
- **Komunikat:** "Adres e-mail jest wymagany"
- **Efekt na UI:** Czerwona ramka wokół pola, komunikat błędu pod polem

**Warunek 2: Poprawny format**
- **Sprawdzenie:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)`
- **Kiedy:** `onBlur`, `onSubmit`
- **Komunikat:** "Podaj poprawny adres e-mail"
- **Efekt na UI:** Czerwona ramka wokół pola, komunikat błędu pod polem

### Walidacja pola Hasło:

**Warunek 1: Pole wymagane**
- **Sprawdzenie:** `password.trim() === ''`
- **Kiedy:** `onBlur`, `onSubmit`
- **Komunikat:** "Hasło jest wymagane"
- **Efekt na UI:** Czerwona ramka wokół pola, komunikat błędu pod polem

**Warunek 2: Minimalna długość**
- **Sprawdzenie:** `password.length < 8`
- **Kiedy:** `onBlur`, `onSubmit`
- **Komunikat:** "Hasło musi mieć minimum 8 znaków"
- **Efekt na UI:** Czerwona ramka wokół pola, komunikat błędu pod polem

### Walidacja formularza:

**Warunek: Formularz jest poprawny**
- **Sprawdzenie:** Brak błędów w `errors` i wszystkie pola wypełnione
- **Efekt na UI:** 
  - Przycisk "Zarejestruj się" jest aktywny (nie ma atrybutu `disabled`)
  - Kliknięcie przycisku wywołuje `handleSubmit`

**Warunek: Formularz jest niepoprawny**
- **Sprawdzenie:** Istnieją błędy w `errors` lub pola są puste
- **Efekt na UI:**
  - Przycisk "Zarejestruj się" jest nieaktywny (`disabled={!isFormValid}`)
  - Przycisk ma przygaszony wygląd (opacity 0.5)
  - Kliknięcie przycisku nie wywołuje akcji

**Warunek: Trwa rejestracja**
- **Sprawdzenie:** `isLoading === true`
- **Efekt na UI:**
  - Przycisk jest nieaktywny (`disabled`)
  - Wyświetlany jest spinner/loader
  - Pola formularza są zablokowane (`disabled`)

### Implementacja walidacji:

```typescript
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return 'Adres e-mail jest wymagany';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Podaj poprawny adres e-mail';
  }
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password.trim()) {
    return 'Hasło jest wymagane';
  }
  if (password.length < 8) {
    return 'Hasło musi mieć minimum 8 znaków';
  }
  return undefined;
};

const isFormValid = (): boolean => {
  return (
    !errors.email &&
    !errors.password &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== ''
  );
};
```

## 10. Obsługa błędów

### 1. Błędy walidacji (Client-side)

**Scenariusz:** Użytkownik podał nieprawidłowe dane
**Obsługa:**
- Komunikaty błędów wyświetlane bezpośrednio pod polami formularza
- Wizualna indykacja (czerwona ramka) wokół pól z błędami
- Atrybut `aria-invalid="true"` dla dostępności
- Powiązanie komunikatu błędu z polem przez `aria-describedby`

**Przykład:**
```tsx
<Input
  type="email"
  value={formData.email}
  onChange={handleEmailChange}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <p id="email-error" className="text-sm text-red-600 mt-1">
    {errors.email}
  </p>
)}
```

### 2. Błąd: Email już istnieje

**Scenariusz:** Użytkownik próbuje zarejestrować się z emailem, który już jest w bazie
**Obsługa:**
- Supabase zwraca błąd: `User already registered`
- Wyświetlany jest Toast z komunikatem: "Użytkownik o tym adresie e-mail już istnieje"
- Dodatkowo można podświetlić pole email jako błędne
- Link do strony logowania: "Może chcesz się zalogować?"

### 3. Błąd sieci / timeout

**Scenariusz:** Brak połączenia z internetem lub timeout API
**Obsługa:**
- Przechwycenie błędu w bloku `catch`
- Wyświetlenie Toast: "Nie można połączyć się z serwerem. Sprawdź połączenie internetowe."
- Przycisk ponownie staje się aktywny
- Stan formularza jest zachowany (użytkownik nie musi wpisywać danych ponownie)

### 4. Nieznany błąd API

**Scenariusz:** API zwróciło niestandardowy lub nieoczekiwany błąd
**Obsługa:**
- Wyświetlenie ogólnego komunikatu: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."
- Logowanie szczegółów błędu do konsoli (w trybie dev) dla debugowania
- Opcjonalnie: zapisanie błędu do systemu monitorowania błędów (np. Sentry)

### 5. Walidacja po stronie Supabase

**Scenariusz:** Supabase wykrył problem z danymi (np. hasło za krótkie według jego reguł)
**Obsługa:**
- Mapowanie błędu Supabase na przyjazny komunikat (funkcja `mapAuthErrorToMessage`)
- Wyświetlenie Toast z odpowiednim komunikatem
- Jeśli błąd dotyczy konkretnego pola, podświetlenie tego pola

### 6. Błąd przekierowania

**Scenariusz:** Po udanej rejestracji nie można przekierować użytkownika
**Obsługa:**
- Wyświetlenie Toast: "Konto zostało utworzone. Odśwież stronę."
- Zapewnienie alternatywnego linku: "Przejdź do strony głównej"

### 7. JavaScript wyłączony (edge case)

**Scenariusz:** Użytkownik ma wyłączony JavaScript
**Obsługa:**
- Wyświetlenie komunikatu `<noscript>`: "Ta aplikacja wymaga włączonego JavaScript"
- W MVP nie implementujemy fallbacku bez JS (aplikacja jest SPA/MPA z Astro, wymaga JS)

### Centralny handler błędów:

```typescript
const handleRegistrationError = (error: AuthError) => {
  const message = mapAuthErrorToMessage(error);
  
  // Wyświetlenie Toast
  toast({
    title: "Błąd rejestracji",
    description: message,
    variant: "destructive",
  });
  
  // Logowanie w trybie dev
  if (import.meta.env.DEV) {
    console.error('Registration error:', error);
  }
  
  // Aktualizacja stanu
  setGeneralError(message);
  setIsLoading(false);
};
```

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików
- Utworzyć plik `src/pages/rejestracja.astro`
- Utworzyć plik `src/components/RegisterForm.tsx`
- Upewnić się, że komponenty Shadcn/ui są zainstalowane: `Card`, `Input`, `Label`, `Button`, `Toast`
- Jeśli komponentów Shadcn/ui brakuje, zainstalować je zgodnie z dokumentacją Shadcn

### Krok 2: Implementacja strony Astro
- W `rejestracja.astro` zdefiniować layout strony
- Dodać metadane (`<title>Rejestracja - AI Fiszki</title>`)
- Utworzyć wycentrowany kontener dla formularza (flexbox lub grid)
- Zaimportować i osadzić komponent `RegisterForm` z dyrektywą `client:load`

```astro
---
import Layout from '@/layouts/Layout.astro';
import RegisterForm from '@/components/RegisterForm';
---

<Layout title="Rejestracja - AI Fiszki">
  <main class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <RegisterForm client:load />
  </main>
</Layout>
```

### Krok 3: Definicja typów
- W `src/components/RegisterForm.tsx` lub w osobnym pliku `src/types.ts` (jeśli będą używane globalnie):
- Zdefiniować typy `RegisterFormData`, `RegisterFormErrors`, `RegisterFormState`

```typescript
type RegisterFormData = {
  email: string;
  password: string;
};

type RegisterFormErrors = {
  email?: string;
  password?: string;
};
```

### Krok 4: Struktura komponentu RegisterForm
- Utworzyć komponent funkcyjny `RegisterForm`
- Zaimportować niezbędne hooki z React: `useState`
- Zaimportować komponenty Shadcn/ui: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Input`, `Label`, `Button`
- Zaimportować `supabaseClient` z `@/db/supabase.client`
- Zaimportować `toast` i `Toaster` z Shadcn/ui

### Krok 5: Zarządzanie stanem
- Zainicjalizować stany za pomocą `useState`:
  - `formData: RegisterFormData`
  - `errors: RegisterFormErrors`
  - `isLoading: boolean`
  - `generalError: string | null`

```typescript
const [formData, setFormData] = useState<RegisterFormData>({
  email: '',
  password: '',
});
const [errors, setErrors] = useState<RegisterFormErrors>({});
const [isLoading, setIsLoading] = useState(false);
const [generalError, setGeneralError] = useState<string | null>(null);
```

### Krok 6: Implementacja funkcji walidacji
- Utworzyć funkcję `validateEmail(email: string): string | undefined`
- Utworzyć funkcję `validatePassword(password: string): string | undefined`
- Utworzyć funkcję pomocniczą `isFormValid(): boolean`

```typescript
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'Adres e-mail jest wymagany';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Podaj poprawny adres e-mail';
  return undefined;
};

const validatePassword = (password: string): string | undefined => {
  if (!password.trim()) return 'Hasło jest wymagane';
  if (password.length < 8) return 'Hasło musi mieć minimum 8 znaków';
  return undefined;
};

const isFormValid = (): boolean => {
  return (
    !errors.email &&
    !errors.password &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== ''
  );
};
```

### Krok 7: Implementacja handlerów zdarzeń
- Utworzyć handler `handleEmailChange` dla zmiany wartości email
- Utworzyć handler `handlePasswordChange` dla zmiany wartości hasła
- Utworzyć handler `handleBlur` dla walidacji po opuszczeniu pola

```typescript
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, email: e.target.value });
  // Usunięcie błędu w trakcie pisania
  if (errors.email) {
    setErrors({ ...errors, email: undefined });
  }
};

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, password: e.target.value });
  if (errors.password) {
    setErrors({ ...errors, password: undefined });
  }
};

const handleBlur = (field: keyof RegisterFormData) => {
  if (field === 'email') {
    const error = validateEmail(formData.email);
    setErrors({ ...errors, email: error });
  } else if (field === 'password') {
    const error = validatePassword(formData.password);
    setErrors({ ...errors, password: error });
  }
};
```

### Krok 8: Implementacja funkcji mapowania błędów
- Utworzyć funkcję `mapAuthErrorToMessage(error: AuthError): string`
- Zmapować typowe błędy Supabase na przyjazne komunikaty po polsku

```typescript
const mapAuthErrorToMessage = (error: AuthError): string => {
  switch (error.message) {
    case 'User already registered':
      return 'Użytkownik o tym adresie e-mail już istnieje';
    case 'Invalid email':
      return 'Podano nieprawidłowy adres e-mail';
    case 'Password should be at least 6 characters':
      return 'Hasło musi mieć co najmniej 6 znaków';
    default:
      return 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.';
  }
};
```

### Krok 9: Implementacja handleSubmit
- Utworzyć funkcję asynchroniczną `handleSubmit`
- Zaimplementować pełną logikę rejestracji:
  1. Zapobiec domyślnej akcji formularza
  2. Walidacja wszystkich pól
  3. Ustawienie stanu `isLoading`
  4. Wywołanie `supabaseClient.auth.signUp()`
  5. Obsługa odpowiedzi (sukces/błąd)
  6. Przekierowanie lub wyświetlenie błędu

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // Walidacja
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  
  if (emailError || passwordError) {
    setErrors({ email: emailError, password: passwordError });
    return;
  }
  
  setIsLoading(true);
  setGeneralError(null);
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    
    if (error) throw error;
    
    if (data.user && data.session) {
      toast({
        title: "Sukces!",
        description: "Konto zostało utworzone pomyślnie!",
      });
      
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    }
  } catch (error) {
    const authError = error as AuthError;
    const message = mapAuthErrorToMessage(authError);
    setGeneralError(message);
    
    toast({
      title: "Błąd rejestracji",
      description: message,
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Krok 10: Struktura JSX komponentu
- Zbudować strukturę JSX formularza z wykorzystaniem komponentów Shadcn/ui
- Zaimplementować warunkowe renderowanie (błędy, loading)
- Dodać odpowiednie atrybuty ARIA dla dostępności

```tsx
return (
  <>
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Zarejestruj się</CardTitle>
        <CardDescription>Utwórz konto, aby korzystać z AI Fiszki</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Adres e-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => handleBlur('email')}
              disabled={isLoading}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-red-600 mt-1">
                {errors.email}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="password">Hasło</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-red-600 mt-1">
                {errors.password}
              </p>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Rejestrowanie...' : 'Zarejestruj się'}
          </Button>
          
          <p className="text-sm text-center text-gray-600">
            Masz już konto?{' '}
            <a href="/logowanie" className="text-blue-600 hover:underline">
              Zaloguj się
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
    <Toaster />
  </>
);
```

### Krok 11: Styling i responsywność
- Upewnić się, że formularz jest responsywny (działa na mobile i desktop)
- Użyć klas Tailwind: `max-w-md`, `w-full`, `min-h-screen`, `flex`, `items-center`, `justify-center`
- Przetestować wygląd na różnych rozmiarach ekranu
- Upewnić się, że kolory błędów są wystarczająco kontrastowe (WCAG AA)

### Krok 12: Testowanie manualne
- Przetestować formularz z poprawnymi danymi
- Przetestować formularz z nieprawidłowymi danymi (błędny email, za krótkie hasło)
- Przetestować rejestrację z zajętym emailem
- Przetestować zachowanie podczas braku internetu
- Przetestować dostępność za pomocą czytnika ekranu lub narzędzi dev tools
- Przetestować nawigację klawiaturą (Tab, Enter)

### Krok 13: Optymalizacja i refaktoryzacja
- Jeśli komponent jest zbyt duży, rozważyć wydzielenie custom hooka `useRegisterForm`
- Rozważyć utworzenie osobnego komponentu dla pola formularza z błędem (`FormField`)
- Upewnić się, że wszystkie stringi są łatwe do zmiany (można rozważyć plik z tłumaczeniami)

### Krok 14: Dokumentacja
- Dodać komentarze JSDoc do kluczowych funkcji
- Zaktualizować README projektu (jeśli istnieje) o informacje o nowym widoku
- Dodać notatki dla przyszłych programistów (np. jak rozszerzyć walidację)

### Krok 15: Commit i review
- Commitować zmiany z opisowym komunikatem: `feat: implement registration view (US-001)`
- Utworzyć Pull Request
- Przeprowadzić code review
- Poprawić ewentualne uwagi
- Merge do głównej gałęzi

---

**Koniec planu implementacji widoku Rejestracja**
