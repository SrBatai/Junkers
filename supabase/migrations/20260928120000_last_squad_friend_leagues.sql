-- Last Squad: friend leagues with their own accounts.
--
-- Lives in a shared Supabase project, so everything is prefixed `ls_` and it does NOT use
-- Supabase Auth (auth.users has a trigger that belongs to another app). Accounts, sessions
-- and game data are only reachable through the SECURITY DEFINER functions below: the
-- tables have RLS enabled and no policies, and table privileges are revoked from the API
-- roles.

-- ------------------------------------------------------------------ tables

create table public.ls_accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint ls_accounts_username_format check (username ~ '^[A-Za-z0-9_.-]{3,18}$')
);
create unique index ls_accounts_username_key on public.ls_accounts (lower(username));

create table public.ls_sessions (
  token_hash text primary key,
  account_id uuid not null references public.ls_accounts (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create index ls_sessions_account_idx on public.ls_sessions (account_id);

create table public.ls_leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 32),
  owner_id uuid not null references public.ls_accounts (id) on delete cascade,
  invite_code text not null unique,
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  round int not null default 0,
  ending text check (ending in ('solo', 'split', 'wipeout')),
  created_at timestamptz not null default now()
);
create index ls_leagues_owner_idx on public.ls_leagues (owner_id);

create table public.ls_members (
  league_id uuid not null references public.ls_leagues (id) on delete cascade,
  account_id uuid not null references public.ls_accounts (id) on delete cascade,
  joined_at timestamptz not null default now(),
  out_round int,
  rebuy_used boolean not null default false,
  winner boolean not null default false,
  primary key (league_id, account_id)
);
create index ls_members_account_idx on public.ls_members (account_id);

create table public.ls_rounds (
  league_id uuid not null references public.ls_leagues (id) on delete cascade,
  round int not null check (round between 1 and 6),
  matches jsonb not null,
  results jsonb,
  resolved_at timestamptz,
  primary key (league_id, round)
);

create table public.ls_picks (
  league_id uuid not null,
  round int not null,
  account_id uuid not null,
  team_id text not null,
  survived boolean,
  created_at timestamptz not null default now(),
  primary key (league_id, round, account_id),
  foreign key (league_id, round) references public.ls_rounds (league_id, round) on delete cascade,
  foreign key (league_id, account_id) references public.ls_members (league_id, account_id) on delete cascade
);
create index ls_picks_member_idx on public.ls_picks (league_id, account_id);

alter table public.ls_accounts enable row level security;
alter table public.ls_sessions enable row level security;
alter table public.ls_leagues enable row level security;
alter table public.ls_members enable row level security;
alter table public.ls_rounds enable row level security;
alter table public.ls_picks enable row level security;

revoke all on public.ls_accounts, public.ls_sessions, public.ls_leagues, public.ls_members,
  public.ls_rounds, public.ls_picks from anon, authenticated;

comment on table public.ls_accounts is 'Last Squad: cuentas propias (independientes de auth.users). Acceso solo via funciones ls_*.';

-- ------------------------------------------------------------------ helpers (not exposed)

create function public.ls_account_for(p_token text)
returns uuid
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare v_account uuid;
begin
  select account_id into v_account
  from ls_sessions
  where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and expires_at > now();
  if v_account is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;
  return v_account;
end $$;

create function public.ls_new_session(p_account uuid)
returns text
language plpgsql security definer
set search_path = public, extensions
as $$
declare v_token text := encode(gen_random_bytes(32), 'hex');
begin
  delete from ls_sessions where account_id = p_account and expires_at <= now();
  insert into ls_sessions (token_hash, account_id)
  values (encode(digest(v_token, 'sha256'), 'hex'), p_account);
  return v_token;
end $$;

create function public.ls_require_member(p_league uuid, p_account uuid)
returns void
language plpgsql stable security definer
set search_path = public
as $$
begin
  if not exists (select 1 from ls_members where league_id = p_league and account_id = p_account) then
    raise exception 'not_member' using errcode = '42501';
  end if;
