# API Endpoint Implementation Plan: Update User Profile

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie uwierzytelnionemu użytkownikowi aktualizacji jego ustawień profilu, w szczególności domyślnego poziomu językowego AI (`default_ai_level`). Endpoint będzie obsługiwał żądania `PATCH`, zapewniając, że tylko określone pola mogą być modyfikowane.

## 2. Szczegóły żądania
- **Metoda HTTP**: `PATCH`
- **Struktura URL**: `/api/profile`
- **Parametry**: Brak parametrów w URL.
- **Request Body**:
  - **Struktura**:
    ```json
    {
      "default_ai_level": "c1"
    }
    ```
  - **Walidacja**:
    - `default_ai_level`: Wymagane, musi być jedną z wartości: 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'.

## 3. Wykorzystywane typy
W pliku `src/types.ts` zostaną zdefiniowane lub zaktualizowane następujące typy:

- **`UpdateProfileDtoSchema` (Zod Schema)**: Do walidacji danych wejściowych.
  ```typescript
  import { z } from 'zod';

  export const UpdateProfileDtoSchema = z.object({
    default_ai_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  });
  ```
- **`UpdateProfileDto`**: Typ TypeScript wygenerowany na podstawie schematu Zod.
  ```typescript
  export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;
  ```
- **`ProfileViewModel`**: Typ reprezentujący dane profilu zwracane przez API.
  ```typescript
  export interface ProfileViewModel {
    id: string;
    default_ai_level: string;
    updated_at: string;
  }
  ```
- **`UpdateProfileCommand`**: Obiekt przekazywany do warstwy serwisu, zawierający zweryfikowane dane i ID użytkownika.
  ```typescript
  export interface UpdateProfileCommand {
    userId: string;
    default_ai_level: string;
  }
  ```

## 4. Szczegóły odpowiedzi
- **Odpowiedź sukcesu (200 OK)**:
  ```json
  {
    "id": "uuid",
    "default_ai_level": "c1",
    "updated_at": "string (ISO 8601)"
  }
  ```
- **Odpowiedzi błędów**:
  - `400 Bad Request`: Nieprawidłowy format JSON.
  - `401 Unauthorized`: Brak lub nieprawidłowy token uwierzytelniający.
  - `404 Not Found`: Profil użytkownika nie został znaleziony.
  - `422 Unprocessable Entity`: Błędy walidacji danych wejściowych.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera.

## 5. Przepływ danych
1.  Klient wysyła żądanie `PATCH` na `/api/profile` z tokenem JWT w nagłówku `Authorization` i ciałem żądania.
2.  Middleware Astro (`src/middleware/index.ts`) przechwytuje żądanie, weryfikuje token JWT i pobiera dane użytkownika, które umieszcza w `context.locals`.
3.  Handler endpointu (`src/pages/api/profile.ts`) dla metody `PATCH` jest wywoływany.
4.  Handler sprawdza, czy użytkownik jest uwierzytelniony (czy `context.locals.user` istnieje).
5.  Ciało żądania jest parsowane i walidowane przy użyciu `UpdateProfileDtoSchema`.
6.  Jeśli walidacja przejdzie pomyślnie, tworzony jest obiekt `UpdateProfileCommand`.
7.  Tworzona jest instancja `ProfileService`, do której wstrzykiwany jest klient Supabase z `context.locals.supabase`.
8.  Wywoływana jest metoda `profileService.updateProfile(command)`.
9.  `ProfileService` wykonuje operację `UPDATE` na tabeli `public.profiles` w Supabase, polegając na politykach RLS w celu zapewnienia autoryzacji.
10. Wynik operacji jest mapowany na `ProfileViewModel`.
11. Handler API zwraca zmapowany obiekt z kodem statusu `200 OK`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Każde żądanie musi zawierać ważny token JWT, który jest weryfikowany przez middleware. Dostęp do endpointu jest blokowany bez tokenu.
- **Autoryzacja**: Logika biznesowa polega na politykach Row Level Security (RLS) w bazie danych Supabase. Operacja `UPDATE` powiedzie się tylko wtedy, gdy `user_id` w zapytaniu jest równe `auth.uid()` z bieżącej sesji.
- **Walidacja danych**: Wszystkie dane wejściowe są ściśle walidowane za pomocą `zod`, aby zapobiec atakom typu Mass Assignment i zapewnić integralność danych.

## 7. Obsługa błędów
- **Błąd parsowania JSON**: Astro domyślnie zwróci błąd `400`.
- **Brak tokenu/nieprawidłowy token**: Middleware zwróci `401 Unauthorized`.
- **Błąd walidacji Zod**: Handler zwróci `422 Unprocessable Entity` z komunikatem o błędach.
- **Profil nie znaleziony**: `ProfileService` lub handler zwróci `404 Not Found`.
- **Błąd bazy danych**: Każdy błąd z Supabase (np. naruszenie ograniczeń, błąd połączenia) zostanie przechwycony i zwrócony jako `500 Internal Server Error` z odpowiednim logiem po stronie serwera.

## 8. Rozważania dotyczące wydajności
- Operacja `UPDATE` na pojedynczym wierszu w tabeli `profiles` jest wysoce wydajna, ponieważ wykorzystuje klucz główny (`id`).
- Indeks na kolumnie `id` jest domyślnie tworzony przez PostgreSQL, co zapewnia szybki dostęp.
- Nie przewiduje się wąskich gardeł wydajnościowych dla tego endpointu.

## 9. Etapy wdrożenia
1.  **Aktualizacja typów**:
    -   Dodaj/zaktualizuj typy `UpdateProfileDto`, `UpdateProfileDtoSchema`, `ProfileViewModel` i `UpdateProfileCommand` w pliku `src/types.ts`.
2.  **Utworzenie serwisu**:
    -   Stwórz plik `src/lib/services/profile.service.ts`.
    -   Zaimplementuj klasę `ProfileService` z metodą `updateProfile(command: UpdateProfileCommand)`, która będzie zawierać logikę interakcji z Supabase.
3.  **Implementacja endpointu API**:
    -   Stwórz plik `src/pages/api/profile.ts`.
    -   Zaimplementuj handler dla metody `PATCH`.
    -   W handlerze:
        -   Pobierz klienta Supabase i dane użytkownika z `context.locals`.
        -   Sprawdź uwierzytelnienie.
        -   Pobierz i zwaliduj ciało żądania za pomocą `UpdateProfileDtoSchema`.
        -   Utwórz instancję `ProfileService`.
        -   Wywołaj metodę serwisu.
        -   Obsłuż błędy i zwróć odpowiednią odpowiedź (sukces lub błąd).
        -   Zmapuj wynik na `ProfileViewModel` przed wysłaniem odpowiedzi.
4.  **Testowanie**:
    -   Napisz testy jednostkowe dla `ProfileService`.
    -   Napisz testy integracyjne dla endpointu `/api/profile`, obejmujące scenariusze sukcesu i błędów (np. nieprawidłowe dane, brak autoryzacji).
5.  **Dokumentacja**:
    -   Upewnij się, że implementacja jest zgodna z planem w `api-plan.md`. W razie potrzeby zaktualizuj dokumentację.