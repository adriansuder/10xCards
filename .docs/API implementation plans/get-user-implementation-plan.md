# API Endpoint Implementation Plan: Get User Profile

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest bezpieczne pobranie i zwrócenie profilu oraz ustawień dla aktualnie uwierzytelnionego użytkownika. Endpoint dostarcza kluczowych danych, takich jak domyślny poziom AI, które są niezbędne do personalizacji doświadczenia użytkownika w aplikacji.

## 2. Szczegóły żądania
- **Metoda HTTP**: `GET`
- **Struktura URL**: `/api/profile`
- **Parametry**:
  - **Wymagane**: Brak parametrów w URL. Wymagany jest nagłówek `Authorization: Bearer <SUPABASE_JWT>`.
  - **Opcjonalne**: Brak.
- **Request Body**: Brak.

## 3. Wykorzystywane typy
- **`UserProfileDto`**: Obiekt transferu danych (DTO) dla odpowiedzi, zdefiniowany w `src/types.ts`.
  ```typescript
  export interface UserProfileDto {
    id: string;
    default_ai_level: string;
    created_at: string;
  }
  ```
- **`Profile`**: Typ encji z `src/db/database.types.ts` (generowany przez Supabase), reprezentujący wiersz w tabeli `public.profiles`.

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "id": "uuid",
    "default_ai_level": "b2",
    "created_at": "string (ISO 8601)"
  }
  ```
- **Odpowiedzi błędów**:
  - `401 Unauthorized`: Gdy użytkownik nie jest uwierzytelniony (brak lub nieważny token JWT).
  - `404 Not Found`: Gdy uwierzytelniony użytkownik nie ma profilu w bazie danych.
  - `500 Internal Server Error`: W przypadku nieoczekiwanych błędów po stronie serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie `GET` na `/api/profile` z tokenem JWT w nagłówku `Authorization`.
2. Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, używa `Astro.locals.supabase` do walidacji tokenu i pobrania sesji użytkownika. Jeśli sesja jest nieważna, zwraca `401`.
3. Handler endpointu (`src/pages/api/profile.ts`) jest wywoływany.
4. Handler wywołuje metodę `getUserProfile(supabase, userId)` z nowo utworzonego serwisu `ProfileService` (`src/lib/services/profile.service.ts`).
5. `ProfileService` wykonuje zapytanie do tabeli `public.profiles` w Supabase, filtrując po `id` użytkownika.
6. `ProfileService` mapuje wynik z bazy danych na `UserProfileDto`, wybierając tylko wymagane pola.
7. Jeśli profil nie zostanie znaleziony, serwis zwraca błąd.
8. Handler endpointu odbiera wynik z serwisu. W przypadku sukcesu zwraca `200 OK` z `UserProfileDto`. W przypadku błędu "nie znaleziono" zwraca `404 Not Found`. Inne błędy skutkują `500 Internal Server Error`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Dostęp jest ściśle ograniczony do uwierzytelnionych użytkowników. Middleware Astro i Supabase są odpowiedzialne za weryfikację tokenu JWT.
- **Autoryzacja**: Polityka RLS (Row Level Security) w Supabase musi być włączona dla tabeli `profiles` i skonfigurowana tak, aby użytkownicy mogli odczytywać tylko własne dane (`auth.uid() = id`).
- **Walidacja danych**: Ponieważ endpoint nie przyjmuje danych wejściowych, walidacja nie jest wymagana.
- **Minimalizacja danych**: Endpoint zwraca tylko podzbiór danych z tabeli `profiles`, aby uniknąć wycieku wrażliwych informacji.

## 7. Obsługa błędów
- Błędy będą obsługiwane za pomocą standardowych bloków `try...catch` w handlerze i wzorca `Result` w serwisie.
- **Brak sesji użytkownika**: Middleware automatycznie zwróci `401`.
- **Profil nie znaleziony**: Serwis zidentyfikuje ten przypadek, a handler zwróci `404`.
- **Błędy bazy danych**: Wszelkie błędy z Supabase (np. problem z połączeniem) będą logowane na serwerze, a klient otrzyma odpowiedź `500`.

## 8. Rozważania dotyczące wydajności
- Zapytanie do bazy danych jest bardzo proste i filtruje po kluczu głównym (`id`), co gwarantuje wysoką wydajność.
- Tabela `profiles` ma indeks na kolumnie `id` (jako klucz główny), co zapewnia szybkie wyszukiwanie.
- Obciążenie jest minimalne, więc nie przewiduje się problemów z wydajnością.

## 9. Etapy wdrożenia
1. **Aktualizacja typów**:
   - W pliku `src/types.ts` zdefiniuj interfejs `UserProfileDto`.
2. **Utworzenie serwisu**:
   - Utwórz nowy plik `src/lib/services/profile.service.ts`.
   - Zaimplementuj w nim `ProfileService` z metodą `getUserProfile(supabase, userId)`, która pobiera dane z Supabase i mapuje je na `UserProfileDto`.
   - Zastosuj obsługę błędów, aby odróżnić "nie znaleziono" od innych błędów.
3. **Utworzenie endpointu API**:
   - Utwórz nowy plik `src/pages/api/profile.ts`.
   - Zaimplementuj handler `GET`, który wykorzystuje middleware do pobrania sesji użytkownika.
   - Wywołaj metodę z `ProfileService` i przekaż jej klienta Supabase z `Astro.locals.supabase`.
   - Zwróć odpowiednie kody statusu (`200`, `404`, `500`) w zależności od wyniku operacji.
4. **Weryfikacja polityki RLS**:
   - Sprawdź w panelu Supabase lub w plikach migracji, czy dla tabeli `public.profiles` istnieje i jest aktywna polityka RLS, która pozwala użytkownikom na odczyt tylko własnego profilu.
5. **Testowanie**:
   - Utwórz testy (manualne lub automatyczne) dla następujących scenariuszy:
     - Żądanie z poprawnym tokenem JWT.
     - Żądanie bez tokenu JWT.
     - Żądanie z nieważnym tokenem JWT.
     - Scenariusz, w którym profil użytkownika nie istnieje w bazie danych (jeśli to możliwe do zasymulowania).
