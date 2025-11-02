### 1. Analiza sekcji wejściowych

#### PRD (Product Requirements Document)
- **Kluczowe punkty**: Aplikacja AI Fiszki umożliwia automatyzację tworzenia fiszek językowych za pomocą AI, manualne dodawanie, zarządzanie CRUD oraz system powtórek oparty na metodzie Leitnera. Główny problem: Czasochłonne tworzenie fiszek manualnie. Wymagania obejmują uwierzytelnianie, generowanie AI, import, manualne tworzenie, przeglądanie fiszek, sesje powtórek. Granice: MVP bez zaawansowanych algorytmów, importu plików czy współdzielenia.
- **Wymagania i ograniczenia**: Uwierzytelnianie przez Supabase, maksymalnie 2000 znaków tekstu dla AI, poziomy językowe B1/B2/C1, paginacja dla list, transakcyjność importu. Ograniczenia: Brak wsparcia dla plików innych niż tekst, brak współdzielenia fiszek, brak zaawansowanych powtórek.
- **Potencjalne wyzwania i ważne kwestie**: Integracja z AI (Openrouter.ai), obsługa błędów API, UX dla edycji inline i stanów ładowania. Ważne: Zgodność z Supabase dla bezpieczeństwa, optymalizacja dla mobilnych urządzeń, dostępność (ARIA).

#### User Stories
- **Kluczowe punkty**: US-003 do US-007 dotyczą strony głównej: Generowanie z AI, obsługa błędów, przegląd/edycja/odrzucanie propozycji, import, manualne dodawanie. US-008 to inna strona (Moje Fiszki), US-009/010 to sesje powtórek.
- **Wymagania i ograniczenia**: Szczegółowe kryteria: Pole tekstowe max 2000 znaków, dropdown domyślnie B2, przycisk aktywny tylko przy niepustym tekście, ładowanie podczas generowania, inline edycja, dynamiczna etykieta przycisku, toast dla błędów/sukcesów, walidacja pól dla manualnego dodawania.
- **Potencjalne wyzwania i ważne kwestie**: Obsługa stanów ładowania i błędów bez blokowania UI, inline edycja bez utraty danych, synchronizacja listy propozycji z API. Ważne: UX dla toastów i potwierdzeń.

#### Endpoint Description
- **Kluczowe punkty**: API dla flashcards (GET/POST/PATCH/DELETE), AI generation (POST generate-suggestions, POST import-flashcards), review session (GET/POST). Dla strony głównej: generate-suggestions (nie zapisuje do DB), import-flashcards (bulk insert), POST flashcards (manual).
- **Wymagania i ograniczenia**: Payloady JSON z walidacją (np. text min 1 max 2000, level enum), odpowiedzi z DTO, kody błędów (400, 401, 422, 502). Ograniczenia: Non-idempotent dla generate, transakcyjny dla import.
- **Potencjalne wyzwania i ważne kwestie**: Obsługa błędów 502 dla AI, walidacja po stronie klienta zgodna z API, bezpieczeństwo (user_id z sesji).

#### Endpoint Implementation
- **Kluczowe punkty**: Pliki TS dla endpointów: generate-suggestions.ts (POST, walidacja Zod, wywołanie AI), import-flashcards plan (RPC w Supabase), [flashcardId].ts (GET/PATCH), session.ts/update.ts (review). Używają Astro APIRoute, middleware dla auth.
- **Wymagania i ograniczenia**: Prerender = false, walidacja Zod, obsługa błędów z kodami statusu, integracja z Supabase.
- **Potencjalne wyzwania i ważne kwestie**: Synchronizacja z typami z types.ts, obsługa błędów w transakcjach Supabase.

#### Type Definitions
- **Kluczowe punkty**: types.ts definiuje DTO (np. FlashcardListItemDto, GenerateSuggestionsResponseDto), command models (np. CreateFlashcardCommand), enums (LanguageLevel). Używają Tables/Insert/Update z database.types.ts.
- **Wymagania i ograniczenia**: Zgodność z Supabase, opcjonalne pola dla partial updates.
- **Potencjalne wyzwania i ważne kwestie**: Rozszerzenie dla ViewModel (np. z isEditing), synchronizacja z API.

#### Tech Stack
- **Kluczowe punkty**: Astro 5 (strony/layouty), React 19 (komponenty interaktywne), TypeScript 5, Tailwind 4, Shadcn/ui (komponenty UI), Supabase (backend/auth/DB).
- **Wymagania i ograniczenia**: Astro dla statycznych części, React dla dynamicznych, Tailwind dla stylowania, Shadcn dla dostępności.
- **Potencjalne wyzwania i ważne kwestie**: Integracja Astro + React, optymalizacja Tailwind, dostępność w Shadcn.

