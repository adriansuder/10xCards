# Plan implementacji punktu końcowego API: Import AI-Generated Flashcards

## 1. Przegląd punktu końcowego

Punkt końcowy `POST /api/ai/import-flashcards` umożliwia masowe dodawanie do bazy danych fiszek wygenerowanych przez AI, które zostały zatwierdzone przez użytkownika. Operacja jest transakcyjna i obejmuje wstawienie fiszek oraz zapisanie metryk dotyczących tego procesu. Punkt końcowy jest zabezpieczony i wymaga uwierzytelnienia użytkownika.

## 2. Szczegóły żądania

-   **Metoda HTTP**: `POST`
-   **Struktura URL**: `/api/ai/import-flashcards`
-   **Parametry**: Brak parametrów URL.
-   **Request Body**: Wymagany jest obiekt JSON o następującej strukturze:
    ```json
    {
      "flashcards": [
        { "front": "string", "back": "string", "part_of_speech": "string" }
      ],
      "metrics": {
        "generatedCount": "number",
        "importedCount": "number"
      }
    }
    ```
    -   `flashcards`: Tablica zawierająca co najmniej jedną fiszkę do zaimportowania.
    -   `metrics`: Obiekt zawierający statystyki operacji. `importedCount` musi być równe długości tablicy `flashcards`.

## 3. Wykorzystywane typy

Do implementacji zostaną wykorzystane następujące typy i schematy walidacji `zod`, zdefiniowane w `src/types.ts`:

-   **`FlashcardImportItemSchema`**: Schemat `zod` dla pojedynczej fiszki w tablicy `flashcards`.
-   **`ImportMetricsSchema`**: Schemat `zod` dla obiektu `metrics`.
-   **`ImportFlashcardsRequestSchema`**: Główny schemat `zod` dla całego ciała żądania, łączący powyższe schematy i dodający logikę walidacji krzyżowej (`refine`).
-   **`ImportFlashcardsResponse`**: Typ TypeScript dla odpowiedzi z punktu końcowego.
-   **`FlashcardInsert`**: Typ TypeScript generowany przez Supabase dla nowego rekordu w tabeli `flashcards`.
-   **`AiGenerationLogInsert`**: Typ TypeScript generowany przez Supabase dla nowego rekordu w tabeli `ai_generation_logs`.

## 4. Szczegóły odpowiedzi

-   **Odpowiedź sukcesu (201 Created)**:
    ```json
    {
      "message": "Successfully imported 2 flashcards.",
      "importedCount": 2
    }
    ```
-   **Odpowiedzi błędów**:
    -   `400 Bad Request`: Nieprawidłowy format JSON.
    -   `401 Unauthorized`: Użytkownik nie jest uwierzytelniony.
    -   `422 Unprocessable Entity`: Błąd walidacji danych wejściowych (np. brakujące pola, niezgodność `importedCount`).
    -   `500 Internal Server Error`: Błąd po stronie serwera, np. problem z wykonaniem transakcji w bazie danych.

## 5. Przepływ danych

1.  Żądanie `POST` trafia do punktu końcowego Astro (`src/pages/api/ai/import-flashcards.ts`).
2.  Middleware Astro weryfikuje sesję użytkownika. Jeśli użytkownik nie jest zalogowany, zwraca `401`.
3.  Endpoint pobiera `userId` i klienta `supabase` z `context.locals`.
4.  Ciało żądania jest parsowane i walidowane przy użyciu schematu `ImportFlashcardsRequestSchema` (`zod`). W przypadku błędu zwracany jest status `422`.
5.  Pobierany jest domyślny poziom językowy AI (`default_ai_level`) z profilu użytkownika.
6.  Wywoływana jest funkcja `importAiFlashcards` z nowego serwisu `src/lib/services/flashcard.service.ts`.
7.  Serwis przygotowuje dane:
    -   Mapuje obiekty z `flashcards` na format zgodny z tabelą `public.flashcards`, dodając `user_id`, `ai_generated: true` oraz `flashcard_language_level`.
    -   Przygotowuje obiekt logu dla tabeli `public.ai_generation_logs`.
