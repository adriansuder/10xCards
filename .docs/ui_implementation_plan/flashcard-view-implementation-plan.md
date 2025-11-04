# Plan implementacji widoku Moje Fiszki

## 1. Przegląd

Widok "Moje Fiszki" to główna strona zarządzania fiszkami użytkownika, umożliwiająca przeglądanie, edycję i usuwanie wszystkich stworzonych fiszek. Widok prezentuje dane w formie tabeli z paginacją, oferując funkcjonalność edycji inline oraz modalne potwierdzenie usunięcia. Zaprojektowany został z myślą o responsywności i optymistycznym UI dla lepszego doświadczenia użytkownika.

## 2. Routing widoku

- **Ścieżka**: `/moje-fiszki`
- **Typ**: Chroniona trasa wymagająca uwierzytelnienia
- **Plik**: `src/pages/moje-fiszki.astro`

## 3. Struktura komponentów

```
MojeFiszkiPage (Astro)
├── PageHeader (React)
│   └── Heading + Description
├── FlashcardTable (React) - główny komponent
    ├── TableSkeleton (React) - stan ładowania
    ├── EmptyState (React) - stan pusty
    └── Table (Shadcn/ui)
        ├── TableHeader
        │   └── TableRow
        │       └── TableHead (kolumny)
        ├── TableBody
        │   └── FlashcardRow (React) - wiersz z fiszką
        │       ├── EditableCell (React) - inline edycja
        │       └── ActionCell (React)
        │           ├── Button (Edytuj)
        │           └── DeleteButton (React)
        │               └── AlertDialog (Shadcn/ui)
        └── TableFooter
            └── Pagination (React)
                ├── PaginationContent
                ├── PaginationItem
                ├── PaginationPrevious
                ├── PaginationNext
                └── PaginationLink
```

## 4. Szczegóły komponentów

### 4.1. MojeFiszkiPage (Astro)

**Opis**: Główny komponent strony odpowiedzialny za routing, sprawdzenie autoryzacji i renderowanie layoutu.

**Główne elementy**:
- Layout aplikacji (`MainLayout`)
- Sprawdzenie sesji użytkownika w middleware
- Nagłówek strony z tytułem "Moje Fiszki"
- Komponent `FlashcardTable` z dyrektywą `client:load`

**Obsługiwane zdarzenia**: Brak (komponent statyczny Astro)

**Warunki walidacji**:
- Użytkownik musi być zalogowany (sprawdzenie `context.locals.session`)
- Przekierowanie na `/login` jeśli brak sesji

**Typy**: Brak (wykorzystuje typy z Astro)

**Propsy**: Brak

---

### 4.2. FlashcardTable (React)

**Opis**: Główny komponent React zarządzający stanem, pobieraniem danych i wyświetlaniem tabeli fiszek. Odpowiada za koordynację wszystkich podkomponentów i integrację z API.

**Główne elementy**:
- Kontener `<div>` z odpowiednimi klasami Tailwind
- Warunkowe renderowanie: `TableSkeleton`, `EmptyState`, lub pełna tabela
- Komponent `Table` z Shadcn/ui
- Komponent `Pagination`

**Obsługiwane zdarzenia**:
- `onPageChange` - zmiana strony paginacji
- `onFlashcardUpdate` - aktualizacja fiszki
- `onFlashcardDelete` - usunięcie fiszki
- `useEffect` - pobieranie danych przy montowaniu i zmianie strony

**Warunki walidacji**:
- Sprawdzenie czy `data.length > 0` przed renderowaniem tabeli
- Sprawdzenie czy `isLoading === false` przed ukryciem skeletonu
- Walidacja odpowiedzi API (status 200, poprawna struktura danych)

**Typy**:
- `FlashcardTableViewModel` - stan komponentu
- `ListFlashcardsResponseDto` - dane z API
- `FlashcardListItemDto` - pojedyncza fiszka

**Propsy**: Brak (root component)

---

### 4.3. TableSkeleton (React)

**Opis**: Komponent wyświetlający placeholder podczas ładowania danych z API. Pokazuje szkielet tabeli z animowanymi elementami.

**Główne elementy**:
- `Table` z Shadcn/ui
- `Skeleton` z Shadcn/ui (wiersze i kolumny)
- 5 wierszy szkieletu z animacją pulse

