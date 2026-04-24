# 🏆 Meu Álbum 2026

Aplicativo pessoal para organizar e acompanhar uma coleção particular de figurinhas — com **48 seleções**, **12 grupos** e **980 slots** no total.

> **Disclaimer**: *Meu Álbum 2026* é um aplicativo pessoal para rastreio de coleções de figurinhas. **Não é afiliado, endossado ou conectado à FIFA, Panini ou qualquer entidade oficial.** Nomes de países e códigos ISO de bandeiras são usados de forma puramente nominativa.

O projeto inclui três frentes integradas:

- 🌐 **API Flask** (backend de desenvolvimento) que persiste o progresso em JSON
- 💻 **Site web responsivo** (HTML/CSS/JS vanilla) servido pela própria API
- 📱 **App mobile React Native + Expo** que consome a mesma API

Para produção nas lojas, o backend será migrado para **Supabase** (veja `PLANO.md`).

---

## ✨ Funcionalidades

- ✅ Controle por seleção: marcar figurinhas como **falta**, **tenho** e **repetidas**
- 🔍 Busca instantânea por código (ex.: `BRA1`, `ARG`) com botão de limpar
- 🎯 Filtros por status: **Todas**, **Falta**, **Tenho**, **Repetidas**, **Shiny**
- 📊 Tela de estatísticas com progresso global e por seleção
- 📑 Abas por grupo (FWC + Grupos A–L) com **percentual de progresso individual**
- 💾 Persistência automática (JSON no dev, Supabase na produção)
- 🔄 Atualização otimista da UI com rollback em caso de erro de rede
- 📳 Feedback tátil (haptics) e UX caprichada no app mobile
- 🌍 Bandeiras carregadas via [flagcdn.com](https://flagcdn.com)

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Backend (dev)** | Python 3, Flask |
| **Backend (produção)** | Supabase (Postgres + Auth) |
| **Frontend Web** | HTML5, CSS3, JavaScript (vanilla, sem build step) |
| **Mobile** | React Native, Expo SDK 54, React Navigation |
| **Persistência** | Arquivo JSON local (dev) / Supabase Postgres (prod) |
| **Assets** | flagcdn.com (bandeiras dos países por código ISO) |

---

## 📁 Estrutura do projeto

```
Meu Álbum 2026/
├── api.py                  # API Flask (dev)
├── backend.py              # Geração inicial do álbum + persistência
├── static/                 # Site web
│   ├── index.html
│   ├── script.js
│   └── style.css
├── supabase/               # Migrations e config (produção)
├── AlbumApp/               # App mobile (Expo)
│   ├── App.js
│   └── src/
│       ├── api.js          # Cliente (Supabase ou Flask)
│       ├── supabase.js     # Cliente Supabase JS
│       ├── auth/           # Autenticação
│       ├── groups.js       # Definição dos 12 grupos + ISO das bandeiras
│       └── screens/
│           ├── AlbumScreen.js
│           └── StatsScreen.js
├── .claude/agents/         # Agentes especializados p/ publicação
├── PLANO.md                # Roadmap de publicação nas lojas
└── README.md
```

---

## 🚀 Como executar (desenvolvimento)

### Backend + Site web

Pré-requisitos: Python 3.10+ e Flask.

```bash
pip install flask
python api.py
```

A API sobe em `http://0.0.0.0:5000` e o site fica disponível em `http://localhost:5000`.

### App mobile (Expo)

Pré-requisitos: Node.js, Expo Go instalado no celular, celular e PC na mesma rede Wi-Fi.

```bash
cd AlbumApp
npm install
npx expo start
```

> ⚠️ Antes de rodar o app, ajuste o IP do servidor Flask em [`AlbumApp/src/api.js`](AlbumApp/src/api.js) para o IP local da sua máquina (ex.: `http://192.168.0.10:5000`). Use `ipconfig` (Windows) ou `ifconfig` (Linux/Mac) para descobrir.

---

## 📡 Endpoints da API (dev)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/album` | Retorna o álbum completo |
| `POST` | `/api/album/<cod>/increment` | Incrementa quantidade de uma figurinha |
| `POST` | `/api/album/<cod>/decrement` | Decrementa quantidade de uma figurinha |
| `GET` | `/api/estatisticas` | Retorna estatísticas globais (total, adquiridas, repetidas, %) |

Em produção, essas funções são substituídas por chamadas diretas ao Supabase (ver `docs/BACKEND.md`).

---

## 🏟️ Os 12 grupos

| Grupo | Seleções |
|---|---|
| **A** | México · África do Sul · Coreia do Sul · Rep. Tcheca |
| **B** | Canadá · Bósnia · Catar · Suíça |
| **C** | Brasil · Marrocos · Haiti · Escócia |
| **D** | Estados Unidos · Paraguai · Austrália · Turquia |
| **E** | Alemanha · Curaçao · Costa do Marfim · Equador |
| **F** | Holanda · Japão · Suécia · Tunísia |
| **G** | Bélgica · Egito · Irã · Nova Zelândia |
| **H** | Espanha · Cabo Verde · Arábia Saudita · Uruguai |
| **I** | França · Senegal · Iraque · Noruega |
| **J** | Argentina · Argélia · Áustria · Jordânia |
| **K** | Portugal · RD Congo · Uzbequistão · Colômbia |
| **L** | Inglaterra · Croácia · Gana · Panamá |

Mais a seção especial **FWC** com 20 slots de símbolos e estádios — totalizando **49 seções × 20 = 980 figurinhas**.

---

## 📱 Publicação nas lojas

Este projeto está em preparação para publicação na **Google Play Store** (e App Store depois). Veja `PLANO.md` para o roadmap completo.

Política de Privacidade: (a ser publicada em GitHub Pages na Fase 4)

---

## 👤 Autores

Desenvolvido por **Gustavo Tapajós** e **João Medina** — projeto pessoal de portfólio e estudo.

[GitHub Gustavo](https://github.com/tapajosgustavo-collab) · [GitHub João](https://github.com/joaohmedina)
