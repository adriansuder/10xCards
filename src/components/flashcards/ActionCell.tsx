import { TableCell } from '../ui/table';
import { DeleteButton } from './DeleteButton';
import type { ActionCellProps } from '../../types';

/**
 * Action cell component containing action buttons for a flashcard row.
 * Currently contains only the delete button, but can be extended with more actions.
 */
export function ActionCell({ flashcardId, onDelete }: ActionCellProps) {
  return (
    <TableCell>
      <div className="flex items-center gap-2">
        <DeleteButton flashcardId={flashcardId} onDelete={onDelete} />
      </div>
    </TableCell>
  );
}