**Obsługiwane zdarzenia**: Brak

**Warunki walidacji**: Renderowany gdy `isLoading === true`

**Typy**: Brak

**Propsy**: Brak

---

### 4.4. EmptyState (React)

**Opis**: Komponent wyświetlający komunikat gdy użytkownik nie ma jeszcze żadnych fiszek. Zachęca do wygenerowania lub stworzenia pierwszej fiszki.

**Główne elementy**:
- Kontener `<div>` z centrowaniem
- Ikona (np. `<FileX />` z lucide-react)
- Nagłówek "Brak fiszek"
- Tekst opisowy
- `Button` z linkiem do strony generowania fiszek

**Obsługiwane zdarzenia**:
- `onClick` - przekierowanie na stronę generowania

**Warunki walidacji**: Renderowany gdy `!isLoading && data.length === 0`

**Typy**: Brak

**Propsy**: Brak

---

### 4.5. FlashcardRow (React)

**Opis**: Wiersz tabeli reprezentujący pojedynczą fiszkę. Zawiera edytowalne komórki i akcje (edycja, usunięcie).

**Główne elementy**:
- `TableRow` z Shadcn/ui
- `EditableCell` dla kolumn: Front, Tył, Część mowy
- `TableCell` dla kolumn: Pudełko Leitnera, Następna powtórka (tylko odczyt)
- `ActionCell` z przyciskami akcji

**Obsługiwane zdarzenia**:
- `onUpdate` - propagacja aktualizacji do rodzica
- `onDelete` - propagacja usunięcia do rodzica

**Warunki walidacji**:
- Walidacja edytowanych wartości przed wysłaniem
- Sprawdzenie czy wartość się zmieniła przed wywołaniem API

**Typy**:
- `FlashcardRowProps` - propsy komponentu
- `FlashcardListItemDto` - dane fiszki

**Propsy**:
```typescript
interface FlashcardRowProps {
  flashcard: FlashcardListItemDto;
  onUpdate: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}
```

---

### 4.6. EditableCell (React)

**Opis**: Komórka tabeli z funkcjonalnością inline edycji. Przełącza się między trybem odczytu i edycji po kliknięciu.

**Główne elementy**:
- `TableCell` z Shadcn/ui
- `Input` z Shadcn/ui (w trybie edycji)
- `<span>` (w trybie odczytu)
- Przyciski: Zapisz (✓), Anuluj (✗)

**Obsługiwane zdarzenia**:
- `onClick` - przełączenie na tryb edycji
- `onChange` - aktualizacja wartości w stanie lokalnym
- `onSave` - zapisanie zmian i wywołanie `onUpdate`
- `onCancel` - anulowanie edycji i przywrócenie oryginalnej wartości
- `onBlur` - opcjonalne zapisanie zmian przy utracie focusa
- `onKeyDown` - obsługa Enter (zapis) i Escape (anuluj)

**Warunki walidacji**:
- **Front**: min 1 znak, max 249 znaków, wymagane
- **Back**: min 1 znak, max 249 znaków, wymagane
- **Part of speech**: max 249 znaków, opcjonalne (może być null)
- Wyświetlenie błędu walidacji pod inputem
- Wyłączenie przycisku zapisz przy błędach walidacji

**Typy**:
- `EditableCellProps` - propsy komponentu
- `EditableCellState` - stan lokalny komponentu

**Propsy**:
```typescript
interface EditableCellProps {
  value: string | null;
  fieldName: 'front' | 'back' | 'part_of_speech';
  onSave: (fieldName: string, newValue: string | null) => Promise<void>;
  isEditable?: boolean;
}
```

---

### 4.7. ActionCell (React)

**Opis**: Komórka tabeli zawierająca przyciski akcji dla danej fiszki (edycja, usunięcie).

**Główne elementy**:
- `TableCell` z Shadcn/ui
- `<div>` z przyciskami w flexie
- `Button` "Edytuj" (opcjonalnie, jeśli edycja inline jest wystarczająca)
- `DeleteButton` - komponent z modałem potwierdzenia

**Obsługiwane zdarzenia**:
- `onDelete` - propagacja usunięcia do rodzica

**Warunki walidacji**: Brak

