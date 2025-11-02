# Architektura UI dla AI Fiszki

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) opiera się na hybrydowym podejściu, wykorzystując **Astro** do renderowania statycznych stron i routingu oraz **React** do tworzenia interaktywnych komponentów (tzw. "wysp"). To połączenie zapewnia optymalną wydajność ładowania stron przy jednoczesnym zachowaniu bogatej interaktywności w kluczowych obszarach aplikacji.

- **Frameworki**: Astro (routing, layouty), React (komponenty `client:load`).
- **Styling**: Tailwind CSS z biblioteką gotowych komponentów **shadcn/ui**.
- **Zarządzanie stanem**:
  - **Globalny**: Stan uwierzytelnienia (sesja użytkownika) będzie zarządzany przez globalny `AuthContext` w React, zasilany przez `supabase.auth.onAuthStateChange`.
  - **Lokalny**: Stany poszczególnych widoków (np. lista fiszek, dane formularzy, stan sesji nauki) będą zarządzane lokalnie w komponentach React za pomocą haków (`useState`, `useReducer`).
- **Responsywność**: Projekt jest tworzony z myślą o przeglądarkach internetowych ("web-only"). Na węższych ekranach (poniżej 1024px) kluczowe, szerokie elementy, takie jak tabele, będą przewijane horyzontalnie.

## 2. Lista widoków

### Widok: Logowanie
- **Ścieżka**: `/logowanie`
- **Główny cel**: Umożliwienie zarejestrowanym użytkownikom dostępu do aplikacji.
- **Kluczowe informacje**: Formularz logowania.
- **Kluczowe komponenty**: `Card`, `Input` (Email, Hasło), `Button` (Zaloguj), `Link` (do /rejestracja).
- **UX, dostępność i bezpieczeństwo**: Prosty, wycentrowany formularz. Walidacja po stronie klienta i serwera. Komunikaty o błędach.

### Widok: Rejestracja
- **Ścieżka**: `/rejestracja`
- **Główny cel**: Umożliwienie nowym użytkownikom założenia konta.
- **Kluczowe informacje**: Formularz rejestracji.
- **Kluczowe komponenty**: `Card`, `Input` (Email, Hasło), `Button` (Zarejestruj), `Link` (do /logowanie).
- **UX, dostępność i bezpieczeństwo**: Prosty, wycentrowany formularz. Walidacja hasła (np. minimalna długość). Komunikaty o błędach (np. zajęty email).

### Widok: Strona Główna (Generator Fiszki)
- **Ścieżka**: `/`
- **Główny cel**: Generowanie fiszek za pomocą AI lub ich manualne dodawanie.
- **Kluczowe informacje**: Formularz do generowania/dodawania, lista propozycji AI.
- **Kluczowe komponenty**:
  - `Tabs` do przełączania między "Generuj z AI" a "Dodaj ręcznie".
  - **Zakładka AI**: `Textarea` (z licznikiem znaków), `Select` (poziom B1/B2/C1), `Button` ("Generuj" ze `Spinner`).
  - **Zakładka Manualna**: `Input` (Front, Tył, Część mowy), `Button` ("Dodaj").
  - **Lista propozycji AI**: Dynamicznie renderowana lista z edycją "inline" i przyciskiem do usuwania.
  - `Button` ("Dodaj [X] fiszek") do importu.
- **UX, dostępność i bezpieczeństwo**: Trasa chroniona (przekierowanie na `/logowanie`). Jasne stany ładowania. Dynamiczna aktualizacja etykiety przycisku importu.

### Widok: Moje Fiszki
- **Ścieżka**: `/moje-fiszki`
- **Główny cel**: Przeglądanie, edycja i usuwanie wszystkich fiszek użytkownika.
- **Kluczowe informacje**: Tabela z fiszkami, paginacja.
- **Kluczowe komponenty**:
  - `Table` z kolumnami: Front, Tył, Część mowy, Pudełko Leitnera, Następna powtórka, Akcje.
  - Komponent paginacji.
  - `Button` (Edytuj, Usuń) w każdym wierszu.
  - `AlertDialog` do potwierdzenia usunięcia.
  - `Skeleton` jako wskaźnik ładowania tabeli.
  - Komunikat o stanie pustym ("Brak fiszek, wygeneruj je!").
- **UX, dostępność i bezpieczeństwo**: Trasa chroniona. Edycja "inline" dla szybkiej modyfikacji. Optymistyczne UI przy usuwaniu dla lepszej responsywności. Tabela przewijana horyzontalnie na mniejszych ekranach.

### Widok: Sesja Nauki
- **Ścieżka**: `/ucz-sie`
- **Główny cel**: Przeprowadzenie sesji powtórek metodą "Spaced Repetition".
- **Kluczowe informacje**: Aktualna fiszka (front/tył), przyciski oceny.
- **Kluczowe komponenty**:
  - `Card` wyświetlający przód fiszki.
  - `Button` ("Pokaż odpowiedź").
  - `Button` ("Wiem"), `Button` ("Nie wiem").
  - Komunikat o stanie pustym ("Wszystko powtórzone na dziś!").
  - Ekran podsumowania sesji (lokalnie zliczone statystyki).
