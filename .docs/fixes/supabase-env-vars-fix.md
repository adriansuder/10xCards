# Fix: Błąd hydratacji komponentów React - supabaseUrl is required

## Problem

Komponenty React (`RegisterForm`, `LoginForm`, `SettingsForm`) wyświetlały błąd podczas hydratacji:

```
Error hydrating /src/components/RegisterForm.tsx 
Error: supabaseUrl is required.
```

## Przyczyna

Zmienne środowiskowe Astro (`import.meta.env`) **nie są domyślnie dostępne** po stronie klienta w komponentach React. Kod próbował użyć:

```typescript
const supabaseUrl = import.meta.env.SUPABASE_URL;  // ❌ undefined w przeglądarce
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;  // ❌ undefined w przeglądarce
```

## Rozwiązanie

Użycie prefiksu `PUBLIC_` dla zmiennych, które mają być dostępne w przeglądarce, zgodnie z konwencją Astro:

### 1. Zmiana nazw zmiennych środowiskowych

**`.env.local`** (przed):
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=eyJhbGci...
```

**`.env.local`** (po):
```bash
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 2. Aktualizacja klienta Supabase

**`src/db/supabase.client.ts`** (przed):
```typescript
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**`src/db/supabase.client.ts`** (po):
```typescript
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Guard clause dla brakujących zmiennych
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### 3. Aktualizacja definicji typów

**`src/env.d.ts`**:
```typescript
interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
}
```

### 4. Utworzenie pliku przykładowego

**`.env.example`** (NOWY):
```bash
# Supabase Configuration
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Dlaczego to jest bezpieczne?

✅ **Supabase URL** i **Anon Key** są **zaprojektowane jako publiczne** i mogą być bezpiecznie eksponowane w przeglądarce.

❌ **Nigdy nie używaj prefiksu `PUBLIC_`** dla:
- Service Role Key
- Database passwords
- API secrets
- Private keys

## Jak działa `PUBLIC_` w Astro?

### Zmienne bez prefiksu `PUBLIC_`
- ✅ Dostępne tylko po stronie serwera (SSR, API routes)
- ❌ **NIE są dostępne** w komponentach React po stronie klienta
- Bezpieczne dla secrets

### Zmienne z prefiksem `PUBLIC_`
- ✅ Dostępne po stronie serwera
- ✅ **Dostępne po stronie klienta** (w przeglądarce)
- ⚠️ Są wbudowane w bundle JavaScript (widoczne w źródle)

## Weryfikacja

### 1. TypeScript Check
```bash
npx astro check
# ✅ Result: 0 errors, 0 warnings, 0 hints
```

### 2. Dev Server
```bash
npm run dev
# ✅ Server running on http://localhost:4321/
# ✅ No hydration errors
```

### 3. Browser Console
- ✅ Brak błędów `supabaseUrl is required`
- ✅ Komponenty React działają poprawnie
- ✅ Autentykacja działa

## Dodatkowe zmiany

### Updated README.md
- Dodano sekcję "Environment Variables"
- Zaktualizowano instrukcje setup
- Dodano informacje o Supabase local development

### Created `.env.example`
- Szablon dla nowych programistów
- Dokumentacja zmiennych środowiskowych
- Instrukcje dla Supabase CLI

## Lekcje na przyszłość

1. **Zawsze używaj `PUBLIC_` dla zmiennych potrzebnych w przeglądarce**
2. **Dodaj guard clauses** sprawdzające istnienie zmiennych środowiskowych
3. **Dokumentuj zmienne** w `.env.example`
4. **Testuj hydratację** komponentów React w przeglądarce

## Related Files

- `src/db/supabase.client.ts` - Klient Supabase
- `src/env.d.ts` - Definicje typów TypeScript
- `.env.local` - Zmienne środowiskowe (lokalne, nie commitowane)
- `.env.example` - Przykładowy plik konfiguracji (commitowany)
- `README.md` - Zaktualizowana dokumentacja

## References

- [Astro Environment Variables](https://docs.astro.build/en/guides/environment-variables/)
- [Supabase Client-side Auth](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

---

**Status:** ✅ FIXED  
**Data:** 2025-11-02  
**Impact:** Krytyczny (bloker dla autentykacji)
