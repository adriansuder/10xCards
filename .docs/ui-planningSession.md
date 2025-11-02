\<conversation_summary\>
\<decisions\>

1.  Architektura UI zostanie oparta na Astro (strony statyczne) z React (komponenty interaktywne `client:load`), stylizowana za pomocą Tailwind i biblioteki komponentów `shadcn/ui`.
2.  Uwierzytelnianie będzie zarządzane globalnie przez React `AuthContext` (słuchający Supabase `onAuthStateChange`), który będzie sterował ochroną tras (przekierowanie do `/logowanie`) oraz dynamicznym renderowaniem nawigacji.
3.  Strona główna (`/`) będzie zawierać komponent `Tabs` do przełączania między generatorem AI (US-003) a formularzem manualnym (US-007).
4.  Stan propozycji wygenerowanych przez AI (`POST /api/ai/generate-suggestions`) będzie zarządzany wyłącznie po stronie klienta (stan React) przed masowym importem (`POST /api/ai/import-flashcards`).
5.  Interfejs użytkownika musi obsłużyć niespójność API (R3.8): po otrzymaniu sugestii z AI, musi rozparować pole `back` (np. "szybki (przymiotnik)") na dwa osobne pola (tłumaczenie i część mowy) w stanie klienta, aby umożliwić edycję i poprawny import.
6.  Strona "Moje Fiszki" (`/moje-fiszki`) będzie wyświetlać dane w komponencie `Table` z `shadcn/ui`, który na węższych ekranach będzie przewijalny horyzontalnie (R3.10).
7.  Tabela "Moje Fiszki" będzie zawierać kolumny "Pudełko" (`leitner_box`) i "Następna powtórka" (`review_due_at`) oraz obsługiwać paginację po stronie klienta (R1.4, R3.3).
8.  Edycja fiszek (US-008) będzie realizowana "inline" (zamiana tekstu na `<input>`), a usuwanie będzie wymagało potwierdzenia przez `AlertDialog` i użyje mechanizmu "optymistycznego UI" (R1.6, R3.1, R3.4).
9.  Sesja nauki (`/ucz-sie`) pobierze _całą_ kolejkę fiszek (`GET /api/review/session`) do stanu klienta i będzie przetwarzać je pojedynczo, usuwając z lokalnej tablicy po ocenie (R1.7).
10. Stany ładowania będą obsługiwane przez `Spinner` w przyciskach (AI Gen) i `Skeleton` (ładowanie tabeli), a błędy API będą komunikowane przez globalny komponent `Toaster` (R1.8, R2.5).

\</decisions\>
\<matched_recommendations\>

1.  (R1.1) Zaimplementowano podział nawigacji na zalogowaną (Generator, Ucz się, Moje Fiszki, Profil) i niezalogowaną (Zaloguj, Zarejestruj).
2.  (R1.2, R2.1) Zaakceptowano użycie komponentu `Tabs` na stronie głównej do rozdzielenia generatora AI i formularza manualnego.
3.  (R1.3, R2.8, R3.6) Zaakceptowano strategię zarządzania stanem propozycji AI (włącznie z dynamicznym przyciskiem importu i użyciem `temporary-id` jako klucza) wyłącznie po stronie klienta.
4.  (R1.4, R2.2, R3.3, R3.4) Zdefiniowano wygląd i logikę strony "Moje Fiszki", w tym paginację, stan pusty, dodatkowe kolumny (`leitner_box`) oraz logikę CRUD (inline edit, optimistic delete).
5.  (R1.5, R1.7, R2.3, R3.9) Zdefiniowano kompletny przepływ sesji nauki: pobranie całej kolejki do stanu klienta, stan pusty (gratulacje), minimalistyczny interfejs karty oraz lokalne zliczanie wyników na ekranie podsumowania.
6.  (R1.8) Zaakceptowano globalną strategię obsługi błędów przy użyciu komponentu `Toaster` `shadcn/ui`.
7.  (R1.9) Zaakceptowano utworzenie nowej, prostej strony `/ustawienia` do zarządzania profilem użytkownika (`PATCH /api/profile`).
8.  (R2.4) Zdefiniowano dedykowane trasy `/logowanie` i `/rejestracja` z wycentrowanymi formularzami.
9.  (R2.7, R2.10, R3.5) Zdefiniowano strategię zarządzania stanem uwierzytelnienia (globalny `AuthContext` w React) i powiązania jej z ochroną tras oraz komponentami Astro (wymagając `client:load` dla nagłówka).
10. (R3.8) Zidentyfikowano i zaakceptowano kluczową logikę biznesową po stronie UI, polegającą na parsowaniu odpowiedzi z AI, aby dopasować ją do schematu API importu.
11. (R3.10) Podjęto decyzję o obsłudze węższych ekranów webowych poprzez horyzontalne przewijanie tabeli, rezygnując z podejścia "mobile-first".
    \</matched_recommendations\>
    \<ui_architecture_planning_summary\>

