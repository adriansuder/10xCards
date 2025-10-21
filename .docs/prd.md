# Dokument wymagań produktu (PRD) - AI Fiszki

## 1. Przegląd produktu
AI Fiszki to aplikacja internetowa zaprojektowana, aby zrewolucjonizować proces nauki języka angielskiego dla polskich użytkowników poprzez automatyzację tworzenia fiszek. Aplikacja wykorzystuje sztuczną inteligencję do generowania fiszek ze słownictwem na podstawie tekstu dostarczonego przez użytkownika. Główne funkcje obejmują uwierzytelnianie użytkowników, generowanie fiszek przez AI, manualne tworzenie i edycję fiszek oraz zintegrowany system powtórek w odroczonym czasie (Spaced Repetition) oparty na zmodyfikowanej metodzie Leitnera. Celem projektu jest znaczne skrócenie czasu potrzebnego na tworzenie materiałów do nauki i zachęcenie do regularnych powtórek.

## 2. Problem użytkownika
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest procesem czasochłonnym i monotonnym. Uczniowie często rezygnują z tej efektywnej metody nauki (Spaced Repetition), ponieważ bariera wejścia związana z przygotowaniem materiałów jest zbyt wysoka. Brakuje narzędzia, które automatyzuje ten proces, pozwalając użytkownikom skupić się na nauce, a nie na tworzeniu fiszek.

## 3. Wymagania funkcjonalne
- 3.1. Uwierzytelnianie użytkowników:
  - Rejestracja i logowanie za pośrednictwem Supabase.
  - Każdy użytkownik ma dostęp wyłącznie do swoich fiszek.
- 3.2. Generowanie fiszek przez AI:
  - Interfejs do wklejania tekstu w języku angielskim (limit 2000 znaków).
  - Możliwość wyboru poziomu trudności (B1, B2, C1), z domyślnym B2.
  - Zapytanie do API Openrouter.ai (modele Haiku/Mistral) z tekstem i poziomem.
  - Oczekiwanie na odpowiedź w formacie JSON: `{"fiszki": [{"front": "...", "tyl": "... (część mowy)"}, ...]}`.
  - Wyświetlanie wskaźnika ładowania w trakcie generowania.
- 3.3. Przegląd i import fiszek:
  - Wygenerowane propozycje fiszek wyświetlane są w formie listy.
  - Użytkownik może edytować (inline) każdą propozycję.
  - Użytkownik może odrzucić (usunąć z listy) każdą propozycję.
  - Przycisk "Dodaj [X] fiszek" zapisuje zaakceptowane pozycje do bazy danych.
- 3.4. Manualne tworzenie fiszek:
  - Dostępny formularz do ręcznego dodawania fiszek.
  - Pola: "Front (EN)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)".
- 3.5. Zarządzanie fiszkami (CRUD):
  - Dedykowana strona "Moje Fiszki" z listą wszystkich fiszek użytkownika.
  - Możliwość edycji (inline) i usuwania istniejących fiszek.
- 3.6. System powtórek (Spaced Repetition):
  - Sesja nauki pobiera fiszki, dla których `review_due_at <= NOW()` posortowane rosnąco wg `leitner_box`.
  - Interfejs sesji pokazuje najpierw przód fiszki (Front).
  - Po kliknięciu "Pokaż odpowiedź" odsłaniany jest tył fiszki (Tył).
  - Dwa przyciski do oceny: "Wiem" i "Nie wiem".
  - Logika aktualizacji:
    - "Nie wiem": `leitner_box` = 1, `review_due_at` = NOW().
    - "Wiem" (Box 1 -> 2): `leitner_box` = 2, `review_due_at` = NOW() + 1 dzień.
    - "Wiem" (Box 2 -> 3): `leitner_box` = 3, `review_due_at` = NOW() + 3 dni.
  - Po zakończeniu sesji (brak fiszek do powtórki) wyświetlany jest ekran podsumowania.
- 3.7. Obsługa błędów:
  - Komunikaty typu "Toast" informują użytkownika o błędach (np. błąd API, błąd zapisu do bazy).

## 4. Granice produktu
Następujące funkcje celowo nie wchodzą w zakres MVP, aby umożliwić szybkie wdrożenie i weryfikację kluczowych hipotez:
- Zaawansowane algorytmy powtórek (np. SuperMemo, Anki).
- Import plików w formatach innych niż czysty tekst (np. PDF, DOCX, URL).
- Tworzenie i zarządzanie wieloma taliami fiszek (wszystkie trafiają do jednej bazy).
- Współdzielenie talii lub fiszek między użytkownikami.
- Integracje z zewnętrznymi platformami edukacyjnymi.
- Dedykowane aplikacje mobilne (projekt jest aplikacją webową).

