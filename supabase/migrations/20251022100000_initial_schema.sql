-- Migration: Initial Schema Setup
-- Description: Creates the initial database schema for the 10xCards application,
--              including tables for profiles, flashcards, and AI generation logs.
--              It also sets up custom types, functions, triggers, indexes, and RLS policies.
-- Touched Tables: public.profiles, public.flashcards, public.ai_generation_logs
-- Touched Functions: public.handle_new_user, public.update_flashcard_review
-- Special Notes: This is the foundational migration for the entire application.

-- step 1: create custom enum type for language levels
-- this type ensures that language level data is consistent across the application.
create type public.language_level as enum ('a1', 'a2', 'b1', 'b2', 'c1', 'c2');

-- step 2: create the 'profiles' table
-- this table stores user-specific settings and preferences, linked one-to-one with auth.users.
create table public.profiles (
    id uuid not null primary key references auth.users(id) on delete cascade,
    default_ai_level text not null default 'b2',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- comment on table public.profiles is 'stores user-specific settings and preferences.';

-- step 3: enable row level security on the 'profiles' table
-- rls is enabled to ensure users can only access their own profile data.
alter table public.profiles enable row level security;

-- step 4: create rls policies for the 'profiles' table
-- policies for the 'authenticated' role grant access only to the user's own profile.
-- the 'anon' role is denied all access.

-- policy for select access
create policy "allow authenticated select access on profiles"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "deny anon select access on profiles"
on public.profiles for select
to anon
using (false);

-- policy for update access
create policy "allow authenticated update access on profiles"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "deny anon update access on profiles"
on public.profiles for update
to anon
using (false);

-- insert and delete are not granted as profile creation is handled by a trigger
-- and deletion is cascaded from auth.users.

-- step 5: create the 'flashcards' table
-- this is the core table for storing flashcard data for all users.
create table public.flashcards (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    front text not null check (length(front) > 0 and length(front) < 250),
    back text not null check (length(back) > 0 and length(back) < 250),
    part_of_speech text null,
    ai_generated boolean not null default false,
    flashcard_language_level public.language_level null,
    leitner_box smallint not null default 1 check (leitner_box > 0),
    review_due_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- comment on table public.flashcards is 'stores all user-created and ai-generated flashcards.';

-- step 6: enable row level security on the 'flashcards' table
-- rls ensures that users can only perform crud operations on their own flashcards.
alter table public.flashcards enable row level security;

-- step 7: create rls policies for the 'flashcards' table
-- policies for the 'authenticated' role grant full crud access to their own flashcards.
-- the 'anon' role is denied all access.

-- policy for select access
create policy "allow authenticated select access on flashcards"
on public.flashcards for select
to authenticated
using (auth.uid() = user_id);

create policy "deny anon select access on flashcards"
on public.flashcards for select
to anon
using (false);

-- policy for insert access
create policy "allow authenticated insert access on flashcards"
on public.flashcards for insert
to authenticated
with check (auth.uid() = user_id);

create policy "deny anon insert access on flashcards"
on public.flashcards for insert
to anon
with check (false);

-- policy for update access
create policy "allow authenticated update access on flashcards"
on public.flashcards for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "deny anon update access on flashcards"
on public.flashcards for update
to anon
using (false);

-- policy for delete access
create policy "allow authenticated delete access on flashcards"
on public.flashcards for delete
to authenticated
using (auth.uid() = user_id);

create policy "deny anon delete access on flashcards"
on public.flashcards for delete
to anon
using (false);


-- step 8: create the 'ai_generation_logs' table
-- this table provides atomic tracking of ai generation and import metrics.
create table public.ai_generation_logs (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generated_count smallint not null check (generated_count >= 0),
    imported_count smallint not null check (imported_count >= 0),
    created_at timestamptz not null default now()
);
-- comment on table public.ai_generation_logs is 'atomically tracks metrics for ai-generated flashcards.';

-- step 9: enable row level security on the 'ai_generation_logs' table
-- rls ensures users can only insert and view their own generation logs.
alter table public.ai_generation_logs enable row level security;

-- step 10: create rls policies for the 'ai_generation_logs' table
-- policies for the 'authenticated' role allow inserting and selecting their own logs.
-- the 'anon' role is denied all access.

-- policy for select access
create policy "allow authenticated select access on ai_generation_logs"
on public.ai_generation_logs for select
to authenticated
using (auth.uid() = user_id);

create policy "deny anon select access on ai_generation_logs"
on public.ai_generation_logs for select
to anon
using (false);

-- policy for insert access
create policy "allow authenticated insert access on ai_generation_logs"
on public.ai_generation_logs for insert
to authenticated
with check (auth.uid() = user_id);

create policy "deny anon insert access on ai_generation_logs"
on public.ai_generation_logs for insert
to anon
with check (false);

-- update and delete are not granted for this log table to maintain data integrity.

-- step 11: create function and trigger to handle new user profile creation
-- this function automatically creates a corresponding profile in public.profiles when a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- the trigger is fired after a new user is inserted into auth.users.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- step 12: create function to handle flashcard review logic
-- this function encapsulates the leitner spaced repetition system logic.
create or replace function public.update_flashcard_review(p_flashcard_id uuid, p_knew_it boolean)
returns void as $$
declare
  v_current_box smallint;
begin
  -- get the current leitner box of the flashcard
  select leitner_box into v_current_box from public.flashcards where id = p_flashcard_id and user_id = auth.uid();

  if v_current_box is null then
    -- exit if the flashcard doesn't exist or doesn't belong to the user
    return;
  end if;

  if p_knew_it then
    -- "wiem" -> advance the card to the next box and set the next review date.
    case v_current_box
      when 1 then
        update public.flashcards set leitner_box = 2, review_due_at = now() + interval '1 day' where id = p_flashcard_id;
      when 2 then
        update public.flashcards set leitner_box = 3, review_due_at = now() + interval '3 days' where id = p_flashcard_id;
      when 3 then
        update public.flashcards set leitner_box = 4, review_due_at = now() + interval '7 days' where id = p_flashcard_id;
      when 4 then
        update public.flashcards set leitner_box = 5, review_due_at = now() + interval '14 days' where id = p_flashcard_id;
      else -- box 5 and above
        update public.flashcards set leitner_box = leitner_box + 1, review_due_at = now() + interval '30 days' where id = p_flashcard_id;
    end case;
  else
    -- "nie wiem" -> reset the card to the first box, due for review immediately.
    update public.flashcards set leitner_box = 1, review_due_at = now() where id = p_flashcard_id;
  end if;
end;
$$ language plpgsql;

-- step 13: create indexes for performance optimization
-- this index is critical for efficiently fetching flashcards during a review session.
create index flashcards_review_session_idx on public.flashcards (user_id, review_due_at, leitner_box);

-- this index speeds up loading the user's list of flashcards on the "my flashcards" page.
create index flashcards_user_list_idx on public.flashcards (user_id, created_at desc);