- **UX, dostępność i bezpieczeństwo**: Trasa chroniona. Minimalistyczny interfejs skupiający użytkownika na zadaniu. Płynne przejścia między kartami.

### Widok: Ustawienia
- **Ścieżka**: `/ustawienia`
- **Główny cel**: Zarządzanie ustawieniami profilu użytkownika.
- **Kluczowe informacje**: Formularz ustawień.
- **Kluczowe komponenty**: `Select` do zmiany domyślnego poziomu AI (`default_ai_level`), `Button` ("Zapisz").
- **UX, dostępność i bezpieczeństwo**: Trasa chroniona. Prosty formularz. Zapis zmian może następować automatycznie po zmianie wartości w celu uproszczenia interfejsu.

## 3. Mapa podróży użytkownika

Główny przepływ pracy użytkownika (tzw. "happy path") wygląda następująco:

1.  **Rejestracja/Logowanie**: Użytkownik trafia na stronę `/logowanie` lub `/rejestracja`, zakłada konto lub loguje się, po czym jest przekierowywany na stronę główną (`/`).
2.  **Generowanie Fiszki**: Na stronie głównej (`/`) użytkownik wkleja tekst, wybiera poziom i klika "Generuj". Aplikacja wyświetla `Spinner` i wysyła zapytanie do `POST /api/ai/generate-suggestions`.
3.  **Przegląd i Edycja**: Pod formularzem pojawia się lista propozycji. Użytkownik przegląda je, edytuje niektóre "inline" i usuwa te, których nie chce.
4.  **Import**: Użytkownik klika "Dodaj [X] fiszek", co wysyła stan klienta do `POST /api/ai/import-flashcards`. Aplikacja wyświetla `Toaster` z komunikatem o sukcesie.
5.  **Nauka**: Użytkownik przechodzi do `/ucz-sie`. Aplikacja pobiera karty do powtórki z `GET /api/review/session` i rozpoczyna sesję.
6.  **Przebieg Sesji**: Użytkownik odsłania odpowiedzi i ocenia swoją wiedzę ("Wiem"/"Nie wiem"). Każda ocena wysyła `POST /api/review/update`, a aplikacja automatycznie przechodzi do kolejnej karty.
7.  **Zarządzanie**: Po jakimś czasie użytkownik przechodzi do `/moje-fiszki`, gdzie przegląda swoją kolekcję, poprawia literówkę w jednej z fiszek i usuwa inną.
8.  **Zmiana Ustawień**: Użytkownik wchodzi na `/ustawienia` i zmienia swój domyślny poziom trudności AI na `C1`.

## 4. Układ i struktura nawigacji

Nawigacja będzie dynamicznie dostosowywać się do stanu uwierzytelnienia użytkownika.

- **Układ (Layout)**: Aplikacja będzie miała dwa główne układy: jeden dla gości (bez nawigacji) i jeden dla zalogowanych użytkowników (z nagłówkiem i nawigacją).
- **Nawigacja dla Gościa**: Brak widocznej nawigacji. Strony `/logowanie` i `/rejestracja` zawierają linki do siebie nawzajem.
- **Nawigacja dla Zalogowanego Użytkownika**:
  - Komponent `Header` (React, `client:load`) będzie widoczny na wszystkich chronionych stronach.
  - Główne linki nawigacyjne:
    - **Generuj Fiszki** (`/`)
    - **Ucz się** (`/ucz-sie`)
    - **Moje Fiszki** (`/moje-fiszki`)
  - Menu użytkownika (rozwijane):
    - **Ustawienia** (`/ustawienia`)
    - **Wyloguj** (przycisk wywołujący `supabase.auth.signOut()`)

## 5. Kluczowe komponenty

Poniższe komponenty (głównie z `shadcn/ui`) będą reużywane w całej aplikacji, zapewniając spójność wizualną i funkcjonalną.

- **`Button`**: Standardowe przyciski do akcji, z wariantami (główny, drugorzędny, destrukcyjny). Będą zawierać komponent `Spinner` do sygnalizowania stanów ładowania.
- **`Input` / `Textarea`**: Pola formularzy do wprowadzania danych.
- **`Card`**: Kontener do grupowania powiązanych treści (np. formularze, karta fiszki).
- **`Table`**: Do wyświetlania danych tabelarycznych (lista fiszek).
- **`Tabs`**: Do przełączania widoków w obrębie jednej strony (generator AI vs manualny).
- **`AlertDialog`**: Modalne okno dialogowe do krytycznych potwierdzeń (np. usunięcie fiszki).
- **`Toaster`**: Globalny system do wyświetlania powiadomień "toast" o sukcesach lub błędach.
- **`Skeleton`**: Wskaźnik ładowania używany do sygnalizowania ładowania treści o znanej strukturze (np. wiersze tabeli).
- **`Spinner`**: Wskaźnik ładowania używany do akcji o nieokreślonym czasie trwania (np. wewnątrz przycisku).
- **`AuthContext` (React Context)**: Globalny dostawca stanu sesji, umożliwiający komponentom React dostęp do informacji o zalogowanym użytkowniku i implementację ochrony tras.
