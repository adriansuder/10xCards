import { TableCell, TableRow } from '../ui/table';
import { EditableCell } from './EditableCell';
import { ActionCell } from './ActionCell';
import { formatLeitnerBox, formatRelativeTime } from '../../lib/formatters';
import type { FlashcardRowProps, UpdateFlashcardCommand } from '../../types';

/**
 * Table row component representing a single flashcard.
 * Contains editable cells for front, back, and part_of_speech fields.
 */
export function FlashcardRow({ flashcard, onUpdate, onDelete }: FlashcardRowProps) {
  /**
   * Handles saving changes to a specific field.
   */
  const handleFieldSave = async (fieldName: keyof UpdateFlashcardCommand, value: string) => {
    const updateData: UpdateFlashcardCommand = {
      [fieldName]: value || null,
    };
    await onUpdate(flashcard.id, updateData);
  };

  return (
    <TableRow>
      {/* Front - editable */}
      <EditableCell
        value={flashcard.front}
        fieldName="front"
        onSave={(value) => handleFieldSave('front', value)}
      />

      {/* Back - editable */}
      <EditableCell
        value={flashcard.back}
        fieldName="back"
        onSave={(value) => handleFieldSave('back', value)}
      />

      {/* Part of speech - editable */}
      <EditableCell
        value={flashcard.part_of_speech}
        fieldName="part_of_speech"
        onSave={(value) => handleFieldSave('part_of_speech', value)}
      />

      {/* Leitner box - read only */}
      <TableCell>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
          {formatLeitnerBox(flashcard.leitner_box)}
        </span>
      </TableCell>

      {/* Next review - read only */}
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {formatRelativeTime(flashcard.review_due_at)}
        </span>
      </TableCell>

      {/* Actions */}
      <ActionCell flashcardId={flashcard.id} onDelete={onDelete} />
    </TableRow>
  );
}
