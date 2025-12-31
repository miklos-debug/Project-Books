create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('user','admin')) default 'user'
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_id uuid references public.authors(id),
  cover_url text,
  audio_url text,
  summary_json jsonb not null,
  publish_status text not null check (publish_status in ('draft','published')) default 'draft',
  published_at timestamptz,
  reading_time_minutes integer not null default 15
);

create table public.content_category (
  content_id uuid references public.content_items(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  primary key (content_id, category_id)
);

create table public.content_tag (
  content_id uuid references public.content_items(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table public.segments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('new','popular','continue','curated')),
  is_active boolean default true,
  order_index integer default 0
);

create table public.segment_items (
  segment_id uuid references public.segments(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  order_index integer default 0,
  primary key (segment_id, content_id)
);

create table public.user_saves (
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, content_id)
);

create table public.user_progress (
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  reading_percent numeric default 0,
  audio_position_seconds numeric default 0,
  updated_at timestamptz default now(),
  primary key (user_id, content_id)
);

create table public.downloads (
  user_id uuid references auth.users(id) on delete cascade,
  content_id uuid references public.content_items(id) on delete cascade,
  local_path text,
  created_at timestamptz default now(),
  primary key (user_id, content_id)
);

-- views
create view public.content_items_view as
select ci.*, a.name as author_name,
  (select coalesce(count(*),0) from user_saves us where us.content_id = ci.id) as saves_count
from content_items ci
left join authors a on ci.author_id = a.id
where ci.publish_status = 'published';

create view public.user_saves_view as
select ci.*, a.name as author_name, us.user_id
from user_saves us
join content_items ci on ci.id = us.content_id
left join authors a on ci.author_id = a.id;

-- RPC for mobile segments
create or replace function public.get_active_segments()
returns jsonb
language plpgsql
as $$
DECLARE
  result jsonb;
BEGIN
  select jsonb_agg(jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'type', s.type,
    'is_active', s.is_active,
    'order_index', s.order_index,
    'items', case
      when s.type = 'new' then (
        select jsonb_agg(row_to_json(ci)) from content_items_view ci order by coalesce(ci.published_at, now()) desc limit 8
      )
      when s.type = 'popular' then (
        select jsonb_agg(row_to_json(ci)) from content_items_view ci order by ci.saves_count desc limit 8
      )
      when s.type = 'continue' then (
        select jsonb_agg(row_to_json(ci)) from content_items_view ci limit 8
      )
      else (
        select jsonb_agg(row_to_json(ci)) from segment_items si join content_items_view ci on ci.id = si.content_id where si.segment_id = s.id order by si.order_index
      )
    end
  )) into result
  from segments s
  where s.is_active = true
  order by s.order_index;

  return coalesce(result, '[]'::jsonb);
END;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.content_items enable row level security;
alter table public.content_category enable row level security;
alter table public.content_tag enable row level security;
alter table public.segments enable row level security;
alter table public.segment_items enable row level security;
alter table public.user_saves enable row level security;
alter table public.user_progress enable row level security;
alter table public.downloads enable row level security;

-- helper
create or replace function public.is_admin(uid uuid) returns boolean as $$
  select exists(select 1 from profiles p where p.user_id = uid and p.role = 'admin');
$$ language sql stable;

-- policies
create policy "published readable" on public.content_items for select using (publish_status = 'published' or is_admin(auth.uid()));
create policy "admins can manage content" on public.content_items for all using (is_admin(auth.uid()));

create policy "open view" on public.content_items_view for select using (true);

create policy "admins authors" on public.authors for all using (is_admin(auth.uid()));
create policy "admins categories" on public.categories for all using (is_admin(auth.uid()));
create policy "admins tags" on public.tags for all using (is_admin(auth.uid()));

create policy "admins segments" on public.segments for all using (is_admin(auth.uid()));
create policy "admins segment items" on public.segment_items for all using (is_admin(auth.uid()));

create policy "own saves" on public.user_saves for select using (auth.uid() = user_id);
create policy "own saves insert" on public.user_saves for insert with check (auth.uid() = user_id);
create policy "own saves delete" on public.user_saves for delete using (auth.uid() = user_id);

create policy "own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "own progress write" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "own progress update" on public.user_progress for update using (auth.uid() = user_id);

create policy "own downloads" on public.downloads for select using (auth.uid() = user_id);
create policy "own downloads write" on public.downloads for insert with check (auth.uid() = user_id);
create policy "own downloads delete" on public.downloads for delete using (auth.uid() = user_id);
