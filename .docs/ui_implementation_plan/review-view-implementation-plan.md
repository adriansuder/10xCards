# Plan implementacji widoku Sesja Nauki

## 1. Przegląd

Widok Sesja Nauki (`/ucz-sie`) to kluczowy komponent aplikacji AI Fiszki, który umożliwia użytkownikom przeprowadzenie sesji powtórek według zmodyfikowanej metody Leitnera. Widok prezentuje użytkownikowi fiszki, które wymagają powtórki (gdzie `review_due_at <= NOW()`), umożliwia odkrycie odpowiedzi i samoocenę wiedzy poprzez przyciski "Wiem" i "Nie wiem". System automatycznie aktualizuje status fiszki (pudełko Leitnera i datę kolejnej powtórki) oraz kontynuuje sesję do momentu wyczerpania kart. Po zakończeniu użytkownik widzi ekran podsumowania z lokalnymi statystykami sesji.

Widok musi być chroniony autentykacją i zaprojektowany w minimalistyczny sposób, aby maksymalnie skupić uwagę użytkownika na zadaniu nauki.

## 2. Routing widoku

- **Ścieżka**: `/ucz-sie`
- **Typ trasy**: Chroniona (wymaga uwierzytelnienia użytkownika)
- **Plik Astro**: `src/pages/ucz-sie.astro`
- **Przekierowanie**: Nieautoryzowani użytkownicy są przekierowywani na stronę logowania

## 3. Struktura komponentów

```
ReviewSessionPage (Astro)
├── ReviewSessionContainer (React)
    ├── LoadingState (React)
    ├── EmptyState (React)
    ├── ActiveSession (React)
    │   ├── SessionProgress (React)
    │   ├── FlashcardDisplay (React)
    │   │   ├── Card (shadcn/ui)
    │   │   └── Button (shadcn/ui) - "Pokaż odpowiedź"
    │   └── ReviewActions (React)
    │       ├── Button (shadcn/ui) - "Nie wiem"
    │       └── Button (shadcn/ui) - "Wiem"
    └── SessionSummary (React)
        ├── Card (shadcn/ui)
        └── Button (shadcn/ui) - "Zakończ sesję"
```

## 4. Szczegóły komponentów

### ReviewSessionPage (Astro)

- **Opis komponentu**: Główny plik strony Astro odpowiedzialny za renderowanie widoku sesji nauki. Komponent server-side zapewnia ochronę trasy i przekazuje kontekst użytkownika do komponentu React.
- **Główne elementy**: 
  - Layout aplikacji
  - Middleware sprawdzający autentykację
  - Hydratowany komponent React `ReviewSessionContainer`
- **Obsługiwane zdarzenia**: Brak (komponent statyczny)
- **Warunki walidacji**: Sprawdzenie, czy użytkownik jest zalogowany (middleware)
- **Typy**: Brak dodatkowych typów
- **Propsy**: Brak

### ReviewSessionContainer (React)

- **Opis komponentu**: Główny kontener React zarządzający stanem całej sesji nauki. Odpowiedzialny za pobieranie fiszek, orkiestrację przepływu między kartami, komunikację z API oraz przełączanie między stanami (loading, empty, active, summary).
- **Główne elementy**:
  - Warunkowe renderowanie stanów: `LoadingState`, `EmptyState`, `ActiveSession`, `SessionSummary`
  - Logika zarządzania stanem sesji (custom hook `useReviewSession`)
- **Obsługiwane zdarzenia**:
  - Inicjalizacja sesji (przy montowaniu komponentu)
  - Obsługa odpowiedzi użytkownika ("Wiem"/"Nie wiem")
  - Przejście do następnej karty
  - Zakończenie sesji
- **Warunki walidacji**: 
  - Sprawdzenie, czy API zwróciło dane
  - Sprawdzenie, czy lista kart nie jest pusta
  - Walidacja odpowiedzi API zgodnie z `ReviewSessionDto`
- **Typy**: 
  - `ReviewSessionDto` (z types.ts)
  - `ReviewCardDto` (z types.ts)
  - `SessionState` (nowy ViewModel)
  - `SessionStatistics` (nowy ViewModel)
- **Propsy**: Brak (komponent główny)

### LoadingState (React)

- **Opis komponentu**: Komponent prezentacyjny wyświetlający wskaźnik ładowania podczas pobierania fiszek z API.
- **Główne elementy**:
  - Spinner/skeleton loader (z shadcn/ui)
  - Tekst "Przygotowuję twoją sesję..."