## 5. Historyjki użytkowników

- ID: US-001
- Tytuł: Rejestracja nowego użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto w aplikacji przy użyciu adresu e-mail i hasła, aby móc zapisywać swoje fiszki i postępy w nauce.
- Kryteria akceptacji:
  - 1. Formularz rejestracji zawiera pola na adres e-mail i hasło.
  - 2. System waliduje poprawność formatu adresu e-mail.
  - 3. System wymaga hasła o minimalnej długości (np. 8 znaków).
  - 4. Po pomyślnej rejestracji użytkownik jest automatycznie zalogowany i przekierowany na stronę główną.
  - 5. W przypadku błędu (np. zajęty e-mail) wyświetlany jest czytelny komunikat.

- ID: US-002
- Tytuł: Logowanie do aplikacji
- Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do moich fiszek i rozpocząć sesję nauki.
- Kryteria akceptacji:
  - 1. Formularz logowania zawiera pola na adres e-mail i hasło.
  - 2. Po pomyślnym zalogowaniu użytkownik jest przekierowany na stronę główną.
  - 3. W przypadku podania błędnych danych logowania wyświetlany jest odpowiedni komunikat.

- ID: US-003
- Tytuł: Generowanie fiszek na podstawie tekstu
- Opis: Jako użytkownik, chcę wkleić fragment angielskiego tekstu i wybrać poziom trudności, aby AI wygenerowało dla mnie propozycje fiszek z najciekawszymi słówkami.
- Kryteria akceptacji:
  - 1. Na stronie głównej znajduje się pole tekstowe na max. 2000 znaków.
  - 2. Dostępny jest dropdown do wyboru poziomu (B1, B2, C1), z domyślnie wybranym B2.
  - 3. Przycisk "Generuj" jest aktywny tylko, gdy pole tekstowe nie jest puste.
  - 4. Po kliknięciu "Generuj" przycisk staje się nieaktywny, a na ekranie pojawia się wskaźnik ładowania.
  - 5. Zapytanie do AI jest wysyłane z tekstem i wybranym poziomem.
  - 6. Po otrzymaniu odpowiedzi od AI, wskaźnik ładowania znika, a pod formularzem pojawia się lista propozycji fiszek.

- ID: US-004
- Tytuł: Obsługa błędów podczas generowania fiszek
- Opis: Jako użytkownik, w przypadku problemu z generowaniem fiszek (np. błąd sieci, błąd API), chcę otrzymać jasny komunikat o błędzie.
- Kryteria akceptacji:
  - 1. Jeśli API zwróci błąd lub odpowiedź nie jest w formacie JSON, wskaźnik ładowania znika.
  - 2. Na ekranie pojawia się komunikat "Toast" informujący o problemie (np. "Wystąpił błąd podczas generowania fiszek. Spróbuj ponownie.").
  - 3. Przycisk "Generuj" ponownie staje się aktywny.

- ID: US-005
- Tytuł: Przegląd, edycja i odrzucanie propozycji fiszek
- Opis: Jako użytkownik, chcę przejrzeć listę fiszek zaproponowanych przez AI, aby móc je edytować lub odrzucić te, których nie chcę dodawać do mojej kolekcji.
- Kryteria akceptacji:
  - 1. Każda propozycja na liście wyświetla "Front", "Tył" i "Część mowy".
  - 2. Kliknięcie na tekst fiszki (front lub tył) umożliwia jego edycję w miejscu (inline).
  - 3. Przy każdej propozycji znajduje się przycisk "X", który usuwa ją z listy.
  - 4. Główny przycisk "Dodaj fiszki" dynamicznie aktualizuje swoją etykietę, pokazując liczbę pozostałych na liście propozycji (np. "Dodaj 18 fiszek").

- ID: US-006
- Tytuł: Import zaakceptowanych fiszek
- Opis: Jako użytkownik, po przejrzeniu propozycji, chcę jednym kliknięciem dodać wszystkie zaakceptowane fiszki do mojej głównej bazy.
- Kryteria akceptacji:
  - 1. Kliknięcie przycisku "Dodaj [X] fiszek" zapisuje wszystkie pozycje z listy do bazy danych Supabase.
  - 2. Każda zapisana fiszka ma przypisany `user_id`, `leitner_box` = 1 oraz `review_due_at` = aktualny czas.
  - 3. Po pomyślnym zapisie lista propozycji jest czyszczona, a użytkownik widzi komunikat "Toast" o sukcesie.
  - 4. W przypadku błędu zapisu do bazy, użytkownik widzi komunikat o błędzie, a propozycje pozostają na liście.

