# Plan implementacji widoku Logowania

## 1. Przegląd
Widok logowania to punkt wejścia dla zarejestrowanych użytkowników aplikacji AI Fiszki. Jego głównym celem jest umożliwienie uwierzytelnienia użytkownika poprzez prosty, bezpieczny formularz z polami email i hasło. Widok wykorzystuje Supabase Auth do obsługi procesu logowania i zapewnia przejrzysty interfejs z odpowiednią walidacją i komunikatami o błędach.

## 2. Routing widoku
- **Ścieżka**: `/logowanie`
- **Plik**: `src/pages/logowanie.astro`
- **Typ**: Strona publiczna (bez wymaganej autoryzacji)
- **Przekierowanie po sukcesie**: `/` (strona główna)

## 3. Struktura komponentów
```
LoginPage (Astro)
└── LoginForm (React - interaktywny)
    ├── Card (Shadcn/ui)
    │   ├── CardHeader
    │   │   ├── CardTitle
    │   │   └── CardDescription
    │   ├── CardContent
    │   │   └── Form (własny wrapper)
    │   │       ├── FormField (Email)
    │   │       │   ├── Label
    │   │       │   └── Input
    │   │       ├── FormField (Password)
    │   │       │   ├── Label
    │   │       │   └── Input
    │   │       └── ErrorMessage (warunkowy)
    │   └── CardFooter
    │       ├── Button (Submit - "Zaloguj się")
    │       └── Link (do /rejestracja)
```

## 4. Szczegóły komponentów

### LoginPage (Astro)
- **Opis**: Strona Astro działająca jako kontener dla formularza logowania. Odpowiada za podstawowy layout strony i osadzenie interaktywnego komponentu React.
- **Główne elementy**: 
  - Layout strony z podstawową strukturą HTML
  - Wycentrowany kontener dla formularza
  - Import i renderowanie komponentu `LoginForm` z dyrektywą `client:load`
- **Obsługiwane interakcje**: Brak (statyczna strona Astro)
- **Walidacja**: Brak (walidacja odbywa się w komponencie React)
- **Typy**: Brak specyficznych typów
- **Propsy**: Brak

### LoginForm (React)
- **Opis**: Główny interaktywny komponent zawierający logikę formularza logowania. Zarządza stanem formularza, walidacją i komunikacją z Supabase Auth.
- **Główne elementy**:
  - `Card` jako kontener wizualny
  - `form` element z obsługą zdarzenia `onSubmit`
  - Dwa pola input (email, hasło)
  - Przycisk submit
  - Link do strony rejestracji
  - Warunkowe wyświetlanie komunikatów o błędach
- **Obsługiwane interakcje**:
  - `onChange` dla pól input (aktualizacja stanu formularza)
  - `onSubmit` formularza (próba logowania)
  - `onClick` na linku do rejestracji (nawigacja)
- **Walidacja**:
  - Email: poprawny format email (walidacja HTML5 `type="email"`)
  - Hasło: niepuste pole (minimum 1 znak, `required`)
  - Walidacja formatów przed wysłaniem do API
  - Obsługa błędów zwróconych z Supabase (nieprawidłowe dane)
- **Typy**: 
  - `LoginFormData` (lokalny interface dla stanu formularza)
  - `LoginError` (typ dla błędów logowania)
- **Propsy**: Brak (komponent niezależny)

### FormField (Email)
- **Opis**: Pole formularza dla adresu email z etykietą i inputem.
- **Główne elementy**:
  - `Label` z tekstem "Adres e-mail"
  - `Input` typu email z atrybutami: `type="email"`, `required`, `autoComplete="email"`
- **Obsługiwane interakcje**: 
  - `onChange` przekazywane z komponentu nadrzędnego
- **Walidacja**:
  - Format email (walidacja HTML5)
  - Pole wymagane
- **Typy**: `string` dla wartości
- **Propsy**:
  - `value: string`
  - `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`
  - `error?: string`

### FormField (Password)
- **Opis**: Pole formularza dla hasła z etykietą i inputem.
- **Główne elementy**:
  - `Label` z tekstem "Hasło"
  - `Input` typu password z atrybutami: `type="password"`, `required`, `autoComplete="current-password"`
- **Obsługiwane interakcje**: 
  - `onChange` przekazywane z komponentu nadrzędnego
- **Walidacja**:
  - Pole wymagane (minimum 1 znak)
- **Typy**: `string` dla wartości
- **Propsy**:
  - `value: string`
  - `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`
  - `error?: string`