- **Obsługiwane zdarzenia**: Brak
- **Warunki walidacji**: Brak
- **Typy**: Brak
- **Propsy**: Brak

### EmptyState (React)

- **Opis komponentu**: Komponent prezentacyjny wyświetlający komunikat, gdy brak fiszek do powtórki.
- **Główne elementy**:
  - `Card` (shadcn/ui) z ikoną sukcesu
  - Nagłówek: "Świetna robota!"
  - Tekst: "Ukończyłeś wszystkie powtórki na dziś. Wróć jutro, aby kontynuować naukę."
  - `Button` (shadcn/ui) - link powrotu do strony głównej
- **Obsługiwane zdarzenia**: 
  - Kliknięcie przycisku powrotu (przekierowanie)
- **Warunki walidacji**: Brak
- **Typy**: Brak
- **Propsy**: Brak

### ActiveSession (React)

- **Opis komponentu**: Komponent zarządzający aktywną sesją nauki. Wyświetla aktualną fiszkę i przyciski akcji.
- **Główne elementy**:
  - `SessionProgress` - wskaźnik postępu
  - `FlashcardDisplay` - wyświetlanie fiszki
  - `ReviewActions` - przyciski oceny (warunkowo)
- **Obsługiwane zdarzenia**:
  - Pokazanie odpowiedzi
  - Ocena fiszki ("Wiem"/"Nie wiem")
- **Warunki walidacji**: 
  - Sprawdzenie, czy `currentCard` istnieje
  - Sprawdzenie, czy indeks karty jest poprawny
- **Typy**:
  - `ReviewCardDto`
  - `SessionState`
- **Propsy**:
  - `currentCard: ReviewCardDto` - aktualna fiszka do wyświetlenia
  - `currentIndex: number` - indeks aktualnej karty
  - `totalCards: number` - łączna liczba kart
  - `isAnswerRevealed: boolean` - czy odpowiedź jest odkryta
  - `isSubmitting: boolean` - czy trwa wysyłanie oceny
  - `onRevealAnswer: () => void` - callback odkrycia odpowiedzi
  - `onSubmitReview: (knewIt: boolean) => Promise<void>` - callback oceny

### SessionProgress (React)

- **Opis komponentu**: Komponent wyświetlający postęp sesji (X z Y kart).
- **Główne elementy**:
  - Tekst: "Karta X z Y"
  - Progress bar (opcjonalnie, z shadcn/ui)
- **Obsługiwane zdarzenia**: Brak
- **Warunki walidacji**: 
  - `currentIndex` >= 1
  - `totalCards` >= 1
  - `currentIndex` <= `totalCards`
- **Typy**: Brak
- **Propsy**:
  - `currentIndex: number` - numer aktualnej karty (1-based)
  - `totalCards: number` - łączna liczba kart

### FlashcardDisplay (React)

- **Opis komponentu**: Komponent wyświetlający treść fiszki. Pokazuje przód karty, a po kliknięciu "Pokaż odpowiedź" odkrywa tył.
- **Główne elementy**:
  - `Card` (shadcn/ui) - kontener fiszki
  - Sekcja "Front" - zawsze widoczna
  - Sekcja "Back" - widoczna po odkryciu
  - Sekcja "Part of Speech" - widoczna po odkryciu (jeśli istnieje)
  - `Button` "Pokaż odpowiedź" - widoczny tylko gdy odpowiedź ukryta
- **Obsługiwane zdarzenia**:
  - `onRevealAnswer` - kliknięcie przycisku odkrycia odpowiedzi
- **Warunki walidacji**:
  - `card.front` - wymagane, niepuste
  - `card.back` - wymagane, niepuste
  - `card.part_of_speech` - opcjonalne
- **Typy**: `ReviewCardDto`
- **Propsy**:
  - `card: ReviewCardDto` - obiekt fiszki
  - `isAnswerRevealed: boolean` - czy odpowiedź jest odkryta
  - `onRevealAnswer: () => void` - callback odkrycia odpowiedzi

### ReviewActions (React)

- **Opis komponentu**: Komponent zawierający przyciski oceny fiszki ("Nie wiem" i "Wiem"). Wyświetlany tylko po odkryciu odpowiedzi.
- **Główne elementy**:
  - `Button` "Nie wiem" (wariant destructive/secondary)
  - `Button` "Wiem" (wariant primary/default)
  - Oba przyciski zablokowane podczas `isSubmitting`
