-- ============================================================================
-- Academic Hub - Supabase schema + Row Level Security
-- Apply with: supabase db push   (after supabase login + supabase link)
-- Or paste into the Supabase SQL Editor.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILES (one row per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  role text,
  department text,
  bio text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 2. POSTS (feed)
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = author_id);

create policy "Authors can update their own posts"
  on public.posts for update using (auth.uid() = author_id);

create policy "Authors can delete their own posts"
  on public.posts for delete using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- 3. POST LIKES
-- ---------------------------------------------------------------------------
create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Likes are viewable by everyone"
  on public.post_likes for select using (true);

create policy "Users can like posts"
  on public.post_likes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own likes"
  on public.post_likes for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. POST COMMENTS
-- ---------------------------------------------------------------------------
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.post_comments for select using (true);

create policy "Authenticated users can comment"
  on public.post_comments for insert with check (auth.uid() = author_id);

create policy "Authors can delete their own comments"
  on public.post_comments for delete using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- 5. PROJECTS
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'Planning'
    check (status in ('Active', 'Completed', 'Planning')),
  progress int not null default 0 check (progress between 0 and 100),
  category text,
  image_url text,
  technologies text[] not null default '{}',
  views int not null default 0,
  start_date date,
  end_date date,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Projects are viewable by everyone"
  on public.projects for select using (true);

create policy "Authenticated users can create projects"
  on public.projects for insert with check (auth.uid() = owner_id);

create policy "Owners can update their projects"
  on public.projects for update using (auth.uid() = owner_id);

create policy "Owners can delete their projects"
  on public.projects for delete using (auth.uid() = owner_id);

-- ---------------------------------------------------------------------------
-- 6. PROJECT MEMBERS
-- ---------------------------------------------------------------------------
create table if not exists public.project_members (
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'Member',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.project_members enable row level security;

create policy "Project members are viewable by everyone"
  on public.project_members for select using (true);

create policy "Users can join projects"
  on public.project_members for insert with check (auth.uid() = user_id);

create policy "Users can leave projects"
  on public.project_members for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 7. COMMUNITIES
-- ---------------------------------------------------------------------------
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  image_url text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy "Communities are viewable by everyone"
  on public.communities for select using (true);

create policy "Authenticated users can create communities"
  on public.communities for insert with check (auth.uid() = created_by);

create policy "Creators can update their communities"
  on public.communities for update using (auth.uid() = created_by);

create policy "Creators can delete their communities"
  on public.communities for delete using (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 8. COMMUNITY MEMBERS
-- ---------------------------------------------------------------------------
create table if not exists public.community_members (
  community_id uuid not null references public.communities (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'Member',
  created_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

alter table public.community_members enable row level security;

create policy "Community members are viewable by everyone"
  on public.community_members for select using (true);

create policy "Users can join communities"
  on public.community_members for insert with check (auth.uid() = user_id);

create policy "Users can leave communities"
  on public.community_members for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 9. DISCUSSIONS (community threads)
-- ---------------------------------------------------------------------------
create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  content text,
  created_at timestamptz not null default now()
);

alter table public.discussions enable row level security;

create policy "Discussions are viewable by everyone"
  on public.discussions for select using (true);

create policy "Authenticated users can create discussions"
  on public.discussions for insert with check (auth.uid() = author_id);

create policy "Authors can update their discussions"
  on public.discussions for update using (auth.uid() = author_id);

create policy "Authors can delete their discussions"
  on public.discussions for delete using (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- 10. MESSAGES (1-to-1 chat)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can read their own conversations"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

create policy "Users can update their received messages"
  on public.messages for update
  using (auth.uid() = recipient_id);

-- ---------------------------------------------------------------------------
-- 11. Realtime (chat + feed live updates)
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.posts;

-- ---------------------------------------------------------------------------
-- 12. Seed a few sample rows once you are authenticated (optional).
--     Replace <YOUR_USER_ID> with the id shown in Authentication > Users.
-- ---------------------------------------------------------------------------
-- insert into public.projects (title, description, owner_id, status, progress, category, technologies)
-- values ('AI Study Assistant', 'ML platform for personalized learning.', '<YOUR_USER_ID>', 'Active', 75, 'Artificial Intelligence', '{Angular,AWS,Python}');
