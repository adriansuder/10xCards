/**
 * Utility functions for formatting data in the UI.
 */

/**
 * Formats an ISO 8601 date string to a localized date format.
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string in Polish locale
 */
export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a Leitner box number to a display string.
 * @param box - Leitner box number (1-5)
 * @returns Formatted box label
 */
export const formatLeitnerBox = (box: number): string => {
  return `Pudełko ${box}`;
};

/**
 * Formats a relative time from now.
 * @param isoString - ISO 8601 date string
 * @returns Relative time string (e.g., "za 2 dni", "wczoraj")
 */
export const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return 'Przeterminowane';
  } else if (diffInDays === 0) {
    return 'Dzisiaj';
  } else if (diffInDays === 1) {
    return 'Jutro';
  } else {
    return `Za ${diffInDays} dni`;
  }
};