### ErrorMessage
- **Opis**: Komponent wyświetlający komunikaty o błędach w sposób dostępny i widoczny dla użytkownika.
- **Główne elementy**:
  - `div` lub `Alert` z Shadcn/ui ze stylami błędu
  - Ikona ostrzeżenia (opcjonalnie)
  - Tekst błędu
- **Obsługiwane interakcje**: Brak
- **Walidacja**: Brak
- **Typy**: `string` dla komunikatu błędu
- **Propsy**:
  - `message: string`
  - `type?: 'error' | 'warning' | 'info'` (domyślnie 'error')

### Button (Submit)
- **Opis**: Przycisk Shadcn/ui do wysłania formularza.
- **Główne elementy**: Komponent `Button` z tekstem "Zaloguj się"
- **Obsługiwane interakcje**: 
  - `onClick` (submit formularza)
  - Stan loading podczas próby logowania
- **Walidacja**: Nieaktywny podczas ładowania (`disabled={isLoading}`)
- **Typy**: Brak
- **Propsy**:
  - `type: "submit"`
  - `disabled: boolean`
  - `isLoading: boolean` (dla stanu loading)

## 5. Typy

### LoginFormData
```typescript
interface LoginFormData {
  email: string;
  password: string;
}
```
**Opis**: Lokalny interface reprezentujący dane formularza logowania.
- `email`: Adres email użytkownika (string)
- `password`: Hasło użytkownika (string)

### LoginError
```typescript
interface LoginError {
  message: string;
  code?: string;
}
```
**Opis**: Typ reprezentujący błąd podczas logowania.
- `message`: Komunikat błędu do wyświetlenia użytkownikowi (string)
- `code`: Opcjonalny kod błędu z Supabase (string | undefined)

### SupabaseClient
```typescript
import type { SupabaseClient } from './db/supabase.client';
```
**Opis**: Typ klienta Supabase używany do uwierzytelnienia. Importowany z lokalnej konfiguracji projektu.

## 6. Zarządzanie stanem

Zarządzanie stanem w komponencie `LoginForm` będzie obsługiwane za pomocą hooków React:

### Stan lokalny (useState)
```typescript
const [formData, setFormData] = useState<LoginFormData>({
  email: '',
  password: ''
});

const [isLoading, setIsLoading] = useState<boolean>(false);
const [error, setError] = useState<LoginError | null>(null);
```

**Opis stanów**:
- `formData`: Przechowuje wartości pól formularza (email i hasło)
- `isLoading`: Flaga wskazująca, czy trwa proces logowania (używana do dezaktywacji przycisku i pokazania loadera)
- `error`: Przechowuje informacje o błędzie (jeśli wystąpił) lub null gdy nie ma błędu

### Aktualizacja stanu
- `formData` aktualizowany przy każdej zmianie wartości inputów (`onChange`)
- `isLoading` ustawiany na `true` przed wywołaniem API i na `false` po otrzymaniu odpowiedzi
- `error` resetowany przed każdą próbą logowania i ustawiany w przypadku niepowodzenia

### Custom hook (opcjonalnie)
Możliwe jest wyodrębnienie logiki do custom hooka `useAuth` w przyszłości, ale dla MVP wystarczy zarządzanie stanem bezpośrednio w komponencie.

## 7. Integracja API

### Metoda uwierzytelnienia
Logowanie będzie realizowane za pomocą metody `signInWithPassword` z Supabase Auth:

```typescript
const supabase = createClient(/* konfiguracja */);

const handleLogin = async (credentials: LoginFormData) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });
  
  return { data, error };
};
```

### Typ żądania
```typescript
{
  email: string;      // Format email, required
  password: string;   // Min. 1 znak, required
}
```

### Typ odpowiedzi (sukces)
```typescript
{
  data: {
    user: User;         // Obiekt użytkownika z Supabase
    session: Session;   // Sesja z JWT tokenem
  },
  error: null
}
```

### Typ odpowiedzi (błąd)
```typescript
{
  data: {
    user: null,
    session: null
  },
  error: {
    message: string;    // Komunikat błędu
    status: number;     // Kod HTTP
  }
}
```

### Obsługa odpowiedzi
- **Sukces**: Przekierowanie użytkownika na stronę główną (`/`) przy użyciu `window.location.href` lub `Astro.redirect` (w zależności od implementacji)
- **Błąd**: Wyświetlenie komunikatu błędu w komponencie `ErrorMessage`

