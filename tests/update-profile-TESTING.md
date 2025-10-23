# Testowanie Endpointu: PATCH /api/profile

## Przegląd
Ten dokument opisuje, jak przetestować endpoint `PATCH /api/profile`, który umożliwia aktualizację domyślnego poziomu językowego AI użytkownika.

## Wymagania wstępne

### 1. Uruchom serwer deweloperski
```powershell
npm run dev
```

### 2. Uzyskaj token uwierzytelniający
- Zaloguj się do aplikacji poprzez interfejs użytkownika
- Otwórz DevTools (F12) → Zakładka Application/Storage → Local Storage
- Skopiuj wartość tokenu JWT (klucz: `supabase.auth.token` lub podobny)

### 3. Konfiguracja Thunder Client
- Otwórz plik `tests/thunder-client-env.json`
- Ustaw zmienne środowiskowe:
  ```json
  {
    "baseUrl": "http://localhost:4321",
    "token": "TWÓJ_JWT_TOKEN"
  }
  ```

## Testy do wykonania

### ✅ Testy Scenariuszy Pozytywnych (Happy Path)

#### Test 1: Aktualizacja default_ai_level do 'c1'
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "default_ai_level": "c1"
}
```

**Oczekiwana odpowiedź:** `200 OK`
```json
{
  "id": "uuid",
  "default_ai_level": "c1",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Test 2: Aktualizacja default_ai_level do 'b1'
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "default_ai_level": "b1"
}
```

**Oczekiwana odpowiedź:** `200 OK`
```json
{
  "id": "uuid",
  "default_ai_level": "b1",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### Test 3: Sprawdzenie wszystkich poziomów językowych
Przetestuj każdy z poziomów: `a1`, `a2`, `b1`, `b2`, `c1`, `c2`

### ❌ Testy Scenariuszy Błędów

#### Test 4: Brak tokenu autoryzacyjnego
**Żądanie:**
```http
PATCH /api/profile
Content-Type: application/json

{
  "default_ai_level": "c1"
}
```

**Oczekiwana odpowiedź:** `401 Unauthorized`
```json
{
  "message": "Unauthorized"
}
```

#### Test 5: Nieprawidłowy format JSON
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{invalid json}
```

**Oczekiwana odpowiedź:** `400 Bad Request`
```json
{
  "message": "Invalid JSON format in request body."
}
```

#### Test 6: Brak wymaganego pola default_ai_level
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{}
```

**Oczekiwana odpowiedź:** `422 Unprocessable Entity`
```json
{
  "message": "Validation failed.",
  "errors": {
    "default_ai_level": ["default_ai_level is required."]
  }
}
```

#### Test 7: Nieprawidłowa wartość poziomu językowego
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "default_ai_level": "invalid_level"
}
```

**Oczekiwana odpowiedź:** `422 Unprocessable Entity`
```json
{
  "message": "Validation failed.",
  "errors": {
    "default_ai_level": ["Invalid enum value..."]
  }
}
```

#### Test 8: Nieprawidłowy typ danych
**Żądanie:**
```http
PATCH /api/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "default_ai_level": 123
}
```

**Oczekiwana odpowiedź:** `422 Unprocessable Entity`

## Testowanie za pomocą Thunder Client

1. Otwórz VS Code
2. Zainstaluj rozszerzenie "Thunder Client" (jeśli jeszcze nie masz)
3. Zaimportuj kolekcję testów:
   - Otwórz Thunder Client
   - Kliknij "Collections"
   - Kliknij "Menu" (⋮) → "Import"
   - Wybierz plik `tests/profile-update-tests.json`
4. Ustaw zmienne środowiskowe w `tests/thunder-client-env.json`
5. Uruchom testy jeden po drugim lub całą kolekcję

## Testowanie za pomocą cURL (PowerShell)

### Happy Path - Aktualizacja do c1
```powershell
$token = "TWÓJ_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
$body = @{
    default_ai_level = "c1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4321/api/profile" -Method PATCH -Headers $headers -Body $body
```

### Error Test - Brak tokenu
```powershell
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    default_ai_level = "c1"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4321/api/profile" -Method PATCH -Headers $headers -Body $body
```

## Weryfikacja w bazie danych

Po pomyślnej aktualizacji, możesz zweryfikować zmiany w Supabase:

1. Otwórz Supabase Dashboard
2. Przejdź do Table Editor → `profiles`
3. Znajdź swój profil po `id` (odpowiada to `user.id` z tokenu JWT)
4. Sprawdź czy wartość `default_ai_level` została zaktualizowana
5. Sprawdź czy `updated_at` został zaktualizowany do aktualnej daty/czasu

## Checklist testowy

- [ ] Test 1: Aktualizacja do 'c1' - 200 OK
- [ ] Test 2: Aktualizacja do 'b1' - 200 OK
- [ ] Test 3: Aktualizacja do 'a1' - 200 OK
- [ ] Test 3: Aktualizacja do 'a2' - 200 OK
- [ ] Test 3: Aktualizacja do 'b2' - 200 OK
- [ ] Test 3: Aktualizacja do 'c2' - 200 OK
- [ ] Test 4: Brak tokenu - 401 Unauthorized
- [ ] Test 5: Nieprawidłowy JSON - 400 Bad Request
- [ ] Test 6: Brak wymaganego pola - 422 Unprocessable Entity
- [ ] Test 7: Nieprawidłowa wartość - 422 Unprocessable Entity
- [ ] Test 8: Nieprawidłowy typ danych - 422 Unprocessable Entity
- [ ] Weryfikacja w bazie danych - wartość została zapisana
- [ ] Weryfikacja w bazie danych - timestamp updated_at został zaktualizowany

## Rozwiązywanie problemów

### Problem: 401 Unauthorized mimo prawidłowego tokenu
- Sprawdź czy token nie wygasł
- Zweryfikuj middleware w `src/middleware/index.ts`
- Sprawdź czy `locals.user` jest poprawnie ustawiony

### Problem: 500 Internal Server Error
- Sprawdź logi serwera w terminalu
- Zweryfikuj połączenie z Supabase
- Sprawdź polityki RLS w Supabase dla tabeli `profiles`

### Problem: 404 Not Found
- Upewnij się, że profil użytkownika istnieje w tabeli `profiles`
- Sprawdź czy `user.id` z tokenu JWT odpowiada rekordowi w bazie danych

## Notatki
- Endpoint korzysta z Row Level Security (RLS) w Supabase
- Tylko uwierzytelniony użytkownik może zaktualizować swój własny profil
- Aktualizacja jest atomowa - albo wszystko się uda, albo nic nie zostanie zmienione
