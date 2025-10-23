# API Endpoint Implementation Plan: Create Flashcard

## 1. Przegląd punktu końcowego
Ten dokument opisuje plan wdrożenia punktu końcowego `POST /api/flashcards`, który umożliwia uwierzytelnionym użytkownikom ręczne tworzenie nowych fiszek. Endpoint waliduje dane wejściowe, zapisuje je w bazie danych i zwraca nowo utworzony obiekt fiszki.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/flashcards`
- **Nagłówki**:
  - `Content-Type: application/json`
- **Request Body**: Obiekt JSON zgodny z typem `CreateFlashcardCommand`.
  ```json
  {
    "front": "string",
    "back": "string",
    "part_of_speech": "string"
  }
  ```
- **Parametry**:
  - **Wymagane**: `front`, `back`
  - **Opcjonalne**: `part_of_speech`

## 3. Wykorzystywane typy
- **Command Model (Request)**: `CreateFlashcardCommand` z `src/types.ts` do walidacji i przetwarzania danych wejściowych.
- **DTO (Response)**: `CreatedFlashcardDto` z `src/types.ts` do formatowania odpowiedzi.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (201 Created)**: Zwraca obiekt JSON z danymi nowo utworzonej fiszki, zgodny z `CreatedFlashcardDto`.
  ```json
  {
    "id": "uuid",
    "front": "Hello",
    "back": "Cześć",
    "part_of_speech": "interjection",
    "leitner_box": 1,
    "review_due_at": "string (ISO 8601)",
    "created_at": "string (ISO 8601)"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Błędy walidacji danych wejściowych.
  - `401 Unauthorized`: Użytkownik nie jest zalogowany.
  - `422 Unprocessable Entity`: Błąd operacji na bazie danych.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Klient wysyła żądanie `POST` na adres `/api/flashcards` z danymi fiszki.
2.  Middleware Astro (`src/middleware/index.ts`) weryfikuje sesję użytkownika i dołącza ją do `context.locals`.
3.  Handler `POST` w `src/pages/api/flashcards/index.ts` jest wywoływany.
4.  Handler sprawdza, czy `context.locals.session` istnieje. Jeśli nie, zwraca `401 Unauthorized`.
5.  Dane z body żądania są walidowane przy użyciu schematu Zod opartego na `CreateFlashcardCommand`. W przypadku błędu zwracany jest `400 Bad Request`.
6.  Handler wywołuje funkcję `createFlashcard` z serwisu `src/lib/services/flashcard.service.ts`, przekazując `userId` i zwalidowane dane.
7.  Serwis `flashcard.service.ts` wykonuje operację `insert` na tabeli `flashcards` w bazie danych Supabase.
8.  W przypadku błędu zapisu do bazy, serwis zwraca błąd, a handler zwraca `422 Unprocessable Entity`.
9.  Po pomyślnym zapisie, serwis zwraca nowo utworzony rekord.
10. Handler formatuje odpowiedź zgodnie z `CreatedFlashcardDto` i wysyła ją do klienta z kodem `201 Created`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp do endpointu jest ograniczony do uwierzytelnionych użytkowników. Każde żądanie musi być powiązane z aktywną sesją Supabase, która jest weryfikowana w middleware Astro.
- **Autoryzacja**: Logika biznesowa zapewnia, że fiszki są tworzone wyłącznie dla zalogowanego użytkownika (`user_id` jest pobierane z sesji, a nie z payloadu).
- **Walidacja danych**: Wszystkie dane wejściowe są rygorystycznie walidowane za pomocą `zod`, aby zapobiec nieprawidłowym danym i potencjalnym atakom (np. przez ograniczenie długości pól `front` i `back`).
- **Ochrona przed SQL Injection**: Użycie Supabase Client (opartego na PostgREST) zapewnia parametryzację zapytań, co eliminuje ryzyko SQL Injection.

## 7. Rozważania dotyczące wydajności
- Operacja `insert` na tabeli `flashcards` jest atomowa i szybka.
- Indeks na kolumnie `user_id` (automatycznie tworzony dla klucza obcego) zapewnia wydajność przyszłych zapytań.
- Przy dużej skali można rozważyć optymalizację bazy danych, ale na obecnym etapie nie przewiduje się wąskich gardeł.

## 8. Etapy wdrożenia
1.  **Utworzenie schematu walidacji Zod**:
    - W nowym pliku `src/lib/validators.ts` (lub podobnym) zdefiniować schemat `CreateFlashcardSchema` dla `CreateFlashcardCommand`.
2.  **Implementacja serwisu**:
    - Utworzyć plik `src/lib/services/flashcard.service.ts`, jeśli nie istnieje.
    - Dodać funkcję `createFlashcard(userId: string, data: CreateFlashcardCommand, supabase: SupabaseClient)`.
    - Zaimplementować logikę wstawiania nowego rekordu do tabeli `flashcards` przy użyciu `supabase.from('flashcards').insert(...).select().single()`.
    - Dodać obsługę błędów dla operacji bazodanowej.
3.  **Implementacja handlera API**:
    - Utworzyć plik `src/pages/api/flashcards/index.ts`.
    - Dodać `export const prerender = false;`
    - Zaimplementować handler `POST({ request, locals })`.
    - Sprawdzić istnienie sesji użytkownika w `locals.session`.
    - Zwalidować ciało żądania za pomocą `CreateFlashcardSchema`.
    - Wywołać serwis `flashcard.service.ts`.
    - Zwrócić odpowiedź `201 Created` z danymi fiszki lub odpowiedni kod błędu.
4.  **Testy i weryfikacja**:
    - Przeprowadzić manualne testy endpointu przy użyciu narzędzia do testowania API (np. Postman, VS Code REST Client).
    - Przetestować scenariusze sukcesu i wszystkie scenariusze błędów (400, 401, 422).
