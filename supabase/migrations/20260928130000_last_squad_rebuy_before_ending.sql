-- Last Squad: players who just fell and still have their rebuy get the chance to use it
-- before the league is declared over. The ending is decided when the next round opens.

create or replace function public.ls_resolve_round(p_token text, p_league uuid, p_results jsonb)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_league ls_leagues := ls_require_owner(p_league, ls_account_for(p_token));
  v_round ls_rounds;
  v_alive_before int;
  v_alive_after int;
  v_pending_rebuys int;
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
  select count(*) into v_pending_rebuys from ls_members
  where league_id = p_league and out_round = v_league.round and not rebuy_used and v_league.round < 6;

  if v_league.round >= 6 then
    v_ending := case v_alive_after when 0 then 'wipeout' when 1 then 'solo' else 'split' end;
  elsif v_pending_rebuys = 0 and v_alive_after = 0 then
    v_ending := 'wipeout';
  elsif v_pending_rebuys = 0 and v_alive_after = 1 and v_alive_before > 1 then
    v_ending := 'solo';
  end if;

  if v_ending is not null then
    update ls_members set winner = true where league_id = p_league and out_round is null;
    update ls_leagues set status = 'finished', ending = v_ending where id = p_league;
  end if;
end $$;

create or replace function public.ls_next_round(p_token text, p_league uuid, p_matches jsonb)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_league ls_leagues := ls_require_owner(p_league, ls_account_for(p_token));
  v_alive int;
begin
  if v_league.status <> 'playing' then
    raise exception 'league_not_playing' using errcode = '55000';
  end if;
  if not exists (select 1 from ls_rounds where league_id = p_league and round = v_league.round and results is not null) then
    raise exception 'round_open' using errcode = '55000';
  end if;

  -- Rebuy window is over: settle a league that was waiting on it.
  select count(*) into v_alive from ls_members where league_id = p_league and out_round is null;
  if v_alive <= 1 then
    update ls_members set winner = true where league_id = p_league and out_round is null;
    update ls_leagues set status = 'finished', ending = case when v_alive = 0 then 'wipeout' else 'solo' end
    where id = p_league;
    return;
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

revoke all on function public.ls_resolve_round(text, uuid, jsonb), public.ls_next_round(text, uuid, jsonb) from public;
grant execute on function public.ls_resolve_round(text, uuid, jsonb), public.ls_next_round(text, uuid, jsonb)
  to anon, authenticated;