### Klient Supabase
Klient Supabase powinien być zaimportowany z `src/db/supabase.client.ts` zgodnie z konfiguracją projektu:

```typescript
import { supabaseClient } from '@/db/supabase.client';
```

## 8. Interakcje użytkownika

### 1. Wprowadzanie danych w pola formularza
- **Akcja**: Użytkownik wpisuje email i hasło
- **Reakcja**: 
  - Wartości są zapisywane w stanie `formData`
  - Jeśli wcześniej był wyświetlony błąd, jest on czyszczony (`setError(null)`)
  - Pole email pokazuje walidację HTML5 (format email)

### 2. Próba wysłania formularza
- **Akcja**: Użytkownik klika przycisk "Zaloguj się" lub naciska Enter
- **Reakcja**:
  - Walidacja HTML5 sprawdza poprawność formatów
  - Jeśli dane są nieprawidłowe, przeglądarka pokazuje natywne komunikaty walidacji
  - Jeśli dane są poprawne, wykonywane są następujące kroki:
    1. `setIsLoading(true)` - przycisk staje się nieaktywny
    2. `setError(null)` - czyszczenie poprzednich błędów
    3. Wywołanie `supabase.auth.signInWithPassword()`
    4. Czekanie na odpowiedź

### 3. Otrzymanie odpowiedzi z API
- **Sukces**:
  - JWT token jest automatycznie zapisywany przez Supabase Client
  - Użytkownik jest przekierowany na stronę główną (`/`)
- **Błąd**:
  - `setIsLoading(false)` - przycisk staje się aktywny
  - `setError({ message: 'komunikat' })` - wyświetlenie komunikatu błędu
  - Użytkownik może spróbować ponownie

### 4. Nawigacja do rejestracji
- **Akcja**: Użytkownik klika link "Nie masz konta? Zarejestruj się"
- **Reakcja**: Przekierowanie na stronę `/rejestracja`

## 9. Warunki i walidacja

### Walidacja po stronie klienta (Frontend)

#### Pole Email
- **Warunek 1**: Pole nie może być puste
  - **Komponent**: `FormField (Email)`
  - **Implementacja**: Atrybut `required` na `<input>`
  - **Wpływ na UI**: Przeglądarka wyświetla natywny komunikat walidacji przy próbie submit
  
- **Warunek 2**: Musi być poprawnym formatem email
  - **Komponent**: `FormField (Email)`
  - **Implementacja**: Atrybut `type="email"` na `<input>`
  - **Wpływ na UI**: Przeglądarka waliduje format i wyświetla komunikat jeśli niepoprawny

#### Pole Password
- **Warunek 1**: Pole nie może być puste
  - **Komponent**: `FormField (Password)`
  - **Implementacja**: Atrybut `required` na `<input>`
  - **Wpływ na UI**: Przeglądarka wyświetla natywny komunikat walidacji przy próbie submit

#### Formularz
- **Warunek 1**: Wszystkie pola muszą być wypełnione przed wysłaniem
  - **Komponent**: `LoginForm`
  - **Implementacja**: Walidacja HTML5 przed wywołaniem `handleSubmit`
  - **Wpływ na UI**: Przycisk submit można kliknąć, ale formularz nie zostanie wysłany jeśli walidacja nie przejdzie

### Walidacja po stronie serwera (Backend - Supabase)

#### Uwierzytelnienie
- **Warunek 1**: Email musi istnieć w bazie danych
  - **Komponent**: `LoginForm` (obsługa błędu)
  - **Implementacja**: Supabase sprawdza istnienie użytkownika
  - **Wpływ na UI**: Wyświetlenie komunikatu "Nieprawidłowy email lub hasło"

- **Warunek 2**: Hasło musi być poprawne dla danego email
  - **Komponent**: `LoginForm` (obsługa błędu)
  - **Implementacja**: Supabase weryfikuje hasło
  - **Wpływ na UI**: Wyświetlenie komunikatu "Nieprawidłowy email lub hasło"

- **Warunek 3**: Konto użytkownika musi być aktywne
  - **Komponent**: `LoginForm` (obsługa błędu)
  - **Implementacja**: Supabase sprawdza status konta
  - **Wpływ na UI**: Wyświetlenie komunikatu specyficznego dla statusu konta

### Wpływ stanów walidacji na UI

