import { Button } from '../ui/button';

/**
 * Review actions component containing "I knew" and "I didn't know" buttons.
 * Only displayed after the answer is revealed.
 *
 * @param isSubmitting - Whether a review is currently being submitted
 * @param onSubmitReview - Callback to submit the review (true = knew it, false = didn't know)
 */
interface ReviewActionsProps {
  isSubmitting: boolean;
  onSubmitReview: (knewIt: boolean) => Promise<void>;
}

export function ReviewActions({ isSubmitting, onSubmitReview }: ReviewActionsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
      <Button
        onClick={() => onSubmitReview(false)}
        disabled={isSubmitting}
        variant="destructive"
        size="lg"
        className="min-w-[200px]"
      >
        {isSubmitting ? 'Zapisuję...' : 'Nie wiem'}
      </Button>
      <Button
        onClick={() => onSubmitReview(true)}
        disabled={isSubmitting}
        variant="default"
        size="lg"
        className="min-w-[200px]"
      >
        {isSubmitting ? 'Zapisuję...' : 'Wiem'}
      </Button>
    </div>
  );
}
