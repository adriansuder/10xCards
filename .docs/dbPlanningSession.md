<conversation_summary>
<decisions>
1.  **Główne Encje:** Schemat będzie składał się z trzech głównych tabel: `public.profiles` (dla ustawień użytkownika), `public.flashcards` (dla fiszek) oraz `public.ai_generation_logs` (dla metryk).
2.  **Relacje:**
    * `public.profiles` będzie miało relację 1:1 z `auth.users` (Supabase). Klucz główny `profiles.id` będzie kluczem obcym wskazującym na `auth.users(id)` z `ON DELETE CASCADE`.
    * `public.flashcards` będzie miało relację Wiele:1 z `auth.users`. Kolumna `flashcards.user_id` będzie kluczem obcym wskazującym na `auth.users(id)` z `ON DELETE CASCADE`.
    * `public.ai_generation_logs` będzie miało relację Wiele:1 z `auth.users`. Kolumna `user_id` będzie kluczem obcym wskazującym na `auth.users(id)` (potencjalnie z `ON DELETE SET NULL`, aby zachować metryki anonimowo, lub `ON DELETE CASCADE`).
3.  **Tabela `profiles`:** Będzie zawierać kolumnę `default_ai_level (text, DEFAULT 'B2')` do przechowywania domyślnego poziomu AI dla użytkownika.
4.  **Tabela `flashcards` (Zawartość):** Kolumny `front` i `back` będą typu `text` z ograniczeniami `CHECK(length(...) > 0 AND length(...) < 250)`. Kolumna `part_of_speech` będzie typu `text NULL`.
5.  **Tabela `flashcards` (Metadane):**
    * Kolumna `ai_generated` będzie typu `boolean NOT NULL DEFAULT FALSE`.
    * Zostanie utworzony typ `language_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')`.
    * Kolumna `flashcard_language_level` będzie typu `language_level NULL` (opcjonalna dla wpisów manualnych, obowiązkowa dla AI).
6.  **System Powtórek (Spaced Repetition):**
    * Implementacja w tabeli `flashcards` za pomocą kolumn `leitner_box (smallint NOT NULL DEFAULT 1, CHECK > 0)` oraz `review_due_at (timestamptz NOT NULL DEFAULT NOW())`.
    * Logika zostanie zamknięta w funkcji PostgreSQL `public.update_flashcard_review(p_flashcard_id uuid, p_knew_it boolean)`, implementującej 5-stopniowy system Leitnera (Box 3->+7d, 4->+14d, 5->+30d; "Nie wiem" resetuje do Box 1).
7.  **Bezpieczeństwo (RLS):**
    * Row Level Security zostanie włączone dla wszystkich trzech tabel.
    * `flashcards`: Polityki zezwolą na pełny CRUD (SELECT, INSERT, UPDATE, DELETE) tylko dla właściciela (`auth.uid() = user_id`).
    * `profiles`: Polityki zezwolą tylko na `SELECT` i `UPDATE` dla właściciela (`auth.uid() = id`).
    * `ai_generation_logs`: Polityka zezwoli na `INSERT` dla zalogowanych użytkowników (`auth.uid() = user_id`) oraz (opcjonalnie) `SELECT` tylko dla właściciela.
8.  **Automatyzacja (Trigger):** Zostanie utworzona funkcja triggera uruchamiana `AFTER INSERT ON auth.users`, która automatycznie utworzy powiązany wiersz w `public.profiles`.
9.  **Wydajność (Indeksy):** Tabela `flashcards` będzie posiadać dwa kluczowe indeksy złożone:
    * ` (user_id, review_due_at, leitner_box)` (dla sesji nauki).
    * `(user_id, created_at DESC)` (dla strony "Moje Fiszki").
10. **Metryki (Wymaganie 6.1):** Zostanie utworzona tabela `public.ai_generation_logs` (`id (uuid, PK)`, `user_id (uuid, FK)`, `generated_count (smallint)`, `imported_count (smallint)`, `created_at (timestamptz)`) do atomowego śledzenia metryk AI. Jeden wiersz będzie dodawany po każdej operacji importu AI.
</decisions>

