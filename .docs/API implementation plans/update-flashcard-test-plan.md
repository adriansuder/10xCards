# Plan Testów Endpointu PATCH /api/flashcards/{flashcardId}

## Przygotowanie do testów

### 1. Uruchomienie serwera deweloperskiego
```bash
npx astro dev
```

### 2. Uzyskanie tokenu JWT
- Zaloguj się do aplikacji przez przeglądarkę
- Skopiuj token z cookies/localStorage (nazwa: `sb-access-token` lub podobna)
- Token będzie używany w nagłówku `Authorization: Bearer {token}`

### 3. Uzyskanie ID istniejącej fiszki
Wykonaj request GET do `/api/flashcards` aby uzyskać listę fiszek i ich ID.

---

## Scenariusze Testowe

### ✅ Test 1: Happy Path - Aktualizacja pojedynczego pola (front)

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": "Updated front text"
}
```

**Oczekiwany rezultat:**
- Status: `200 OK`
- Body: Pełny obiekt fiszki z zaktualizowanym polem `front`
- Pozostałe pola (`back`, `part_of_speech`) niezmienione

---

### ✅ Test 2: Happy Path - Aktualizacja wielu pól

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": "New front",
  "back": "New back",
  "part_of_speech": "verb"
}
```

**Oczekiwany rezultat:**
- Status: `200 OK`
- Body: Pełny obiekt fiszki z wszystkimi zaktualizowanymi polami

---

### ✅ Test 3: Happy Path - Ustawienie part_of_speech na null

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "part_of_speech": null
}
```

**Oczekiwany rezultat:**
- Status: `200 OK`
- Body: Obiekt fiszki z `part_of_speech: null`

---

### ❌ Test 4: Błąd 401 - Brak autoryzacji

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Content-Type: application/json

{
  "front": "Updated text"
}
```
*(bez nagłówka Authorization)*

**Oczekiwany rezultat:**
- Status: `401 Unauthorized`
- Body: `{ "message": "Unauthorized" }`

---

### ❌ Test 5: Błąd 400 - Nieprawidłowy UUID

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/invalid-uuid
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": "Updated text"
}
```

**Oczekiwany rezultat:**
- Status: `400 Bad Request`
- Body: 
```json
{
  "message": "Invalid flashcard ID.",
  "errors": {
    "flashcardId": ["Flashcard ID must be a valid UUID."]
  }
}
```

---

### ❌ Test 6: Błąd 400 - Puste body

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{}
```

**Oczekiwany rezultat:**
- Status: `400 Bad Request`
- Body: `{ "message": "Request body cannot be empty. Provide at least one field to update." }`

---

### ❌ Test 7: Błąd 400 - Nieprawidłowy JSON

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{invalid json}
```

**Oczekiwany rezultat:**
- Status: `400 Bad Request`
- Body: `{ "message": "Invalid JSON in request body." }`

---

### ❌ Test 8: Błąd 404 - Nieistniejąca fiszka

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/00000000-0000-0000-0000-000000000000
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": "Updated text"
}
```
*(użyj prawidłowego UUID, który nie istnieje w bazie)*

**Oczekiwany rezultat:**
- Status: `404 Not Found`
- Body: `{ "message": "Flashcard not found or access denied." }`

---

### ❌ Test 9: Błąd 404 - Fiszka należy do innego użytkownika

**Przygotowanie:**
1. Utwórz fiszkę jako użytkownik A
2. Zaloguj się jako użytkownik B
3. Spróbuj zaktualizować fiszkę użytkownika A

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId_of_userA}
Authorization: Bearer {userB_jwt_token}
Content-Type: application/json

{
  "front": "Trying to update someone else's card"
}
```

**Oczekiwany rezultat:**
- Status: `404 Not Found`
- Body: `{ "message": "Flashcard not found or access denied." }`

---

### ❌ Test 10: Błąd 422 - Puste pole front

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": ""
}
```

**Oczekiwany rezultat:**
- Status: `422 Unprocessable Entity`
- Body:
```json
{
  "message": "Invalid request data.",
  "errors": {
    "front": ["Front cannot be empty."]
  }
}
```

---

### ❌ Test 11: Błąd 422 - Zbyt długi tekst (> 249 znaków)

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "front": "a".repeat(250)
}
```

**Oczekiwany rezultat:**
- Status: `422 Unprocessable Entity`
- Body:
```json
{
  "message": "Invalid request data.",
  "errors": {
    "front": ["Front cannot exceed 249 characters."]
  }
}
```

---

### ❌ Test 12: Błąd 422 - Zbyt długi part_of_speech

**Request:**
```http
PATCH http://localhost:4321/api/flashcards/{flashcardId}
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "part_of_speech": "a".repeat(250)
}
```

**Oczekiwany rezultat:**
- Status: `422 Unprocessable Entity`
- Body:
```json
{
  "message": "Invalid request data.",
  "errors": {
    "part_of_speech": ["Part of speech cannot exceed 249 characters."]
  }
}
```

---

## Dodatkowe Testy

### 🔒 Test bezpieczeństwa RLS (Row Level Security)

**Cel:** Upewnić się, że polityki RLS w Supabase działają poprawnie

**Scenariusz:**
1. Użytkownik A tworzy fiszkę
2. Użytkownik B próbuje ją zaktualizować (nawet mając prawidłowe ID)
3. System powinien zwrócić 404 (nie 403, aby nie ujawniać istnienia zasobu)

---

### 🔍 Test integralności danych

**Cel:** Upewnić się, że aktualizacja nie wpływa na inne pola

**Scenariusz:**
1. Stwórz fiszkę z wszystkimi polami wypełnionymi
2. Zaktualizuj tylko `front`
3. Sprawdź, czy `back`, `part_of_speech`, `leitner_box`, `review_due_at` pozostały niezmienione

---

## Narzędzia do testowania

### Thunder Client (VS Code Extension)
1. Zainstaluj rozszerzenie Thunder Client
2. Utwórz nową kolekcję "Flashcards API"
3. Dodaj wszystkie powyższe testy

### Postman
1. Zaimportuj testy jako kolekcję
2. Użyj zmiennych środowiskowych dla `baseUrl` i `token`

### curl (Command Line)
```bash
curl -X PATCH http://localhost:4321/api/flashcards/{flashcardId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"front": "Updated text"}'
```

---

## Checklist po testach

- [ ] Wszystkie testy happy path przeszły pomyślnie
- [ ] Wszystkie scenariusze błędów zwracają właściwe kody statusu
- [ ] Komunikaty błędów są jasne i pomocne
- [ ] RLS działa poprawnie (użytkownicy nie mogą modyfikować cudzych fiszek)
- [ ] Walidacja działa dla wszystkich pól
- [ ] Częściowa aktualizacja działa (można zaktualizować tylko wybrane pola)
- [ ] Pole `updated_at` jest automatycznie aktualizowane w bazie danych
- [ ] Nie ma błędów w logach serwera

---

## Uwagi

- Testy powinny być wykonane na czystej bazie danych testowej
- Po każdym teście sprawdź logi serwera w konsoli
- Możesz użyć Supabase Dashboard do weryfikacji zmian w bazie danych
- Rozważ automatyzację tych testów używając narzędzi jak Vitest lub Playwright
