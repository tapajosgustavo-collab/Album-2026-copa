# 🔧 Backend — Setup Supabase

Este documento explica como configurar o backend de produção do **Meu Álbum 2026** usando Supabase (Postgres + Auth).

> Os arquivos Flask (`api.py`, `backend.py`) continuam no repo como modo dev opcional — você pode continuar usando localmente enquanto testa.

---

## 📋 Pré-requisitos

- Conta gratuita no Supabase: https://supabase.com
- Node.js v18+ (para o app mobile)
- (Opcional) Supabase CLI: https://supabase.com/docs/guides/cli

---

## 🛠️ Passo a passo

### 1. Criar projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em **New project**
3. Nome: `meu-album-2026`
4. Database password: gere uma senha forte e **salve** (vai precisar)
5. Region: **South America (São Paulo)** (latência menor)
6. Clique em **Create new project** e aguarde ~2 min

### 2. Anotar as credenciais

Após criar, vá em **Settings → API** e copie:

- **Project URL** → usar em `EXPO_PUBLIC_SUPABASE_URL`
- **anon public key** → usar em `EXPO_PUBLIC_SUPABASE_ANON_KEY`

> A anon key é pública por design e pode ir no bundle do app — a segurança é garantida pelas políticas RLS.

### 3. Rodar a migration

**Opção A — pelo Dashboard (mais rápido):**
1. Vá em **SQL Editor** → **New query**
2. Abra `supabase/migrations/20260417000000_init.sql` localmente
3. Copie todo o conteúdo, cole no editor do Dashboard
4. Clique em **Run** (Ctrl+Enter)
5. Deve ver `Success. No rows returned` após cada bloco

**Opção B — via CLI:**
```bash
npx supabase login
npx supabase link --project-ref SEU-PROJETO-REF
npx supabase db push
```

### 4. Configurar autenticação

No Dashboard:

1. **Authentication → Providers**
2. **Email** (habilitado por padrão) — ative **"Confirm email"** se quiser validação por e-mail (recomendado pra produção)
3. (Opcional) **Google OAuth**:
   - Criar credencial no Google Cloud Console
   - Copiar Client ID e Client Secret
   - Adicionar redirect URI do Supabase

### 5. Configurar o app mobile

```bash
cd AlbumApp
cp .env.example .env
# abra .env e preencha com a URL e anon key do passo 2
```

Instale as novas dependências:

```bash
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

### 6. Testar

```bash
cd AlbumApp
npx expo start
```

Ao abrir o app:
1. Você deve ver a tela de login
2. Clique em **"Criar uma"** e faça signup com um e-mail real
3. (Se validação estiver ligada) confirme o e-mail
4. Faça login
5. O álbum deve aparecer vazio (980 figurinhas com qtd=0)

No Supabase Dashboard → **Table Editor** → **stickers**, você deve ver 980 linhas criadas automaticamente pela trigger.

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────┐
│            App Mobile (Expo)             │
│                                          │
│  AuthProvider                            │
│  ├─ não autenticado → LoginScreen        │
│  └─ autenticado     → Tabs (Álbum/Stats) │
│                                          │
│  api.js (getAlbum, getStats, +/−)        │
│         │                                │
│         ▼                                │
│  supabase-js SDK                         │
└──────────┬───────────────────────────────┘
           │ HTTPS
           ▼
┌──────────────────────────────────────────┐
│              Supabase                    │
│                                          │
│  ├─ Auth (e-mail/senha)                  │
│  │    └─ on_auth_user_created trigger    │
│  │         ├─ cria álbum                 │
│  │         └─ seed 980 figurinhas        │
│  │                                       │
│  └─ Postgres                             │
│       ├─ albums   (RLS: user_id)         │
│       └─ stickers (RLS: via albums)      │
│            ├─ sticker_increment() RPC    │
│            └─ sticker_decrement() RPC    │
└──────────────────────────────────────────┘
```

---

## 🔐 Segurança

- **RLS (Row Level Security)** obrigatório em `albums` e `stickers`
- `auth.uid()` garante que cada usuário só acessa o próprio álbum
- Increment/decrement via RPC evita race conditions (UPDATE atômico no DB)
- Anon key é pública por design; security vem das policies, não do segredo

---

## 🆘 Troubleshooting

**"permission denied for table stickers"**
→ RLS ativo mas sem policy. Re-rode o bloco de policies do migration.

**"stickers não aparecem após signup"**
→ Trigger `on_auth_user_created` não disparou. Verifique em **Database → Triggers** que existe.

**"invalid JWT"**
→ Sessão expirada; faça signout e login de novo.

**"Network request failed"**
→ URL do Supabase incorreta no `.env`, ou celular sem internet.

---

## 💰 Custos

- **Free tier**: até 500MB de DB, 50k MAU, 2GB de transferência — suficiente pra começar
- Se crescer: Pro plan US$ 25/mês

---

## 🧹 Rollback / Desfazer

Se quiser voltar pro Flask:
```bash
cd AlbumApp
rm .env  # ou renomeie
npx expo start
```

Sem as env vars do Supabase, o `api.js` cai automaticamente no fallback Flask.
