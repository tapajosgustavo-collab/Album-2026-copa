// Mapa de código do álbum → código ISO para flagcdn.com
const ISO = {
  FWC:'un',  USA:'us',  MEX:'mx',  CAN:'ca',  BRA:'br',  ARG:'ar',
  FRA:'fr',  ENG:'gb-eng', GER:'de', ESP:'es', ITA:'it',  POR:'pt',
  NED:'nl',  BEL:'be',  CRO:'hr',  URU:'uy',  COL:'co',  MAR:'ma',
  SEN:'sn',  JPN:'jp',  KOR:'kr',  AUS:'au',  ECU:'ec',  SUI:'ch',
  DEN:'dk',  SRB:'rs',  POL:'pl',  UKR:'ua',  SWE:'se',  TUR:'tr',
  EGY:'eg',  NGA:'ng',  GHA:'gh',  TUN:'tn',  ALG:'dz',  CMR:'cm',
  MLI:'ml',  KSA:'sa',  IRN:'ir',  IRQ:'iq',  UAE:'ae',  UZB:'uz',
  PAN:'pa',  CRC:'cr',  JAM:'jm',  HON:'hn',  SLV:'sv',  NZL:'nz', PAR:'py'
};

function flagImg(code, size = 32) {
  const iso = ISO[code];
  if (!iso) return '';
  return `<img src="https://flagcdn.com/w${size}/${iso}.png" alt="${code}" class="flag-img">`;
}

let album = {};
let currentSelecao = null;
let activeFilter = 'todas';
let toastTimeout = null;

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

// --- FILTROS ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilter();
  });
});

function applyFilter() {
  document.querySelectorAll('.sticker-card').forEach(card => {
    if (activeFilter === 'todas') { card.classList.remove('hidden'); return; }
    const cls = card.className;
    const match =
      (activeFilter === 'falta'    && cls.includes('falta'))    ||
      (activeFilter === 'tenho'    && cls.includes('tenho'))    ||
      (activeFilter === 'repetida' && cls.includes('repetida')) ||
      (activeFilter === 'shiny'    && cls.includes('shiny'));
    card.classList.toggle('hidden', !match);
  });
}

// --- TOAST ---
function showToast(msg, color) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderLeftWidth = color ? '3px' : '1px';
  toast.style.borderLeftColor = color || '';
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

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
  updateSidebarProgress();

  select.addEventListener('change', () => {
    currentSelecao = select.value;
    activeFilter = 'todas';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="todas"]').classList.add('active');
    renderGrid(currentSelecao);
  });
}

// --- RENDERIZAR GRID ---
function renderGrid(selKey) {
  const sel = album[selKey];
  document.getElementById('team-flag').innerHTML = flagImg(selKey, 48);
  document.getElementById('selecao-nome').textContent = sel.nome;
  updateTeamProgress(selKey);

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

    card.addEventListener('click', () => handleIncrement(cod, card));
    card.addEventListener('contextmenu', e => { e.preventDefault(); handleDecrement(cod, card); });

    grid.appendChild(card);
  }

  applyFilter();
}

// --- PROGRESSO DA SELEÇÃO ---
function updateTeamProgress(selKey) {
  const sel = album[selKey];
  const total = Object.keys(sel.figurinhas).length;
  const adq = Object.values(sel.figurinhas).filter(f => f.qtd > 0).length;
  const pct = Math.round((adq / total) * 100);
  document.getElementById('team-progress-fill').style.width = `${pct}%`;
  document.getElementById('team-progress-label').textContent = `${adq}/${total} — ${pct}%`;
}

// --- PROGRESSO GERAL (SIDEBAR) ---
function updateSidebarProgress() {
  const total = 980;
  const adq = Object.values(album).reduce((acc, s) =>
    acc + Object.values(s.figurinhas).filter(f => f.qtd > 0).length, 0);
  const pct = ((adq / total) * 100).toFixed(1);
  document.getElementById('sidebar-fill').style.width = `${pct}%`;
  document.getElementById('sidebar-pct').textContent = `${pct}%`;
  document.getElementById('sidebar-count').textContent = `${adq} de ${total}`;
}

// --- CARD HELPERS ---
function getCardClass(dados) {
  const shiny = dados.is_shiny ? ' shiny' : '';
  if (dados.qtd === 0) return `sticker-card falta${shiny}`;
  if (dados.qtd === 1) return `sticker-card tenho${shiny}`;
  return `sticker-card repetida${shiny}`;
}

function getCardInfo(dados) {
  if (dados.qtd === 0) return { emoji: '❌', status: 'Falta' };
  if (dados.qtd === 1) return { emoji: '✅', status: 'Tenho' };
  return { emoji: '🔄', status: `×${dados.qtd}` };
}

// --- INCREMENTAR ---
async function handleIncrement(cod, card) {
  const res = await fetch(`/api/album/${cod}/increment`, { method: 'POST' });
  const data = await res.json();
  album[currentSelecao].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[currentSelecao].figurinhas[cod]);
  updateTeamProgress(currentSelecao);
  updateSidebarProgress();
  const info = getCardInfo(album[currentSelecao].figurinhas[cod]);
  const color = data.qtd === 1 ? '#00e676' : '#448aff';
  showToast(`${cod}  +1 — ${info.status}`, color);
}

// --- DECREMENTAR ---
async function handleDecrement(cod, card) {
  const res = await fetch(`/api/album/${cod}/decrement`, { method: 'POST' });
  const data = await res.json();
  album[currentSelecao].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[currentSelecao].figurinhas[cod]);
  updateTeamProgress(currentSelecao);
  updateSidebarProgress();
  showToast(`${cod}  -1`, '#ff5252');
}

function updateCard(card, dados) {
  card.className = getCardClass(dados);
  const { emoji, status } = getCardInfo(dados);
  card.querySelector('.sticker-emoji').textContent = emoji;
  card.querySelector('.sticker-status').textContent = status;
  applyFilter();
}

// --- ESTATÍSTICAS ---
async function loadStats() {
  const res = await fetch('/api/estatisticas');
  const stats = await res.json();

  document.getElementById('progress-fill').style.width = `${stats.porcentagem}%`;
  document.getElementById('progress-label').innerHTML =
    `<strong>${stats.porcentagem}% Completo</strong> — ${stats.adquiridas} de ${stats.total} figurinhas`;

  document.getElementById('stat-adquiridas').textContent = stats.adquiridas;
  document.getElementById('stat-faltam').textContent = stats.faltam;
  document.getElementById('stat-repetidas').textContent = stats.repetidas;

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
      <td><span class="team-badge">${key}</span>${flagImg(key, 24)} ${sel.nome}</td>
      <td>${adq}</td>
      <td>${falt}</td>
      <td>${rep}</td>
      <td>
        <div class="mini-bar-wrap">
          <div class="mini-bar-track"><div class="mini-bar" style="width:${pct}%"></div></div>
          <span class="mini-pct">${pct}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

// --- INIT ---
loadAlbum();
