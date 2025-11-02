# Home View Components

This directory contains all React components for the home page (flashcard creation view).

## Component Structure

```
HomePage (Container)
├── Tabs (UI)
│   ├── AiTab
│   │   ├── Form (Textarea, Select, Button)
│   │   └── SuggestionList
│   │       └── SuggestionItem (multiple)
│   │           ├── EditableText (front/back)
│   │           ├── Select (part_of_speech)
│   │           └── DeleteButton
│   └── ManualTab
│       └── Form (Input front, Input back, Select, Button)
```

## Components

### HomePage.tsx
Main container component managing:
- Tab navigation (AI/Manual)
- Toast notifications (success/error)
- State coordination between tabs

### AiTab.tsx
AI-powered flashcard generation:
- Text input (max 2000 chars) with counter
- Language level selector (B1/B2/C1)
- Generate button with loading state
- Displays SuggestionList when suggestions available
- Uses `useAiGeneration` hook

### ManualTab.tsx
Manual flashcard creation:
- Front field (required)
- Back field (required)
- Part of speech selector (optional)
- Submit button with loading state
- Uses `useManualFlashcard` hook

### SuggestionList.tsx
Displays grid of AI-generated suggestions:
- Responsive grid (1/2/3 columns)
- Maps to SuggestionItem components
- Import button with dynamic label
- Shows loading state during import

### SuggestionItem.tsx
Single flashcard suggestion with inline editing:
- Click-to-edit front/back fields
- Part of speech dropdown
- Delete button (visible on hover)
- Keyboard shortcuts (Enter=save, Escape=cancel)
- Full ARIA labels for accessibility

## Custom Hooks

### useAiGeneration.ts
Manages AI generation flow:
- `generate(command)` - Call AI API
- `importFlashcards(metrics)` - Bulk import
- `updateSuggestion(id, updates)` - Edit suggestion
- `removeSuggestion(id)` - Remove suggestion
- `clearSuggestions()` - Clear list
- Returns: suggestions, loading states, errors

### useManualFlashcard.ts
Manages manual creation:
- `updateField(field, value)` - Update form
- `createFlashcard()` - Submit to API
- `resetForm()` - Clear after success
- Returns: form state, loading, errors

## Toast System

Uses Sonner library for notifications:
- Success: Import/create confirmations
- Error: API errors, validation failures
- Positioned top-right
- Auto-dismiss after 4 seconds

## API Integration

### AI Generation
- POST `/api/ai/generate-suggestions` - Generate flashcards
- POST `/api/ai/import-flashcards` - Import approved cards

### Manual Creation
- POST `/api/flashcards` - Create single flashcard

## Type Safety

All components use TypeScript with strict types from `src/types.ts`:
- `AiSuggestionViewModel` - Suggestion with editing state
- `ManualFormViewModel` - Form state
- `GenerateSuggestionsCommand` - API request
- `CreateFlashcardCommand` - API request

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management for inline editing
- Screen reader friendly error messages
- High contrast color scheme

## Styling

- Tailwind CSS utility classes
- Shadcn/ui components for consistency
- Responsive design (mobile-first)
- Dark mode ready (via CSS variables)
