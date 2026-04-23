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

### Fase 1 — 🎨 Brand ✅ CONCLUÍDA
- [x] Renomear para "Meu Álbum 2026" em todos os textos
- [x] Remover menções diretas a FIFA / Panini / Copa do Mundo (marca registrada)
- [x] Adicionar disclaimer "App não-oficial" no header e README
- [ ] Regenerar ícone e splash neutros _(pendente — ver `TODO_BRAND.md`)_
- [x] Atualizar README.md público

### Fase 2 — 🔧 Backend ✅ CONCLUÍDA
- [x] Criar projeto Supabase (`zuvjmzzkbwxasbmxkmnu`, São Paulo)
- [x] Schema: `albums`, `stickers` com RLS
- [x] Migration SQL em `supabase/migrations/20260417000000_init.sql`
- [x] Trocar `AlbumApp/src/api.js` por cliente Supabase
- [x] Auth via e-mail/senha (Google OAuth pode vir depois)
- [x] Manter `api.py` Flask como dev fallback (opcional)
- [x] Testado end-to-end no Expo Go (signup, álbum, increment/decrement)

**Checkpoint 1** ✅ mergeado `agent/brand` + `agent/backend` em `main`

### Fase 3 — 📱 Mobile ✅ CONCLUÍDA
- [x] `app.json`: bundleIdentifier, package, version, permissões
- [x] Criar `eas.json` com perfis dev/preview/production
- [x] Variáveis de ambiente (`.env.local`, `eas secret`)
- [x] Instalar `expo-updates` para OTA
- [x] `eas build --profile preview --platform android` (APK de teste)

**Checkpoint 2** ✅ APK testado no celular real — signup, álbum e increment/decrement funcionando

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

### Fase 6 — 💰 Monetização via AdMob _(pós-lançamento, quando quisermos retorno financeiro)_
- [ ] Criar conta Google AdMob (grátis) e linkar com Play Console
- [ ] Instalar `react-native-google-mobile-ads` no Expo
- [ ] Implementar banner no rodapé da tela de Álbum
- [ ] (Fase 6.1) Adicionar intersticial suave a cada N ações
- [ ] Atualizar `privacy-policy.html` mencionando AdMob + consentimento GDPR/LGPD
- [ ] Atualizar `terms.html` com cláusula sobre anúncios
- [ ] Play Console: mudar "Contém ads = Sim", atualizar Data Safety (ID de publicidade)
- [ ] Revalidar classificação etária (pode subir de Livre pra 12+)
- [ ] Submeter nova versão (v1.1.0)
- [ ] (Opcional v2.0) Variante "Pro" sem ads por valor one-time

> **Estratégia**: lançar v1.0 **sem ads** pra aprovação rápida e reviews limpos nos primeiros 1-2 meses. Só então ativar Fase 6 com dados reais de uso.

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
- [x] Agentes criados em `.claude/agents/`
- [x] Fase 1 (Brand) concluída e mergeada
- [x] Fase 2 (Backend) concluída e mergeada — Supabase em produção
- [x] Checkpoint 1 validado (signup + álbum + increment testados no Expo Go)
- [x] Fase 3 (Mobile/EAS) concluída e mergeada — APK preview buildado e testado no celular real
- [ ] **Próximo**: Fase 4 (Assets) — screenshots, descrições PT-BR, política de privacidade + termos em GitHub Pages

> 🤝 **Handoff**: se outro dev for continuar, ler `HANDOFF.md` (não commitado — pedir ao Gustavo).