### 2. Wyodrębnienie kluczowych wymagań z PRD dla strony głównej
- Formularz generowania AI: Textarea (max 2000 znaków, licznik), Select (B1/B2/C1, domyślnie B2), Button (Generuj z spinner, aktywny przy niepustym tekście).
- Lista propozycji: Wyświetlanie front/back/part_of_speech, inline edycja, przycisk usunięcia, dynamiczna etykieta przycisku importu.
- Formularz manualny: Inputs dla front/back/part_of_speech (opcjonalny), Button (Dodaj, aktywny przy front/back wypełnionych).
- Tabs do przełączania między AI i manualnym.
- Chroniona trasa (przekierowanie na /logowanie).
- Toast dla błędów (np. API error) i sukcesów (import/manual).
- Stan ładowania podczas generowania/importu.
- Walidacja: Tekst nie pusty dla AI, front/back nie puste dla manual.
- Integracja z API: generate-suggestions, import-flashcards, POST flashcards.

### 3. Wypisanie głównych komponentów
- **HomePage**: Główny komponent strony, zarządza routingiem i auth, zawiera Tabs.
  - Typy: Brak specyficznych, używa istniejących DTO.
  - Zdarzenia: Brak bezpośrednich, deleguje do dzieci.
  - Walidacja: Brak, ale sprawdza auth.
- **Tabs**: Komponent Shadcn/ui do przełączania między zakładkami AI i manual.
  - Typy: Brak.
  - Zdarzenia: onTabChange.
  - Walidacja: Brak.
- **AiTab**: Formularz AI, lista propozycji, przycisk importu.
  - Typy: GenerateSuggestionsCommand, GenerateSuggestionsResponseDto, ImportFlashcardsCommand.
  - Zdarzenia: onSubmit (generuj), onEdit (propozycja), onDelete (propozycja), onImport.
  - Walidacja: Text min 1 max 2000, level enum.
- **ManualTab**: Formularz manualny, przycisk dodania.
  - Typy: CreateFlashcardCommand, CreatedFlashcardDto.
  - Zdarzenia: onSubmit (dodaj).
  - Walidacja: Front i back nie puste, part_of_speech opcjonalny.
- **SuggestionList**: Lista propozycji z mapowaniem na SuggestionItem.
  - Typy: AiSuggestion[].
  - Zdarzenia: onEdit, onDelete.
  - Walidacja: Brak, ale sprawdza długość listy dla etykiety.
- **SuggestionItem**: Pojedyncza propozycja z inline edycją.
  - Typy: AiSuggestion.
  - Zdarzenia: onEdit, onDelete.
  - Walidacja: Front/back nie puste podczas edycji.
- **Toast**: Komponent Shadcn dla komunikatów.
  - Typy: Brak.
  - Zdarzenia: Brak.
  - Walidacja: Brak.

### 4. Wysokopoziomowy diagram drzewa komponentów
```
HomePage
├── Tabs
│   ├── AiTab
│   │   ├── Textarea (tekst)
│   │   ├── Select (poziom)
│   │   ├── Button (Generuj)
│   │   ├── SuggestionList
│   │   │   ├── SuggestionItem (wiele)
│   │   │   │   ├── EditableText (front)
│   │   │   │   ├── EditableText (back)
│   │   │   │   ├── Select (part_of_speech)
│   │   │   │   └── Button (X)
│   │   └── Button (Dodaj [X] fiszek)
│   └── ManualTab
│       ├── Input (front)
│       ├── Input (back)
│       ├── Select (part_of_speech)
│       └── Button (Dodaj)
└── Toast (globalny)
```

### 5. Wymagane DTO i niestandardowe typy ViewModel
- **DTO istniejące**: GenerateSuggestionsCommand (text: string, level: 'b1'|'b2'|'c1'), GenerateSuggestionsResponseDto (suggestions: AiSuggestion[]), AiSuggestion (id: string, front: string, back: string), ImportFlashcardsCommand (flashcards: Array<{front: string, back: string, part_of_speech?: string}>, metrics: {generatedCount: number, importedCount: number}), CreateFlashcardCommand (front: string, back: string, part_of_speech?: string), CreatedFlashcardDto (rozszerza CreateFlashcardCommand o id, leitner_box, review_due_at, created_at).
- **Niestandardowe ViewModel**:
  - **AiSuggestionViewModel**: Rozszerza AiSuggestion o isEditing: boolean (czy edytowany), tempFront: string (tymczasowy front podczas edycji), tempBack: string (tymczasowy back), tempPartOfSpeech: string | null (tymczasowy part_of_speech). Używane w SuggestionItem do zarządzania stanem edycji bez mutacji oryginalnego AiSuggestion.
  - **ManualFormViewModel**: { front: string, back: string, part_of_speech: string | null, isSubmitting: boolean }. Używane w ManualTab do zarządzania formularzem i stanem ładowania.

