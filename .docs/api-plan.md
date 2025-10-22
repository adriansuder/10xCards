# REST API Plan

## 1. Resources

- **Flashcards**: Represents the user's flashcards. Corresponds to the `public.flashcards` table.
- **Profiles**: Represents user-specific settings. Corresponds to the `public.profiles` table.
- **AI**: A procedural resource for AI-related tasks, not directly mapped to a single table.
- **Review**: A procedural resource for the spaced repetition learning session.

## 2. Endpoints

### 2.1. Flashcards

#### List Flashcards

- **Method**: `GET`
- **Path**: `/api/flashcards`
- **Description**: Retrieves a paginated list of the authenticated user's flashcards.
- **Query Parameters**:
  - `page` (number, optional, default: 1): The page number for pagination.
  - `pageSize` (number, optional, default: 20): The number of items per page.
  - `sortBy` (string, optional, default: 'created_at'): Field to sort by (e.g., 'created_at', 'front').
  - `order` (string, optional, default: 'desc'): Sort order ('asc' or 'desc').
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "part_of_speech": "string | null",
        "leitner_box": "number",
        "review_due_at": "string (ISO 8601)",
        "created_at": "string (ISO 8601)"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 150,
      "totalPages": 8
    }
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `401 Unauthorized`

#### Create Flashcard (Manual)

- **Method**: `POST`
- **Path**: `/api/flashcards`
- **Description**: Creates a single new flashcard for the authenticated user.
- **Request Payload**:
  ```json
  {
    "front": "Hello",
    "back": "Cześć",
    "part_of_speech": "interjection"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "uuid",
    "front": "Hello",
    "back": "Cześć",
    "part_of_speech": "interjection",
    "leitner_box": 1,
    "review_due_at": "string (ISO 8601)",
    "created_at": "string (ISO 8601)"
  }
  ```
