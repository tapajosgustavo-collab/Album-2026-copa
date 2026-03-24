let album = {};
let currentSelecao = null;

// --- NAVEGAÇÃO ---
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`page-${btn.dataset.page}`).classList.add('active');
    if (btn.dataset.page === 'stats') loadStats();
  });
});

// --- CARREGAR ÁLBUM ---
async function loadAlbum() {
  const res = await fetch('/api/album');
  album = await res.json();

  const select = document.getElementById('selecao-select');
  select.innerHTML = '';
  for (const key of Object.keys(album)) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${key} — ${album[key].nome}`;
    select.appendChild(opt);
  }

  currentSelecao = select.value;
  renderGrid(currentSelecao);

  select.addEventListener('change', () => {
    currentSelecao = select.value;
    renderGrid(currentSelecao);
  });
}

// --- RENDERIZAR GRID ---
function renderGrid(selKey) {
  const sel = album[selKey];
  document.getElementById('selecao-nome').textContent = sel.nome;
  const grid = document.getElementById('grid-figurinhas');
  grid.innerHTML = '';

  for (const [cod, dados] of Object.entries(sel.figurinhas)) {
    const card = document.createElement('div');
    card.className = getCardClass(dados);
    card.dataset.cod = cod;

    const { emoji, status } = getCardInfo(dados);

    card.innerHTML = `
      <span class="sticker-emoji">${emoji}</span>
      <span class="sticker-cod">${cod}</span>
      <span class="sticker-status">${status}</span>
    `;

    // Clique esquerdo: +1
    card.addEventListener('click', () => handleIncrement(cod, card));

    // Clique direito: -1
    card.addEventListener('contextmenu', e => {
      e.preventDefault();
      handleDecrement(cod, card);
    });

    grid.appendChild(card);
  }
}

function getCardClass(dados) {
  const shiny = dados.is_shiny ? ' shiny' : '';
  if (dados.qtd === 0) return `sticker-card falta${shiny}`;
  if (dados.qtd === 1) return `sticker-card tenho${shiny}`;
  return `sticker-card repetida${shiny}`;
}

function getCardInfo(dados) {
  if (dados.qtd === 0) return { emoji: '❌', status: 'Falta' };
  if (dados.qtd === 1) return { emoji: '✅', status: 'Tenho' };
  return { emoji: '🔄', status: `Repetida (${dados.qtd})` };
}

// --- INCREMENTAR ---
async function handleIncrement(cod, card) {
  const res = await fetch(`/api/album/${cod}/increment`, { method: 'POST' });
  const data = await res.json();
  album[currentSelecao].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[currentSelecao].figurinhas[cod]);
}

// --- DECREMENTAR ---
async function handleDecrement(cod, card) {
  const res = await fetch(`/api/album/${cod}/decrement`, { method: 'POST' });
  const data = await res.json();
  album[currentSelecao].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[currentSelecao].figurinhas[cod]);
}

function updateCard(card, dados) {
  card.className = getCardClass(dados);
  const { emoji, status } = getCardInfo(dados);
  card.querySelector('.sticker-emoji').textContent = emoji;
  card.querySelector('.sticker-status').textContent = status;
}

// --- ESTATÍSTICAS ---
async function loadStats() {
  const [statsRes, albumRes] = await Promise.all([
    fetch('/api/estatisticas'),
    Promise.resolve(album),
  ]);
  const stats = await statsRes.json();

  document.getElementById('progress-fill').style.width = `${stats.porcentagem}%`;
  document.getElementById('progress-label').innerHTML =
    `<strong>${stats.porcentagem}% Completo</strong> — ${stats.adquiridas} de ${stats.total} figurinhas`;

  document.getElementById('stat-adquiridas').textContent = stats.adquiridas;
  document.getElementById('stat-faltam').textContent = stats.faltam;
  document.getElementById('stat-repetidas').textContent = stats.repetidas;

  // Tabela por seleção
  const tbody = document.getElementById('stats-tbody');
  tbody.innerHTML = '';
  for (const [key, sel] of Object.entries(album)) {
    const total = Object.keys(sel.figurinhas).length;
    const adq = Object.values(sel.figurinhas).filter(f => f.qtd > 0).length;
    const rep = Object.values(sel.figurinhas).reduce((acc, f) => acc + Math.max(0, f.qtd - 1), 0);
    const falt = total - adq;
    const pct = Math.round((adq / total) * 100);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${key}</strong> — ${sel.nome}</td>
      <td>${adq}</td>
      <td>${falt}</td>
      <td>${rep}</td>
      <td>
        <div class="mini-bar-wrap">
          <div class="mini-bar" style="width:${pct}%"></div>
        </div>
        <span style="font-size:11px;color:#8b949e;margin-left:6px">${pct}%</span>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

// --- INIT ---
loadAlbum();
