## Architektura Modułu Autentykacji (Astro + Supabase)

### 1. Frontend (Astro + React)

* **Layouty (Astro):**
    * `src/pages/logowanie.astro`, `src/pages/rejestracja.astro`: Dla użytkowników anonimowych (strony `/logowanie`, `/rejestracja`).
    * `src/layouts/MainLayout.astro`: Dla zalogowanych użytkowników (strony chronione moje-fiszki.astro, ucz-sie.astro, ustawienia.astro, index.astro).
* **Strony (Astro):**
    * `src/pages/rejestracja.astro`: Renderuje `GuestLayout` + `<RegisterForm client:load />`. Przekierowuje zalogowanych na `/`.
    * `src/pages/logowanie.astro`: Renderuje `GuestLayout` + `<LoginForm client:load />`. Przekierowuje zalogowanych na `/`.
* **Komponenty (React + Shadcn/ui):**
    * `src/components/RegisterForm.tsx`: Interaktywny formularz React.
        * **Walidacja:** `zod` + `react-hook-form` (email, min. 8 znaków hasła).
        * **Logika:** Wywołuje `supabase.auth.signUp()`. Po sukcesie (AC-4) przekierowuje na `/` (`window.location.href`). Obsługuje błędy (AC-5) i wyświetla je w komponencie `Alert`.
    * `src/components/LoginForm.tsx`: Interaktywny formularz React.
        * **Logika:** Wywołuje `supabase.auth.signInWithPassword()`. Po sukcesie (AC-2) przekierowuje na `/`. Obsługuje błędy (AC-3) "Nieprawidłowy e-mail lub hasło".

### 2. Backend (Astro SSR + Supabase BaaS)
* **Klient Przeglądarki:** `src/db/supabase.client.ts` używa `createBrowserClient`. Będzie on automatycznie zarządzał sesją w `cookies` i `localStorage`.
* **Middleware (`src/middleware/index.ts`):**
    * Centralny punkt logiki serwera.
    * Przy każdym żądaniu odczytuje `Astro.cookies` za pomocą `createSupabaseServerClient`.
    * Pobiera sesję i zapisuje ją w `Astro.locals.session`.
    * Implementuje ochronę tras (przekierowuje niezalogowanych z `/app/*` do `/logowanie` oraz zalogowanych z `/logowanie` do `/`).
    * Automatycznie odświeża tokeny i zarządza cookies odpowiedzi.