- **Obsługiwane zdarzenia**:
  - `onSubmitReview(false)` - kliknięcie "Nie wiem"
  - `onSubmitReview(true)` - kliknięcie "Wiem"
- **Warunki walidacji**:
  - Przyciski nieaktywne podczas `isSubmitting === true`
  - Komponent nie renderuje się gdy `isAnswerRevealed === false`
- **Typy**: Brak
- **Propsy**:
  - `isSubmitting: boolean` - czy trwa wysyłanie oceny
  - `onSubmitReview: (knewIt: boolean) => Promise<void>` - callback oceny

### SessionSummary (React)

- **Opis komponentu**: Komponent wyświetlający podsumowanie zakończonej sesji z lokalnymi statystykami.
- **Główne elementy**:
  - `Card` (shadcn/ui) z podsumowaniem
  - Nagłówek: "Sesja zakończona!"
  - Statystyki:
    - Łączna liczba przejrzanych kart
    - Liczba kart "Wiem"
    - Liczba kart "Nie wiem"
    - Procent poprawnych odpowiedzi
  - `Button` "Zakończ sesję" - powrót do strony głównej
- **Obsługiwane zdarzenia**:
  - Kliknięcie przycisku zakończenia (przekierowanie)
- **Warunki walidacji**:
  - `statistics.totalReviewed` > 0
  - `statistics.knewCount + statistics.didntKnowCount === statistics.totalReviewed`
- **Typy**: `SessionStatistics`
- **Propsy**:
  - `statistics: SessionStatistics` - obiekt ze statystykami sesji

## 5. Typy

### Istniejące typy (z types.ts)

```typescript
// DTO dla pojedynczej karty w sesji powtórek
export type ReviewCardDto = Pick<FlashcardRow, 'id' | 'front' | 'back' | 'part_of_speech'>;

// DTO dla całej sesji powtórek
export type ReviewSessionDto = {
  cards: ReviewCardDto[];
};

// DTO dla aktualizacji statusu powtórki
export type UpdateCardReviewDto = {
  flashcardId: string;
  knewIt: boolean;
};
```

### Nowe typy ViewModel (do utworzenia w komponencie lub osobnym pliku types)

