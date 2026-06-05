create table if not exists public.torneo_fases (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null unique,
  fase_activa text not null check (fase_activa in ('INSCRIPCION', 'GRUPOS', 'BRACKET')),
  fase_orden integer not null default 1,
  config jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.torneo_grupos (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null,
  fase text not null check (fase in ('GRUPOS')),
  grupo_codigo text not null,
  nombre text,
  max_equipos integer not null default 4,
  creado_en timestamptz not null default now()
);

create index if not exists torneo_grupos_torneo_fase_idx
  on public.torneo_grupos (torneo_id, fase);

create table if not exists public.torneo_grupo_puntajes (
  id uuid primary key default gen_random_uuid(),
  torneo_id text not null,
  grupo_id uuid not null references public.torneo_grupos(id) on delete cascade,
  equipo_id text not null,
  puntos integer not null default 0,
  partidos_jugados integer not null default 0,
  ganados integer not null default 0,
  perdidos integer not null default 0,
  empatados integer not null default 0,
  diferencia integer not null default 0,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (grupo_id, equipo_id)
);

create index if not exists torneo_grupo_puntajes_grupo_idx
  on public.torneo_grupo_puntajes (grupo_id);