end $$;

create function public.ls_require_owner(p_league uuid, p_account uuid)
returns ls_leagues
language plpgsql security definer
set search_path = public
as $$
declare v_league ls_leagues;
begin
  select * into v_league from ls_leagues where id = p_league for update;
  if v_league.id is null then
    raise exception 'league_not_found' using errcode = 'P0002';
  end if;
  if v_league.owner_id <> p_account then
    raise exception 'not_owner' using errcode = '42501';
  end if;
  return v_league;
end $$;

-- ------------------------------------------------------------------ accounts

create function public.ls_sign_up(p_username text, p_password text)
returns json
language plpgsql security definer
set search_path = public, extensions
as $$
declare v_id uuid;
begin
  if p_username !~ '^[A-Za-z0-9_.-]{3,18}$' then
    raise exception 'invalid_username' using errcode = '22023';
  end if;
  if char_length(coalesce(p_password, '')) not between 6 and 72 then
    raise exception 'invalid_password' using errcode = '22023';
  end if;
  if exists (select 1 from ls_accounts where lower(username) = lower(p_username)) then
    raise exception 'username_taken' using errcode = '23505';
  end if;
  insert into ls_accounts (username, password_hash)
  values (p_username, crypt(p_password, gen_salt('bf', 10)))
  returning id into v_id;
  return json_build_object('token', ls_new_session(v_id), 'username', p_username);
end $$;

create function public.ls_sign_in(p_username text, p_password text)
returns json
language plpgsql security definer
set search_path = public, extensions
as $$
declare v_account ls_accounts;
begin
  select * into v_account from ls_accounts where lower(username) = lower(p_username);
  if v_account.id is null or v_account.password_hash <> crypt(coalesce(p_password, ''), v_account.password_hash) then
    raise exception 'invalid_credentials' using errcode = '28P01';
  end if;
  return json_build_object('token', ls_new_session(v_account.id), 'username', v_account.username);
end $$;

create function public.ls_sign_out(p_token text)
returns void
language sql security definer
set search_path = public, extensions
as $$
  delete from ls_sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

create function public.ls_me(p_token text)
returns json
language sql stable security definer
set search_path = public, extensions
as $$
  select json_build_object('id', a.id, 'username', a.username)
  from ls_sessions s join ls_accounts a on a.id = s.account_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.expires_at > now();
$$;

-- ------------------------------------------------------------------ leagues

create function public.ls_create_league(p_token text, p_name text)
returns uuid
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_code text;
  v_id uuid;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if char_length(trim(coalesce(p_name, ''))) not between 2 and 32 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if (select count(*) from ls_leagues where owner_id = v_account and status <> 'finished') >= 10 then
    raise exception 'too_many_leagues' using errcode = '54000';
  end if;
  loop
    select string_agg(substr(v_alphabet, 1 + (get_byte(b, i) % 32), 1), '')
      into v_code
      from (select gen_random_bytes(6) as b) r, generate_series(0, 5) i;
    exit when not exists (select 1 from ls_leagues where invite_code = v_code);
  end loop;
  insert into ls_leagues (name, owner_id, invite_code)
  values (trim(p_name), v_account, v_code)
  returning id into v_id;
  insert into ls_members (league_id, account_id) values (v_id, v_account);
  return v_id;
end $$;