```typescript
/**
 * Typ enum reprezentujący możliwe stany widoku sesji.
 */
export type SessionViewState = 
  | 'loading'      // Pobieranie fiszek z API
  | 'empty'        // Brak fiszek do powtórki
  | 'active'       // Aktywna sesja nauki
  | 'summary';     // Ekran podsumowania

/**
 * Typ reprezentujący kompletny stan sesji w komponencie.
 */
export type SessionState = {
  viewState: SessionViewState;
  cards: ReviewCardDto[];
  currentIndex: number;           // 0-based index aktualnej karty
  isAnswerRevealed: boolean;
  isSubmitting: boolean;          // Czy trwa wysyłanie oceny do API
  statistics: SessionStatistics;
};

/**
 * Typ reprezentujący statystyki sesji nauki.
 * Zliczane lokalnie podczas sesji.
 */
export type SessionStatistics = {
  totalReviewed: number;          // Łączna liczba przejrzanych kart
  knewCount: number;              // Liczba kart ocenionych jako "Wiem"
  didntKnowCount: number;         // Liczba kart ocenionych jako "Nie wiem"
  successRate: number;            // Procent poprawnych (knewCount / totalReviewed * 100)
};

/**
 * Typ reprezentujący błędy API w kontekście sesji.
 */
export type SessionError = {
  message: string;
  type: 'fetch' | 'update' | 'unknown';
};
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany przez custom hook `useReviewSession`, który enkapsuluje całą logikę biznesową sesji nauki.

### Custom Hook: useReviewSession

**Lokalizacja**: `src/components/hooks/useReviewSession.ts`

**Odpowiedzialności**:
1. Pobieranie fiszek do powtórki z API przy inicjalizacji
2. Zarządzanie stanem widoku (loading, empty, active, summary)
3. Zarządzanie aktualnym indeksem karty
4. Obsługa odkrywania odpowiedzi
5. Wysyłanie oceny fiszki do API
6. Przejście do kolejnej karty lub ekranu podsumowania
7. Zliczanie lokalnych statystyk sesji
8. Obsługa błędów i retry logic

**Stan wewnętrzny**:
```typescript
const [sessionState, setSessionState] = useState<SessionState>({
  viewState: 'loading',
  cards: [],
  currentIndex: 0,
  isAnswerRevealed: false,
  isSubmitting: false,
  statistics: {
    totalReviewed: 0,
    knewCount: 0,
    didntKnowCount: 0,
    successRate: 0,
  },
});
const [error, setError] = useState<SessionError | null>(null);
```

**Eksportowane funkcje**:
- `initializeSession(): Promise<void>` - inicjalizacja sesji (pobieranie kart)
- `revealAnswer(): void` - odkrycie odpowiedzi aktualnej karty
- `submitReview(knewIt: boolean): Promise<void>` - wysłanie oceny i przejście do kolejnej karty
- `endSession(): void` - ręczne zakończenie sesji (przekierowanie)

**Logika submitReview**:
1. Ustaw `isSubmitting = true`
2. Wyślij POST do `/api/review/update` z `{ flashcardId, knewIt }`
3. Jeśli sukces (204):
   - Zaktualizuj statystyki lokalnie (increment totalReviewed, increment knewCount lub didntKnowCount)
   - Przelicz successRate
   - Jeśli `currentIndex + 1 < cards.length`:
     - Increment `currentIndex`
     - Ustaw `isAnswerRevealed = false`
   - Jeśli to była ostatnia karta:
     - Ustaw `viewState = 'summary'`
4. Jeśli błąd:
   - Wyświetl toast z błędem
   - Ustaw `error` state
   - Umożliw retry (przycisk "Spróbuj ponownie")
5. Ustaw `isSubmitting = false`

**Obsługa błędów**:
- **Błąd inicjalizacji** (GET /api/review/session): Toast + przycisk "Spróbuj ponownie"
- **Błąd aktualizacji** (POST /api/review/update): Toast + zachowanie stanu (możliwość ponownej próby)
- **404 przy aktualizacji**: Toast "Fiszka nie została znaleziona" + przejście do kolejnej karty
- **401 Unauthorized**: Przekierowanie na stronę logowania

## 7. Integracja API

### Endpoint 1: Pobieranie kart do powtórki

- **Metoda**: `GET`
- **Ścieżka**: `/api/review/session`
- **Query params**: 
  - `limit` (opcjonalny, domyślnie 50): `number`
- **Request payload**: Brak
- **Response payload**: `ReviewSessionDto`
  ```typescript
  {
    cards: ReviewCardDto[]  // tablica obiektów { id, front, back, part_of_speech }
  }
  ```
- **Kody sukcesu**: `200 OK`
- **Kody błędów**: 
  - `401 Unauthorized` - użytkownik niezalogowany
- **Kiedy wywołać**: Przy montowaniu komponentu `ReviewSessionContainer` w `useEffect` lub w custom hook `useReviewSession`
- **Typ żądania**: Brak body
- **Typ odpowiedzi**: `ReviewSessionDto`
- **Walidacja odpowiedzi**: Sprawdzić, czy `cards` jest tablicą, walidować strukturę każdego elementu (`id`, `front`, `back`)

### Endpoint 2: Aktualizacja statusu powtórki

- **Metoda**: `POST`
- **Ścieżka**: `/api/review/update`
- **Query params**: Brak
- **Request payload**: `UpdateCardReviewDto`
  ```typescript
  {
    flashcardId: string;  // UUID fiszki
    knewIt: boolean;      // true = "Wiem", false = "Nie wiem"
  }
  ```
- **Response payload**: Brak (204 No Content)
- **Kody sukcesu**: `204 No Content`
- **Kody błędów**:
  - `400 Bad Request` - błędna walidacja (np. niepoprawny UUID)
  - `401 Unauthorized` - użytkownik niezalogowany
  - `404 Not Found` - fiszka nie istnieje lub nie należy do użytkownika
- **Kiedy wywołać**: Po kliknięciu "Wiem" lub "Nie wiem" w komponencie `ReviewActions`
- **Typ żądania**: `UpdateCardReviewDto`
- **Typ odpowiedzi**: `void` (brak body w odpowiedzi)
- **Walidacja żądania**: Walidacja UUID po stronie klienta przed wysłaniem

## 8. Interakcje użytkownika

### Interakcja 1: Rozpoczęcie sesji
- **Trigger**: Użytkownik klika link "Ucz się" w nawigacji
- **Przebieg**:
  1. Przekierowanie na `/ucz-sie`
  2. Wyświetlenie `LoadingState`
  3. Wywołanie GET `/api/review/session`
  4. Jeśli sukces i `cards.length > 0`: wyświetlenie `ActiveSession` z pierwszą kartą
  5. Jeśli sukces i `cards.length === 0`: wyświetlenie `EmptyState`
  6. Jeśli błąd: wyświetlenie toastu z błędem + przycisk retry
- **Oczekiwany wynik**: Użytkownik widzi pierwszą fiszkę do powtórki lub komunikat o braku kart

### Interakcja 2: Odkrycie odpowiedzi
- **Trigger**: Użytkownik klika przycisk "Pokaż odpowiedź"
- **Przebieg**:
  1. Wywołanie `revealAnswer()` z hooka
  2. Ustawienie `isAnswerRevealed = true`
  3. Komponent `FlashcardDisplay` odkrywa tył karty i część mowy
  4. Komponent `ReviewActions` staje się widoczny
- **Oczekiwany wynik**: Użytkownik widzi tył fiszki i przyciski "Wiem"/"Nie wiem"

### Interakcja 3: Ocena fiszki jako "Wiem"
- **Trigger**: Użytkownik klika przycisk "Wiem"
- **Przebieg**:
  1. Wywołanie `submitReview(true)`
  2. Ustawienie `isSubmitting = true` (przyciski disabled)
  3. Wysłanie POST `/api/review/update` z `{ flashcardId, knewIt: true }`
  4. Jeśli sukces:
     - Aktualizacja statystyk: `totalReviewed++`, `knewCount++`
     - Przeliczenie `successRate`
     - Jeśli są kolejne karty: przejście do następnej (`currentIndex++`, `isAnswerRevealed = false`)
     - Jeśli to ostatnia karta: przejście do `viewState = 'summary'`
  5. Jeśli błąd: toast z komunikatem + możliwość retry
  6. Ustawienie `isSubmitting = false`
- **Oczekiwany wynik**: Przejście do kolejnej fiszki lub ekranu podsumowania

### Interakcja 4: Ocena fiszki jako "Nie wiem"
- **Trigger**: Użytkownik klika przycisk "Nie wiem"
- **Przebieg**: Analogiczny jak w Interakcji 3, z różnicą `knewIt: false` i `didntKnowCount++`
- **Oczekiwany wynik**: Przejście do kolejnej fiszki lub ekranu podsumowania

### Interakcja 5: Zakończenie sesji z podsumowaniem
- **Trigger**: Ocena ostatniej fiszki w sesji
- **Przebieg**:
  1. Po aktualizacji ostatniej karty `viewState` ustawia się na `'summary'`
  2. Wyświetlenie komponentu `SessionSummary` ze statystykami
  3. Użytkownik widzi: liczbę przejrzanych kart, procent sukcesu, przycisk "Zakończ sesję"
- **Oczekiwany wynik**: Użytkownik widzi podsumowanie i może zakończyć sesję

### Interakcja 6: Powrót do strony głównej
- **Trigger**: Użytkownik klika "Zakończ sesję" w podsumowaniu lub przycisk powrotu w `EmptyState`
- **Przebieg**: Przekierowanie na stronę główną (`/` lub `/dashboard`)
- **Oczekiwany wynik**: Użytkownik wraca na stronę główną

## 9. Warunki i walidacja

### Warunki API (sprawdzane przez backend)
1. **Autentykacja**: Użytkownik musi być zalogowany (`locals.user` istnieje)
2. **UUID flashcardId**: Poprawny format UUID w `UpdateCardReviewDto`
3. **Własność fiszki**: Fiszka musi należeć do zalogowanego użytkownika (weryfikowane przez RLS)
4. **Typ knewIt**: Wartość boolean w `UpdateCardReviewDto`

### Warunki weryfikowane przez frontend

#### W komponencie ReviewSessionContainer
- **Po pobraniu sesji**:
  - Sprawdzenie, czy `response.cards` jest tablicą
  - Jeśli `cards.length === 0`: przejście do `viewState = 'empty'`
  - Jeśli `cards.length > 0`: przejście do `viewState = 'active'`

#### W komponencie ActiveSession
- **Przed renderowaniem**:
  - `currentIndex >= 0`
  - `currentIndex < cards.length`
  - `currentCard` nie jest `undefined`

#### W komponencie SessionProgress
- **Przed renderowaniem**:
  - `totalCards > 0`
  - `currentIndex >= 0`
  - Wyświetlany numer karty: `currentIndex + 1` (1-based dla użytkownika)

#### W komponencie FlashcardDisplay
- **Przed renderowaniem**:
  - `card.front` jest niepuste
  - `card.back` jest niepuste
  - `card.part_of_speech` może być null/undefined (opcjonalne)
- **Stan przycisku "Pokaż odpowiedź"**:
  - Widoczny tylko gdy `isAnswerRevealed === false`

#### W komponencie ReviewActions
- **Przed renderowaniem**:
  - Komponent renderuje się tylko gdy `isAnswerRevealed === true`
- **Stan przycisków**:
  - Przyciski disabled gdy `isSubmitting === true`
  - Przyciski enabled gdy `isSubmitting === false`

#### W komponencie SessionSummary
- **Przed renderowaniem**:
  - `statistics.totalReviewed > 0`
  - `statistics.knewCount + statistics.didntKnowCount === statistics.totalReviewed`
  - `statistics.successRate` jest liczbą między 0 a 100

### Walidacja danych przed wysłaniem do API
- **UUID flashcardId**: Walidacja formatu UUID przed wywołaniem POST `/api/review/update`
- **Typ boolean knewIt**: Zapewnione przez TypeScript i type-safe funkcje

## 10. Obsługa błędów

### Błędy inicjalizacji sesji (GET /api/review/session)

#### 401 Unauthorized
- **Przyczyna**: Użytkownik niezalogowany lub wygasła sesja
- **Obsługa**: 
  - Przekierowanie na stronę logowania (`/login`)
  - Toast: "Twoja sesja wygasła. Zaloguj się ponownie."

#### 500 Internal Server Error lub błąd sieci
- **Przyczyna**: Problem z serwerem lub połączeniem
- **Obsługa**:
  - Wyświetlenie stanu błędu z komunikatem
  - Toast: "Nie udało się pobrać fiszek. Sprawdź połączenie."
  - Przycisk "Spróbuj ponownie" wywołujący `initializeSession()`

#### Błąd parsowania odpowiedzi
- **Przyczyna**: Niepoprawna struktura JSON
- **Obsługa**:
  - Toast: "Otrzymano nieprawidłowe dane z serwera."
  - Przycisk "Spróbuj ponownie"

### Błędy aktualizacji statusu (POST /api/review/update)

#### 400 Bad Request
- **Przyczyna**: Niepoprawny format danych (błędny UUID, brak wymaganych pól)
- **Obsługa**:
  - Toast: "Błąd walidacji danych. Spróbuj ponownie."
  - Zachowanie aktualnej karty (możliwość ponownej próby)
  - Log błędu do konsoli dla debugowania

#### 401 Unauthorized
- **Przyczyna**: Użytkownik niezalogowany
- **Obsługa**:
  - Przekierowanie na stronę logowania
  - Toast: "Twoja sesja wygasła. Zaloguj się ponownie."

#### 404 Not Found
- **Przyczyna**: Fiszka nie istnieje lub nie należy do użytkownika
- **Obsługa**:
  - Toast: "Fiszka nie została znaleziona. Przechodzę do kolejnej."
  - Automatyczne przejście do kolejnej karty lub podsumowania
  - Dekrementacja `totalReviewed` (nie liczymy tej karty)

#### 500 Internal Server Error lub błąd sieci
- **Przyczyna**: Problem z serwerem lub połączeniem
- **Obsługa**:
  - Toast: "Nie udało się zapisać odpowiedzi. Spróbuj ponownie."
  - Zachowanie aktualnej karty (przyciski "Wiem"/"Nie wiem" pozostają aktywne)
  - Możliwość ponownej próby bez utraty postępu

### Obsługa przypadków brzegowych

#### Brak fiszek do powtórki
- **Przypadek**: `cards.length === 0` po pobraniu sesji
- **Obsługa**: Wyświetlenie `EmptyState` z gratulacjami

#### Utrata połączenia podczas sesji
- **Przypadek**: Błąd sieci podczas `submitReview`
- **Obsługa**: 
  - Toast z informacją o utracie połączenia
  - Zachowanie stanu sesji (nie tracenie postępu)
  - Możliwość retry po przywróceniu połączenia

#### Wielokrotne kliknięcie przycisku oceny
- **Przypadek**: Użytkownik szybko klika "Wiem" lub "Nie wiem"
- **Obsługa**: 
  - `isSubmitting` blokuje kolejne kliknięcia
  - Przyciski są disabled podczas `isSubmitting === true`

#### Odświeżenie strony podczas sesji
- **Przypadek**: Użytkownik odświeża stronę w trakcie sesji
- **Obsługa**: 
  - Sesja rozpoczyna się od nowa (brak persystencji stanu)
  - Fiszki już ocenione nie pojawią się ponownie (backend je filtruje)
  - Statystyki sesji są resetowane (liczenie od zera)

## 11. Kroki implementacji

### Krok 1: Przygotowanie struktury plików
1. Utwórz plik strony Astro: `src/pages/ucz-sie.astro`
2. Utwórz folder dla komponentów sesji: `src/components/review/`
3. Utwórz folder dla hooka: `src/components/hooks/`
4. Utwórz plik typów (jeśli osobny): `src/components/review/types.ts`

### Krok 2: Definicja typów
1. W pliku `src/components/review/types.ts` zdefiniuj nowe typy:
   - `SessionViewState`
   - `SessionState`
   - `SessionStatistics`
   - `SessionError`
2. Upewnij się, że importujesz istniejące typy z `src/types.ts`:
   - `ReviewCardDto`
   - `ReviewSessionDto`
   - `UpdateCardReviewDto`

### Krok 3: Implementacja custom hooka useReviewSession
1. Utwórz plik: `src/components/hooks/useReviewSession.ts`
2. Zaimplementuj stan początkowy `SessionState`
3. Zaimplementuj funkcję `initializeSession()`:
   - Fetch GET `/api/review/session`
   - Obsługa odpowiedzi (sukces/błąd)
   - Ustawienie `viewState` na podstawie liczby kart
4. Zaimplementuj funkcję `revealAnswer()`:
   - Ustaw `isAnswerRevealed = true`
5. Zaimplementuj funkcję `submitReview(knewIt: boolean)`:
   - Ustaw `isSubmitting = true`
   - Fetch POST `/api/review/update`
   - Aktualizacja statystyk
   - Przejście do kolejnej karty lub podsumowania
   - Obsługa błędów
   - Ustaw `isSubmitting = false`
6. Zaimplementuj funkcję `endSession()`:
   - Przekierowanie na stronę główną
7. Dodaj `useEffect` do automatycznej inicjalizacji sesji przy montowaniu

### Krok 4: Implementacja komponentów prezentacyjnych
1. **LoadingState** (`src/components/review/LoadingState.tsx`):
   - Dodaj spinner/skeleton z shadcn/ui
   - Dodaj tekst "Przygotowuję twoją sesję..."
2. **EmptyState** (`src/components/review/EmptyState.tsx`):
   - Użyj `Card` z shadcn/ui
   - Dodaj ikonę sukcesu
   - Dodaj tekst gratulacyjny
   - Dodaj przycisk powrotu do strony głównej
3. **SessionProgress** (`src/components/review/SessionProgress.tsx`):
   - Wyświetl "Karta {currentIndex + 1} z {totalCards}"
   - Opcjonalnie: dodaj progress bar z shadcn/ui

### Krok 5: Implementacja FlashcardDisplay
1. Utwórz plik: `src/components/review/FlashcardDisplay.tsx`
2. Zaimplementuj propsy: `card`, `isAnswerRevealed`, `onRevealAnswer`
3. Renderuj `Card` z shadcn/ui
4. Sekcja Front: zawsze widoczna, wyświetla `card.front`
5. Przycisk "Pokaż odpowiedź": widoczny tylko gdy `!isAnswerRevealed`
6. Sekcja Back: widoczna tylko gdy `isAnswerRevealed`, wyświetla `card.back`
7. Sekcja Part of Speech: widoczna gdy `isAnswerRevealed && card.part_of_speech`

### Krok 6: Implementacja ReviewActions
1. Utwórz plik: `src/components/review/ReviewActions.tsx`
2. Zaimplementuj propsy: `isSubmitting`, `onSubmitReview`
3. Dodaj dwa przyciski z shadcn/ui:
   - "Nie wiem" (wariant secondary/destructive)
   - "Wiem" (wariant default/primary)
4. Oba przyciski disabled gdy `isSubmitting === true`
5. Obsługa onClick wywołuje `onSubmitReview(false)` lub `onSubmitReview(true)`

### Krok 7: Implementacja ActiveSession
1. Utwórz plik: `src/components/review/ActiveSession.tsx`
2. Zaimplementuj propsy zgodnie ze specyfikacją w sekcji 4
3. Oblicz `currentCard` na podstawie `cards[currentIndex]`
4. Renderuj:
   - `SessionProgress`
   - `FlashcardDisplay`
   - `ReviewActions` (warunkowo, gdy `isAnswerRevealed`)
5. Przekaż odpowiednie propsy do komponentów dzieci

### Krok 8: Implementacja SessionSummary
1. Utwórz plik: `src/components/review/SessionSummary.tsx`
2. Zaimplementuj propsy: `statistics`
3. Użyj `Card` z shadcn/ui
4. Wyświetl:
   - Nagłówek: "Sesja zakończona!"
   - Liczba przejrzanych kart: `statistics.totalReviewed`
   - Liczba kart "Wiem": `statistics.knewCount`
   - Liczba kart "Nie wiem": `statistics.didntKnowCount`
   - Procent sukcesu: `statistics.successRate`%
5. Dodaj przycisk "Zakończ sesję" z przekierowaniem

### Krok 9: Implementacja ReviewSessionContainer
1. Utwórz plik: `src/components/review/ReviewSessionContainer.tsx`
2. Zaimportuj custom hook `useReviewSession`
3. Wywołaj hook: `const { sessionState, revealAnswer, submitReview, endSession } = useReviewSession()`
4. Zaimplementuj warunkowe renderowanie na podstawie `sessionState.viewState`:
   ```typescript
   switch (sessionState.viewState) {
     case 'loading':
       return <LoadingState />;
     case 'empty':
       return <EmptyState />;
     case 'active':
       return <ActiveSession {...propsForActiveSession} />;
     case 'summary':
       return <SessionSummary statistics={sessionState.statistics} />;
   }
   ```
5. Przekaż odpowiednie propsy do `ActiveSession`:
   - `currentCard`
   - `currentIndex`
   - `totalCards`
   - `isAnswerRevealed`
   - `isSubmitting`
   - `onRevealAnswer`
   - `onSubmitReview`

### Krok 10: Implementacja strony Astro
1. Otwórz plik: `src/pages/ucz-sie.astro`
2. Dodaj sprawdzenie autentykacji w middleware lub na początku strony:
   ```typescript
   const { user } = Astro.locals;
   if (!user) {
     return Astro.redirect('/login');
   }
   ```
3. Użyj layoutu aplikacji
4. Dodaj hydratowany komponent React:
   ```astro
   <ReviewSessionContainer client:load />
   ```
5. Opcjonalnie: dodaj meta tagi (title, description)

### Krok 11: Stylowanie
1. Użyj Tailwind CSS do stylowania wszystkich komponentów
2. Upewnij się, że interfejs jest minimalistyczny i skupia uwagę użytkownika
3. Dodaj płynne przejścia między kartami (opcjonalnie: animacje CSS/Framer Motion)
4. Dostosuj kolory przycisków:
   - "Nie wiem": kolor czerwony/pomarańczowy (destructive)
   - "Wiem": kolor zielony/niebieski (primary)
5. Upewnij się, że wszystko jest responsywne (mobile-first)

### Krok 12: Obsługa błędów i toasty
1. Zainstaluj/skonfiguruj bibliotekę do toastów (np. Sonner z shadcn/ui)
2. W hooku `useReviewSession` dodaj wyświetlanie toastów w catch blocksach
3. Zaimplementuj retry logic dla błędów inicjalizacji
4. Przetestuj wszystkie scenariusze błędów opisane w sekcji 10

### Krok 13: Testowanie manualne
1. **Test happy path**:
   - Zaloguj się jako użytkownik z fiszkami do powtórki
   - Przejdź na `/ucz-sie`
   - Odkryj odpowiedź każdej fiszki
   - Oceń wszystkie fiszki
   - Sprawdź ekran podsumowania
2. **Test empty state**:
   - Zaloguj się jako użytkownik bez fiszek do powtórki
   - Sprawdź, czy wyświetla się `EmptyState`
3. **Test błędów sieci**:
   - Odłącz internet podczas inicjalizacji
   - Odłącz internet podczas oceny fiszki
   - Sprawdź, czy toasty i retry działają poprawnie
4. **Test responsywności**:
   - Przetestuj widok na różnych rozmiarach ekranu (mobile, tablet, desktop)

### Krok 14: Optymalizacja i finalne poprawki
1. Sprawdź performance (React DevTools Profiler)
2. Upewnij się, że nie ma memory leaks (cleanup w useEffect)
3. Dodaj loading indicators podczas fetch
4. Sprawdź dostępność (ARIA labels, keyboard navigation)
5. Zoptymalizuj bundle size (code splitting, lazy loading)

### Krok 15: Aktualizacja nawigacji
1. Dodaj link "Ucz się" do głównej nawigacji aplikacji
2. Upewnij się, że link jest widoczny tylko dla zalogowanych użytkowników
3. Opcjonalnie: dodaj badge z liczbą fiszek do powtórki
