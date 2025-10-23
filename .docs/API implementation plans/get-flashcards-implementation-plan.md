# API Endpoint Implementation Plan: Get Flashcard by ID

## 1. Przegląd punktu końcowego
Ten punkt końcowy API służy do pobierania pojedynczej fiszki na podstawie jej unikalnego identyfikatora (`flashcardId`). Zapewnia dostęp do szczegółów fiszki wyłącznie jej właścicielowi, zgodnie z zasadami bezpieczeństwa danych.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/flashcards/{flashcardId}`
- **Parametry**:
  - **Wymagane**:
    - `flashcardId` (parametr ścieżki): Unikalny identyfikator fiszki w formacie UUID.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak (N/A).

## 3. Wykorzystywane typy

### DTO (Data Transfer Object)
- **`FlashcardDto`**: Obiekt reprezentujący publiczne dane fiszki. Zostanie zdefiniowany w `src/types.ts`.
  ```typescript
  export interface FlashcardDto {
    id: string;
    front: string;
    back: string;
    part_of_speech: string | null;
    leitner_box: number;
    review_due_at: string;
    created_at: string;
  }
  ```

### Modele Walidacji (Zod)
- **`GetFlashcardParamsSchema`**: Schemat Zod do walidacji parametrów ścieżki.
  ```typescript
  import { z } from 'zod';

  export const GetFlashcardParamsSchema = z.object({
    flashcardId: z.string().uuid({ message: "Flashcard ID must be a valid UUID." }),
  });
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**: Zwraca obiekt `FlashcardDto` w formacie JSON.
  ```json
  {
    "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    "front": "Hello",
    "back": "Cześć",
    "part_of_speech": "interjection",
    "leitner_box": 1,
    "review_due_at": "2025-10-23T10:00:00.000Z",
    "created_at": "2025-10-22T10:00:00.000Z"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Jeśli `flashcardId` nie jest prawidłowym UUID.
  - `401 Unauthorized`: Jeśli użytkownik nie jest uwierzytelniony.
  - `404 Not Found`: Jeśli fiszka o podanym ID nie istnieje lub nie należy do użytkownika.
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie `GET` na adres `/api/flashcards/{flashcardId}` z tokenem JWT w nagłówku `Authorization`.
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, waliduje token JWT przy użyciu Supabase i dołącza klienta Supabase oraz sesję użytkownika do `context.locals`. Jeśli token jest nieprawidłowy, middleware zwraca `401 Unauthorized`.
3. Handler punktu końcowego (`src/pages/api/flashcards/[flashcardId].ts`) jest wywoływany.
4. Handler waliduje parametr `flashcardId` przy użyciu schematu `GetFlashcardParamsSchema`. W przypadku błędu zwraca `400 Bad Request`.
5. Handler wywołuje funkcję `getFlashcardById` z serwisu `flashcard.service.ts`, przekazując instancję klienta Supabase z `context.locals.supabase` i `flashcardId`.
6. Funkcja `getFlashcardById` wykonuje zapytanie do tabeli `public.flashcards` w bazie danych Supabase: `supabase.from('flashcards').select(...).eq('id', flashcardId).single()`.
7. Polityka RLS w Supabase automatycznie filtruje wyniki, zapewniając, że zapytanie zwróci dane tylko wtedy, gdy `user_id` wiersza pasuje do ID uwierzytelnionego użytkownika.
8. Jeśli zapytanie nie zwróci żadnych danych (błąd `PGRST116` z Supabase), oznacza to, że fiszka nie istnieje lub użytkownik nie ma do niej dostępu. Serwis zwraca `null`.
9. Handler otrzymuje `null` z serwisu i zwraca odpowiedź `404 Not Found`.
10. Jeśli zapytanie zwróci dane, serwis mapuje je na `FlashcardDto` i zwraca do handlera.
11. Handler zwraca `FlashcardDto` z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wszystkie żądania muszą być uwierzytelnione za pomocą tokenu JWT Supabase, co jest weryfikowane przez middleware.
- **Autoryzacja**: Dostęp do danych jest kontrolowany przez polityki RLS w bazie danych PostgreSQL. Zapytania będą zwracać tylko te fiszki, które należą do zalogowanego użytkownika. To zapobiega wyciekowi danych między użytkownikami.
- **Walidacja danych wejściowych**: Parametr `flashcardId` jest walidowany jako UUID, aby zapobiec błędom zapytań do bazy danych i potencjalnym atakom (np. SQL Injection, chociaż Supabase ORM w dużym stopniu przed tym chroni).

## 7. Rozważania dotyczące wydajności
- **Indeksowanie bazy danych**: Tabela `flashcards` ma klucz główny na kolumnie `id`, co zapewnia bardzo szybkie wyszukiwanie. Zapytanie `...eq('id', flashcardId)` będzie wysoce wydajne.
- **Rozmiar odpowiedzi**: Odpowiedź zawiera tylko dane dla jednej fiszki, więc jej rozmiar jest mały i nie powinien stanowić problemu wydajnościowego.

## 8. Etapy wdrożenia
1. **Aktualizacja typów**:
   - W pliku `src/types.ts` zdefiniuj lub zweryfikuj istnienie interfejsu `FlashcardDto`.

2. **Utworzenie serwisu**:
   - Utwórz nowy plik `src/lib/services/flashcard.service.ts`.
   - Zaimplementuj w nim funkcję `getFlashcardById(supabase: SupabaseClient, flashcardId: string): Promise<FlashcardDto | null>`.
   - Funkcja powinna wykonać zapytanie do Supabase, obsłużyć przypadek, gdy fiszka nie zostanie znaleziona (Supabase zwróci błąd, który należy przechwycić) i zmapować wynik na `FlashcardDto`.

3. **Implementacja punktu końcowego**:
   - Utwórz plik `src/pages/api/flashcards/[flashcardId].ts`.
   - Zaimplementuj handler `GET` dla `APIContext`.
   - Pobierz `supabase` i `session` z `context.locals`. Sprawdź, czy sesja istnieje, jeśli nie, zwróć `401`.
   - Zwaliduj parametr `context.params.flashcardId` przy użyciu `GetFlashcardParamsSchema`. W przypadku błędu zwróć `400`.
   - Wywołaj `flashcardService.getFlashcardById(...)`.
   - Jeśli wynik jest `null`, zwróć `404 Not Found`.
   - Jeśli wynik jest obiektem fiszki, zwróć go z kodem `200 OK`.
   - Dodaj `export const prerender = false;` na końcu pliku, aby zapewnić renderowanie dynamiczne.

4. **Obsługa błędów**:
   - W handlerze punktu końcowego opakuj logikę w blok `try...catch`, aby przechwytywać nieoczekiwane błędy i zwracać `500 Internal Server Error`.
