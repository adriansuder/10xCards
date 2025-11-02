import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '../ui/button';
import type { PaginationProps } from '../../types';

/**
 * Pagination component for navigating through pages of flashcards.
 * Displays page numbers, navigation buttons, and information about total items.
 */
export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  /**
   * Generates an array of page numbers to display.
   * Shows current page, adjacent pages, and ellipsis for gaps.
   */
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    pages.push(1);

    // Show ellipsis or second page
    if (showEllipsisStart) {
      pages.push('ellipsis');
    } else if (totalPages > 1) {
      pages.push(2);
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i > 1 && i < totalPages && !pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis or second-to-last page
    if (showEllipsisEnd) {
      pages.push('ellipsis');
    } else if (totalPages > 2 && !pages.includes(totalPages - 1)) {
      pages.push(totalPages - 1);
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {/* Info text */}
      <div className="text-sm text-muted-foreground">
        Strona <span className="font-medium">{currentPage}</span> z{' '}
        <span className="font-medium">{totalPages}</span> (łącznie{' '}
        <span className="font-medium">{totalItems}</span> {totalItems === 1 ? 'fiszka' : 'fiszek'})
      </div>

      {/* Navigation buttons */}
      <nav className="flex items-center gap-1" aria-label="Pagination">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrevious}
          aria-label="Pierwsza strona"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          aria-label="Poprzednia strona"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <Button key={`ellipsis-${index}`} variant="ghost" size="icon" disabled>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Więcej stron</span>
            </Button>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => onPageChange(page)}
              aria-label={`Strona ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Następna strona"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          aria-label="Ostatnia strona"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
