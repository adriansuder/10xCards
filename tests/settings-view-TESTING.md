# Plan testowania widoku Ustawienia

## Status implementacji: ✅ GOTOWE

Data: 2025-11-02

## Komponenty zaimplementowane

- ✅ Strona `src/pages/ustawienia.astro`
- ✅ Komponent `src/components/SettingsForm.tsx`
- ✅ Link w nawigacji (`MainLayout.astro`)
- ✅ Integracja z API `/api/profile` (GET i PATCH)
- ✅ Obsługa błędów i komunikatów toast
- ✅ Responsywny design

## Testy manualne do wykonania

### 1. Test podstawowego przepływu

**Kroki:**
1. Zaloguj się do aplikacji
2. Kliknij "Ustawienia" w nawigacji
3. Zweryfikuj, że strona się ładuje
4. Sprawdź, czy wyświetlany jest aktualny poziom trudności AI

**Oczekiwany rezultat:**
- Strona ładuje się bez błędów
- Formularz wyświetla aktualną wartość `default_ai_level`
- UI jest czytelny i intuicyjny

**Status:** ⏳ DO WYKONANIA

---

### 2. Test zmiany poziomu trudności

**Kroki:**
1. Na stronie ustawień kliknij na pole wyboru poziomu
2. Wybierz inny poziom z listy (np. C1)
3. Obserwuj UI podczas zapisu

**Oczekiwany rezultat:**
- Wartość zmienia się natychmiast
- Pojawia się spinner ładowania
- Po zapisie wyświetla się toast sukcesu: "Zapisano zmiany"
- Wartość pozostaje zmieniona po odświeżeniu strony

**Status:** ⏳ DO WYKONANIA

---

### 3. Test walidacji i dostępnych opcji

**Kroki:**
1. Kliknij na pole wyboru poziomu
2. Sprawdź listę dostępnych opcji

**Oczekiwany rezultat:**
- Lista zawiera wszystkie poziomy: A1, A2, B1, B2, C1, C2
- Każdy poziom ma czytelny opis (np. "B1 - Średniozaawansowany")
- Nie można wprowadzić nieprawidłowej wartości

**Status:** ⏳ DO WYKONANIA

---

### 4. Test obsługi błędów sieci

**Kroki:**
1. Otwórz DevTools → Network → Throttling
2. Ustaw "Offline"
3. Spróbuj zmienić poziom trudności

**Oczekiwany rezultat:**
- Wartość wraca do poprzedniej
- Wyświetla się toast błędu: "Nie udało się zapisać zmian. Sprawdź połączenie..."
- Użytkownik może ponownie spróbować

**Status:** ⏳ DO WYKONANIA

---

### 5. Test autoryzacji

**Kroki:**
1. Wyloguj się z aplikacji
2. W pasku adresu wpisz `/ustawienia`
3. Naciśnij Enter

**Oczekiwany rezultat:**
- Automatyczne przekierowanie na `/logowanie`
- Brak dostępu do strony bez zalogowania

**Status:** ⏳ DO WYKONANIA

---

### 6. Test dostępności (a11y)

**Kroki:**
1. Na stronie ustawień użyj tylko klawiatury:
   - Tab do nawigacji między elementami
   - Space/Enter do otwarcia select
   - Strzałki do wyboru opcji
2. Włącz czytnik ekranu (np. NVDA, JAWS)
3. Sprawdź, czy wszystkie elementy są ogłaszane

**Oczekiwany rezultat:**
- Można nawigować tylko klawiaturą
- Focus jest widoczny
- Czytnik ekranu prawidłowo ogłasza etykiety, wartości i stany

**Status:** ⏳ DO WYKONANIA

---

### 7. Test responsywności

**Kroki:**
1. Otwórz stronę ustawień na różnych rozdzielczościach:
   - Mobile (320px - 480px)
   - Tablet (768px - 1024px)
   - Desktop (1280px+)
2. Sprawdź, czy wszystkie elementy są czytelne i dostępne

