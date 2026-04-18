# 🚀 Plano Mestre — Publicação "Meu Álbum 2026"

> **Autor**: Gustavo Tapajós · **RA**: 177063
> **Objetivo**: publicar o app nas lojas (Google Play primeiro, App Store depois)
> **Stack decidida**: React Native + Expo · Supabase (Auth + Postgres) · EAS Build

---

## 📌 Decisões confirmadas

| # | Decisão | Valor |
|---|---|---|
| 1 | Nome do app | **Meu Álbum 2026** |
| 2 | Backend | **Supabase puro** (sem Flask em produção) |
| 3 | Plataformas iniciais | **Android** (iOS em segundo momento) |
| 4 | Monetização | **Grátis, sem ads** |
| 5 | Modo de trabalho | **Autônomo com checkpoints** |

---

## 🎭 Time de agentes

| Agente | Arquivo | Escopo | Branch |
|---|---|---|---|
| 🎨 Brand | `.claude/agents/brand.md` | Rebranding jurídico, novo nome, UI textos | `agent/brand` |
| 🔧 Backend | `.claude/agents/backend.md` | Supabase schema, auth, SDK no app | `agent/backend` |
| 📱 Mobile | `.claude/agents/mobile.md` | app.json, eas.json, build EAS | `agent/mobile` |
| 🎬 Assets | `.claude/agents/assets.md` | Screenshots, descrições, privacy policy | `agent/assets` |
| 🚀 Submit | `.claude/agents/submit.md` | eas submit, Play Console, App Store | `agent/submit` |

---

## 🗓️ Fases e dependências

```
Fase 1 (Brand)   ──┐
                   ├──▶ merge ──▶ Fase 3 (Mobile) ──▶ merge ──▶ Fase 5 (Submit)
Fase 2 (Backend) ──┘                    │
                                        ▼
                              Fase 4 (Assets) ─▶ merge
```

### Fase 1 — 🎨 Brand (paralelo com Fase 2)
- [ ] Renomear para "Meu Álbum 2026" em todos os textos
- [ ] Remover menções diretas a FIFA / Panini / Copa do Mundo (marca registrada)
- [ ] Adicionar disclaimer "App não-oficial" no header e README
- [ ] Regenerar ícone e splash neutros
- [ ] Atualizar README.md público

### Fase 2 — 🔧 Backend (paralelo com Fase 1)
- [ ] Criar projeto Supabase
- [ ] Schema: `users`, `albums`, `stickers` com RLS
- [ ] Migration SQL em `supabase/migrations/`
- [ ] Trocar `AlbumApp/src/api.js` por cliente Supabase
- [ ] Auth via e-mail/senha + Google OAuth
- [ ] Manter `api.py` Flask como dev fallback (opcional)

**Checkpoint 1** — merge `agent/brand` + `agent/backend` em `main`

### Fase 3 — 📱 Mobile (depende de 1+2)
- [ ] `app.json`: bundleIdentifier, package, version, permissões
- [ ] Criar `eas.json` com perfis dev/preview/production
- [ ] Variáveis de ambiente (`.env.local`, `eas secret`)
- [ ] Instalar `expo-updates` para OTA
- [ ] `eas build --profile preview --platform android` (APK de teste)

**Checkpoint 2** — testar APK no celular real

### Fase 4 — 🎬 Assets (paralelo com tail da Fase 3)
- [ ] Gerar screenshots em simulador (phone + tablet Android)
- [ ] Descrição curta (80 chars) e longa (4000 chars) — PT-BR
- [ ] Política de Privacidade em HTML
- [ ] Termos de Uso em HTML
- [ ] Deploy das páginas legais em GitHub Pages
- [ ] Preencher questionário de classificação etária

**Checkpoint 3** — revisar visual e textos

### Fase 5 — 🚀 Submit (depende de tudo)
- [ ] Criar app na Google Play Console
- [ ] Upload do `.aab` via `eas submit --platform android`
- [ ] Preencher ficha da loja com assets da Fase 4
- [ ] Enviar para review (interno → fechado → produção)
- [ ] Responder feedback se vier

---

## 💰 Custos totais estimados

| Item | Custo |
|---|---|
| Google Play Console | US$ 25 (one-time) |
| Supabase | US$ 0 (free tier) |
| GitHub Pages | US$ 0 |
| EAS Build | US$ 0 (30 builds/mês grátis) |
| **Total pra lançar** | **~R$ 140** |

iOS adicionado depois: +US$ 99/ano.

---

## 📍 Estado atual

- [x] Defaults aprovados
- [x] `PLANO.md` criado
- [ ] Agentes criados em `.claude/agents/`
- [ ] Worktrees preparados
- [ ] Fase 1+2 rodando em paralelo
