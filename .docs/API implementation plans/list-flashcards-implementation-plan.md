# API Endpoint Implementation Plan: List Flashcards

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest dostarczenie paginowanej i sortowalnej listy fiszek należących do uwierzytelnionego użytkownika. Endpoint `GET /api/flashcards` umożliwia klientom przeglądanie kolekcji fiszek w sposób wydajny, z kontrolą nad sortowaniem i paginacją.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/flashcards`
- **Parametry (Query)**:
  - **Wymagane**: Brak.
  - **Opcjonalne**:
    - `page` (`number`, domyślnie: `1`): Numer strony do pobrania.
    - `pageSize` (`number`, domyślnie: `20`): Liczba fiszek na stronie.
    - `sortBy` (`string`, domyślnie: `'created_at'`): Pole, po którym odbywa się sortowanie. Dozwolone wartości: `created_at`, `front`, `leitner_box`.
    - `order` (`string`, domyślnie: `'desc'`): Kierunek sortowania. Dozwolone wartości: `asc`, `desc`.
- **Request Body**: Brak.

## 3. Wykorzystywane typy
W pliku `src/types.ts` zostaną zdefiniowane lub zaktualizowane następujące typy:

- **`FlashcardListItemDto`**: Już istnieje i będzie używany do reprezentowania pojedynczej fiszki na liście.
  ```typescript
  export type FlashcardListItemDto = Pick<
    FlashcardRow,
    'id' | 'front' | 'back' | 'part_of_speech' | 'leitner_box' | 'review_due_at' | 'created_at'
  >;
  ```
- **`PaginationDto`** (nowy typ): Będzie reprezentować obiekt paginacji w odpowiedzi.
  ```typescript
  export type PaginationDto = {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  ```
- **`ListFlashcardsResponseDto`** (nowy typ): Będzie reprezentować całą strukturę odpowiedzi.
  ```typescript
  export type ListFlashcardsResponseDto = {
    data: FlashcardListItemDto[];
    pagination: PaginationDto;
  };
  ```

## 4. Przepływ danych
1.  Klient wysyła żądanie `GET` do `/api/flashcards` z opcjonalnymi parametrami `page`, `pageSize`, `sortBy`, `order`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję użytkownika i umieszcza dane użytkownika w `context.locals.user`.
3.  Handler API w `src/pages/api/flashcards/index.astro` odbiera żądanie.
4.  Handler sprawdza, czy użytkownik jest uwierzytelniony (`context.locals.user`). Jeśli nie, zwraca `401 Unauthorized`.
5.  Parametry zapytania są walidowane i parsowane przy użyciu schematu `zod`. W przypadku błędu walidacji zwracany jest `400 Bad Request`.
6.  Handler wywołuje funkcję `getFlashcards(userId, options)` z serwisu `flashcardService`.
7.  `flashcardService` wykonuje dwa zapytania do bazy danych Supabase:
    a. Zapytanie o łączną liczbę fiszek użytkownika (`SELECT count()`).
    b. Zapytanie o paginowaną i posortowaną listę fiszek (`SELECT ... LIMIT ... OFFSET ... ORDER BY ...`).
8.  `flashcardService` oblicza `totalPages` i zwraca listę fiszek oraz obiekt paginacji do handlera.
9.  Handler API formatuje odpowiedź zgodnie z typem `ListFlashcardsResponseDto` i wysyła ją do klienta z kodem `200 OK`.

## 5. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointu jest ograniczony tylko do zalogowanych użytkowników. Middleware Astro będzie odpowiedzialne za weryfikację tokena sesji.
- **Autoryzacja**: Każde zapytanie do bazy danych będzie filtrowane po `user_id` pobranym z sesji. Wykorzystane zostaną polityki RLS (Row-Level Security) w Supabase, aby zapewnić, że użytkownik ma dostęp wyłącznie do swoich danych.
- **Walidacja wejścia**: Wszystkie parametry zapytania będą rygorystycznie walidowane, aby zapobiec atakom (np. DoS przez duży `pageSize`) i błędom zapytań.

## 6. Obsługa błędów
- **`200 OK`**: Żądanie zakończone sukcesem.
- **`400 Bad Request`**: Błąd walidacji parametrów zapytania. Odpowiedź będzie zawierać szczegółowy opis błędu zwrócony przez `zod`.
- **`401 Unauthorized`**: Użytkownik nie jest zalogowany lub sesja wygasła.
- **`500 Internal Server Error`**: Wystąpił błąd po stronie serwera, np. problem z połączeniem z bazą danych. Błąd zostanie zalogowany po stronie serwera.

## 7. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Kluczowy indeks `flashcards_user_list_idx` na kolumnach `(user_id, created_at DESC)` jest już zaplanowany, co znacząco przyspieszy sortowanie i filtrowanie. Należy upewnić się, że sortowanie po innych dozwolonych polach również jest zoptymalizowane.
- **Paginacja**: Implementacja paginacji po stronie serwera jest kluczowa, aby unikać przesyłania dużych ilości danych i obciążania klienta.
- **Liczba zapytań**: Wykonanie dwóch zapytań (jedno po dane, drugie po liczbę wszystkich rekordów) jest standardowym i akceptowalnym podejściem.

## 8. Etapy wdrożenia
1.  **Aktualizacja typów**: Zaktualizuj plik `src/types.ts`, dodając typy `PaginationDto` i `ListFlashcardsResponseDto`.
2.  **Utworzenie serwisu**: Stwórz plik `src/lib/services/flashcardService.ts`.
3.  **Implementacja logiki serwisu**: W `flashcardService.ts` zaimplementuj funkcję `getFlashcards(userId, options)`, która będzie komunikować się z Supabase, pobierać dane, zliczać rekordy i zwracać je w ustrukturyzowanej formie.
4.  **Utworzenie endpointu API**: Stwórz plik `src/pages/api/flashcards/index.astro`.
5.  **Implementacja handlera GET**: W pliku `index.astro` zaimplementuj handler `GET`, który będzie:
    a. Sprawdzał uwierzytelnienie użytkownika.
    b. Definiował schemat `zod` do walidacji parametrów.
    c. Parsował i walidował parametry zapytania.
    d. Wywoływał `flashcardService.getFlashcards`.
    e. Obsługiwał błędy i zwracał odpowiednie kody statusu.
    f. Formatował i zwracał pomyślną odpowiedź.
6.  **Testowanie**: Napisz testy jednostkowe dla serwisu i testy integracyjne dla endpointu API, aby zweryfikować poprawność działania, obsługę błędów i bezpieczeństwo.
7.  **Dokumentacja**: Upewnij się, że endpoint jest udokumentowany (np. w Postmanie lub Swaggerze), jeśli projekt tego wymaga.