- ID: US-007
- Tytuł: Manualne dodawanie fiszki
- Opis: Jako użytkownik, chcę mieć możliwość szybkiego dodania własnej fiszki, bez korzystania z AI.
- Kryteria akceptacji:
  - 1. Na stronie głównej znajduje się przełącznik lub link do formularza manualnego.
  - 2. Formularz zawiera pola: "Front (EN)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)".
  - 3. Przycisk "Zapisz" jest aktywny tylko, gdy pola "Front" i "Tłumaczenie" są wypełnione.
  - 4. Po kliknięciu "Zapisz" fiszka jest dodawana do bazy z `leitner_box` = 1 i `review_due_at` = aktualny czas.
  - 5. Formularz jest czyszczony, a użytkownik widzi komunikat o pomyślnym dodaniu fiszki.

- ID: US-008
- Tytuł: Przeglądanie i zarządzanie moimi fiszkami
- Opis: Jako użytkownik, chcę mieć stronę, na której mogę zobaczyć wszystkie moje fiszki, edytować je lub usunąć.
- Kryteria akceptacji:
  - 1. Strona "Moje Fiszki" wyświetla tabelę lub listę wszystkich fiszek zalogowanego użytkownika.
  - 2. Każdy wiersz zawiera "Front", "Tył", "Część mowy" oraz opcje edycji i usunięcia.
  - 3. Edycja odbywa się w miejscu (inline).
  - 4. Usunięcie fiszki wymaga potwierdzenia (np. w oknie modalnym).
  - 5. Po usunięciu fiszka znika z listy.

- ID: US-009
- Tytuł: Rozpoczynanie sesji powtórek
- Opis: Jako użytkownik, chcę rozpocząć sesję nauki, podczas której system zaprezentuje mi fiszki, które wymagają powtórki w danym dniu.
- Kryteria akceptacji:
  - 1. W nawigacji znajduje się link "Ucz się".
  - 2. Po kliknięciu system pobiera fiszki, dla których `review_due_at <= NOW()`, sortując je po `leitner_box`.
  - 3. Jeśli nie ma fiszek do powtórki, wyświetlany jest komunikat "Ukończyłeś sesję na dziś!".
  - 4. Jeśli są fiszki, wyświetlany jest interfejs sesji z pierwszą fiszką.

- ID: US-010
- Tytuł: Przebieg sesji powtórek
- Opis: Jako użytkownik w trakcie sesji, chcę zobaczyć przód fiszki, następnie odkryć odpowiedź i ocenić, czy ją znałem.
- Kryteria akceptacji:
  - 1. Domyślnie widoczny jest tylko przód fiszki (Front).
  - 2. Przycisk "Pokaż odpowiedź" odsłania tył fiszki.
  - 3. Po odsłonięciu odpowiedzi pojawiają się dwa przyciski: "Wiem" i "Nie wiem".
  - 4. Kliknięcie "Wiem" lub "Nie wiem" aktualizuje fiszkę w bazie zgodnie z logiką (opisaną w wymaganiach funkcjonalnych) i ładuje kolejną fiszkę.
  - 5. Sesja kontynuowana jest do momentu, aż nie będzie więcej kart do powtórzenia.
  - 6. Na koniec wyświetlany jest ekran podsumowania.

## 6. Metryki sukcesu
- 6.1. Jakość generowania AI (Cel: >75%):
  - Mierzone jako stosunek liczby fiszek zaakceptowanych (nieodrzuconych i nieedytowanych) do całkowitej liczby fiszek wygenerowanych przez AI.
  - `SUM(ai_proposal_accepted) / SUM(ai_proposal_generated) > 0.75`
- 6.2. Adopcja funkcji AI (Cel: >50% aktywnych użytkowników):
  - Mierzone jako procent aktywnych użytkowników (zalogowanych w ciągu ostatnich 14 dni), którzy wygenerowali i zapisali co najmniej jedną fiszkę przy użyciu AI.
  - `(Użytkownicy z fiszkami AI) / (Aktywni użytkownicy) > 0.5`
