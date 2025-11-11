import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { TableCell } from '../ui/table';
import { toast } from 'sonner';
import type { EditableCellProps, EditableCellState } from '../../types';

/**
 * Editable table cell component with inline editing functionality.
 * Switches between read and edit mode on click.
 * Validates input and displays errors.
 */
export function EditableCell({ value, fieldName, onSave, isEditable = true }: EditableCellProps) {
  const [state, setState] = useState<EditableCellState>({
    isEditing: false,
    currentValue: value || '',
    error: null,
    isSaving: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when prop value changes
  useEffect(() => {
    if (!state.isEditing) {
      setState((prev) => ({ ...prev, currentValue: value || '' }));
    }
  }, [value, state.isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (state.isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [state.isEditing]);

  /**
   * Validates the input value based on field name.
   */
  const validateValue = (val: string): string | null => {
    // Part of speech is optional (can be empty)
    if (fieldName === 'part_of_speech') {
      if (val.length > 249) {
        return 'Maksymalnie 249 znaków';
      }
      return null;
    }

    // Front and back are required
    if (val.trim().length === 0) {
      return 'Pole nie może być puste';
    }

    if (val.length > 249) {
      return 'Maksymalnie 249 znaków';
    }

    return null;
  };

  /**
   * Enters edit mode.
   */
  const handleEditClick = () => {
    if (!isEditable) return;
    setState((prev) => ({ ...prev, isEditing: true, error: null }));
  };

  /**
   * Handles input value change with validation.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const error = validateValue(newValue);
    setState((prev) => ({ ...prev, currentValue: newValue, error }));
  };

  /**
   * Saves changes and exits edit mode.
   */
  const handleSave = async () => {
    const trimmedValue = state.currentValue.trim();
    const error = validateValue(trimmedValue);

    if (error) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    // Don't save if value hasn't changed
    if (trimmedValue === (value || '')) {
      setState((prev) => ({
        ...prev,
        isEditing: false,
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSave(trimmedValue || '');
      setState((prev) => ({
        ...prev,
        isEditing: false,
        isSaving: false,
        error: null,
      }));
      toast.success('Fiszka została zaktualizowana');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się zapisać zmian';
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));
      toast.error('Wystąpił błąd');
    }
  };

  /**
   * Cancels editing and reverts to original value.
   */
  const handleCancel = () => {
    setState({
      isEditing: false,
      currentValue: value || '',
      error: null,
      isSaving: false,
    });
  };

  /**
   * Handles keyboard shortcuts.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !state.error) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <TableCell className="relative">
      {state.isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={state.currentValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={state.isSaving}
              className={state.error ? 'border-destructive' : ''}
              aria-invalid={!!state.error}
              aria-describedby={state.error ? 'error-message' : undefined}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={!!state.error || state.isSaving}
              aria-label="Zapisz zmiany"
              className="shrink-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              disabled={state.isSaving}
              aria-label="Anuluj zmiany"
              className="shrink-0"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          {state.error && (
            <p id="error-message" className="text-xs text-destructive">
              {state.error}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={handleEditClick}
          disabled={!isEditable}
          className="text-left w-full hover:bg-accent hover:text-accent-foreground rounded px-2 py-1 -mx-2 -my-1 transition-colors disabled:cursor-not-allowed"
          aria-label={`Edytuj ${fieldName}`}
        >
          {value || <span className="text-muted-foreground italic">Brak wartości</span>}
        </button>
      )}
    </TableCell>
  );
}
