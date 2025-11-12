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
- ✅ Testy jednostkowe z coverage (threshold: 40%)
- ✅ Testy E2E z Playwright (tylko Chromium zgodnie z konfiguracją)
- ✅ Upload coverage do Codecov w formacie LCOV (tylko testy jednostkowe)
- ✅ Upload artefaktów testowych i raportów Playwright
- ✅ Automatyczny komentarz w PR ze statusem wszystkich jobów
- ✅ Używa najnowszych wersji akcji (sprawdzone: 2025-11-12)

### Coverage

- **Format**: LCOV (`coverage/lcov.info`)
- **Provider**: Vitest v8
- **Threshold**: 40% dla lines, functions, branches, statements
- **Tylko testy jednostkowe** - Playwright nie generuje coverage natywnie

### Uruchamiane testy E2E

Wszystkie testy z katalogu `tests/e2e/*.spec.ts`:
- `manual-flashcard-creation.spec.ts` - Tworzenie fiszek ręcznie
- `user-journey.spec.ts` - Zarządzanie fiszkami, edycja inline, usuwanie, dostępność (WCAG 2.1 AA)

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
