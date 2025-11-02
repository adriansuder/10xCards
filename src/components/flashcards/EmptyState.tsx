import { FileX } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Empty state component displayed when user has no flashcards.
 * Encourages users to create their first flashcard.
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <FileX className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
      <h2 className="text-2xl font-semibold mb-2">Brak fiszek</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Nie masz jeszcze żadnych fiszek. Zacznij swoją przygodę z nauką, generując fiszki za pomocą
        AI lub tworząc je ręcznie.
      </p>
      <Button asChild>
        <a href="/generuj-fiszki">Wygeneruj fiszki</a>
      </Button>
    </div>
  );
}
