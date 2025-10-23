# Testing Guide: Update Card Review Endpoint

## Endpoint Details
- **URL**: `POST /api/review/update`
- **Authentication**: Required (JWT token)
- **Content-Type**: `application/json`

## Test Scenarios

### 1. ✅ Success Case (204 No Content)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{
  "flashcardId": "550e8400-e29b-41d4-a716-446655440000",
  "knewIt": true
}
```

**Expected Response:**
- Status: `204 No Content`
- Body: Empty

**Verification:**
- Check that the flashcard's `leitner_box` was incremented
- Check that `review_due_at` was updated according to Leitner logic

---

### 2. ❌ Validation Error - Invalid UUID (400 Bad Request)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{
  "flashcardId": "invalid-uuid",
  "knewIt": true
}
```

**Expected Response:**
- Status: `400 Bad Request`
- Body:
```json
{
  "message": "Validation failed",
  "errors": {
    "fieldErrors": {
      "flashcardId": ["Flashcard ID must be a valid UUID."]
    }
  }
}
```

---

### 3. ❌ Validation Error - Missing knewIt (400 Bad Request)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{
  "flashcardId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Expected Response:**
- Status: `400 Bad Request`
- Body:
```json
{
  "message": "Validation failed",
  "errors": {
    "fieldErrors": {
      "knewIt": ["knewIt is required."]
    }
  }
}
```

---

### 4. ❌ Validation Error - Invalid JSON (400 Bad Request)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{invalid json}
```

**Expected Response:**
- Status: `400 Bad Request`
- Body:
```json
{
  "message": "Invalid JSON in request body"
}
```

---

### 5. ❌ Unauthorized - No Token (401 Unauthorized)
**Request:**
```json
POST /api/review/update
Content-Type: application/json

{
  "flashcardId": "550e8400-e29b-41d4-a716-446655440000",
  "knewIt": true
}
```

**Expected Response:**
- Status: `401 Unauthorized`
- Body:
```json
{
  "message": "Unauthorized"
}
```

---

### 6. ❌ Flashcard Not Found (404 Not Found)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{
  "flashcardId": "00000000-0000-0000-0000-000000000000",
  "knewIt": true
}
```

**Expected Response:**
- Status: `404 Not Found`
- Body:
```json
{
  "message": "Flashcard not found or does not belong to the user"
}
```

---

### 7. ✅ Success - User Didn't Know (204 No Content)
**Request:**
```json
POST /api/review/update
Authorization: Bearer <valid_jwt_token>
Content-Type: application/json

{
  "flashcardId": "550e8400-e29b-41d4-a716-446655440000",
  "knewIt": false
}
```

**Expected Response:**
- Status: `204 No Content`
- Body: Empty

**Verification:**
- Check that the flashcard's `leitner_box` was reset to 1
- Check that `review_due_at` was set to `now()`

---

## Leitner Box Logic Verification

When `knewIt: true`, the flashcard should advance according to:
- Box 1 → Box 2 (review in 1 day)
- Box 2 → Box 3 (review in 3 days)
- Box 3 → Box 4 (review in 7 days)
- Box 4 → Box 5 (review in 14 days)
- Box 5+ → Box N+1 (review in 30 days)

When `knewIt: false`, the flashcard should:
- Any Box → Box 1 (review immediately)

---

## cURL Examples

### Success Case:
```bash
curl -X POST http://localhost:4321/api/review/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "550e8400-e29b-41d4-a716-446655440000",
    "knewIt": true
  }'
```

### Invalid UUID Case:
```bash
curl -X POST http://localhost:4321/api/review/update \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "invalid-uuid",
    "knewIt": true
  }'
```

### Unauthorized Case:
```bash
curl -X POST http://localhost:4321/api/review/update \
  -H "Content-Type: application/json" \
  -d '{
    "flashcardId": "550e8400-e29b-41d4-a716-446655440000",
    "knewIt": true
  }'
```
