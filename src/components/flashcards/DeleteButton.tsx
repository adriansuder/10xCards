import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import type { DeleteButtonProps } from '../../types';

/**
 * Delete button with confirmation dialog.
 * Implements optimistic UI - the row is removed before API confirmation.
 */
export function DeleteButton({ flashcardId, onDelete, isDeleting = false }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the delete confirmation.
   */
  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onDelete(flashcardId);
      setIsOpen(false);
    } catch (error) {
      // Error is handled by the parent component
      console.error('Failed to delete flashcard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          aria-label="Usuń fiszkę"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Usuń
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta akcja jest nieodwracalna. Fiszka zostanie trwale usunięta z Twojej kolekcji i nie
            będzie można jej przywrócić.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Usuwanie...' : 'Usuń'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