<matched_recommendations>
1.  **Izolacja Danych (RLS):** Zastosowano rekomendację wdrożenia Row Level Security dla tabel `flashcards`, `profiles` i `ai_generation_logs` w oparciu o `auth.uid() = user_id`, co jest kluczowe dla Wymagania 3.1.
2.  **Automatyzacja Profilu Użytkownika:** Zaakceptowano rekomendację utworzenia funkcji triggera `AFTER INSERT ON auth.users` do automatycznego tworzenia rekordu w `public.profiles`, co upraszcza zarządzanie użytkownikami i RLS.
3.  **Optymalizacja Sesji Nauki:** Zaakceptowano rekomendację utworzenia kluczowego indeksu złożonego `(user_id, review_due_at, leitner_box)`, który jest niezbędny do wydajnego pobierania fiszek do powtórki (Wymaganie 3.6).
4.  **Optymalizacja Listy FIszek:** Zaakceptowano rekomendację dodania drugiego indeksu `(user_id, created_at DESC)` w celu przyspieszenia ładowania strony "Moje Fiszki" (US-008).
5.  **Hermetyzacja Logiki Biznesowej:** Zaakceptowano rekomendację stworzenia funkcji PostgreSQL (`update_flashcard_review`) do zarządzania logiką systemu Leitnera, co zapewnia spójność danych i upraszcza logikę frontendu.
6.  **Integralność Danych (Typy):** Zaakceptowano rekomendacje dotyczące użycia specyficznych typów danych: `smallint` dla `leitner_box` (oszczędność miejsca) oraz `ENUM` dla `flashcard_language_level` (integralność danych).
7.  **Integralność Relacyjna:** Zaakceptowano rekomendację użycia `ON DELETE CASCADE` dla kluczy obcych (`profiles`, `flashcards`) wskazujących na `auth.users(id)`, co zapewnia automatyczne czyszczenie danych po usunięciu użytkownika.
8.  **Ograniczenia (CHECK):** Zaakceptowano rekomendację użycia ograniczeń `CHECK` dla pól `front` i `back`, aby zapewnić limity długości i zapobiec pustym wpisom.
9.  **Śledzenie Metryk (Atomowość):** Zastosowano rekomendację utworzenia oddzielnej tabeli `ai_generation_logs` do rejestrowania każdej operacji generowania AI. Zapewnia to atomowość i rozwiązuje problem "race condition", który wystąpiłby przy aktualizacji liczników w tabeli `profiles`.
</matched_recommendations>

<database_planning_summary>
Podsumowanie planowania bazy danych dla MVP "AI Fiszki" koncentruje się na trzech głównych tabelach (`profiles`, `flashcards`, `ai_generation_logs`) w ekosystemie Supabase (PostgreSQL), z silnym naciskiem na bezpieczeństwo, wydajność i atomowość danych.

**a. Główne wymagania dotyczące schematu bazy danych**
Schemat musi wspierać:
1.  **Autentykację** i powiązanie danych z konkretnym użytkownikiem `auth.users`.
2.  **Przechowywanie fiszek** (`front`, `back`, `part_of_speech`).
3.  **Metadane fiszek** (źródło `ai_generated`, poziom językowy `flashcard_language_level`).
4.  **System Spaced Repetition** (śledzenie `leitner_box` i daty następnej powtórki `review_due_at`).
5.  **Ustawienia użytkownika** (domyślny poziom AI `default_ai_level`).
6.  **Śledzenie metryk** adopcji AI w sposób atomowy (logowanie każdej partii wygenerowanych i zaimportowanych fiszek).

**b. Kluczowe encje i ich relacje**
* **`auth.users` (Encja Supabase):** Przechowuje dane uwierzytelniające. Jest centrum relacji.
* **`public.profiles` (Encja Ustawień):** Relacja 1:1 z `auth.users`. Przechowuje dane specyficzne dla aplikacji (ustawienia). Tworzona automatycznie przez trigger.
* **`public.flashcards` (Główna Encja):** Relacja Wiele:1 z `auth.users`. Przechowuje wszystkie fiszki użytkownika oraz ich stan w systemie powtórek.
* **`public.ai_generation_logs` (Encja Metryk):** Relacja Wiele:1 z `auth.users`. Rejestruje wynik każdej operacji generowania AI (ile wygenerowano vs. ile zaimportowano), aby zapewnić dokładne i atomowe śledzenie metryk.

**c. Ważne kwestie dotyczące bezpieczeństwa i skalowalności**
* **Bezpieczeństwo:** Najwyższym priorytetem jest izolacja danych. Zostanie ona osiągnięta przez włączenie RLS dla wszystkich tabel aplikacji (`profiles`, `flashcards`, `ai_generation_logs`). Polityki będą ściśle ograniczać dostęp (CRUD) tylko do wierszy, których właścicielem jest aktualnie zalogowany użytkownik (`auth.uid()`).
* **Skalowalność:** Wydajność zostanie zapewniona przez dwa strategiczne indeksy złożone w tabeli `flashcards`. Pierwszy `(user_id, review_due_at, leitner_box)` jest krytyczny dla podstawowej funkcjonalności aplikacji (sesja nauki). Drugi `(user_id, created_at DESC)` zapewni szybkie ładowanie interfejsu zarządzania fiszkami. Atomowość zapisu metryk jest zapewniona przez dedykowaną tabelę `ai_generation_logs`.

</database_planning_summary>

</conversation_summary>