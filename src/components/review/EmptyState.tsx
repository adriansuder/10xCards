import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Empty state component displayed when there are no flashcards to review.
 * Shows a success message and a button to return to home page.
 */
export function EmptyState() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="h-8 w-8 text-green-600 dark:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <CardTitle className="text-center text-2xl">
            Świetna robota!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Nie masz żadnych fiszek do powtórki. Wróć później, aby kontynuować naukę.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => (window.location.href = '/')} size="lg">
              Powrót do strony głównej
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
