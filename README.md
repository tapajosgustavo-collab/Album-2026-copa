# 🏆 Álbum Copa do Mundo 2026

Aplicação completa para acompanhar a coleção de figurinhas do álbum oficial da Copa do Mundo FIFA 2026 — com **48 seleções**, **12 grupos** e **980 figurinhas** ao todo.

O projeto inclui três frentes integradas:

- 🌐 **API Flask** (backend Python) que persiste o progresso em JSON
- 💻 **Site web responsivo** (HTML/CSS/JS vanilla) servido pela própria API
- 📱 **App mobile React Native + Expo** que consome a mesma API

---

## ✨ Funcionalidades

- ✅ Controle por seleção: marcar figurinhas como **falta**, **tenho** e **repetidas**
- 🔍 Busca instantânea por código (ex.: `BRA1`, `ARG`) com botão de limpar
- 🎯 Filtros por status: **Todas**, **Falta**, **Tenho**, **Repetidas**
- 📊 Tela de estatísticas com progresso global e por seleção
- 📑 Abas por grupo (FWC + Grupos A–L) com **percentual de progresso individual**
- 💾 Persistência automática no servidor (JSON)
- 🔄 Atualização otimista da UI com rollback em caso de erro de rede
- 📳 Feedback tátil (haptics) e UX caprichada no app mobile
- 🌍 Bandeiras carregadas via [flagcdn.com](https://flagcdn.com)

---

## 🛠️ Stack

| Camada | Tecnologias |
|---|---|
| **Backend** | Python 3, Flask |
| **Frontend Web** | HTML5, CSS3, JavaScript (vanilla, sem build step) |
| **Mobile** | React Native, Expo SDK 54, React Navigation |
| **Persistência** | Arquivo JSON local (`album_salvo.json`) |
| **Assets** | flagcdn.com (bandeiras dos países por código ISO) |

---

## 📁 Estrutura do projeto

```
Album 2026/
├── api.py                  # API Flask (rotas REST)
├── backend.py              # Geração inicial do álbum + persistência
├── static/                 # Site web
│   ├── index.html
│   ├── script.js
│   └── style.css
└── AlbumApp/               # App mobile (Expo)
    ├── App.js
    └── src/
        ├── api.js          # Cliente HTTP
        ├── groups.js       # Definição dos 12 grupos + ISO das bandeiras
        └── screens/
            ├── AlbumScreen.js
            └── StatsScreen.js
```

---

## 🚀 Como executar

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

## 📡 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/album` | Retorna o álbum completo |
| `POST` | `/api/album/<cod>/increment` | Incrementa quantidade de uma figurinha |
| `POST` | `/api/album/<cod>/decrement` | Decrementa quantidade de uma figurinha |
| `GET` | `/api/estatisticas` | Retorna estatísticas globais (total, adquiridas, repetidas, %) |

---

## 🏟️ Os 12 grupos da Copa 2026

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

Mais a seção especial **FWC** com 20 figurinhas de símbolos e estádios — totalizando **49 seções × 20 = 980 figurinhas**.

---

## 👤 Autor

Desenvolvido por **Gustavo Tapajós** — projeto pessoal de portfólio.

[GitHub](https://github.com/tapajosgustavo-collab)
