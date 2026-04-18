-- =============================================================================
-- Meu Álbum 2026 — Schema inicial
-- Projeto: tracker de coleção de figurinhas da Copa 2026
-- Autor: Gustavo Tapajós (RA 177063)
-- =============================================================================
--
-- Este migration cria:
--   1. Tabela `albums`      (1 álbum por usuário autenticado)
--   2. Tabela `stickers`    (figurinhas individuais, vinculadas a um álbum)
--   3. Políticas RLS        (cada usuário só vê/edita o próprio álbum)
--   4. Trigger auth.users   (cria álbum automaticamente ao registrar)
--   5. Função seed          (popula as 980 figurinhas do álbum 2026)
--
-- Executar:
--   - Via SQL Editor no Dashboard do Supabase (copy/paste), OU
--   - Via Supabase CLI: `supabase db push`
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Extensions necessárias
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";


-- -----------------------------------------------------------------------------
-- 2. Tabela: albums
-- -----------------------------------------------------------------------------
create table if not exists public.albums (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique (user_id)   -- 1 álbum por usuário
);

comment on table public.albums is 'Álbum de figurinhas. Um por usuário.';


-- -----------------------------------------------------------------------------
-- 3. Tabela: stickers
-- -----------------------------------------------------------------------------
create table if not exists public.stickers (
  id         uuid primary key default gen_random_uuid(),
  album_id   uuid references public.albums(id) on delete cascade not null,
  code       text    not null,                 -- ex: "BRA1", "FWC3"
  section    text    not null,                 -- ex: "BRA", "FWC"
  section_name text  not null default '',      -- ex: "Brasil", "Símbolos e Estádios"
  qtd        int     not null default 0,
  is_shiny   boolean not null default false,
  updated_at timestamptz default now() not null,
  unique (album_id, code)
);

comment on table public.stickers is 'Figurinhas do álbum. 980 por usuário quando completo.';

create index if not exists stickers_album_id_idx            on public.stickers (album_id);
create index if not exists stickers_album_id_section_idx    on public.stickers (album_id, section);


-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- -----------------------------------------------------------------------------
alter table public.albums   enable row level security;
alter table public.stickers enable row level security;

-- ---- Albums ------------------------------------------------------------------
drop policy if exists "albums: owner can read"   on public.albums;
drop policy if exists "albums: owner can insert" on public.albums;
drop policy if exists "albums: owner can update" on public.albums;
drop policy if exists "albums: owner can delete" on public.albums;

create policy "albums: owner can read"
  on public.albums for select
  using (auth.uid() = user_id);

create policy "albums: owner can insert"
  on public.albums for insert
  with check (auth.uid() = user_id);

create policy "albums: owner can update"
  on public.albums for update
  using (auth.uid() = user_id);

create policy "albums: owner can delete"
  on public.albums for delete
  using (auth.uid() = user_id);


-- ---- Stickers ----------------------------------------------------------------
drop policy if exists "stickers: owner can read"   on public.stickers;
drop policy if exists "stickers: owner can insert" on public.stickers;
drop policy if exists "stickers: owner can update" on public.stickers;
drop policy if exists "stickers: owner can delete" on public.stickers;

create policy "stickers: owner can read"
  on public.stickers for select
  using (
    exists (
      select 1 from public.albums a
      where a.id = stickers.album_id
        and a.user_id = auth.uid()
    )
  );

create policy "stickers: owner can insert"
  on public.stickers for insert
  with check (
    exists (
      select 1 from public.albums a
      where a.id = stickers.album_id
        and a.user_id = auth.uid()
    )
  );

create policy "stickers: owner can update"
  on public.stickers for update
  using (
    exists (
      select 1 from public.albums a
      where a.id = stickers.album_id
        and a.user_id = auth.uid()
    )
  );

create policy "stickers: owner can delete"
  on public.stickers for delete
  using (
    exists (
      select 1 from public.albums a
      where a.id = stickers.album_id
        and a.user_id = auth.uid()
    )
  );