**Typy**:
- `ActionCellProps` - propsy komponentu

**Propsy**:
```typescript
interface ActionCellProps {
  flashcardId: string;
  onDelete: (id: string) => Promise<void>;
}
```

---

### 4.8. DeleteButton (React)

**Opis**: Przycisk usuwania z modalnym dialogiem potwierdzenia. Implementuje optymistyczne UI - usuwa wiersz z widoku przed potwierdzeniem z API.

**Główne elementy**:
- `AlertDialog` z Shadcn/ui
- `AlertDialogTrigger` - przycisk "Usuń"
- `AlertDialogContent`
  - `AlertDialogHeader`
    - `AlertDialogTitle`: "Czy na pewno chcesz usunąć tę fiszkę?"
    - `AlertDialogDescription`: "Ta akcja jest nieodwracalna."
  - `AlertDialogFooter`
    - `AlertDialogCancel`: "Anuluj"
    - `AlertDialogAction`: "Usuń" (wywołuje `onConfirm`)

**Obsługiwane zdarzenia**:
- `onOpenChange` - otwarcie/zamknięcie dialogu
- `onConfirm` - potwierdzenie usunięcia
- Wywołanie `onDelete` z rodzica

**Warunki walidacji**: Brak (potwierdzenie jest wystarczające)

**Typy**:
- `DeleteButtonProps` - propsy komponentu

**Propsy**:
```typescript
interface DeleteButtonProps {
  flashcardId: string;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}
```

---

### 4.9. Pagination (React)

**Opis**: Komponent nawigacji między stronami z informacją o aktualnej stronie i łącznej liczbie stron.

**Główne elementy**:
- `PaginationContent` z Shadcn/ui
- `PaginationItem` z przyciskiem "Poprzednia"
- `PaginationItem` z numerami stron (aktualna + sąsiednie)
- `PaginationEllipsis` dla pominięcia stron
- `PaginationItem` z przyciskiem "Następna"
- Info tekstowe: "Strona X z Y (łącznie Z fiszek)"

**Obsługiwane zdarzenia**:
- `onPageChange` - zmiana strony

**Warunki walidacji**:
- Przycisk "Poprzednia" wyłączony gdy `currentPage === 1`
- Przycisk "Następna" wyłączony gdy `currentPage === totalPages`
- Pokazywanie maksymalnie 5 przycisków ze stronami jednocześnie

**Typy**:
- `PaginationProps` - propsy komponentu
- `PaginationDto` - dane paginacji z API

**Propsy**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
```

## 5. Typy

### 5.1. Istniejące typy (z `types.ts`)

```typescript
// DTO dla pojedynczej fiszki w liście
export type FlashcardListItemDto = Pick<
  FlashcardRow,
  'id' | 'front' | 'back' | 'part_of_speech' | 'leitner_box' | 'review_due_at' | 'created_at'
>;

// DTO dla odpowiedzi z listą fiszek
export type ListFlashcardsResponseDto = {
  data: FlashcardListItemDto[];
  pagination: PaginationDto;
};

