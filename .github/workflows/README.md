# GitHub Actions Workflows

## Pull Request CI (`pull-request.yml`)

Automatyczny workflow CI/CD dla pull requestów.

### Struktura

1. **Lint** - Lintowanie kodu (Astro check, TypeScript check)
2. **Równoległe testy** (wymagają zakończenia lint):
   - **Unit Tests** - Testy jednostkowe z coverage
   - **E2E Tests** - Testy end-to-end z coverage
3. **Status Comment** - Komentarz do PR ze statusem (uruchamia się tylko po zakończeniu wszystkich poprzednich)

### Wymagane Secrets/Variables

Aby workflow działał poprawnie, musisz skonfigurować następujące sekrety w repozytorium GitHub:

#### W Settings → Secrets and variables → Actions → Repository secrets:

- `PUBLIC_SUPABASE_ANON_KEY` - Klucz publiczny Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Klucz service role Supabase
- `E2E_PASSWORD` - Hasło użytkownika testowego

#### W Settings → Secrets and variables → Actions → Repository variables (opcjonalnie):

- `PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `E2E_USERNAME_ID` - ID użytkownika testowego
- `E2E_USERNAME` - Email użytkownika testowego

**Uwaga:** Możesz również dodać wszystkie wartości jako secrets zamiast używać zmiennych.

#### W Settings → Environments → integration:

Utwórz środowisko `integration` dla testów E2E (opcjonalnie możesz dodać protection rules).

### Funkcjonalności

- ✅ Automatyczne lintowanie kodu (Astro + TypeScript)
- ✅ Testy jednostkowe z coverage
- ✅ Testy E2E z Playwright (tylko Chromium zgodnie z konfiguracją)
- ✅ Upload coverage do Codecov
- ✅ Upload artefaktów testowych
- ✅ Automatyczny komentarz w PR ze statusem wszystkich jobów
- ✅ Używa najnowszych wersji akcji (sprawdzone: 2025-11-12)

### Wykorzystane akcje

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v5`
- `codecov/codecov-action@v5`
- `actions/github-script@v8`

### Triggery

Workflow uruchamia się przy:
- Otwarciu pull requesta do branch `main`
- Każdym push do PR
