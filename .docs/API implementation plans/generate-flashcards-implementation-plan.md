# API Endpoint Implementation Plan: Generate Flashcard Suggestions

## 1. Przegląd punktu końcowego
Ten punkt końcowy `POST /api/ai/generate-suggestions` służy jako procedura do generowania propozycji fiszek przy użyciu zewnętrznej usługi AI. Użytkownik wysyła fragment tekstu oraz docelowy poziom językowy, a w odpowiedzi otrzymuje listę sugerowanych fiszek (słowo i jego tłumaczenie/definicja). Endpoint ten nie dokonuje żadnych zmian w bazie danych; jego jedynym zadaniem jest komunikacja z usługą AI i zwrócenie przetworzonych danych do klienta.

## 2. Szczegóły żądania
- **Metoda HTTP**: `POST`
- **Struktura URL**: `/api/ai/generate-suggestions`
- **Parametry**: Brak parametrów URL.
- **Request Body**: Wymagane jest ciało żądania w formacie `application/json`.
  ```json
  {
    "text": "The quick brown fox jumps over the lazy dog.",
    "level": "b2"
  }
  ```
  - **Pola**:
    - `text` (string, wymagane): Tekst źródłowy do analizy, o długości od 1 do 2000 znaków.
    - `level` (string, wymagane): Poziom językowy, musi być jedną z wartości: 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'.

## 3. Wykorzystywane typy
Do implementacji zostaną wykorzystane następujące typy i schematy walidacji:

- **Schemat walidacji (Zod)**: `GenerateSuggestionsPayloadSchema` do walidacji ciała żądania.
  ```typescript
  // src/pages/api/ai/generate-suggestions.ts
  import { z } from 'zod';
  
  const GenerateSuggestionsPayloadSchema = z.object({
    text: z.string().min(1, "Text cannot be empty.").max(2000, "Text cannot exceed 2000 characters."),
    level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2'], { message: "Invalid language level." }),
  });
  ```
- **Typy DTO (Data Transfer Object)** w `src/types.ts`:
  ```typescript
  // src/types.ts
  export interface AISuggestion {
    id: string; // UUID wygenerowane po stronie serwera
    front: string;
    back: string;
  }

  export interface GenerateSuggestionsResponse {
    suggestions: AISuggestion[];
  }
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "suggestions": [
      {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
        "front": "quick",
        "back": "szybki (przymiotnik)"
      },
      {
        "id": "d290f1ee-6c54-4b01-90e6-d701748f0852",
        "front": "lazy",
        "back": "leniwy (przymiotnik)"
      }
    ]
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Ciało żądania nie jest poprawnym formatem JSON.
  - `401 Unauthorized`: Użytkownik nie jest zalogowany (brak poprawnego tokenu JWT).
  - `422 Unprocessable Entity`: Błąd walidacji danych wejściowych (np. pusty `text`, nieprawidłowy `level`).
  - `502 Bad Gateway`: Błąd komunikacji z zewnętrzną usługą AI.

## 5. Przepływ danych
1. Klient wysyła żądanie `POST` na `/api/ai/generate-suggestions` z tokenem JWT w nagłówku `Authorization`.
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token JWT przy użyciu Supabase i dołącza klienta Supabase oraz sesję użytkownika do `context.locals`. Jeśli token jest nieprawidłowy, zwraca `401`.
3. Handler endpointu w `src/pages/api/ai/generate-suggestions.ts` odbiera żądanie.
4. Ciało żądania jest parsowane i walidowane przy użyciu schematu `GenerateSuggestionsPayloadSchema`. W przypadku błędu zwracany jest `422`.
5. Handler wywołuje funkcję `generateFlashcardSuggestions(text, level)` z nowo utworzonego serwisu `src/lib/ai.service.ts`.
6. Serwis `ai.service.ts` konstruuje odpowiedni prompt dla modelu AI, zawierający tekst użytkownika i instrukcje dotyczące formatu odpowiedzi.
7. Serwis wysyła żądanie do zewnętrznego API (np. OpenAI) z użyciem klucza API przechowywanego w zmiennych środowiskowych.
8. Serwis `ai.service.ts` odbiera odpowiedź od AI, parsuje ją i transformuje do formatu `AISuggestion[]`. Każdej sugestii nadawany jest unikalny identyfikator `uuid` wygenerowany po stronie serwera.
9. W przypadku błędu komunikacji z AI, serwis rzuca wyjątek, który jest przechwytywany w handlerze endpointu i mapowany na odpowiedź `502 Bad Gateway`.
10. Handler endpointu otrzymuje listę sugestii z serwisu i zwraca ją do klienta w formacie `GenerateSuggestionsResponse` z kodem `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wszystkie żądania do tego endpointu muszą być uwierzytelnione. Middleware Astro zapewni, że tylko zalogowani użytkownicy mogą z niego korzystać.
- **Autoryzacja**: Ponieważ operacja nie modyfikuje danych, autoryzacja na poziomie RLS nie jest wymagana. Wystarczy potwierdzenie tożsamości użytkownika.
- **Zarządzanie sekretami**: Klucz API do usługi AI będzie przechowywany wyłącznie po stronie serwera w zmiennych środowiskowych i nigdy nie będzie dostępny dla klienta.
- **Walidacja wejścia**: Rygorystyczna walidacja za pomocą Zod chroni przed niepoprawnymi danymi, które mogłyby prowadzić do błędów lub niepotrzebnego zużycia zasobów AI.

