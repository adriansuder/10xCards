# API Endpoint Implementation Plan: Get Review Session Cards

## 1. Przegląd punktu końcowego
Ten punkt końcowy (`GET /api/review/session`) jest przeznaczony do pobierania fiszek, które są zaległe do powtórki dla aktualnie uwierzytelnionego użytkownika. Jest to kluczowy element pętli nauki opartej na systemie powtórek Leitnera, dostarczający użytkownikowi materiał do bieżącej sesji nauki.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/review/session`
- **Parametry**:
  - **Wymagane**: Brak.
  - **Opcjonalne**:
    - `limit` (query parameter, `number`): Maksymalna liczba kart do pobrania w jednej sesji. Domyślna wartość to `50`.
- **Request Body**: Brak.

## 3. Wykorzystywane typy
- **DTO (Data Transfer Objects)**:
  - `ReviewCardDto`: Obiekt reprezentujący pojedynczą fiszkę w sesji powtórkowej.
    ```typescript
    // src/types.ts
    export interface ReviewCardDto {
      id: string; // uuid
      front: string;
      back: string;
      part_of_speech: string | null;
    }
    ```
  - `GetReviewSessionResponseDto`: Obiekt odpowiedzi punktu końcowego.
    ```typescript
    // src/types.ts
    export interface GetReviewSessionResponseDto {
      cards: ReviewCardDto[];
    }
    ```
- **Modele poleceń (Command Models)**:
  - `GetReviewSessionCommand`: Obiekt przechowujący zwalidowane parametry wejściowe.
    ```typescript
    // src/lib/services/review.service.ts (lub podobny)
    export interface GetReviewSessionCommand {
      userId: string;
      limit: number;
    }
    ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "cards": [
      {
        "id": "c2a8c2b8-5c1b-4b1e-8c2a-8c2b85c1b4b1",
        "front": "ephemeral",
        "back": "efemeryczny",
        "part_of_speech": "adjective"
      }
    ]
  }
  ```
- **Odpowiedź błędu**: Zobacz sekcję "Obsługa błędów".

## 5. Przepływ danych
1.  Żądanie `GET` trafia do punktu końcowego `/api/review/session` w Astro.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token `Bearer` z nagłówka `Authorization` przy użyciu Supabase i dołącza klienta Supabase oraz sesję użytkownika do `context.locals`. Jeśli uwierzytelnianie się nie powiedzie, middleware zwraca `401 Unauthorized`.
3.  Handler punktu końcowego (`src/pages/api/review/session.ts`) jest wykonywany.
4.  Handler odczytuje parametr `limit` z `Astro.url.searchParams`.
5.  Dane wejściowe są walidowane przy użyciu `zod`. Domyślna wartość dla `limit` to 50, a maksymalna to 100.
6.  Handler wywołuje metodę `getReviewSessionCards` z serwisu `ReviewService`, przekazując `userId` (z `context.locals.user.id`) i zwalidowany `limit`.
7.  `ReviewService` konstruuje i wykonuje zapytanie do bazy danych Supabase, używając klienta Supabase.
    - Zapytanie SQL: `SELECT id, front, back, part_of_speech FROM flashcards WHERE user_id = :userId AND review_due_at <= NOW() ORDER BY leitner_box ASC, review_due_at ASC LIMIT :limit;`
8.  `ReviewService` zwraca listę fiszek do handlera.
9.  Handler formatuje dane zgodnie z `GetReviewSessionResponseDto` i zwraca odpowiedź JSON z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wszystkie żądania muszą być uwierzytelnione za pomocą tokenu JWT Supabase. Middleware Astro jest odpowiedzialne za egzekwowanie tego wymogu.
- **Autoryzacja**: Dostęp do danych jest ograniczony na poziomie zapytania SQL poprzez klauzulę `WHERE user_id = :userId`. Dodatkowo, polityki RLS (Row Level Security) w bazie danych Supabase zapewniają, że użytkownicy mogą odczytywać tylko własne fiszki.
- **Walidacja danych wejściowych**: Parametr `limit` jest walidowany, aby zapobiec nadużyciom (np. próbom pobrania zbyt dużej liczby danych) i zapewnić, że jest to poprawna liczba.

## 7. Obsługa błędów
- **401 Unauthorized**: Zwracany przez middleware, jeśli token JWT jest nieprawidłowy, wygasł lub go brakuje.
- **400 Bad Request**: Zwracany, jeśli parametr `limit` nie przejdzie walidacji `zod` (np. nie jest liczbą, jest poza dozwolonym zakresem). Odpowiedź będzie zawierać szczegóły błędu walidacji.
- **500 Internal Server Error**: Zwracany w przypadku nieoczekiwanego błędu po stronie serwera, np. gdy zapytanie do bazy danych zakończy się niepowodzeniem. Błąd zostanie zalogowany po stronie serwera w celu dalszej analizy.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Zapytanie opiera się na kolumnach `user_id` i `review_due_at`. Należy upewnić się, że istnieje złożony indeks na tych kolumnach, aby zapewnić szybkie wyszukiwanie.
  - Sugerowany indeks: `CREATE INDEX IF NOT EXISTS flashcards_review_session_idx ON public.flashcards (user_id, review_due_at);`
- **Paginacja/Limit**: Użycie parametru `limit` zapobiega pobieraniu nadmiernej ilości danych, co chroni zarówno serwer, jak i klienta przed przeciążeniem.

## 9. Etapy wdrożenia
1.  **Aktualizacja typów**: Zdefiniuj typy `ReviewCardDto` i `GetReviewSessionResponseDto` w pliku `src/types.ts`.
2.  **Utworzenie serwisu**: Stwórz plik `src/lib/services/review.service.ts`.
3.  **Implementacja logiki serwisu**: W `review.service.ts` zaimplementuj metodę `getReviewSessionCards(command: GetReviewSessionCommand)`, która będzie wykonywać zapytanie do Supabase w celu pobrania fiszek do powtórki.
4.  **Utworzenie pliku endpointu**: Stwórz plik `src/pages/api/review/session.ts`.
5.  **Implementacja handlera endpointu**:
    - W `session.ts` dodaj `export const prerender = false;`.
    - Zaimplementuj handler `GET`.
    - Pobierz `user` z `context.locals`. Jeśli nie istnieje, zwróć `401`.
    - Zwaliduj parametr `limit` przy użyciu `zod`. W przypadku błędu zwróć `400`.
    - Wywołaj metodę `reviewService.getReviewSessionCards`.
    - Obsłuż potencjalne błędy z serwisu, logując je i zwracając `500`.
    - Zwróć pomyślną odpowiedź z kodem `200 OK` i danymi w formacie `GetReviewSessionResponseDto`.
6.  **Testowanie**: Napisz testy jednostkowe dla serwisu i testy integracyjne dla punktu końcowego, aby zweryfikować poprawność działania, obsługę błędów i bezpieczeństwo.
7.  **Dokumentacja**: Zaktualizuj dokumentację API (np. w Postmanie lub Swaggerze), aby odzwierciedlała zaimplementowany punkt końcowy.
