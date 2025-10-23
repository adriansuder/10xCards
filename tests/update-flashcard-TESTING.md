# Testowanie Endpointu PATCH /api/flashcards/{flashcardId}

## 🚀 Szybki Start

### Wymagania
- Zainstalowane rozszerzenie Thunder Client w VS Code (lub Postman)
- Działająca instancja Supabase
- Skonfigurowane zmienne środowiskowe (.env)

### Kroki
1. **Uruchom serwer deweloperski**
   ```bash
   npx astro dev
   ```

2. **Zaimportuj kolekcję testową**
   - Otwórz Thunder Client w VS Code
   - Kliknij "Collections" → "Menu" → "Import"
   - Wybierz plik `thunder-client-collection.json`
   - Zaimportuj środowisko z pliku `thunder-client-env.json`

3. **Skonfiguruj zmienne środowiskowe**
   - W Thunder Client przejdź do "Env" → "10xCards - Local Development"
   - Ustaw wartości:
     - `baseUrl`: `http://localhost:4321` (domyślnie OK)
     - `token`: Twój JWT token (instrukcja poniżej)
     - `flashcardId`: UUID istniejącej fiszki (instrukcja poniżej)

4. **Uzyskanie JWT Token**
   - Zaloguj się do aplikacji przez przeglądarkę
   - Otwórz DevTools (F12) → Application/Storage → Cookies
   - Znajdź cookie o nazwie typu `sb-*-auth-token`
   - Skopiuj wartość `access_token` z obiektu JSON
   - Wklej do zmiennej `token` w Thunder Client

5. **Uzyskanie flashcardId**
   - Wykonaj request: `GET http://localhost:4321/api/flashcards`
   - Skopiuj `id` dowolnej fiszki z odpowiedzi
   - Wklej do zmiennej `flashcardId` w Thunder Client

6. **Uruchom testy**
   - Otwórz kolekcję "10xCards - Update Flashcard Tests"
   - Folder "✅ Happy Path Tests" - uruchom wszystkie testy
   - Folder "❌ Error Tests" - uruchom wszystkie testy
   - Sprawdź czy wszystkie testy przeszły pomyślnie (status codes się zgadzają)

---

## 📋 Szczegółowy Plan Testów

Pełna dokumentacja testów znajduje się w pliku: `update-flashcard-test-plan.md`

Zawiera:
- 12+ scenariuszy testowych (happy path + error handling)
- Oczekiwane odpowiedzi dla każdego scenariusza
- Dodatkowe testy bezpieczeństwa i integralności
- Checklist po zakończeniu testów

---

## ✅ Checklist Implementacji

### Krok 1: Typy i Walidacja ✅
- [x] Utworzono schemat `UpdateFlashcardSchema` w `validators.ts`
- [x] Schemat waliduje opcjonalne pola: `front`, `back`, `part_of_speech`
- [x] Maksymalna długość 249 znaków dla wszystkich pól
- [x] Walidacja niepustych stringów

### Krok 2: Logika Serwisu ✅
- [x] Dodano metodę `updateFlashcard` w `flashcard.service.ts`
- [x] Metoda wykonuje UPDATE z filtrowaniem po `id` i `user_id`
- [x] Zwraca `null` dla nieznalezionej fiszki (PGRST116)
- [x] Rzuca błąd dla innych problemów z bazą danych
- [x] Dodano import typu `UpdateFlashcardCommand`

### Krok 3: Endpoint API ✅
- [x] Dodano handler `PATCH` w `[flashcardId].ts`
- [x] Walidacja uwierzytelnienia (401)
- [x] Walidacja UUID flashcardId (400)
- [x] Walidacja JSON w body (400)
- [x] Sprawdzenie pustego body (400)
- [x] Walidacja Zod (422)
- [x] Obsługa nieznalezionej fiszki (404)
- [x] Obsługa błędów serwera (500)
- [x] Zastosowano guard clauses i early returns
- [x] Dodano dokumentację JSDoc

### Krok 4: Testowanie ⏳
- [ ] Wykonano testy manualne (Happy Path)
- [ ] Wykonano testy błędów (Error Cases)
- [ ] Sprawdzono bezpieczeństwo RLS
- [ ] Zweryfikowano integralność danych

---

## 🔧 Troubleshooting

### Problem: "Unauthorized" mimo poprawnego tokena
**Rozwiązanie:**
- Sprawdź czy token nie wygasł
- Sprawdź czy middleware Astro działa poprawnie
- Sprawdź konfigurację Supabase w `.env`

### Problem: "Flashcard not found" dla istniejącej fiszki
**Rozwiązanie:**
- Upewnij się, że token należy do właściciela fiszki
- Sprawdź polityki RLS w Supabase
- Sprawdź czy `user_id` w tabeli `flashcards` jest poprawny

### Problem: Serwer nie startuje
**Rozwiązanie:**
- Sprawdź czy port 4321 jest wolny
- Sprawdź logi w konsoli
- Upewnij się, że wszystkie zależności są zainstalowane (`npm install`)

---

## 📊 Przykładowe Odpowiedzi

### Sukces (200)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "user-uuid",
  "front": "Updated front text",
  "back": "Original back text",
  "part_of_speech": "noun",
  "leitner_box": 1,
  "review_due_at": "2025-10-23T10:00:00.000Z",
  "created_at": "2025-10-22T10:00:00.000Z",
  "updated_at": "2025-10-23T12:34:56.789Z"
}
```

### Błąd walidacji (422)
```json
{
  "message": "Invalid request data.",
  "errors": {
    "front": ["Front cannot be empty."]
  }
}
```

### Błąd autoryzacji (401)
```json
{
  "message": "Unauthorized"
}
```

### Nie znaleziono (404)
```json
{
  "message": "Flashcard not found or access denied."
}
```

---

## 🎯 Następne Kroki

Po pomyślnym przejściu wszystkich testów manualnych, rozważ:

1. **Automatyzacja testów** - napisz testy jednostkowe i integracyjne
2. **Dokumentacja API** - dodaj endpoint do OpenAPI/Swagger docs
3. **Monitoring** - dodaj metryki i logi dla tego endpointu
4. **Rate limiting** - rozważ ograniczenie liczby żądań
5. **Optimistic updates** - implementacja w frontendzie

---

## 📚 Powiązane Dokumenty

- `update-flashcard-implementation-plan.md` - Plan implementacji
- `update-flashcard-test-plan.md` - Szczegółowy plan testów
- `thunder-client-collection.json` - Kolekcja testów Thunder Client
- `thunder-client-env.json` - Zmienne środowiskowe

---

## ✨ Status Implementacji

**Status:** ✅ **GOTOWE DO TESTOWANIA**

Endpoint został w pełni zaimplementowany zgodnie z planem. Wszystkie kroki 1-3 zostały ukończone:
- ✅ Typy i walidacja
- ✅ Logika serwisu
- ✅ Endpoint API

Pozostaje krok 4 - manualne testowanie wszystkich scenariuszy.