## 7. Rozważania dotyczące wydajności
- **Czas odpowiedzi**: Głównym czynnikiem wpływającym na wydajność jest czas odpowiedzi zewnętrznej usługi AI. Połączenie z AI jest operacją blokującą (asynchronicznie), więc klient będzie musiał na nią czekać.
- **Optymalizacja**: Należy zaimplementować odpowiedni `timeout` dla żądania do API AI, aby uniknąć zbyt długiego oczekiwania klienta w przypadku problemów z usługą.
- **Streaming**: W przyszłości można rozważyć implementację streamingu odpowiedzi od AI, aby poprawić postrzeganą szybkość działania po stronie klienta. Na obecnym etapie nie jest to wymagane.

## 8. Etapy wdrożenia
1. **Utworzenie typów**: Zaktualizuj plik `src/types.ts`, dodając interfejsy `AISuggestion` i `GenerateSuggestionsResponse`.
2. **Utworzenie serwisu AI**:
   - Stwórz plik `src/lib/ai.service.ts`.
   - Zaimplementuj w nim funkcję `generateFlashcardSuggestions(text: string, level: string): Promise<AISuggestion[]>`.
   - Funkcja powinna zawierać logikę tworzenia promptu, komunikacji z API AI (np. OpenAI), parsowania odpowiedzi i obsługi błędów.
   - Dodaj niezbędne zmienne środowiskowe (np. `OPENAI_API_KEY`) do plików `.env` i `supabase/config.toml`.
3. **Implementacja endpointu API**:
   - Stwórz plik `src/pages/api/ai/generate-suggestions.ts`.
   - Zaimplementuj handler `POST`, który będzie pełnił rolę kontrolera.
   - Dodaj walidację ciała żądania przy użyciu Zod (`GenerateSuggestionsPayloadSchema`).
   - Zintegruj endpoint z nowym serwisem `ai.service.ts`.
   - Zaimplementuj mapowanie błędów z serwisu i walidacji na odpowiednie kody statusu HTTP.
4. **Ochrona endpointu**: Upewnij się, że middleware w `src/middleware/index.ts` poprawnie obsługuje ścieżkę `/api/ai/*` i wymusza uwierzytelnianie.
5. **Testowanie**:
   - Napisz testy jednostkowe dla serwisu `ai.service.ts`, mockując zewnętrzne API.
   - Przeprowadź testy integracyjne endpointu przy użyciu narzędzi takich jak Postman lub testów `fetch` w środowisku deweloperskim, sprawdzając wszystkie scenariusze sukcesu i błędów.
