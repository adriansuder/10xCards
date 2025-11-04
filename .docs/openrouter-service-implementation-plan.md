# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi

`OpenRouterService` to klasa TypeScript zaprojektowana do hermetyzacji logiki komunikacji z API OpenRouter. Jej głównym celem jest dostarczenie prostego i reużywalnego interfejsu do generowania odpowiedzi z modeli językowych (LLM) w całej aplikacji. Usługa będzie odpowiedzialna za konstruowanie zapytań, zarządzanie kluczami API, wysyłanie żądań, parsowanie odpowiedzi oraz obsługę błędów.

Będzie ona wykorzystywana w backendowych endpointach API (Astro Server Endpoints) do zadań takich jak generowanie fiszek na podstawie tekstu dostarczonego przez użytkownika.

## 2. Opis konstruktora

Konstruktor klasy `OpenRouterService` będzie inicjalizował usługę, pobierając klucz API OpenRouter ze zmiennych środowiskowych. Takie podejście zapewnia bezpieczeństwo, unikając hardkodowania wrażliwych danych w kodzie źródłowym.

```typescript
// src/lib/services/openrouter.service.ts

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor() {
    // Pobranie klucza API ze zmiennych środowiskowych
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      // Rzucenie błędu, jeśli klucz nie jest skonfigurowany
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }
    this.apiKey = apiKey;
  }

  // ... metody
}
```

## 3. Publiczne metody i pola

### Metody

#### `getStructuredCompletion<T>(options: CompletionOptions): Promise<T>`

Główna metoda publiczna usługi. Przyjmuje obiekt konfiguracyjny i zwraca sparsowaną odpowiedź JSON w oczekiwanym typie generycznym `T`.

-   **`options` (`CompletionOptions`):** Obiekt zawierający wszystkie parametry potrzebne do wywołania API.
    -   `systemPrompt` (string): Instrukcje dla modelu definiujące jego rolę i cel.
    -   `userPrompt` (string): Konkretne zapytanie lub dane od użytkownika.
    -   `model` (string): Nazwa modelu do użycia (np. `anthropic/claude-3.5-sonnet`).
    -   `responseSchema` (Zod.ZodType): Schemat Zod definiujący strukturę oczekiwanej odpowiedzi JSON.
    -   `params?` (object): Opcjonalne parametry modelu, takie jak `temperature` czy `max_tokens`.

-   **Zwraca:** `Promise<T>` - Obiekt JSON zgodny ze schematem `responseSchema`.

## 4. Prywatne metody i pola

### Pola

-   `apiKey` (string): Przechowuje klucz API OpenRouter.
-   `baseUrl` (string): Bazowy URL do API OpenRouter.

### Metody

#### `buildRequestPayload(options: CompletionOptions): object`

Prywatna metoda do budowania obiektu żądania (payload) na podstawie dostarczonych opcji. Konwertuje schemat Zod na format `json_schema` zrozumiały dla API OpenRouter.

#### `executeRequest<T>(payload: object): Promise<T>`

Metoda odpowiedzialna za wykonanie żądania `fetch` do API OpenRouter. Ustawia odpowiednie nagłówki (`Authorization`, `Content-Type`), wysyła żądanie i obsługuje podstawową odpowiedź HTTP.

## 5. Obsługa błędów

Usługa będzie implementować kompleksową obsługę błędów, aby zapewnić stabilność i przewidywalność działania.

1.  **Błąd konfiguracji:** Konstruktor rzuci błąd, jeśli zmienna środowiskowa `OPENROUTER_API_KEY` nie zostanie znaleziona.
2.  **Błędy walidacji Zod:** Jeśli odpowiedź API nie będzie zgodna z dostarczonym `responseSchema`, metoda `getStructuredCompletion` rzuci błąd walidacji, informując o niezgodności danych.
3.  **Błędy HTTP:** W przypadku odpowiedzi o statusie innym niż `2xx` (np. 401 - Unauthorized, 429 - Too Many Requests, 500 - Internal Server Error), metoda `executeRequest` rzuci `Error` z komunikatem zawierającym status i treść odpowiedzi.
4.  **Błędy sieciowe:** W przypadku problemów z połączeniem (np. brak dostępu do internetu), `fetch` rzuci wyjątek, który zostanie przechwycony i opakowany w standardowy `Error`.

## 6. Kwestie bezpieczeństwa

1.  **Zarządzanie kluczem API:** Klucz API będzie przechowywany wyłącznie w zmiennych środowiskowych (`.env`) i nigdy nie będzie eksponowany po stronie klienta. Plik `.env` musi być dodany do `.gitignore`.
2.  **Walidacja danych wejściowych:** Dane pochodzące od użytkownika (`userPrompt`) powinny być walidowane i sanityzowane w endpointach API przed przekazaniem do `OpenRouterService`, aby zapobiec atakom typu Prompt Injection.
3.  **Walidacja danych wyjściowych:** Użycie schematów Zod (`responseSchema`) gwarantuje, że dane zwracane przez LLM mają oczekiwaną strukturę, co chroni przed nieoczekiwanym zachowaniem aplikacji w przypadku niepoprawnych odpowiedzi modelu.
4.  **Ograniczenie dostępu:** Usługa powinna być wywoływana wyłącznie po stronie serwera (w endpointach Astro), aby chronić klucz API i logikę biznesową.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Instalacja zależności

Zainstaluj `zod` do walidacji schematów oraz `zod-to-json-schema` do konwersji schematów Zod na format JSON Schema.