create function public.ls_join_league(p_token text, p_code text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_league ls_leagues;
begin
  select * into v_league from ls_leagues where invite_code = upper(trim(p_code)) for update;
  if v_league.id is null then
    raise exception 'league_not_found' using errcode = 'P0002';
  end if;
  if exists (select 1 from ls_members where league_id = v_league.id and account_id = v_account) then
    return v_league.id;
  end if;
  if v_league.status <> 'lobby' then
    raise exception 'league_started' using errcode = '55000';
  end if;
  if (select count(*) from ls_members where league_id = v_league.id) >= 24 then
    raise exception 'league_full' using errcode = '54000';
  end if;
  insert into ls_members (league_id, account_id) values (v_league.id, v_account);
  return v_league.id;
end $$;

create function public.ls_leave_league(p_token text, p_league uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_league ls_leagues;
begin
  select * into v_league from ls_leagues where id = p_league for update;
  if v_league.id is null then
    raise exception 'league_not_found' using errcode = 'P0002';
  end if;
  if v_league.owner_id = v_account then
    delete from ls_leagues where id = p_league;
  elsif v_league.status = 'lobby' then
    delete from ls_members where league_id = p_league and account_id = v_account;
  else
    raise exception 'league_started' using errcode = '55000';
  end if;
end $$;

create function public.ls_my_leagues(p_token text)
returns json
language plpgsql stable security definer
set search_path = public
as $$
declare v_account uuid := ls_account_for(p_token);
begin
  return coalesce((
    select json_agg(row_to_json(t) order by t.created_at desc)
    from (
      select l.id, l.name, l.status, l.round, l.ending, l.created_at,
             l.owner_id = v_account as is_owner,
             m.out_round, m.winner,
             (select count(*) from ls_members x where x.league_id = l.id) as members,
             (select count(*) from ls_members x where x.league_id = l.id and x.out_round is null) as alive
      from ls_members m join ls_leagues l on l.id = m.league_id
      where m.account_id = v_account
    ) t
  ), '[]'::json);
end $$;

create function public.ls_league_state(p_token text, p_league uuid)
returns json
language plpgsql stable security definer
set search_path = public
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_league ls_leagues;
begin
  perform ls_require_member(p_league, v_account);
  select * into v_league from ls_leagues where id = p_league;
  return json_build_object(
    'league', json_build_object(
      'id', v_league.id, 'name', v_league.name, 'status', v_league.status, 'round', v_league.round,
      'ending', v_league.ending, 'invite_code', v_league.invite_code,
      'is_owner', v_league.owner_id = v_account, 'owner_id', v_league.owner_id
    ),
    'me', v_account,
    'members', coalesce((
      select json_agg(json_build_object(
        'id', a.id, 'username', a.username, 'out_round', m.out_round, 'rebuy_used', m.rebuy_used,
        'winner', m.winner,
        'picked', exists (select 1 from ls_picks p where p.league_id = m.league_id
                          and p.account_id = m.account_id and p.round = v_league.round),
        -- Other players' picks stay hidden until their round is resolved.
        'picks', coalesce((
          select json_agg(json_build_object('round', p.round, 'team_id', p.team_id, 'survived', p.survived)
                          order by p.round)
          from ls_picks p join ls_rounds r on r.league_id = p.league_id and r.round = p.round
          where p.league_id = m.league_id and p.account_id = m.account_id
            and (r.results is not null or p.account_id = v_account)
        ), '[]'::json)
      ) order by m.joined_at)
      from ls_members m join ls_accounts a on a.id = m.account_id
      where m.league_id = p_league
    ), '[]'::json),
    'current', (
      select json_build_object('round', r.round, 'matches', r.matches, 'results', r.results)
      from ls_rounds r where r.league_id = p_league and r.round = v_league.round
    )
  );
end $$;

-- ------------------------------------------------------------------ game flow

create function public.ls_start_league(p_token text, p_league uuid, p_matches jsonb)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v_league ls_leagues := ls_require_owner(p_league, ls_account_for(p_token));
begin
  if v_league.status <> 'lobby' then
    raise exception 'league_started' using errcode = '55000';
  end if;
  if (select count(*) from ls_members where league_id = p_league) < 2 then
    raise exception 'not_enough_players' using errcode = '55000';
  end if;
  if jsonb_typeof(p_matches) <> 'array' or jsonb_array_length(p_matches) = 0 then
    raise exception 'invalid_matches' using errcode = '22023';
  end if;
  insert into ls_rounds (league_id, round, matches) values (p_league, 1, p_matches);
  update ls_leagues set status = 'playing', round = 1 where id = p_league;
end $$;

create function public.ls_submit_pick(p_token text, p_league uuid, p_team text)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_league ls_leagues;
  v_round ls_rounds;
begin
  perform ls_require_member(p_league, v_account);
  select * into v_league from ls_leagues where id = p_league;
  if v_league.status <> 'playing' then
    raise exception 'league_not_playing' using errcode = '55000';
  end if;
  select * into v_round from ls_rounds where league_id = p_league and round = v_league.round;
  if v_round.results is not null then
    raise exception 'round_closed' using errcode = '55000';
  end if;
  if (select out_round from ls_members where league_id = p_league and account_id = v_account) is not null then
    raise exception 'eliminated' using errcode = '55000';
  end if;
  if not exists (
    select 1 from jsonb_array_elements(v_round.matches) m, jsonb_array_elements_text(m -> 'teams') t
    where t = p_team
  ) then
    raise exception 'invalid_team' using errcode = '22023';
  end if;
  if exists (
    select 1 from ls_picks
    where league_id = p_league and account_id = v_account and team_id = p_team and round < v_league.round
  ) then
    raise exception 'team_used' using errcode = '23505';
  end if;
  insert into ls_picks (league_id, round, account_id, team_id)
  values (p_league, v_league.round, v_account, p_team)
  on conflict (league_id, round, account_id) do update set team_id = excluded.team_id, created_at = now();
end $$;

-- Results are simulated by the app server and sent by the league owner. They are
-- validated against the round's matches; survival is decided here.
create function public.ls_resolve_round(p_token text, p_league uuid, p_results jsonb)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_league ls_leagues := ls_require_owner(p_league, ls_account_for(p_token));
  v_round ls_rounds;
  v_alive_before int;
  v_alive_after int;
  v_ending text;
begin
  if v_league.status <> 'playing' then
    raise exception 'league_not_playing' using errcode = '55000';
  end if;
  select * into v_round from ls_rounds where league_id = p_league and round = v_league.round for update;
  if v_round.results is not null then
    raise exception 'round_closed' using errcode = '55000';
  end if;
  if jsonb_typeof(p_results) <> 'array' or jsonb_array_length(p_results) <> jsonb_array_length(v_round.matches)
     or exists (
       select 1
       from jsonb_array_elements(v_round.matches) with ordinality m(match, i)
       join jsonb_array_elements(p_results) with ordinality r(result, j) on i = j
       where r.result ->> 'mode' is distinct from m.match ->> 'mode'
          or (select array_agg(x order by x) from jsonb_array_elements_text(r.result -> 'order') x)
             is distinct from
             (select array_agg(x order by x) from jsonb_array_elements_text(m.match -> 'teams') x)
     ) then
    raise exception 'invalid_results' using errcode = '22023';
  end if;

  select count(*) into v_alive_before from ls_members where league_id = p_league and out_round is null;

  -- Survival for every pick of the round.
  update ls_picks p set survived = (
    select case r.result ->> 'mode'
             when 'cashout' then e.ord <= 2
             else e.ord = 1
           end
    from jsonb_array_elements(p_results) r(result),
         jsonb_array_elements_text(r.result -> 'order') with ordinality e(team, ord)
    where e.team = p.team_id
    limit 1
  )
  where p.league_id = p_league and p.round = v_league.round;

  -- Alive players who lost, or who did not pick, are out.
  update ls_members m set out_round = v_league.round
  where m.league_id = p_league and m.out_round is null
    and not exists (
      select 1 from ls_picks p
      where p.league_id = m.league_id and p.account_id = m.account_id
        and p.round = v_league.round and p.survived
    );

  update ls_rounds set results = p_results, resolved_at = now()
  where league_id = p_league and round = v_league.round;

  select count(*) into v_alive_after from ls_members where league_id = p_league and out_round is null;

  if v_alive_after = 0 then
    v_ending := 'wipeout';
  elsif v_alive_after = 1 and v_alive_before > 1 then
    v_ending := 'solo';
  elsif v_league.round >= 6 then
    v_ending := case when v_alive_after = 1 then 'solo' else 'split' end;
  end if;

  if v_ending is not null then
    update ls_members set winner = true where league_id = p_league and out_round is null;
    update ls_leagues set status = 'finished', ending = v_ending where id = p_league;
  end if;
end $$;

create function public.ls_next_round(p_token text, p_league uuid, p_matches jsonb)
returns void
language plpgsql security definer
set search_path = public
as $$
declare v_league ls_leagues := ls_require_owner(p_league, ls_account_for(p_token));
begin
  if v_league.status <> 'playing' then
    raise exception 'league_not_playing' using errcode = '55000';
  end if;
  if not exists (select 1 from ls_rounds where league_id = p_league and round = v_league.round and results is not null) then
    raise exception 'round_open' using errcode = '55000';
  end if;
  if v_league.round >= 6 then
    raise exception 'no_more_rounds' using errcode = '55000';
  end if;
  if jsonb_typeof(p_matches) <> 'array' or jsonb_array_length(p_matches) = 0 then
    raise exception 'invalid_matches' using errcode = '22023';
  end if;
  insert into ls_rounds (league_id, round, matches) values (p_league, v_league.round + 1, p_matches);
  update ls_leagues set round = v_league.round + 1 where id = p_league;
end $$;

-- Premium "reenganche": once per league, right after falling, while the round is still on screen.
create function public.ls_use_rebuy(p_token text, p_league uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_account uuid := ls_account_for(p_token);
  v_league ls_leagues;
  v_member ls_members;
begin
  perform ls_require_member(p_league, v_account);
  select * into v_league from ls_leagues where id = p_league;
  select * into v_member from ls_members where league_id = p_league and account_id = v_account for update;
  if v_league.status <> 'playing' or v_league.round >= 6
     or v_member.rebuy_used or v_member.out_round is distinct from v_league.round
     or not exists (select 1 from ls_rounds where league_id = p_league and round = v_league.round and results is not null) then
    raise exception 'rebuy_unavailable' using errcode = '55000';
  end if;
  update ls_members set out_round = null, rebuy_used = true
  where league_id = p_league and account_id = v_account;
end $$;

-- ------------------------------------------------------------------ privileges

revoke all on function
  public.ls_account_for(text), public.ls_new_session(uuid),
  public.ls_require_member(uuid, uuid), public.ls_require_owner(uuid, uuid)
from public, anon, authenticated;

revoke all on function
  public.ls_sign_up(text, text), public.ls_sign_in(text, text), public.ls_sign_out(text),
  public.ls_me(text), public.ls_create_league(text, text), public.ls_join_league(text, text),
  public.ls_leave_league(text, uuid), public.ls_my_leagues(text), public.ls_league_state(text, uuid),
  public.ls_start_league(text, uuid, jsonb), public.ls_submit_pick(text, uuid, text),
  public.ls_resolve_round(text, uuid, jsonb), public.ls_next_round(text, uuid, jsonb),
  public.ls_use_rebuy(text, uuid)
from public;

grant execute on function
  public.ls_sign_up(text, text), public.ls_sign_in(text, text), public.ls_sign_out(text),
  public.ls_me(text), public.ls_create_league(text, text), public.ls_join_league(text, text),
  public.ls_leave_league(text, uuid), public.ls_my_leagues(text), public.ls_league_state(text, uuid),
  public.ls_start_league(text, uuid, jsonb), public.ls_submit_pick(text, uuid, text),
  public.ls_resolve_round(text, uuid, jsonb), public.ls_next_round(text, uuid, jsonb),
  public.ls_use_rebuy(text, uuid)
to anon, authenticated;
