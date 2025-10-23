# API Endpoint Implementation Plan: Update Card Review Status

## 1. Przegląd punktu końcowego
Ten punkt końcowy (`POST /api/review/update`) jest odpowiedzialny za aktualizację statusu powtórki pojedynczej fiszki w oparciu o odpowiedź użytkownika. Jest to kluczowa operacja w systemie powtórek Leitnera, która modyfikuje stan fiszki (numer pudełka i datę następnej powtórki) poprzez wywołanie dedykowanej funkcji w bazie danych.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/review/update`
- **Parametry**: Brak parametrów URL.
- **Request Body**:
  ```json
  {
    "flashcardId": "uuid",
    "knewIt": true
  }
  ```
  - **Wymagane pola**:
    - `flashcardId` (`string`): Unikalny identyfikator (UUID) fiszki, której status jest aktualizowany.
    - `knewIt` (`boolean`): Wartość logiczna wskazująca, czy użytkownik znał odpowiedź (`true`) czy nie (`false`).

## 3. Wykorzystywane typy
- **DTO (Data Transfer Objects)**:
  - `UpdateCardReviewDto`: Obiekt reprezentujący ciało żądania.
    ```typescript
    // src/types.ts
    export interface UpdateCardReviewDto {
      flashcardId: string;
      knewIt: boolean;
    }
    ```
- **Modele poleceń (Command Models)**:
  - `UpdateCardReviewCommand`: Obiekt przechowujący zwalidowane dane wejściowe dla warstwy serwisowej.
    ```typescript
    // src/lib/services/review.service.ts
    export interface UpdateCardReviewCommand {
      userId: string;
      flashcardId: string;
      knewIt: boolean;
    }
    ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (204 No Content)**: Punkt końcowy nie zwraca żadnej treści w przypadku pomyślnej aktualizacji. Zwraca jedynie kod statusu `204`.
- **Odpowiedź błędu**: Zobacz sekcję "Obsługa błędów".

## 5. Przepływ danych
1.  Żądanie `POST` z ciałem zawierającym `flashcardId` i `knewIt` trafia do punktu końcowego `/api/review/update`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT z nagłówka `Authorization` i dołącza sesję użytkownika do `context.locals`. W przypadku błędu uwierzytelniania zwraca `401`.
3.  Handler punktu końcowego (`src/pages/api/review/update.ts`) odczytuje i parsuje ciało żądania.
4.  Dane wejściowe są walidowane przy użyciu schemy `zod`, która sprawdza, czy `flashcardId` jest poprawnym UUID i `knewIt` jest wartością logiczną.
5.  Handler wywołuje metodę `updateCardReviewStatus` z serwisu `ReviewService`, przekazując `userId` (z `context.locals.user.id`) oraz zwalidowane `flashcardId` i `knewIt`.
6.  `ReviewService` używa klienta Supabase do wywołania procedury zdalnej (RPC) `update_flashcard_review` w bazie danych.
    - Wywołanie RPC: `supabase.rpc('update_flashcard_review', { flashcard_id: command.flashcardId, knew_it: command.knewIt })`
7.  Funkcja w bazie danych `update_flashcard_review` zawiera logikę biznesową:
    - Weryfikuje, czy fiszka o podanym ID należy do uwierzytelnionego użytkownika (`auth.uid()`).
    - Oblicza nowy numer pudełka Leitnera i nową datę `review_due_at`.
    - Aktualizuje wiersz w tabeli `flashcards`.
8.  `ReviewService` sprawdza odpowiedź z wywołania RPC. Jeśli wystąpił błąd (np. fiszka nie została znaleziona), serwis rzuca odpowiedni wyjątek.
9.  Handler punktu końcowego zwraca odpowiedź z kodem statusu `204 No Content` w przypadku sukcesu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp jest chroniony przez middleware Astro, które wymaga prawidłowego tokenu JWT.
- **Autoryzacja**: Logika autoryzacji jest delegowana do funkcji PostgreSQL `update_flashcard_review`. Funkcja ta musi bezwzględnie weryfikować, czy `user_id` fiszki jest zgodny z `auth.uid()` przed wykonaniem jakiejkolwiek modyfikacji. Zapobiega to modyfikowaniu fiszek innych użytkowników.
- **Walidacja danych wejściowych**: Użycie `zod` do walidacji typów i formatu (`uuid`) danych wejściowych chroni przed błędami i potencjalnymi atakami (np. SQL Injection, chociaż Supabase RPC jest sparametryzowane).

## 7. Obsługa błędów
- **400 Bad Request**: Zwracany, gdy ciało żądania nie przejdzie walidacji `zod` (np. brakujące pole, nieprawidłowy typ danych, `flashcardId` nie jest UUID).
- **401 Unauthorized**: Zwracany przez middleware, jeśli żądanie nie jest uwierzytelnione.
- **404 Not Found**: Zwracany, jeśli funkcja RPC w bazie danych zgłosi, że fiszka o podanym `flashcardId` nie istnieje lub nie należy do danego użytkownika.
- **500 Internal Server Error**: Zwracany w przypadku nieoczekiwanego błędu podczas wywoływania funkcji RPC lub innego błędu serwera. Błąd powinien być logowany po stronie serwera.

## 8. Rozważania dotyczące wydajności
- Operacja jest wywołaniem pojedynczej funkcji w bazie danych, która aktualizuje jeden wiersz. Wydajność jest uzależniona od szybkości wykonania tej funkcji.
- Aktualizacja wiersza na podstawie klucza głównego (`id`) jest bardzo wydajna. Nie przewiduje się wąskich gardeł wydajnościowych dla tego punktu końcowego przy normalnym użytkowaniu.

## 9. Etapy wdrożenia
1.  **Aktualizacja typów**: Zdefiniuj typ `UpdateCardReviewDto` w pliku `src/types.ts`.
2.  **Aktualizacja serwisu**: W pliku `src/lib/services/review.service.ts`:
    - Dodaj interfejs `UpdateCardReviewCommand`.
    - Zaimplementuj metodę `updateCardReviewStatus(command: UpdateCardReviewCommand)`, która wywołuje funkcję RPC `update_flashcard_review` w Supabase.
    - Dodaj obsługę błędów z RPC, w tym rzucanie specyficznego błędu dla przypadku "nie znaleziono".
3.  **Utworzenie pliku endpointu**: Stwórz plik `src/pages/api/review/update.ts`.
4.  **Implementacja handlera endpointu**:
    - W `update.ts` dodaj `export const prerender = false;`.
    - Zaimplementuj handler `POST`.
    - Pobierz i zweryfikuj istnienie użytkownika z `context.locals`.
    - Zwaliduj ciało żądania przy użyciu `zod`. W przypadku błędu zwróć `400`.
    - Wywołaj metodę `reviewService.updateCardReviewStatus` w bloku `try...catch`.
    - W bloku `catch` obsłuż błędy, mapując je na odpowiednie kody statusu (`404`, `500`).
    - Jeśli operacja się powiedzie, zwróć pustą odpowiedź z kodem `204`.
5.  **Weryfikacja funkcji DB**: Upewnij się, że funkcja `update_flashcard_review` w bazie danych poprawnie obsługuje logikę biznesową i autoryzację.
6.  **Testowanie**: Stwórz testy integracyjne dla punktu końcowego, które sprawdzą:
    - Pomyślną aktualizację (`204`).
    - Nieautoryzowany dostęp (`401`).
    - Nieprawidłowe dane wejściowe (`400`).
    - Próbę aktualizacji nieistniejącej fiszki (`404`).
7.  **Dokumentacja**: Zaktualizuj kolekcję Postman lub inną dokumentację API.
