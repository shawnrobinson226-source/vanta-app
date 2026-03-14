PRAGMA foreign_keys = ON;

create table if not exists fractures (
  id text primary key,
  label text not null,
  description text not null,
  signals_json text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists redirects (
  id text primary key,
  label text not null,
  steps_json text not null,
  created_at text not null default (datetime('now'))
);

create table if not exists entries (
  id text primary key,
  trigger text not null,

  fracture_id text not null,
  fracture_label text not null,

  reframe text not null,

  redirect_id text not null,
  redirect_label text not null,
  redirect_steps_json text not null,

  created_at text not null default (datetime('now')),

  foreign key (fracture_id) references fractures(id) on delete restrict on update cascade,
  foreign key (redirect_id) references redirects(id) on delete restrict on update cascade
);

create index if not exists idx_entries_created_at on entries(created_at);
create index if not exists idx_entries_fracture_id on entries(fracture_id);
create index if not exists idx_entries_redirect_id on entries(redirect_id);

create table if not exists state_checks (
  id text primary key,
  clarity integer not null,
  emotional_load integer not null,
  note text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_state_checks_created_at on state_checks(created_at);
create table if not exists state_checks (
  id text primary key,
  clarity integer not null,
  emotional_load integer not null,
  note text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_state_checks_created_at
  on state_checks(created_at);
