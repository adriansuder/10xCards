import { Card, CardContent } from '../ui/card';

/**
 * Loading state component displayed while fetching flashcards from API.
 * Shows a spinner and loading message to inform user that session is being prepared.
 */
export function LoadingState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-center text-lg text-muted-foreground">
            Przygotowuję twoją sesję...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