## Podsumowanie Planowania Architektury UI (MVP)

### 1\. Główne Wymagania Architektoniczne

Architektura frontendu będzie hybrydą **Astro 5** (dla stron statycznych i routingu) oraz **React 19** (dla interaktywnych "wysp" oznaczonych jako `client:load`). Podejście to zapewni szybkość ładowania, jednocześnie umożliwiając dynamiczną obsługę stanu w kluczowych komponentach.

- **Styling**: Tailwind 4 wraz z biblioteką komponentów `shadcn/ui` (używaną dla `Tabs`, `Table`, `Button`, `Input`, `AlertDialog`, `Toaster`, `Skeleton` itd.).
- **Backend**: Supabase (Auth, DB) i OpenRouter (AI).
- **Framework**: Astro 5 (routing) + React 19 (komponenty interaktywne).

### 2\. Kluczowe Widoki, Ekrany i Przepływy Użytkownika

Aplikacja będzie posiadać dwa główne układy (Layouts) zależne od stanu uwierzytelnienia, kontrolowane przez globalny `AuthContext`.

**Przepływ Uwierzytelnienia (Gość)**

- **Trasy**: `/logowanie`, `/rejestracja`.
- **UI**: Proste, wycentrowane formularze (`Card` z `shadcn/ui`) na dedykowanych stronach.
- **Logika**: Bezpośrednia komunikacja z `supabase.auth.signIn/signUp`. Po sukcesie następuje przekierowanie na stronę główną (`/`).

**Nawigacja (Zalogowany)**

- **UI**: Stały `Header` (jako komponent React `client:load` czytający `AuthContext`).
- **Linki**: "Generuj Fiszki" (`/`), "Ucz się" (`/ucz-sie`), "Moje Fiszki" (`/moje-fiszki`) oraz menu profilu z linkami do "Ustawienia" (`/ustawienia`) i "Wyloguj".

**Strona Główna / Generator AI (`/`)**

- **UI**: Komponent `Tabs` z dwiema zakładkami:
  1.  **"Generuj z AI" (US-003)**: `Textarea` z licznikiem znaków (limit 2000), `Select` poziomu (B1/B2/C1). Przycisk "Generuj" ze `Spinner`.
  2.  **"Dodaj ręcznie" (US-007)**: Prosty formularz (Front, Tył, opcjonalna Część mowy jako `Input`).
- **Przepływ AI (US-005)**: Po otrzymaniu danych z `POST /api/ai/generate-suggestions`, formularz jest czyszczony, a pod zakładkami pojawia się lista propozycji (edytowalna inline).
- **Przepływ Importu (US-006)**: Przycisk "Dodaj [X] fiszek" (z dynamiczną etykietą zależną od stanu listy) wysyła zawartość stanu klienta do `POST /api/ai/import-flashcards`.

**Sesja Nauki (`/ucz-sie`)**