1. **Stan początkowy**: Formularz pusty, przycisk aktywny
2. **Stan wypełniania**: Użytkownik wypełnia pola, brak komunikatów
3. **Stan błędu walidacji HTML5**: Natywne komunikaty przeglądarki przy próbie submit
4. **Stan ładowania**: Przycisk nieaktywny, pokazany spinner/tekst "Logowanie..."
5. **Stan błędu API**: Komunikat błędu wyświetlony nad formularzem, przycisk aktywny
6. **Stan sukcesu**: Przekierowanie na stronę główną

## 10. Obsługa błędów

### Błędy walidacji po stronie klienta
- **Typ błędu**: Puste pola lub nieprawidłowy format email
- **Obsługa**: Walidacja HTML5 blokuje wysłanie formularza
- **Komunikat**: Natywne komunikaty przeglądarki (np. "Wypełnij to pole", "Wprowadź prawidłowy adres email")
- **Akcja użytkownika**: Poprawienie danych i ponowna próba

### Błędy uwierzytelnienia
- **Typ błędu**: Nieprawidłowe dane logowania (email lub hasło)
- **Obsługa**: Catch błędu z Supabase, wyświetlenie komunikatu
- **Komunikat**: "Nieprawidłowy email lub hasło. Spróbuj ponownie."
- **Akcja użytkownika**: Poprawienie danych lub przejście do rejestracji

### Błędy sieciowe
- **Typ błędu**: Brak połączenia z internetem lub timeout
- **Obsługa**: Catch błędu, wyświetlenie komunikatu
- **Komunikat**: "Wystąpił problem z połączeniem. Sprawdź swoje połączenie internetowe i spróbuj ponownie."
- **Akcja użytkownika**: Sprawdzenie połączenia i ponowna próba

### Błędy serwera
- **Typ błędu**: Błąd 500 lub inny błąd serwera Supabase
- **Obsługa**: Catch błędu, wyświetlenie ogólnego komunikatu
- **Komunikat**: "Wystąpił problem z serwerem. Spróbuj ponownie za chwilę."
- **Akcja użytkownika**: Oczekiwanie i ponowna próba

### Konto nieaktywne
- **Typ błędu**: Konto użytkownika jest nieaktywne lub niepotwierdzony email
- **Obsługa**: Catch specyficznego błędu z Supabase
- **Komunikat**: "Twoje konto nie zostało jeszcze aktywowane. Sprawdź swoją skrzynkę email."
- **Akcja użytkownika**: Sprawdzenie emaila i potwierdzenie konta

### Rate limiting
- **Typ błędu**: Zbyt wiele prób logowania w krótkim czasie
- **Obsługa**: Catch błędu rate limit z Supabase
- **Komunikat**: "Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut."
- **Akcja użytkownika**: Oczekiwanie i ponowna próba po kilku minutach

### Implementacja obsługi błędów
```typescript
try {
  setIsLoading(true);
  setError(null);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password
  });
  
  if (error) {
    // Mapowanie błędów Supabase na przyjazne komunikaty
    const errorMessage = mapSupabaseError(error);
    setError({ message: errorMessage, code: error.code });
    return;
  }
  
  // Sukces - przekierowanie
  window.location.href = '/';
  
} catch (err) {
  // Błędy nieoczekiwane
  setError({ 
    message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.' 
  });
} finally {
  setIsLoading(false);
}
```

### Funkcja pomocnicza mapowania błędów
```typescript
const mapSupabaseError = (error: AuthError): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Nieprawidłowy email lub hasło. Spróbuj ponownie.';
    case 'Email not confirmed':
      return 'Twoje konto nie zostało jeszcze aktywowane. Sprawdź swoją skrzynkę email.';
    case 'Too many requests':
      return 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.';
    default:
      return 'Wystąpił problem podczas logowania. Spróbuj ponownie.';
  }
};
```

## 11. Kroki implementacji

### Krok 1: Utworzenie struktury plików
1. Utwórz plik `src/pages/logowanie.astro` dla strony Astro
2. Utwórz plik `src/components/LoginForm.tsx` dla komponentu React
3. Utwórz plik `src/lib/auth.ts` dla funkcji pomocniczych autoryzacji (mapowanie błędów)

### Krok 2: Definicja typów
1. Dodaj interface `LoginFormData` w pliku `LoginForm.tsx`
2. Dodaj interface `LoginError` w pliku `LoginForm.tsx`
3. Zweryfikuj, czy klient Supabase jest poprawnie skonfigurowany w `src/db/supabase.client.ts`