### 6. Potencjalne zmienne stanu i niestandardowe hooki
- **Zmienne stanu**: suggestions: AiSuggestionViewModel[] (lista propozycji), isGenerating: boolean (ładowanie dla AI), selectedLevel: 'b1'|'b2'|'c1' (poziom AI), text: string (tekst AI), manualForm: ManualFormViewModel (stan formularza manualnego), error: string | null (błąd globalny).
- **Niestandardowe hooki**:
  - **useAiGeneration**: Hook do zarządzania wywołaniami API dla generate-suggestions i import-flashcards. Przyjmuje text/level, zwraca { suggestions, isLoading, error, generate, import }. Wewnątrz używa useState dla stanu, fetch dla API, obsługuje błędy i toast.
  - **useManualFlashcard**: Hook dla POST flashcards. Przyjmuje form data, zwraca { isSubmitting, error, create }. Podobnie jak powyższy.

### 7. Wymień wymagane wywołania API i odpowiadające im akcje frontendowe
- **POST /api/ai/generate-suggestions**: Akcja: Wywołane w AiTab onSubmit, wysyła text i level, aktualizuje suggestions i isGenerating.
- **POST /api/ai/import-flashcards**: Akcja: Wywołane w AiTab onImport, wysyła flashcards (z suggestions) i metrics, czyści suggestions po sukcesie, pokazuje toast.
- **POST /api/flashcards**: Akcja: Wywołane w ManualTab onSubmit, wysyła front/back/part_of_speech, czyści form po sukcesie, pokazuje toast.

### 8. Zmapuj każdej historii użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
- **US-003**: AiTab komponent - formularz (Textarea, Select, Button), wywołanie generate-suggestions, stan ładowania.
- **US-004**: AiTab - obsługa błędów w useAiGeneration, toast dla API error.
- **US-005**: SuggestionList i SuggestionItem - inline edycja (EditableText), onDelete, dynamiczna etykieta w Button.
- **US-006**: AiTab - onImport wywołuje import-flashcards, toast sukces, czyszczenie listy.
- **US-007**: ManualTab - formularz (Inputs, Select, Button), wywołanie POST flashcards, walidacja.

### 9. Wymień interakcje użytkownika i ich oczekiwane wyniki
- Wklejenie tekstu i wybór poziomu, kliknięcie Generuj: Ładowanie, wywołanie API, wyświetlenie listy propozycji.
- Edycja propozycji (kliknięcie tekstu): Przełączenie na tryb edycji, zapis po blur/enter.
- Usunięcie propozycji (kliknięcie X): Usunięcie z listy, aktualizacja etykiety przycisku.
- Kliknięcie Dodaj [X] fiszek: Import, toast sukces, czyszczenie listy.
- Wypełnienie manualnego formularza, kliknięcie Dodaj: Dodanie fiszki, toast sukces, czyszczenie formularza.
- Błąd API: Toast błąd, reset ładowania.

### 10. Wymień warunki wymagane przez API i jak je weryfikować na poziomie komponentów
- Text: min 1, max 2000 - Walidacja w AiTab przed wywołaniem, disable button jeśli pusty.
- Level: enum 'b1'|'b2'|'c1' - Select z opcjami, domyślnie 'b2'.
- Front/Back dla manual: nie puste - Walidacja w ManualTab, disable button jeśli puste.
- Part_of_speech: opcjonalny - Brak walidacji.
- Metrics.importedCount == flashcards.length - Sprawdzane przed importem w AiTab.

### 11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
- Błąd API (502): Toast "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.", reset isGenerating.
- Walidacja niepowodzenie (422): Highlight pól, toast z błędami.
- Network error: Toast ogólny, retry opcja.
- Pusty import: Sprawdź długość suggestions przed wywołaniem.
- Edycja bez zmian: Zachowaj oryginalne wartości.

### 12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania
- Inline edycja: Użyj contentEditable lub controlled inputs w React, zarządzaj stanem w AiSuggestionViewModel.
- Stan listy: Użyj useState z immutable updates, unikaj mutacji.
- Toast: Shadcn/ui Toast, integracja z React.
- Auth: Sprawdzaj w HomePage, przekieruj jeśli brak user.
- Wydajność: Lazy load komponentów, optymalizuj re-renders z React.memo.
- Dostępność: ARIA w komponentach Shadcn, focus management.