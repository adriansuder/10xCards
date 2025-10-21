<conversation_summary> 
<decisions>
System Powtórek: MVP będzie korzystać z 3-stopniowego systemu Leitnera.

Model AI: Testy rozpoczną się od modeli anthropic/claude-3-haiku lub mistralai/mistral-7b-instruct w celu optymalizacji kosztów (główne ryzyko).

Docelowa Grupa: Polacy uczący się języka angielskiego.

Zakres Generowania: Użytkownik wkleja tekst po angielsku (max 2000 znaków). AI generuje maksymalnie 20 fiszek.

Poziom Trudności: Użytkownik wybiera poziom (B1/B2/C1) za pomocą dropdownu na stronie głównej; domyślny poziom to B2.

Format Fiszki: Front: Słówko (EN). Tył: PolskieTłumaczenie (część_mowy).

Format Danych AI: AI (Openrouter) musi zwracać dane w formacie JSON: {"fiszki": [{"front": "...", "tyl": "... (część mowy)"}, ...]}.

Przepływ Importu AI: Użytkownik widzi listę propozycji. Może edytować (inline) lub odrzucić (X) każdą z nich. Główny przycisk "Dodaj [X] fiszek" importuje zaakceptowane.

Przepływ Manualny: Na stronie głównej znajduje się przełącznik do formularza manualnego (Front, Tłumaczenie PL, Część mowy (opcjonalnie)). Zapisane fiszki trafiają do tej samej bazy.

Zarządzanie Talią: Brak talii w MVP. Wszystkie fiszki trafiają do jednej, głównej bazy użytkownika.

Nawigacja: Prosta nawigacja z linkami "Generuj" (strona główna), "Moje Fiszki" (lista/tabela z edycją inline i usuwaniem) oraz logo "AI Fiszki".

Schemat Bazy (Leitner): Tabela fiszki będzie zawierać kolumnę leitner_box (int, domyślnie 1).

Schemat Bazy (Spaced Repetition): Tabela fiszki będzie zawierać kolumnę review_due_at (timestamp).

Logika Spaced Repetition: Sesja pobiera WHERE review_due_at <= NOW() ORDER BY leitner_box ASC. Logika aktualizacji: Nowa (Box 1, Now); Błąd (Box 1, Now); Sukces 1->2 (Box 2, +1 dzień); Sukces 2->3 (Box 3, +3 dni).

UI Sesji Powtórek: Widok pokazuje Front. Przycisk "Pokaż odpowiedź". Przyciski "Wiem" (przesuwa do przodu) i "Nie wiem" (cofa do Box 1). Na koniec sesji ekran podsumowania.

Stack Technologiczny: Astro (z React) hostowany na DigitalOcean (Docker), Supabase (Auth/Baza Danych), Openrouter.ai (LLM), Github Actions (CI/CD).

Obsługa Błędów: Solidne try...catch dla wywołań LLM (błędy sieci, API, parsowania JSON) oraz dla operacji C/U/D w bazie Supabase. Błędy komunikowane użytkownikowi przez komponent Toast (dymek).
</decisions>

<matched_recommendations>
Metryka Jakości AI (Runda 2, Q3): Zdefiniowano śledzenie ai_proposal_generated i ai_proposal_accepted (gdzie akceptacja = nie-odrzucenie). Cel: accepted / generated > 0.75.

Metryka Adopcji AI (Runda 2, Q4 / Runda 5, Q9): Zdefiniowano metrykę jako "% aktywnych użytkowników, którzy użyli AI przynajmniej raz". Użytkownik aktywny = zalogowany w ciągu ostatnich 14 dni.

Format Tyłu Fiszki (Runda 3, Q3 / Runda 4, Q1): Uproszczono format tyłu fiszki do PolskieTłumaczenie (część_mowy), aby zminimalizować koszty LLM.

Selektor Poziomu (Runda 4, Q2): Zdecydowano o dodaniu selektora poziomu (B1/B2/C1) bezpośrednio na stronie generowania, zamiast tworzyć osobną stronę ustawień.

Nawigacja i Zarządzanie (Runda 4, Q5): Wprowadzono prostą nawigację ("Generuj", "Moje Fiszki") oraz listę fiszek z edycją inline.

Schemat Spaced Repetition (Runda 5, Q4): Wzbogacono prosty system Leitnera o kluczową kolumnę review_due_at (timestamp) oraz zdefiniowano logikę interwałów (+1d, +3d), co przekształca go w prawdziwy system powtórek rozłożonych w czasie.

Format Wyjściowy AI (Runda 5, Q3): Ustalono, że AI musi zwracać ustrukturyzowany JSON, aby uniknąć błędów parsowania.

Obsługa Błędów (Runda 5, Q3 & Q9): Zaakceptowano krytyczną potrzebę implementacji obsługi błędów zarówno dla API (LLM), jak i bazy danych (Supabase), z komunikacją przez dymki (Toast). 
</matched_recommendations>

<prd_planning_summary>

