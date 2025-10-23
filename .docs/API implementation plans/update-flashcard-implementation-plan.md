# Plan Implementacji Endpointu API: Aktualizacja Fiszki

## 1. Przegląd punktu końcowego
Ten dokument opisuje plan wdrożenia punktu końcowego `PATCH /api/flashcards/{flashcardId}`. Jego celem jest umożliwienie uwierzytelnionym użytkownikom aktualizacji jednej lub więcej właściwości istniejącej fiszki, takich jak jej treść (`front`, `back`) czy część mowy (`part_of_speech`).

## 2. Szczegóły żądania
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/flashcards/{flashcardId}`
- **Parametry**:
  - **Wymagane**:
    - `flashcardId` (w ścieżce): `string` (UUID) - Identyfikator fiszki do aktualizacji.
  - **Opcjonalne**:
    - Ciało żądania musi zawierać co najmniej jedno z poniższych pól.
- **Ciało żądania**: Obiekt JSON z polami do aktualizacji.
  ```json
  {
    "front": "Nowy tekst na przodzie",
    "back": "Nowy tekst na tyle",
    "part_of_speech": "rzeczownik"
  }
  ```

## 3. Wykorzystywane typy
- **`UpdateFlashcardDto` (nowy typ DTO z walidacją Zod)**:
  - Definiuje schemat dla przychodzących danych.
  - `front`: `z.string().min(1).max(249).optional()`
  - `back`: `z.string().min(1).max(249).optional()`
  - `part_of_speech`: `z.string().max(249).nullable().optional()`
- **`Flashcard` (istniejący typ encji)**:
  - Używany do typowania obiektu zwracanego w odpowiedzi. Zdefiniowany w `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (`200 OK`)**: Zwraca pełny, zaktualizowany obiekt fiszki.
  ```json
  {
    "id": "uuid",
    "front": "Nowy tekst na przodzie",
    "back": "Nowy tekst na tyle",
    "part_of_speech": "rzeczownik",
    "leitner_box": 1,
    "review_due_at": "2025-10-23T10:00:00.000Z",
    "updated_at": "2025-10-23T12:34:56.789Z"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Ciało żądania jest puste.
  - `401 Unauthorized`: Użytkownik nie jest zalogowany.
  - `404 Not Found`: Fiszka o podanym ID nie istnieje lub nie należy do użytkownika.
  - `422 Unprocessable Entity`: Dane wejściowe nie przeszły walidacji (np. zbyt długi tekst).
  - `500 Internal Server Error`: Wystąpił nieoczekiwany błąd serwera.

## 5. Przepływ danych
1.  Żądanie `PATCH` trafia do endpointu Astro `/api/flashcards/[flashcardId].ts`.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje token JWT użytkownika. Jeśli jest nieprawidłowy, zwraca `401`.
3.  Endpoint parsuje `flashcardId` z adresu URL.
4.  Ciało żądania jest walidowane przy użyciu schematu `UpdateFlashcardDto` (Zod). W przypadku błędu zwracany jest kod `422`.
5.  Jeśli ciało żądania jest puste, zwracany jest kod `400`.
6.  Endpoint wywołuje metodę `updateFlashcard` z serwisu `FlashcardService`.
7.  `FlashcardService` wykonuje operację `update()` na kliencie Supabase, przekazując dane i filtrując po `id` i `user_id` (uzyskanym z `context.locals.user`).
8.  Polityka RLS w bazie danych zapewnia, że użytkownik może modyfikować tylko swoje fiszki.
9.  Jeśli operacja `update` nie zwróci żadnych danych (co oznacza, że fiszka nie została znaleziona), serwis rzuca błąd, który jest mapowany na odpowiedź `404`.
10. W przypadku sukcesu, serwis zwraca zaktualizowany obiekt fiszki.
11. Endpoint zwraca otrzymany obiekt z kodem `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Każde żądanie musi zawierać prawidłowy token JWT (Bearer Token), który jest weryfikowany przez middleware Astro z użyciem klienta Supabase.
- **Autoryzacja**: Dostęp do danych jest kontrolowany na poziomie bazy danych przez polityki Row Level Security (RLS). Zapytanie `UPDATE` powiedzie się tylko wtedy, gdy `user_id` fiszki jest zgodne z ID uwierzytelnionego użytkownika.
- **Walidacja danych**: Wszystkie dane wejściowe są walidowane za pomocą Zod, aby zapobiec błędom i potencjalnym atakom (np. SQL Injection, chociaż klient Supabase parametryzuje zapytania).

## 7. Rozważania dotyczące wydajności
- Operacja jest ograniczona do pojedynczego zapytania `UPDATE` do bazy danych, co jest wysoce wydajne.
- Indeks na kluczu głównym (`id`) tabeli `flashcards` zapewnia szybkie wyszukiwanie fiszki do aktualizacji.
- Obciążenie jest minimalne, nie przewiduje się problemów z wydajnością.

## 8. Etapy wdrożenia
1.  **Utworzenie typów i walidacji**:
    - W pliku `src/lib/validators/flashcard.validators.ts` (lub podobnym) zdefiniować schemat Zod `UpdateFlashcardDto`.
2.  **Implementacja logiki w serwisie**:
    - Utworzyć plik `src/lib/services/flashcard.service.ts`, jeśli nie istnieje.
    - Dodać metodę `updateFlashcard(id, data, supabase)`, która będzie zawierać logikę aktualizacji danych w Supabase. Metoda powinna obsługiwać przypadek, gdy fiszka nie zostanie znaleziona.
3.  **Implementacja endpointu API**:
    - Utworzyć plik `src/pages/api/flashcards/[flashcardId].ts`.
    - Zaimplementować handler `PATCH`, który:
      - Pobiera `supabase` i `user` z `context.locals`.
      - Sprawdza, czy użytkownik jest zalogowany.
      - Waliduje `flashcardId` oraz ciało żądania.
      - Wywołuje serwis `flashcardService.updateFlashcard`.
      - Obsługuje błędy zwrócone przez serwis i mapuje je na odpowiednie kody statusu HTTP.
      - Zwraca zaktualizowaną fiszkę z kodem `200 OK` w przypadku sukcesu.
4.  **Testowanie**:
    - Dodać testy jednostkowe dla logiki serwisu.
    - Przeprowadzić testy integracyjne endpointu, sprawdzając wszystkie ścieżki sukcesu i błędów (np. za pomocą narzędzia typu Postman lub testów end-to-end).