**Oczekiwany rezultat:**
- Formularz jest czytelny na wszystkich urządzeniach
- Select nie wychodzi poza ekran
- Tekst jest odpowiednio skalowany (text-2xl → text-3xl na desktop)
- Padding dostosowuje się do rozmiaru ekranu

**Status:** ⏳ DO WYKONANIA

---

### 8. Test kontrastu kolorów

**Kroki:**
1. Otwórz DevTools → Lighthouse
2. Uruchom audit Accessibility
3. Sprawdź wyniki

**Oczekiwany rezultat:**
- Wynik accessibility ≥ 90%
- Brak błędów kontrastu kolorów
- Wszystkie elementy interaktywne mają odpowiedni kontrast

**Status:** ⏳ DO WYKONANIA

---

## Testy integracyjne API

### Test 1: GET /api/profile

**Request:**
```bash
curl -X GET http://localhost:4321/api/profile \
  -H "Cookie: sb-access-token=...; sb-refresh-token=..."
```

**Oczekiwana odpowiedź (200):**
```json
{
  "id": "uuid",
  "default_ai_level": "b2",
  "created_at": "2025-11-02T..."
}
```

**Status:** ⏳ DO WYKONANIA

---

### Test 2: PATCH /api/profile - Sukces

**Request:**
```bash
curl -X PATCH http://localhost:4321/api/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=...; sb-refresh-token=..." \
  -d '{"default_ai_level": "c1"}'
```

**Oczekiwana odpowiedź (200):**
```json
{
  "id": "uuid",
  "default_ai_level": "c1",
  "updated_at": "2025-11-02T..."
}
```

**Status:** ⏳ DO WYKONANIA

---

### Test 3: PATCH /api/profile - Nieprawidłowa wartość (422)

**Request:**
```bash
curl -X PATCH http://localhost:4321/api/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=...; sb-refresh-token=..." \
  -d '{"default_ai_level": "invalid"}'
```

**Oczekiwana odpowiedź (422):**
```json
{
  "message": "Validation failed.",
  "errors": {
    "default_ai_level": ["Invalid enum value..."]
  }
}
```

**Status:** ⏳ DO WYKONANIA

---

### Test 4: PATCH /api/profile - Brak autoryzacji (401)

**Request:**
```bash
curl -X PATCH http://localhost:4321/api/profile \
  -H "Content-Type: application/json" \
  -d '{"default_ai_level": "c1"}'
```

**Oczekiwana odpowiedź (401):**
```json
{
  "message": "Unauthorized"
}
```

**Status:** ⏳ DO WYKONANIA

---

## Checklist przed merge

- [ ] Wszystkie testy manualne wykonane i przeszły pomyślnie
- [ ] Testy API zweryfikowane
- [ ] Brak błędów kompilacji (`npx astro check`)
- [ ] Kod zgodny z linterem
- [ ] Responsywność przetestowana na różnych urządzeniach
- [ ] Dostępność (a11y) zweryfikowana
- [ ] Komunikaty błędów są przyjazne użytkownikowi
- [ ] Dokumentacja zaktualizowana (jeśli potrzebne)

## Notatki

### Zaimplementowane funkcjonalności:
- Automatyczny zapis po zmianie wartości (bez przycisku "Zapisz")
- Optymistyczna aktualizacja UI z rollback przy błędzie
- Spinner ładowania podczas zapisu
- Toast notifications dla sukcesu i błędów
- Pełna obsługa błędów API (401, 404, 422, 500)
- Responsywny design z Tailwind CSS
- Pełna dostępność (ARIA labels, keyboard navigation)

### Potencjalne przyszłe usprawnienia:
- [ ] Integracja default_ai_level z komponentem AiTab na stronie głównej
- [ ] Dodanie więcej ustawień profilu (np. język interfejsu)
- [ ] Implementacja tłumaczeń komunikatów
- [ ] Dodanie animacji transitions między zmianami