a. Główne wymagania funkcjonalne produktu
Uwierzytelnianie: Prosty system kont użytkowników obsługiwany przez Supabase (logowanie, rejestracja).

Generowanie Fiszki (AI):

Interfejs umożliwia wklejenie tekstu w języku angielskim (limit 2000 znaków).

Użytkownik może wybrać poziom trudności słownictwa (B1, B2, C1; domyślnie B2).

Aplikacja (backend Astro) wysyła zapytanie do Openrouter.ai (modele Haiku/Mistral) z tekstem i poziomem.

AI zwraca do 20 fiszek w formacie JSON ({"fiszki": [{"front": "EN", "tyl": "PL (część mowy)"}, ...]}).

UI wyświetla wskaźnik ładowania podczas generowania.

Przegląd Fiszki (Import):

Wygenerowane fiszki są wyświetlane na liście propozycji.

Użytkownik może edytować (inline) lub odrzucić (X) każdą propozycję.

Przycisk "Dodaj [X] fiszek" zapisuje zaakceptowane fiszki do bazy Supabase z leitner_box = 1 i review_due_at = NOW().

Manualne Tworzenie Fiszki:

Interfejs na stronie głównej pozwala na przełączenie się do formularza manualnego.

Formularz zawiera pola: "Front (EN)", "Tłumaczenie (PL)", "Część mowy (opcjonalnie)".

Zapisane fiszki trafiają do tej samej bazy.

Zarządzanie Fiszki (CRUD):

Strona "Moje Fiszki" wyświetla listę wszystkich fiszek użytkownika.

Użytkownik może edytować (inline) lub usuwać istniejące fiszki.

System Powtórek (Spaced Repetition):

Aplikacja pobiera fiszki do powtórki wg zapytania: WHERE review_due_at <= NOW() ORDER BY leitner_box ASC.

UI sesji powtórek: Pokazuje Front, użytkownik odkrywa Tył, następnie wybiera "Wiem" lub "Nie wiem".

Logika: "Nie wiem" (do Box 1, review_due_at = NOW()). "Wiem" (Box 1->2, review_due_at = NOW() + 1 day; Box 2->3, review_due_at = NOW() + 3 days).

Sesja kończy się ekranem podsumowania, gdy nie ma więcej fiszek do powtórki.

Obsługa Błędów: Aplikacja wyświetla komunikaty (Toast) w przypadku błędów generowania AI lub błędów zapisu/edycji w bazie danych.

b. Kluczowe historie użytkownika i ścieżki korzystania
Generowanie i Import: Jako użytkownik, chcę wkleić angielski artykuł, aby AI wygenerowało dla mnie zestaw fiszek z najtrudniejszymi słówkami. Chcę móc je przejrzeć, odrzucić niechciane i zaimportować resztę do mojej bazy jednym kliknięciem.

Ścieżka: Ekran "Generuj" -> Wklej tekst -> (Opcjonalnie zmień poziom) -> Kliknij "Generuj" -> (Ładowanie) -> Przejrzyj listę propozycji -> Kliknij "Odrzuć" przy 2 fiszkach -> Kliknij "Dodaj 18 fiszek" -> Przekierowanie na "Moje Fiszki".

Nauka (Powtórki): Jako użytkownik, chcę rozpocząć sesję nauki, aby system pokazał mi tylko te fiszki, które wymagają dzisiaj powtórki, zgodnie z moim postępem.

Ścieżka: (Z nawigacji) Kliknij "Ucz się" -> Zobacz Front (EN) -> Kliknij "Pokaż Odpowiedź" -> Zobacz Tył (PL) -> Kliknij "Wiem" -> Zobacz kolejną fiszkę -> ... -> Kliknij "Nie wiem" -> ... -> Zobacz ekran "Ukończyłeś sesję na dziś!".

Manualne Dodawanie: Jako użytkownik, chcę szybko dodać własną fiszkę, którą zapamiętałem z filmu, bez konieczności generowania jej przez AI.

Ścieżka: Ekran "Generuj" -> Kliknij "Lub dodaj manualnie" -> Wpisz Front/Tył/Część mowy -> Kliknij "Zapisz" -> (Zobacz toast "Dodano") -> Wpisz kolejną fiszkę.

c. Ważne kryteria sukcesu i sposoby ich mierzenia
Jakość AI (Akceptacja): 75% fiszek wygenerowanych przez AI jest akceptowanych (nie-odrzuconych) przez użytkownika.

Pomiar: Logowanie zdarzeń ai_proposal_generated i ai_proposal_accepted (w tym edytowanych). Metryka: SUM(accepted) / SUM(generated) > 0.75.

Adopcja Funkcji (Użycie AI): Wysoki procent aktywnych użytkowników skorzystało z generowania AI.

Pomiar: Oblicz % użytkowników (którzy zalogowali się w ciągu ostatnich 14 dni, wg last_sign_in_at), którzy mają co najmniej jedną fiszkę z flagą ai_generated = true. 
</prd_planning_summary>
</conversation_summary>