```bash
npm install zod zod-to-json-schema
```

### Krok 2: Konfiguracja zmiennych środowiskowych

1.  Utwórz plik `.env` w głównym katalogu projektu (jeśli jeszcze nie istnieje).
2.  Dodaj do niego swój klucz API OpenRouter:
    ```env
    # .env
    OPENROUTER_API_KEY="sk-or-v1-..."
    ```
3.  Upewnij się, że plik `.env` jest dodany do `.gitignore`.

### Krok 3: Utworzenie typów i schematów

W pliku `src/types.ts` zdefiniuj schematy Zod dla oczekiwanych odpowiedzi oraz typy dla opcji usługi.

```typescript
// src/types.ts

import { z } from 'zod';

// ... istniejące typy

// Schemat dla pojedynczej sugestii fiszki generowanej przez AI
export const AiSuggestionSchema = z.object({
  front: z.string().describe('The front side of the flashcard (a word or phrase).'),
  back: z.string().describe('The back side of the flashcard (the translation or definition).'),
  part_of_speech: z.string().nullable().describe('The part of speech (e.g., noun, verb).'),
});

// Schemat dla całej odpowiedzi zawierającej listę sugestii
export const GenerateSuggestionsResponseSchema = z.object({
  suggestions: z.array(AiSuggestionSchema).describe('An array of generated flashcard suggestions.'),
});

// Typ dla opcji przekazywanych do OpenRouterService
export type CompletionOptions = {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  responseSchema: z.ZodType;
  params?: {
    temperature?: number;
    max_tokens?: number;
  };
};
```

### Krok 4: Implementacja `OpenRouterService`

Utwórz nowy plik `src/lib/services/openrouter.service.ts` i zaimplementuj klasę zgodnie z poniższym wzorcem.

```typescript
// src/lib/services/openrouter.service.ts

import type { CompletionOptions } from '../../types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string = 'https://openrouter.ai/api/v1';

  constructor() {
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables.');
    }
    this.apiKey = apiKey;
  }

  public async getStructuredCompletion<T>(options: CompletionOptions): Promise<T> {
    const payload = this.buildRequestPayload(options);
    const response = await this.executeRequest(payload);
    
    // Walidacja odpowiedzi za pomocą schematu Zod
    const validationResult = options.responseSchema.safeParse(response);
    if (!validationResult.success) {
      console.error('Zod validation failed:', validationResult.error);
      throw new Error('Failed to validate the structured response from the AI model.');
    }

    return validationResult.data;
  }

  private buildRequestPayload(options: CompletionOptions): object {
    const { systemPrompt, userPrompt, model, responseSchema, params } = options;

    // Konwersja schematu Zod na JSON Schema
    const jsonSchema = zodToJsonSchema(responseSchema, 'responseSchema');

    return {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_object',
        schema: jsonSchema,
      },
      ...params,
    };
  }

  private async executeRequest(payload: object): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      // Zgodnie z dokumentacją OpenRouter, treść odpowiedzi jest w `choices[0].message.content`
      // i powinna być stringiem JSON, który należy sparsować.
      const content = JSON.parse(data.choices[0].message.content);
      return content;

    } catch (error) {
      console.error('Error executing OpenRouter request:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred while communicating with the AI service.');
    }
  }
}
```

### Krok 5: Aktualizacja `ai.service.ts`

Zmodyfikuj istniejącą funkcję `generateFlashcardSuggestions` w `src/lib/ai.service.ts`, aby korzystała z nowej usługi `OpenRouterService`.

```typescript
// src/lib/ai.service.ts

import { GenerateSuggestionsResponseSchema, type AiSuggestion } from '../types';
import { OpenRouterService } from './services/openrouter.service';

const SYSTEM_PROMPT = `You are an expert linguist specializing in generating flashcards for language learners. 
Your task is to analyze the provided text and create a list of flashcards based on the user's target language level.
Each flashcard must contain a 'front' (the word), a 'back' (the translation/definition), and the 'part_of_speech'.
The response must be a valid JSON object that strictly adheres to the provided schema.`;

export async function generateFlashcardSuggestions(
  text: string,
  level: string
): Promise<AiSuggestion[]> {
  try {
    const openRouterService = new OpenRouterService();

    const userPrompt = `Please generate flashcard suggestions from the following text for a user at the ${level} language level:\n\n---TEXT---\n${text}\n---END TEXT---`;

    const response = await openRouterService.getStructuredCompletion<{ suggestions: AiSuggestion[] }>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: userPrompt,
      model: 'anthropic/claude-3.5-sonnet', // Przykładowy model
      responseSchema: GenerateSuggestionsResponseSchema,
      params: {
        temperature: 0.5,
      },
    });

    // Dodanie tymczasowego ID po stronie klienta
    return response.suggestions.map(suggestion => ({
      ...suggestion,
      id: crypto.randomUUID(),
    }));

  } catch (error) {
    console.error('Failed to generate flashcard suggestions:', error);
    // Rzuć błąd dalej, aby obsłużyć go w endpoint'cie API
    throw new Error('An error occurred while generating AI suggestions.');
  }
}
```

### Krok 6: Weryfikacja

Uruchom aplikację i przetestuj funkcjonalność generowania sugestii AI, aby upewnić się, że usługa działa poprawnie, a błędy są właściwie obsługiwane. Sprawdź logi serwera w poszukiwaniu ewentualnych błędów walidacji lub komunikacji z API.
