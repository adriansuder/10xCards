/**
 * Session progress component displaying the current card number and total cards.
 * Shows progress in format "Karta X z Y" with an optional progress bar.
 *
 * @param currentIndex - Current card index (0-based)
 * @param totalCards - Total number of cards in the session
 */
interface SessionProgressProps {
  currentIndex: number;
  totalCards: number;
}

export function SessionProgress({ currentIndex, totalCards }: SessionProgressProps) {
  // Validate props
  if (totalCards <= 0) {
    return null;
  }

  const currentCardNumber = currentIndex + 1; // Convert to 1-based for display
  const progressPercentage = (currentCardNumber / totalCards) * 100;

  return (
    <div className="mb-6 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Karta {currentCardNumber} z {totalCards}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Postęp sesji: ${currentCardNumber} z ${totalCards} kart`}
        />
      </div>
    </div>
  );
}