8.  Serwis wykonuje transakcję w Supabase (`supabase.rpc('import_ai_flashcards', ...)`), która atomowo wstawia fiszki i log metryk.
9.  Jeśli transakcja się powiedzie, punkt końcowy zwraca odpowiedź `201 Created`.
10. W przypadku błędu transakcji, jest on przechwytywany, logowany w konsoli, a punkt końcowy zwraca `500 Internal Server Error`.

## 6. Względy bezpieczeństwa

-   **Uwierzytelnianie**: Dostęp do punktu końcowego jest ograniczony do zalogowanych użytkowników poprzez middleware Astro i sprawdzanie sesji Supabase.
-   **Autoryzacja**: Użytkownik może dodawać fiszki tylko do swojego konta. `user_id` jest pobierany z sesji serwerowej, a nie z danych wejściowych, co zapobiega manipulacji.
-   **Walidacja danych**: Wszystkie dane wejściowe są rygorystycznie walidowane przy użyciu `zod`, co chroni przed nieprawidłowymi lub złośliwymi danymi. Sprawdzane są typy, długości ciągów znaków i spójność danych.
-   **Ochrona przed SQL Injection**: Użycie funkcji RPC Supabase z przekazywaniem parametrów zapewnia ochronę przed atakami typu SQL Injection.

## 7. Rozważania dotyczące wydajności

-   **Masowe wstawianie**: Zamiast wstawiać każdą fiszkę osobno, stosowane jest masowe wstawianie (`bulk insert`), co znacząco redukuje liczbę zapytań do bazy danych.
-   **Transakcyjność**: Użycie funkcji RPC do opakowania operacji wstawiania fiszek i logowania metryk w jedną transakcję zapewnia spójność danych bez negatywnego wpływu na wydajność w porównaniu do wielu oddzielnych zapytań.
-   **Rozmiar payloadu**: Należy rozważyć wprowadzenie limitu liczby fiszek, które można zaimportować w jednym żądaniu, aby uniknąć problemów z wydajnością i czasem przetwarzania. Wstępnie można ustawić limit na 50-100 fiszek.

## 8. Etapy wdrożenia

1.  **Definicja typów i walidacji**:
    -   W pliku `src/types.ts` zdefiniować schematy `zod`: `FlashcardImportItemSchema`, `ImportMetricsSchema` oraz `ImportFlashcardsRequestSchema`.
    -   Dodać typ `ImportFlashcardsResponse`.

2.  **Stworzenie funkcji RPC w Supabase**:
    -   W nowym pliku migracji (`supabase/migrations/<timestamp>_import_ai_flashcards_rpc.sql`) stworzyć funkcję `import_ai_flashcards(flashcards_data jsonb, metrics_data jsonb)`.
    -   Funkcja ta będzie wykonywać operacje `INSERT` na tabelach `flashcards` i `ai_generation_logs` w ramach jednej transakcji.

3.  **Implementacja serwisu**:
    -   Utworzyć plik `src/lib/services/flashcard.service.ts`.
    -   Zaimplementować w nim funkcję `importAiFlashcards`, która będzie wywoływać RPC `import_ai_flashcards` z odpowiednio przygotowanymi danymi.

4.  **Implementacja punktu końcowego API**:
    -   Utworzyć plik `src/pages/api/ai/import-flashcards.ts`.
    -   Zaimplementować handler `POST`, który realizuje logikę opisaną w sekcji "Przepływ danych":
        -   Sprawdzenie sesji użytkownika.
        -   Walidacja ciała żądania przy użyciu `zod`.
        -   Pobranie `default_ai_level` z profilu.
        -   Wywołanie serwisu `flashcard.service`.
        -   Obsługa błędów i zwracanie odpowiednich kodów statusu.

5.  **Testowanie**:
    -   Przygotować testy jednostkowe dla logiki walidacji i serwisu.
    -   Przeprowadzić testy integracyjne punktu końcowego przy użyciu narzędzi takich jak Postman lub testów end-to-end, sprawdzając wszystkie scenariusze sukcesu i błędów.