### Krok 3: Implementacja komponentu LoginForm
1. Zaimportuj niezbędne zależności:
   - React hooks (`useState`)
   - Komponenty Shadcn/ui (`Card`, `Input`, `Button`, `Label`)
   - Klient Supabase z `src/db/supabase.client.ts`
2. Zdefiniuj stan komponentu (`formData`, `isLoading`, `error`)
3. Zaimplementuj handler `handleChange` dla aktualizacji pól formularza
4. Zaimplementuj async handler `handleSubmit` dla logowania:
   - Ustawienie `isLoading` na `true`
   - Wywołanie `supabase.auth.signInWithPassword()`
   - Obsługa odpowiedzi (sukces → przekierowanie, błąd → wyświetlenie komunikatu)
   - Ustawienie `isLoading` na `false`
5. Zbuduj strukturę JSX formularza:
   - Komponent `Card` jako kontener
   - `CardHeader` z tytułem i opisem
   - `CardContent` z formularzem
   - Pola input dla email i hasła
   - Warunkowe renderowanie komunikatu błędu
   - `CardFooter` z przyciskiem submit i linkiem do rejestracji

### Krok 4: Implementacja strony Astro
1. Utwórz podstawowy layout strony w `src/pages/logowanie.astro`
2. Zaimportuj komponent `LoginForm`
3. Osadź komponent z dyrektywą `client:load` dla pełnej interaktywności
4. Dodaj stylowanie dla wycentrowania formularza na stronie
5. Dodaj odpowiednie meta tagi dla SEO (title, description)

### Krok 5: Implementacja funkcji pomocniczych
1. W pliku `src/lib/auth.ts` utwórz funkcję `mapSupabaseError`
2. Zaimplementuj mapowanie kodów błędów Supabase na przyjazne komunikaty w języku polskim
3. Wyeksportuj funkcję do użycia w `LoginForm`

### Krok 6: Stylowanie komponentów
1. Użyj klas Tailwind CSS dla układu strony (wycentrowanie formularza)
2. Zastosuj komponenty Shadcn/ui dla spójności z design systemem
3. Dostosuj szerokość `Card` (np. `max-w-md`)
4. Dodaj odpowiednie odstępy między elementami formularza
5. Styluj komunikaty błędów (kolor czerwony, ikona ostrzeżenia)
6. Dodaj stan loading dla przycisku (spinner lub zmiana tekstu)

### Krok 7: Implementacja walidacji
1. Dodaj atrybuty HTML5 do pól input:
   - `type="email"` dla pola email
   - `required` dla obu pól
   - `autoComplete="email"` i `autoComplete="current-password"`
2. Zaimplementuj czyszczenie błędów przy zmianie wartości pól
3. Przetestuj walidację HTML5 w przeglądarce

### Krok 8: Integracja z Supabase Auth
1. Zweryfikuj konfigurację Supabase w projekcie
2. Przetestuj wywołanie `signInWithPassword` z przykładowymi danymi
3. Sprawdź czy JWT token jest prawidłowo zapisywany po sukcesie
4. Przetestuj przekierowanie na stronę główną po zalogowaniu

### Krok 9: Testowanie
1. Przetestuj walidację formularza:
   - Próba wysłania pustego formularza
   - Próba wysłania nieprawidłowego formatu email
   - Próba wysłania poprawnych danych
2. Przetestuj logowanie z poprawnymi danymi:
   - Sprawdź czy użytkownik jest przekierowany
   - Sprawdź czy sesja jest zachowana
3. Przetestuj logowanie z niepoprawnymi danymi:
   - Sprawdź czy wyświetla się odpowiedni komunikat błędu
   - Sprawdź czy można ponowić próbę
4. Przetestuj obsługę błędów sieciowych (symulacja offline)
5. Przetestuj dostępność (keyboard navigation, screen readers)

### Krok 10: Optymalizacja i dopracowanie
1. Sprawdź responsywność na różnych rozmiarach ekranu
2. Przetestuj w różnych przeglądarkach (Chrome, Firefox, Safari, Edge)
3. Zoptymalizuj bundle size (lazy loading jeśli potrzebne)
4. Dodaj analytics tracking (opcjonalnie)
5. Przejrzyj kod pod kątem najlepszych praktyk i refactoringu

### Krok 11: Dokumentacja i finalizacja
1. Dodaj komentarze do kodu wyjaśniające złożoną logikę
2. Zaktualizuj dokumentację projektu jeśli potrzeba
3. Utwórz PR z opisem implementacji
4. Przejdź code review
5. Merge do głównej gałęzi po zatwierdzeniu
