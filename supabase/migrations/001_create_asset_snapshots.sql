create table asset_snapshots (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null,
  snapshot_month        date        not null,
  cash_amount           integer     not null default 0,
  investment_trust_amount integer   not null default 0,
  stock_amount          integer     not null default 0,
  buying_power_amount   integer     not null default 0,
  other_amount          integer     not null default 0,
  total_amount          integer     not null default 0,
  memo                  text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint asset_snapshots_user_month_unique unique (user_id, snapshot_month)
);

-- RLS
alter table asset_snapshots enable row level security;

create policy "Users can select own snapshots"
  on asset_snapshots for select
  using (user_id = auth.uid());

create policy "Users can insert own snapshots"
  on asset_snapshots for insert
  with check (user_id = auth.uid());

create policy "Users can update own snapshots"
  on asset_snapshots for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own snapshots"
  on asset_snapshots for delete
  using (user_id = auth.uid());

-- updated_at を自動更新するトリガー
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger asset_snapshots_set_updated_at
  before update on asset_snapshots
  for each row execute function set_updated_at();
