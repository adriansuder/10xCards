
# Finalny Schemat Bazy Danych PostgreSQL dla "AI Fiszki"

## 1. Typy niestandardowe (Custom Types)

### `language_level`
Typ wyliczeniowy do określania poziomu językowego fiszki.
```sql
CREATE TYPE public.language_level AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
```

---

## 2. Tabele

### `public.profiles`
Tabela przechowująca ustawienia i preferencje użytkowników.
- **Relacja:** 1:1 z `auth.users`.
- **Automatyzacja:** Wiersz jest tworzony automatycznie przez trigger po rejestracji użytkownika.

| Nazwa kolumny      | Typ danych    | Ograniczenia                                                              | Opis                                           |
|--------------------|---------------|---------------------------------------------------------------------------|------------------------------------------------|
| `id`               | `uuid`        | `PRIMARY KEY`, `REFERENCES auth.users(id) ON DELETE CASCADE`              | Klucz główny, powiązany z użytkownikiem Supabase. |
| `default_ai_level` | `text`        | `NOT NULL`, `DEFAULT 'B2'`                                                | Domyślny poziom trudności AI dla użytkownika.  |
| `created_at`       | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                               | Znacznik czasu utworzenia profilu.             |
| `updated_at`       | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                               | Znacznik czasu ostatniej aktualizacji profilu. |

### `public.flashcards`
Główna tabela przechowująca wszystkie fiszki użytkowników.
- **Relacja:** Wiele:1 z `auth.users`.

| Nazwa kolumny                | Typ danych           | Ograniczenia                                                              | Opis                                                              |
|------------------------------|----------------------|---------------------------------------------------------------------------|-------------------------------------------------------------------|
| `id`                         | `uuid`               | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                                | Unikalny identyfikator fiszki.                                    |
| `user_id`                    | `uuid`               | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`                 | Identyfikator właściciela fiszki.                                 |
| `front`                      | `text`               | `NOT NULL`, `CHECK (length(front) > 0 AND length(front) < 250)`           | Przód fiszki (słowo/fraza w języku angielskim).                   |
| `back`                       | `text`               | `NOT NULL`, `CHECK (length(back) > 0 AND length(back) < 250)`             | Tył fiszki (tłumaczenie w języku polskim).                        |
| `part_of_speech`             | `text`               | `NULL`                                                                    | Część mowy (np. "rzeczownik", "czasownik").                       |
| `ai_generated`               | `boolean`            | `NOT NULL`, `DEFAULT FALSE`                                               | Flaga wskazująca, czy fiszka została wygenerowana przez AI.       |
| `flashcard_language_level`   | `language_level`     | `NULL`                                                                    | Poziom językowy fiszki (obowiązkowy dla AI, opcjonalny dla manualnych). |
| `leitner_box`                | `smallint`           | `NOT NULL`, `DEFAULT 1`, `CHECK (leitner_box > 0)`                        | Numer pudełka w systemie Leitnera (stan powtórki).                |
| `review_due_at`              | `timestamptz`        | `NOT NULL`, `DEFAULT now()`                                               | Data i czas następnej zaplanowanej powtórki.                      |
| `created_at`                 | `timestamptz`        | `NOT NULL`, `DEFAULT now()`                                               | Znacznik czasu utworzenia fiszki.                                 |
| `updated_at`                 | `timestamptz`        | `NOT NULL`, `DEFAULT now()`                                               | Znacznik czasu ostatniej aktualizacji fiszki.                     |

### `public.ai_generation_logs`
Tabela do atomowego śledzenia metryk generowania i importu fiszek przez AI.
- **Relacja:** Wiele:1 z `auth.users`.

| Nazwa kolumny     | Typ danych    | Ograniczenia                                                              | Opis                                                              |
|-------------------|---------------|---------------------------------------------------------------------------|-------------------------------------------------------------------|
| `id`              | `uuid`        | `PRIMARY KEY`, `DEFAULT gen_random_uuid()`                                | Unikalny identyfikator logu.                                      |
| `user_id`         | `uuid`        | `NOT NULL`, `REFERENCES auth.users(id) ON DELETE CASCADE`                 | Identyfikator użytkownika, który wykonał operację.                |
| `generated_count` | `smallint`    | `NOT NULL`, `CHECK (generated_count >= 0)`                                | Liczba fiszek zaproponowanych przez AI w jednej operacji.         |
| `imported_count`  | `smallint`    | `NOT NULL`, `CHECK (imported_count >= 0)`                                 | Liczba fiszek faktycznie zaimportowanych przez użytkownika.       |
| `created_at`      | `timestamptz` | `NOT NULL`, `DEFAULT now()`                                               | Znacznik czasu operacji generowania/importu.                      |

---

## 3. Funkcje i Triggery

### `public.handle_new_user()`
Funkcja triggera, która automatycznie tworzy profil dla nowego użytkownika w `public.profiles`.
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### `public.update_flashcard_review()`
Funkcja hermetyzująca logikę systemu powtórek Leitnera.
```sql
CREATE OR REPLACE FUNCTION public.update_flashcard_review(p_flashcard_id uuid, p_knew_it boolean)
RETURNS void AS $$
DECLARE
  v_current_box smallint;