-- -----------------------------------------------------------------------------
-- 5. Seed: gerar as 980 figurinhas de um álbum
-- -----------------------------------------------------------------------------
-- Função que popula um álbum vazio com:
--   • 1 seção FWC (Símbolos e Estádios), 20 figurinhas todas shiny
--   • 48 seleções × 20 figurinhas cada (a #1 de cada seleção é shiny = escudo)
-- -----------------------------------------------------------------------------
create or replace function public.seed_album_stickers(p_album_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  i   int;
begin
  -- Mapeamento código -> nome da seleção
  for rec in
    select * from (values
      ('FWC', 'Símbolos e Estádios'),
      ('MEX', 'México'),            ('RSA', 'África do Sul'),   ('KOR', 'Coreia do Sul'),    ('CZE', 'República Tcheca'),
      ('CAN', 'Canadá'),            ('BIH', 'Bósnia e Herzegovina'), ('QAT', 'Catar'),        ('SUI', 'Suíça'),
      ('BRA', 'Brasil'),            ('MAR', 'Marrocos'),        ('HAI', 'Haiti'),            ('SCO', 'Escócia'),
      ('USA', 'Estados Unidos'),    ('PAR', 'Paraguai'),        ('AUS', 'Austrália'),        ('TUR', 'Turquia'),
      ('GER', 'Alemanha'),          ('CUW', 'Curaçao'),         ('CIV', 'Costa do Marfim'),  ('ECU', 'Equador'),
      ('NED', 'Holanda'),           ('JPN', 'Japão'),           ('SWE', 'Suécia'),           ('TUN', 'Tunísia'),
      ('BEL', 'Bélgica'),           ('EGY', 'Egito'),           ('IRN', 'Irã'),              ('NZL', 'Nova Zelândia'),
      ('ESP', 'Espanha'),           ('CPV', 'Cabo Verde'),      ('KSA', 'Arábia Saudita'),   ('URU', 'Uruguai'),
      ('FRA', 'França'),            ('SEN', 'Senegal'),         ('IRQ', 'Iraque'),           ('NOR', 'Noruega'),
      ('ARG', 'Argentina'),         ('ALG', 'Argélia'),         ('AUT', 'Áustria'),          ('JOR', 'Jordânia'),
      ('POR', 'Portugal'),          ('COD', 'RD Congo'),        ('UZB', 'Uzbequistão'),      ('COL', 'Colômbia'),
      ('ENG', 'Inglaterra'),        ('CRO', 'Croácia'),         ('GHA', 'Gana'),             ('PAN', 'Panamá')
    ) as t(code, section_name)
  loop
    for i in 1..20 loop
      insert into public.stickers (album_id, code, section, section_name, qtd, is_shiny)
      values (
        p_album_id,
        rec.code || i::text,
        rec.code,
        rec.section_name,
        0,
        case
          when rec.code = 'FWC' then true   -- todas da FWC são shiny
          when i = 1            then true   -- #1 de cada seleção é shiny (escudo)
          else false
        end
      )
      on conflict (album_id, code) do nothing;
    end loop;
  end loop;
end;
$$;

comment on function public.seed_album_stickers(uuid) is
  'Popula um álbum com as 980 figurinhas da Copa 2026 (49 seções × 20).';


-- -----------------------------------------------------------------------------
-- 6. Trigger: ao criar um usuário, criar seu álbum (e populá-lo)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_album_id uuid;
begin
  -- cria o álbum vazio
  insert into public.albums (user_id)
  values (new.id)
  returning id into v_album_id;

  -- popula com as 980 figurinhas
  perform public.seed_album_stickers(v_album_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 7. RPC helpers (increment / decrement atômicos)
-- -----------------------------------------------------------------------------
-- Em vez de ler+escrever do cliente (race condition), o app chama um RPC
-- que faz UPDATE ... SET qtd = qtd + 1 atomicamente.
-- RLS continua vigente (o usuário só pode mexer no próprio álbum).
-- -----------------------------------------------------------------------------
create or replace function public.sticker_increment(p_code text)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_qtd int;
begin
  update public.stickers s
     set qtd = s.qtd + 1,
         updated_at = now()
    from public.albums a
   where s.album_id = a.id
     and a.user_id  = auth.uid()
     and s.code     = p_code
  returning s.qtd into v_qtd;

  if v_qtd is null then
    raise exception 'sticker % not found for current user', p_code
      using errcode = 'P0002';
  end if;

  return v_qtd;
end;
$$;

create or replace function public.sticker_decrement(p_code text)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_qtd int;
begin
  update public.stickers s
     set qtd = greatest(s.qtd - 1, 0),
         updated_at = now()
    from public.albums a
   where s.album_id = a.id
     and a.user_id  = auth.uid()
     and s.code     = p_code
  returning s.qtd into v_qtd;

  if v_qtd is null then
    raise exception 'sticker % not found for current user', p_code
      using errcode = 'P0002';
  end if;

  return v_qtd;
end;
$$;

comment on function public.sticker_increment(text) is 'Incrementa qtd de uma figurinha do álbum do usuário autenticado.';
comment on function public.sticker_decrement(text) is 'Decrementa qtd de uma figurinha do álbum do usuário autenticado (mínimo 0).';


-- -----------------------------------------------------------------------------
-- Fim do migration inicial
-- -----------------------------------------------------------------------------