- **Success Codes**: `201 Created`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`

#### Get Flashcard

- **Method**: `GET`
- **Path**: `/api/flashcards/{flashcardId}`
- **Description**: Retrieves a single flashcard by its ID.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "id": "uuid",
    "front": "string",
    "back": "string",
    "part_of_speech": "string | null",
    "leitner_box": "number",
    "review_due_at": "string (ISO 8601)",
    "created_at": "string (ISO 8601)"
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `404 Not Found`

#### Update Flashcard

- **Method**: `PATCH`
- **Path**: `/api/flashcards/{flashcardId}`
- **Description**: Updates one or more fields of a specific flashcard.
- **Request Payload**:
  ```json
  {
    "front": "New front text",
    "back": "New back text"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "uuid",
    "front": "New front text",
    "back": "New back text",
    "part_of_speech": "string | null",
    "leitner_box": "number",
    "review_due_at": "string (ISO 8601)",
    "updated_at": "string (ISO 8601)"
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`

#### Delete Flashcard

- **Method**: `DELETE`
- **Path**: `/api/flashcards/{flashcardId}`
- **Description**: Deletes a specific flashcard.
- **Request Payload**: N/A
- **Response Payload**: N/A
- **Success Codes**: `204 No Content`
- **Error Codes**: `401 Unauthorized`, `404 Not Found`

### 2.2. AI-Assisted Generation

#### Generate Flashcard Suggestions

- **Method**: `POST`
- **Path**: `/api/ai/generate-suggestions`
- **Description**: Sends user-provided text to an AI service to get flashcard suggestions. This is a non-idempotent action that does not persist data to the database.
- **Request Payload**:
  ```json
  {
    "text": "The quick brown fox jumps over the lazy dog.",
    "level": "b2"
  }
  ```
- **Response Payload**:
  ```json
  {
    "suggestions": [
      {
        "id": "temporary-client-side-uuid-1",
        "front": "quick",
        "back": "szybki (przymiotnik)"
      },
      {
        "id": "temporary-client-side-uuid-2",
        "front": "lazy",
        "back": "leniwy (przymiotnik)"
      }
    ]
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`, `502 Bad Gateway` (if AI service fails)

#### Import AI-Generated Flashcards

- **Method**: `POST`
- **Path**: `/api/ai/import-flashcards`
- **Description**: Performs a bulk insert of user-approved flashcard suggestions into the database and logs the generation metrics.
- **Request Payload**:
  ```json
  {
    "flashcards": [
      { "front": "quick", "back": "szybki", "part_of_speech": "przymiotnik" },
      { "front": "lazy", "back": "leniwy", "part_of_speech": "przymiotnik" }
    ],
    "metrics": {
      "generatedCount": 10,
      "importedCount": 2
    }
  }
  ```
- **Response Payload**:
  ```json
  {
    "message": "Successfully imported 2 flashcards.",
    "importedCount": 2
  }
  ```
- **Success Codes**: `201 Created`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `422 Unprocessable Entity`

### 2.3. Review Session

#### Get Review Session Cards

- **Method**: `GET`
- **Path**: `/api/review/session`
- **Description**: Retrieves all flashcards that are due for review for the authenticated user.
- **Query Parameters**:
  - `limit` (number, optional, default: 50): Maximum number of cards to fetch for the session.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "front": "string",
        "back": "string",
        "part_of_speech": "string | null"
      }
    ]
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `401 Unauthorized`

#### Update Card Review Status

- **Method**: `POST`
- **Path**: `/api/review/update`
- **Description**: Updates a flashcard's Leitner box and next review date based on user's answer. This endpoint calls the `update_flashcard_review` database function.
- **Request Payload**:
  ```json
  {
    "flashcardId": "uuid",
    "knewIt": true
  }
  ```
- **Response Payload**: N/A
- **Success Codes**: `204 No Content`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`

### 2.4. User Profile

#### Get User Profile

- **Method**: `GET`
- **Path**: `/api/profile`
- **Description**: Retrieves the profile and settings for the authenticated user.
- **Request Payload**: N/A
- **Response Payload**:
  ```json
  {
    "id": "uuid",
    "default_ai_level": "b2",
    "created_at": "string (ISO 8601)"
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `401 Unauthorized`, `404 Not Found`

#### Update User Profile

- **Method**: `PATCH`
- **Path**: `/api/profile`
- **Description**: Updates the settings for the authenticated user.
- **Request Payload**:
  ```json
  {
    "default_ai_level": "c1"
  }
  ```
- **Response Payload**:
  ```json
  {
    "id": "uuid",
    "default_ai_level": "c1",
    "updated_at": "string (ISO 8601)"
  }
  ```
- **Success Codes**: `200 OK`
- **Error Codes**: `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `422 Unprocessable Entity`

## 3. Authentication and Authorization

- **Mechanism**: Authentication will be handled using JSON Web Tokens (JWT) provided by Supabase Auth.
- **Implementation**:
  1. The client application (Astro/React) will use the `supabase-js` library to handle user sign-up and sign-in.
  2. Upon successful authentication, Supabase provides a JWT.
  3. The client must include this JWT in the `Authorization` header for every request to the custom API endpoints (e.g., `Authorization: Bearer <supabase-jwt>`).
  4. The API backend (e.g., Astro server endpoints, Vercel/Netlify functions) will use a Supabase helper library to validate the incoming JWT and extract the user's ID (`auth.uid()`).
  5. All data access is governed by PostgreSQL Row Level Security (RLS) policies defined in the database schema, ensuring users can only access their own data. The API relies on these RLS policies for data authorization.

## 4. Validation and Business Logic

### Validation

- **`POST /api/flashcards`** & **`PATCH /api/flashcards/{id}`**:
  - `front`: Required, string, length > 0 and < 250.
  - `back`: Required, string, length > 0 and < 250.
- **`POST /api/ai/generate-suggestions`**:
  - `text`: Required, string, non-empty, max 2000 characters (as per PRD).
  - `level`: Required, string, must be one of 'b1', 'b2', 'c1'.
- **`POST /api/ai/import-flashcards`**:
  - `flashcards`: Required, array of objects, each with valid `front` and `back`.
  - `metrics`: Required, object with `generatedCount` and `importedCount` as non-negative integers.
- **`POST /api/review/update`**:
  - `flashcardId`: Required, valid UUID.
  - `knewIt`: Required, boolean.
- **`PATCH /api/profile`**:
  - `default_ai_level`: Required, string, must be one of 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'.

### Business Logic Implementation

- **Spaced Repetition**: The core logic is encapsulated in the `public.update_flashcard_review` PostgreSQL function. The `POST /api/review/update` endpoint acts as a secure proxy, calling this function with the provided `flashcardId` and `knewIt` status. This keeps the business logic centralized in the database.
- **AI Generation Metrics**: The `POST /api/ai/import-flashcards` endpoint is responsible for atomicity. It should wrap the bulk insert of flashcards and the insert into `public.ai_generation_logs` within a single transaction to ensure data consistency.
- **New User Profile**: Profile creation is handled automatically by the `on_auth_user_created` trigger in the database. The API does not need an endpoint for creating profiles.
- **Review Session Fetching**: The `GET /api/review/session` endpoint will query the `flashcards` table using the conditions `user_id = auth.uid()`, `review_due_at <= NOW()`, and `ORDER BY leitner_box ASC`. This query is optimized by the `flashcards_review_session_idx` index.