BEGIN
  SELECT leitner_box INTO v_current_box FROM public.flashcards WHERE id = p_flashcard_id;

  IF p_knew_it THEN
    -- "Wiem" -> przesuń do następnego pudełka
    CASE v_current_box
      WHEN 1 THEN
        UPDATE public.flashcards SET leitner_box = 2, review_due_at = now() + interval '1 day' WHERE id = p_flashcard_id;
      WHEN 2 THEN
        UPDATE public.flashcards SET leitner_box = 3, review_due_at = now() + interval '3 days' WHERE id = p_flashcard_id;
      WHEN 3 THEN
        UPDATE public.flashcards SET leitner_box = 4, review_due_at = now() + interval '7 days' WHERE id = p_flashcard_id;
      WHEN 4 THEN
        UPDATE public.flashcards SET leitner_box = 5, review_due_at = now() + interval '14 days' WHERE id = p_flashcard_id;
      ELSE -- Box 5 i wyżej
        UPDATE public.flashcards SET leitner_box = leitner_box + 1, review_due_at = now() + interval '30 days' WHERE id = p_flashcard_id;
    END CASE;
  ELSE
    -- "Nie wiem" -> cofnij do pierwszego pudełka
    UPDATE public.flashcards SET leitner_box = 1, review_due_at = now() WHERE id = p_flashcard_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Indeksy

### `flashcards_review_session_idx`
Kluczowy indeks do optymalizacji zapytań podczas sesji nauki.
```sql
CREATE INDEX flashcards_review_session_idx ON public.flashcards (user_id, review_due_at, leitner_box);
```

### `flashcards_user_list_idx`
Indeks do szybkiego ładowania listy fiszek użytkownika na stronie "Moje Fiszki".
```sql
CREATE INDEX flashcards_user_list_idx ON public.flashcards (user_id, created_at DESC);
```

---

## 5. Zasady Bezpieczeństwa na Poziomie Wiersza (RLS)

### `public.profiles`
- **Włączenie RLS:** `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`
- **Polityka SELECT:** Użytkownik może odczytać tylko swój własny profil.
  ```sql
  CREATE POLICY "Allow individual user SELECT access" ON public.profiles FOR SELECT USING (auth.uid() = id);
  ```
- **Polityka UPDATE:** Użytkownik może zaktualizować tylko swój własny profil.
  ```sql
  CREATE POLICY "Allow individual user UPDATE access" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  ```

### `public.flashcards`
- **Włączenie RLS:** `ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;`
- **Polityka CRUD:** Użytkownik ma pełny dostęp (CRUD) tylko do swoich fiszek.
  ```sql
  CREATE POLICY "Allow full access to own flashcards" ON public.flashcards FOR ALL USING (auth.uid() = user_id);
  ```

### `public.ai_generation_logs`
- **Włączenie RLS:** `ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;`
- **Polityka INSERT:** Każdy zalogowany użytkownik może dodawać logi powiązane ze swoim kontem.
  ```sql
  CREATE POLICY "Allow individual user INSERT access" ON public.ai_generation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  ```
- **Polityka SELECT (Opcjonalna):** Użytkownik może odczytać tylko swoje logi.
  ```sql
  CREATE POLICY "Allow individual user SELECT access" ON public.ai_generation_logs FOR SELECT USING (auth.uid() = user_id);
  ```

---

## 6. Dodatkowe uwagi
- **Automatyczna aktualizacja `updated_at`:** Zaleca się utworzenie generycznej funkcji triggera, która będzie automatycznie aktualizować kolumnę `updated_at` przy każdej modyfikacji wiersza w tabelach `profiles` i `flashcards`.
- **Klucze obce:** Wszystkie klucze obce (`user_id`, `profiles.id`) używają `ON DELETE CASCADE`, co zapewnia spójność danych i automatyczne usuwanie powiązanych rekordów (profili, fiszek, logów) po usunięciu konta użytkownika z `auth.users`.
- **Normalizacja:** Schemat jest zgodny z 3NF. Denormalizacja nie jest konieczna na tym etapie.
- **Atomowość metryk:** Dedykowana tabela `ai_generation_logs` zapewnia atomowy zapis każdej operacji AI, co jest kluczowe dla dokładności metryk i unika problemów z współbieżnością (race conditions).