// DTO dla paginacji
export type PaginationDto = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// Command Model dla aktualizacji fiszki
export type UpdateFlashcardCommand = Partial<Pick<FlashcardRow, 'front' | 'back' | 'part_of_speech'>>;
```

### 5.2. Nowe typy ViewModel (do dodania)

```typescript
// ViewModel dla stanu komponentu FlashcardTable
export type FlashcardTableViewModel = {
  flashcards: FlashcardListItemDto[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
};

// Props dla FlashcardRow
export interface FlashcardRowProps {
  flashcard: FlashcardListItemDto;
  onUpdate: (id: string, data: UpdateFlashcardCommand) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Props dla EditableCell
export interface EditableCellProps {
  value: string | null;
  fieldName: 'front' | 'back' | 'part_of_speech';
  onSave: (fieldName: string, newValue: string | null) => Promise<void>;
  isEditable?: boolean;
}

// Stan lokalny EditableCell
export interface EditableCellState {
  isEditing: boolean;
  currentValue: string | null;
  originalValue: string | null;
  error: string | null;
  isSaving: boolean;
}

// Props dla ActionCell
export interface ActionCellProps {
  flashcardId: string;
  onDelete: (id: string) => Promise<void>;
}

// Props dla DeleteButton
export interface DeleteButtonProps {
  flashcardId: string;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

// Props dla Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// Typ dla query params paginacji
export interface FlashcardListQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'front' | 'leitner_box';
  order?: 'asc' | 'desc';
}
```

### 5.3. Formatowanie danych

```typescript
// Helper do formatowania daty
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper do mapowania numeru pudełka na wyświetlaną nazwę
export const formatLeitnerBox = (box: number): string => {
  return `Pudełko ${box}`;
};
```

## 6. Zarządzanie stanem

### 6.1. Stan globalny

Nie jest wymagany stan globalny. Cały stan jest zarządzany lokalnie w komponencie `FlashcardTable`.

### 6.2. Stan lokalny w FlashcardTable

```typescript
const [viewModel, setViewModel] = useState<FlashcardTableViewModel>({
  flashcards: [],
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0,
  },
  isLoading: true,
  error: null,
});

const [currentPage, setCurrentPage] = useState<number>(1);
```

### 6.3. Custom Hook: useFlashcards

Rekomendowane jest stworzenie custom hooka dla lepszej organizacji logiki:

```typescript
// src/components/hooks/useFlashcards.ts

export const useFlashcards = (initialPage: number = 1) => {
  const [viewModel, setViewModel] = useState<FlashcardTableViewModel>({
    flashcards: [],
    pagination: {
      currentPage: initialPage,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    },
    isLoading: true,
    error: null,
  });

  // Pobranie fiszek z API
  const fetchFlashcards = async (page: number) => {
    setViewModel(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(
        `/api/flashcards?page=${page}&pageSize=20&sortBy=created_at&order=desc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch flashcards');
      }
      
      const data: ListFlashcardsResponseDto = await response.json();
      
      setViewModel({
        flashcards: data.data,
        pagination: data.pagination,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setViewModel(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  // Aktualizacja fiszki
  const updateFlashcard = async (id: string, data: UpdateFlashcardCommand) => {
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }
      
      const updatedFlashcard: FlashcardDetailDto = await response.json();
      
      // Aktualizacja stanu lokalnego
      setViewModel(prev => ({
        ...prev,
        flashcards: prev.flashcards.map(f => 
          f.id === id ? { ...f, ...updatedFlashcard } : f
        ),
      }));
      
      // Toast sukcesu
      toast.success('Fiszka zaktualizowana pomyślnie');
    } catch (error) {
      toast.error('Nie udało się zaktualizować fiszki');
      throw error;
    }
  };

  // Usunięcie fiszki (optymistyczne UI)
  const deleteFlashcard = async (id: string) => {
    // Zapisz oryginalne dane na wypadek rollbacku
    const originalFlashcards = viewModel.flashcards;
    
    // Optymistyczne usunięcie z UI
    setViewModel(prev => ({
      ...prev,
      flashcards: prev.flashcards.filter(f => f.id !== id),
      pagination: {
        ...prev.pagination,
        totalItems: prev.pagination.totalItems - 1,
      },
    }));
    
    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }
      
      toast.success('Fiszka usunięta pomyślnie');
    } catch (error) {
      // Rollback w przypadku błędu
      setViewModel(prev => ({
        ...prev,
        flashcards: originalFlashcards,
        pagination: {
          ...prev.pagination,
          totalItems: prev.pagination.totalItems + 1,
        },
      }));
      
      toast.error('Nie udało się usunąć fiszki');
      throw error;
    }
  };

  // Zmiana strony
  const changePage = (page: number) => {
    fetchFlashcards(page);
  };

  useEffect(() => {
    fetchFlashcards(initialPage);
  }, []);

  return {
    viewModel,
    updateFlashcard,
    deleteFlashcard,
    changePage,
    refetch: fetchFlashcards,
  };
};
```

## 7. Integracja API

### 7.1. Pobieranie listy fiszek

**Endpoint**: `GET /api/flashcards`

**Query Parameters**:
- `page` (number, domyślnie: 1)
- `pageSize` (number, domyślnie: 20)
- `sortBy` (string, domyślnie: 'created_at')
- `order` (string, domyślnie: 'desc')

**Request**:
```typescript
const response = await fetch(
  `/api/flashcards?page=${page}&pageSize=20&sortBy=created_at&order=desc`
);
```

**Response Type**: `ListFlashcardsResponseDto`

**Obsługa błędów**:
- 401 Unauthorized → Przekierowanie na `/login`
- 500 Server Error → Toast z komunikatem błędu

---

### 7.2. Aktualizacja fiszki

**Endpoint**: `PATCH /api/flashcards/{flashcardId}`

**Request Type**: `UpdateFlashcardCommand`

**Request**:
```typescript
const response = await fetch(`/api/flashcards/${flashcardId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    front: 'Updated front',
    back: 'Updated back',
    part_of_speech: 'noun',
  }),
});
```

**Response Type**: `FlashcardDetailDto`

**Obsługa błędów**:
- 400 Bad Request → Wyświetlenie błędów walidacji w EditableCell
- 401 Unauthorized → Przekierowanie na `/login`
- 404 Not Found → Toast "Fiszka nie została znaleziona"
- 422 Unprocessable Entity → Wyświetlenie błędów walidacji w EditableCell

---

### 7.3. Usunięcie fiszki

**Endpoint**: `DELETE /api/flashcards/{flashcardId}`

**Request**:
```typescript
const response = await fetch(`/api/flashcards/${flashcardId}`, {
  method: 'DELETE',
});
```

**Response**: 204 No Content (brak body)

**Obsługa błędów**:
- 401 Unauthorized → Przekierowanie na `/login`
- 404 Not Found → Toast "Fiszka nie została znaleziona"
- 500 Server Error → Rollback optymistycznego UI + toast błędu

## 8. Interakcje użytkownika

### 8.1. Przeglądanie listy fiszek

**Akcja**: Użytkownik wchodzi na stronę `/moje-fiszki`

**Oczekiwany rezultat**:
1. Wyświetlenie `TableSkeleton` podczas ładowania
2. Pobranie pierwszej strony fiszek z API
3. Wyświetlenie tabeli z fiszkami lub `EmptyState` jeśli brak danych
4. Wyświetlenie paginacji z informacją o liczbie stron i fiszek

---

### 8.2. Zmiana strony

**Akcja**: Użytkownik klika przycisk "Następna" lub numer strony

**Oczekiwany rezultat**:
1. Wywołanie `changePage(newPage)`
2. Wyświetlenie `TableSkeleton` podczas ładowania
3. Pobranie nowej strony fiszek z API
4. Aktualizacja tabeli z nowymi danymi
5. Aktualizacja aktywnej strony w komponencie paginacji

---

### 8.3. Edycja fiszki inline

**Akcja**: Użytkownik klika na tekst w kolumnie "Front", "Tył" lub "Część mowy"

**Oczekiwany rezultat**:
1. Komórka przełącza się w tryb edycji
2. Wyświetlenie `Input` z aktualną wartością
3. Użytkownik modyfikuje tekst
4. Walidacja na bieżąco (wyświetlenie błędów pod inputem)
5. Użytkownik klika "✓" (Zapisz) lub naciska Enter:
   - Wywołanie API `PATCH /api/flashcards/{id}`
   - Wyświetlenie wskaźnika ładowania w komórce
   - Po sukcesie: aktualizacja danych w tabeli + toast sukcesu
   - Po błędzie: wyświetlenie błędu + pozostawienie w trybie edycji
6. Użytkownik klika "✗" (Anuluj) lub naciska Escape:
   - Przywrócenie oryginalnej wartości
   - Powrót do trybu odczytu

---

### 8.4. Usunięcie fiszki

**Akcja**: Użytkownik klika przycisk "Usuń" w kolumnie "Akcje"

**Oczekiwany rezultat**:
1. Otwarcie `AlertDialog` z pytaniem o potwierdzenie
2. Użytkownik klika "Anuluj":
   - Zamknięcie dialogu bez akcji
3. Użytkownik klika "Usuń":
   - Natychmiastowe usunięcie wiersza z tabeli (optymistyczne UI)
   - Wywołanie API `DELETE /api/flashcards/{id}` w tle
   - Po sukcesie: toast sukcesu
   - Po błędzie: przywrócenie wiersza + toast błędu (rollback)

---

### 8.5. Stan pusty

**Akcja**: Użytkownik wchodzi na stronę, ale nie ma jeszcze żadnych fiszek

**Oczekiwany rezultat**:
1. Wyświetlenie komponentu `EmptyState`
2. Komunikat: "Brak fiszek"
3. Tekst zachęcający: "Wygeneruj swoje pierwsze fiszki z pomocą AI lub dodaj je ręcznie"
4. Przycisk "Wygeneruj fiszki" przekierowujący na stronę główną

## 9. Warunki i walidacja

### 9.1. Walidacja na poziomie EditableCell

**Pole: Front**
- **Warunek**: min 1 znak, max 249 znaków
- **Komponent**: `EditableCell` (fieldName='front')
- **Wpływ na UI**:
  - Błąd: "Front nie może być pusty" (jeśli długość < 1)
  - Błąd: "Front nie może przekraczać 249 znaków" (jeśli długość > 249)
  - Przycisk "Zapisz" wyłączony przy błędach
  - Czerwona ramka wokół inputa

**Pole: Back**
- **Warunek**: min 1 znak, max 249 znaków
- **Komponent**: `EditableCell` (fieldName='back')
- **Wpływ na UI**: Analogicznie jak Front

**Pole: Part of Speech**
- **Warunek**: max 249 znaków, opcjonalne (może być null)
- **Komponent**: `EditableCell` (fieldName='part_of_speech')
- **Wpływ na UI**:
  - Błąd: "Część mowy nie może przekraczać 249 znaków" (jeśli długość > 249)
  - Brak błędu jeśli puste (null jest dozwolone)

---

### 9.2. Walidacja na poziomie FlashcardTable

**Warunek: Autoryzacja**
- **Sprawdzenie**: Czy użytkownik jest zalogowany
- **Komponent**: `MojeFiszkiPage` (Astro)
- **Wpływ na UI**:
  - Jeśli brak sesji → przekierowanie na `/login`
  - Jeśli API zwróci 401 → przekierowanie na `/login`

**Warunek: Stan ładowania**
- **Sprawdzenie**: `isLoading === true`
- **Komponent**: `FlashcardTable`
- **Wpływ na UI**: Wyświetlenie `TableSkeleton` zamiast tabeli

**Warunek: Stan pusty**
- **Sprawdzenie**: `!isLoading && flashcards.length === 0`
- **Komponent**: `FlashcardTable`
- **Wpływ na UI**: Wyświetlenie `EmptyState` zamiast tabeli

**Warunek: Błąd pobierania danych**
- **Sprawdzenie**: `error !== null`
- **Komponent**: `FlashcardTable`
- **Wpływ na UI**: Wyświetlenie toast błędu + komunikat w miejscu tabeli

---

### 9.3. Walidacja na poziomie Pagination

**Warunek: Pierwsza strona**
- **Sprawdzenie**: `currentPage === 1`
- **Komponent**: `Pagination`
- **Wpływ na UI**: Wyłączenie przycisku "Poprzednia"

**Warunek: Ostatnia strona**
- **Sprawdzenie**: `currentPage === totalPages`
- **Komponent**: `Pagination`
- **Wpływ na UI**: Wyłączenie przycisku "Następna"

**Warunek: Brak danych**
- **Sprawdzenie**: `totalPages === 0`
- **Komponent**: `Pagination`
- **Wpływ na UI**: Ukrycie całego komponentu paginacji

## 10. Obsługa błędów

### 10.1. Błędy sieciowe

**Scenariusz**: Brak połączenia z internetem lub serwer nie odpowiada

**Obsługa**:
- Wyświetlenie toast: "Wystąpił problem z połączeniem. Spróbuj ponownie."
- Zachowanie ostatniego poprawnego stanu danych
- Przycisk "Spróbuj ponownie" w miejscu tabeli

---

### 10.2. Błędy autoryzacji (401)

**Scenariusz**: Sesja użytkownika wygasła

**Obsługa**:
- Przekierowanie na `/login`
- Toast: "Twoja sesja wygasła. Zaloguj się ponownie."

---

### 10.3. Błędy walidacji (400, 422)

**Scenariusz**: Użytkownik wprowadził niepoprawne dane podczas edycji

**Obsługa**:
- Pozostawienie komórki w trybie edycji
- Wyświetlenie szczegółowych błędów walidacji pod inputem
- Czerwona ramka wokół inputa z błędem
- Brak wywołania toast (błędy pokazane inline)

---

### 10.4. Błędy nie znaleziono (404)

**Scenariusz**: Fiszka została usunięta przez inną sesję lub nie istnieje

**Obsługa**:
- Toast: "Fiszka nie została znaleziona"
- Odświeżenie listy fiszek (wywołanie `refetch()`)

---

### 10.5. Błędy serwera (500)

**Scenariusz**: Wewnętrzny błąd serwera

**Obsługa**:
- Toast: "Wystąpił błąd serwera. Spróbuj ponownie później."
- Rollback optymistycznych zmian (jeśli dotyczy)
- Logowanie błędu do konsoli dla deweloperów

---

### 10.6. Błędy usuwania z rollbackiem

**Scenariusz**: Usunięcie fiszki nie powiodło się po optymistycznym usunięciu z UI

**Obsługa**:
1. Przywrócenie usuniętego wiersza do tabeli
2. Przywrócenie licznika totalItems
3. Toast: "Nie udało się usunąć fiszki. Spróbuj ponownie."

## 11. Kroki implementacji

### Krok 1: Przygotowanie typów i API endpointu DELETE

**Zadania**:
1. Dodaj nowe typy ViewModel do `src/types.ts`
2. Zaimplementuj endpoint `DELETE /api/flashcards/[flashcardId].ts`
3. Dodaj metodę `deleteFlashcard` do `flashcard.service.ts`
4. Dodaj walidację Zod dla parametrów DELETE w `validators.ts`

**Rezultat**: Kompletny backend dla funkcji usuwania fiszek

---

### Krok 2: Instalacja i konfiguracja Shadcn/ui

**Zadania**:
1. Zainstaluj Shadcn/ui jeśli jeszcze nie jest zainstalowany
2. Dodaj komponenty: `Table`, `Button`, `Input`, `AlertDialog`, `Skeleton`
3. Dodaj ikonę `FileX` z lucide-react dla EmptyState
4. Skonfiguruj toast notifications (np. sonner lub react-hot-toast)

**Rezultat**: Gotowe komponenty UI do użycia w projekcie

---

### Krok 3: Stworzenie custom hooka useFlashcards

**Zadania**:
1. Stwórz plik `src/components/hooks/useFlashcards.ts`
2. Zaimplementuj logikę:
   - `fetchFlashcards` - pobieranie danych z API
   - `updateFlashcard` - aktualizacja fiszki
   - `deleteFlashcard` - usuwanie z optymistycznym UI
   - `changePage` - zmiana strony
3. Dodaj obsługę błędów i toast notifications
4. Przetestuj hook w izolacji

**Rezultat**: Reużywalny hook zarządzający logiką fiszek

---

### Krok 4: Implementacja komponentów pomocniczych

**Zadania**:
1. Stwórz `src/components/TableSkeleton.tsx`
   - Używając `Table` i `Skeleton` z Shadcn/ui
   - 5 wierszy szkieletu z odpowiednimi kolumnami
2. Stwórz `src/components/EmptyState.tsx`
   - Ikona `FileX`, nagłówek, opis, przycisk CTA
3. Stwórz `src/components/Pagination.tsx`
   - Implementacja paginacji z Shadcn/ui
   - Logika wyświetlania numerów stron z ellipsis

**Rezultat**: Gotowe komponenty pomocnicze do integracji

---

### Krok 5: Implementacja EditableCell

**Zadania**:
1. Stwórz `src/components/EditableCell.tsx`
2. Zaimplementuj:
   - Przełączanie między trybem odczytu i edycji
   - Walidację inline z użyciem schematów Zod
   - Obsługę zdarzeń: onClick, onChange, onKeyDown
   - Przyciski Zapisz/Anuluj
   - Wyświetlanie błędów walidacji
3. Dodaj style Tailwind dla stanów: hover, focus, error
4. Przetestuj wszystkie interakcje (Enter, Escape, Blur)

**Rezultat**: Funkcjonalna komórka z edycją inline

---

### Krok 6: Implementacja DeleteButton

**Zadania**:
1. Stwórz `src/components/DeleteButton.tsx`
2. Zaimplementuj `AlertDialog` z Shadcn/ui
3. Dodaj obsługę stanu `isDeleting` (wyłączenie przycisku podczas usuwania)
4. Stylowanie przycisków: variant="destructive" dla akcji usunięcia
5. Przetestuj dialog i interakcje

**Rezultat**: Przycisk z modalem potwierdzenia usunięcia

---

### Krok 7: Implementacja ActionCell i FlashcardRow

**Zadania**:
1. Stwórz `src/components/ActionCell.tsx`
   - Integracja z `DeleteButton`
2. Stwórz `src/components/FlashcardRow.tsx`
   - Integracja z `EditableCell` dla kolumn: Front, Back, Part of Speech
   - Kolumny tylko do odczytu: Leitner Box, Review Due At
   - Formatowanie daty z pomocą `formatDate`
   - Integracja z `ActionCell`
3. Dodaj responsywność: na małych ekranach ukryj kolumnę "Część mowy"

**Rezultat**: Kompletny wiersz tabeli z wszystkimi funkcjami

---

### Krok 8: Implementacja FlashcardTable

**Zadania**:
1. Stwórz `src/components/FlashcardTable.tsx`
2. Zintegruj `useFlashcards` hook
3. Zaimplementuj warunkowe renderowanie:
   - `TableSkeleton` gdy `isLoading`
   - `EmptyState` gdy brak danych
   - `Table` z `FlashcardRow` gdy są dane
4. Dodaj `Pagination` na końcu tabeli
5. Dodaj responsywność: przewijanie poziome na małych ekranach
6. Dodaj obsługę błędów sieciowych

**Rezultat**: Główny komponent zarządzający całą tabelą

---

### Krok 9: Stworzenie strony Astro

**Zadania**:
1. Stwórz `src/pages/moje-fiszki.astro`
2. Zaimplementuj sprawdzenie sesji:
   ```typescript
   const { session } = context.locals;
   if (!session?.user) {
     return context.redirect('/logowanie');
   }
   ```
3. Dodaj layout aplikacji
4. Dodaj nagłówek strony
5. Zintegruj `FlashcardTable` z dyrektywą `client:load`
6. Dodaj meta tagi (title, description)

**Rezultat**: Kompletna strona z integracją wszystkich komponentów

---

### Krok 10: Dodanie nawigacji

**Zadania**:
1. Dodaj link "Moje Fiszki" do głównej nawigacji aplikacji
2. Zaktualizuj routing w middleware jeśli potrzeba
3. Dodaj aktywny stan dla linku nawigacji

**Rezultat**: Strona dostępna z głównej nawigacji

---

### Krok 11: Stylowanie i responsive design

**Zadania**:
1. Dodaj responsywność dla tabeli:
   - Przewijanie poziome na ekranach < 768px
   - Ukrycie kolumny "Część mowy" na ekranach < 640px
   - Zmniejszenie padding w komórkach na małych ekranach
2. Dodaj hover effects dla wierszy tabeli
3. Dodaj transition effects dla modali i toast
4. Przetestuj na różnych rozdzielczościach (mobile, tablet, desktop)

**Rezultat**: W pełni responsywny widok

---

### Krok 12: Testowanie i optymalizacja

**Zadania**:
1. Testowanie manualne:
   - Przeglądanie listy
   - Edycja inline wszystkich pól
   - Walidacja (wprowadzanie błędnych danych)
   - Usuwanie fiszek
   - Paginacja
   - Stan pusty
   - Obsługa błędów (symulowanie 500, 401, 404)
2. Testowanie responsywności na różnych urządzeniach
3. Testowanie dostępności (keyboard navigation, screen readers)
4. Optymalizacja:
   - Lazy loading komponentów jeśli potrzeba
   - Debouncing dla operacji API w EditableCell
   - Optimistic UI dla wszystkich operacji
5. Code review i refactoring

**Rezultat**: Stabilny, przetestowany i zoptymalizowany widok

---

### Krok 13: Dokumentacja

**Zadania**:
1. Dodaj komentarze JSDoc do wszystkich komponentów
2. Zaktualizuj README z informacją o nowym widoku
3. Dodaj przykłady użycia komponentów do Storybook (opcjonalnie)
4. Udokumentuj API endpoints w dokumentacji projektu

**Rezultat**: Dobrze udokumentowany kod gotowy dla zespołu
