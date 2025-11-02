import type { SessionStatistics } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

/**
 * Session summary component displaying statistics after completing the review session.
 * Shows total reviewed cards, success rate, and breakdown of known/unknown cards.
 *
 * @param statistics - Session statistics object
 */
interface SessionSummaryProps {
  statistics: SessionStatistics;
}

export function SessionSummary({ statistics }: SessionSummaryProps) {
  // Validate statistics
  if (statistics.totalReviewed <= 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Brak danych do wyświetlenia
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-center text-2xl">
            Sesja zakończona!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary statistics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
              <span className="text-sm font-medium text-muted-foreground">
                Przejrzane karty
              </span>
              <span className="text-2xl font-bold">{statistics.totalReviewed}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-green-100 p-4 dark:bg-green-900/20">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Wiedziałem
              </span>
              <span className="text-2xl font-bold text-green-800 dark:text-green-300">
                {statistics.knewCount}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-red-100 p-4 dark:bg-red-900/20">
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                Nie wiedziałem
              </span>
              <span className="text-2xl font-bold text-red-800 dark:text-red-300">
                {statistics.didntKnowCount}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
              <span className="text-sm font-medium text-primary">
                Skuteczność
              </span>
              <span className="text-2xl font-bold text-primary">
                {statistics.successRate}%
              </span>
            </div>
          </div>

          {/* Action button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => (window.location.href = '/')}
              size="lg"
              className="min-w-[200px]"
            >
              Zakończ sesję
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
