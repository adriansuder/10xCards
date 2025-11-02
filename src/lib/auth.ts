/**
 * Utility functions for authentication-related operations.
 * Provides error mapping and other auth helpers.
 */

/**
 * Maps Supabase authentication errors to user-friendly Polish messages.
 * @param error - The error object from Supabase auth
 * @returns A user-friendly error message in Polish
 */
export const mapSupabaseError = (error: any): string => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Nieprawidłowy email lub hasło. Spróbuj ponownie.';
    case 'Email not confirmed':
      return 'Twoje konto nie zostało jeszcze aktywowane. Sprawdź swoją skrzynkę email.';
    case 'Too many requests':
      return 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.';
    case 'User not found':
      return 'Nie znaleziono użytkownika z podanym adresem email.';
    case 'Invalid email':
      return 'Podany adres email jest nieprawidłowy.';
    case 'Weak password':
      return 'Hasło jest zbyt słabe. Użyj silniejszego hasła.';
    case 'Signup is disabled':
      return 'Rejestracja nowych kont jest tymczasowo wyłączona.';
    case 'Email link is invalid or has expired':
      return 'Link potwierdzający email jest nieprawidłowy lub wygasł.';
    case 'User already registered':
      return 'Użytkownik o tym adresie e-mail już istnieje. Może chcesz się zalogować?';
    case 'Password should be at least 8 characters':
      return 'Hasło musi mieć minimum 8 znaków.';
    default:
      // Handle network errors
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        return 'Problem z połączeniem internetowym. Sprawdź swoje połączenie i spróbuj ponownie.';
      }
      // Handle server errors
      if (error.status >= 500) {
        return 'Wystąpił problem z serwerem. Spróbuj ponownie za chwilę.';
      }
      return 'Wystąpił błąd podczas logowania. Spróbuj ponownie.';
  }
};