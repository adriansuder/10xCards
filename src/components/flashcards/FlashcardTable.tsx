import { useFlashcards } from '../hooks/useFlashcards';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '../ui/table';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import { FlashcardRow } from './FlashcardRow';
import { Pagination } from './Pagination';

/**
 * Main flashcard table component.
 * Manages state, fetches data, and coordinates all sub-components.
 */
export function FlashcardTable() {
  const { viewModel, updateFlashcard, deleteFlashcard, changePage } = useFlashcards();

  // Show loading skeleton
  if (viewModel.isLoading) {
    return <TableSkeleton />;
  }

  // Show error message
  if (viewModel.error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Wystąpił błąd</h2>
          <p className="text-sm text-muted-foreground">{viewModel.error}</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (viewModel.flashcards.length === 0) {
    return <EmptyState />;
  }

  // Show table with data
  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Front</TableHead>
              <TableHead className="w-[25%]">Tył</TableHead>
              <TableHead className="w-[15%]">Część mowy</TableHead>
              <TableHead className="w-[10%]">Pudełko</TableHead>
              <TableHead className="w-[15%]">Następna powtórka</TableHead>
              <TableHead className="w-[10%]">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {viewModel.flashcards.map((flashcard) => (
              <FlashcardRow
                key={flashcard.id}
                flashcard={flashcard}
                onUpdate={updateFlashcard}
                onDelete={deleteFlashcard}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={viewModel.pagination.currentPage}
        pageSize={viewModel.pagination.pageSize}
        totalItems={viewModel.pagination.totalItems}
        totalPages={viewModel.pagination.totalPages}
        onPageChange={changePage}
      />
    </div>
  );
}