- **UI**: Trasa chroniona. Minimalistyczny widok `Card` skupiający na zadaniu.
- **Przepływ (US-009)**: Przy wejściu pobiera _całą_ kolejkę z `GET /api/review/session`.
- **Stan Pusty**: Wyświetla komunikat "Wszystko powtórzone na dziś\!".
- **Logika Sesji (US-010)**: Pokazuje `front` fiszki `cards[0]`. Przycisk "Pokaż" odsłania `back` i zamienia się na przyciski "Wiem" / "Nie wiem". Kliknięcie wysyła `POST /api/review/update`, a następnie usuwa `cards[0]` z lokalnego stanu, automatycznie pokazując kolejną fiszkę.
- **Podsumowanie**: Po opróżnieniu tablicy, wyświetla lokalnie zliczone statystyki sesji.

**Zarządzanie Fiszkami (`/moje-fiszki`)**

- **UI**: Trasa chroniona. Komponent `Table` z `shadcn/ui` z kolumnami: Front, Tył, Pudełko (`leitner_box`), Nast. Powtórka (`review_due_at`) i Akcje.
- **Stan Pusty**: Wyświetla komunikat "Brak fiszek" z CTA do generatora.
- **Logika (US-008)**:
  - **Paginacja**: Komponenty paginacji kontrolują stan (`page`, `pageSize`) używany przy `GET /api/flashcards`.
  - **Edycja**: Przycisk "Edytuj" przełącza wiersz w tryb edycji (pola `<input>`). Przycisk "Zapisz" (ze `Spinner`) wysyła `PATCH /api/flashcards/{id}`.
  - **Usuwanie**: Przycisk "Usuń" otwiera `AlertDialog`. Potwierdzenie wyzwala `DELETE /api/flashcards/{id}` z użyciem optymistycznego UI.

**Ustawienia (`/ustawienia`)**

- **UI**: Trasa chroniona. Prosty formularz z `Select` do zmiany `default_ai_level`.
- **Logika**: Zmiana wartości wywołuje `PATCH /api/profile`.

### 3\. Strategia Integracji z API i Zarządzania Stanem

- **Globalny Stan**: Uwierzytelnienie (`session`) będzie zarządzane przez globalny **React `AuthContext`**.
- **Lokalny Stan (Stan Widoku)**: Większość stanów (listy fiszek, dane formularzy, kolejka sesji, stan paginacji) będzie zarządzana lokalnie w komponentach React (`useState`, `useReducer`).
- **Integralność Danych AI (Kluczowa Logika UI)**: UI jest odpowiedzialne za transformację danych między `GET /api/ai/generate-suggestions` a `POST /api/ai/import-flashcards`. Musi rozbić pole `back` (zawierające część mowy) na dwa osobne pola (`back` i `part_of_speech`) w stanie klienta, aby umożliwić ich osobną edycję i poprawny import.
- **Obsługa Błędów**: Globalny komponent `Toaster` (`shadcn/ui`) będzie używany do wyświetlania komunikatów o błędach przechwyconych z wywołań API (`.catch()`).
- **Stany Ładowania**: Użycie `Skeleton` dla ładowania danych tabelarycznych oraz `Spinner` dla akcji asynchronicznych (generowanie, zapis).

### 4\. Responsywność, Dostępność i Bezpieczeństwo

- **Bezpieczeństwo**: Ochrona tras (Route Guarding) zaimplementowana po stronie klienta w React. Komponenty chronione sprawdzają `AuthContext` i przekierowują na `/logowanie` w przypadku braku sesji. API jest chronione przez RLS w Supabase.
- **Dostępność**: Bazowe standardy dostępności zostaną zapewnione przez semantyczne użycie komponentów `shadcn/ui`.
- **Responsywność**: Projekt jest traktowany jako "web-only". Na węższych ekranach przeglądarek (np. poniżej 1024px) kluczowe komponenty, takie jak tabela na `/moje-fiszki`, staną się **horyzontalnie przewijalne**.
  \</ui_architecture_planning_summary\>
  \</conversation_summary\>
