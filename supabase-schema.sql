-- Run once in the Supabase SQL Editor. Browser clients have no direct table access.
create table if not exists public.raven_comments (
 id uuid primary key default gen_random_uuid(), parent_id uuid references public.raven_comments(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 2 and 60),
 body text not null check (char_length(body) between 10 and 2000), ward_id text check (ward_id is null or ward_id ~ '^ward-([1-9][0-9]?|[12][0-9]{2}|300)$'),
 status text not null default 'published' check (status in ('published','hidden')),
 created_at timestamptz not null default clock_timestamp()
);
create index if not exists raven_comments_feed on public.raven_comments (ward_id, created_at desc) where status='published';
create index if not exists raven_comments_replies on public.raven_comments (parent_id,created_at);
alter table public.raven_comments enable row level security;
revoke all on public.raven_comments from anon,authenticated;
grant all on public.raven_comments to service_role;
create table if not exists public.raven_rate_limits (key text primary key,hour timestamptz not null,hits integer not null);
alter table public.raven_rate_limits enable row level security;
revoke all on public.raven_rate_limits from anon,authenticated;
grant all on public.raven_rate_limits to service_role;
create or replace function public.raven_consume_rate(p_key text,p_limit integer)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer; current_hour timestamptz:=date_trunc('hour',clock_timestamp());
begin
 if length(p_key)<>64 or p_limit<1 or p_limit>10 then return false;end if;
 insert into public.raven_rate_limits(key,hour,hits) values(p_key,current_hour,1)
 on conflict(key) do update set hour=current_hour,hits=case when raven_rate_limits.hour=current_hour then raven_rate_limits.hits+1 else 1 end returning hits into n;
 return n<=p_limit;
end;$$;
revoke all on function public.raven_consume_rate(text,integer) from public,anon,authenticated;
grant execute on function public.raven_consume_rate(text,integer) to service_role;
-- Moderation: set status='hidden' in the Table Editor to remove a comment publicly.
-- Retention: periodically remove rate-limit rows older than 48 hours.
