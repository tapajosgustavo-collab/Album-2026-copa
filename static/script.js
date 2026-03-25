// ─── MAPA DE FLAGS ───────────────────────────────────────────────────────────
const ISO = {
  FWC:'un', USA:'us', MEX:'mx', CAN:'ca', BRA:'br', ARG:'ar',
  FRA:'fr', ENG:'gb-eng', GER:'de', ESP:'es', ITA:'it', POR:'pt',
  NED:'nl', BEL:'be', CRO:'hr', URU:'uy', COL:'co', MAR:'ma',
  SEN:'sn', JPN:'jp', KOR:'kr', AUS:'au', ECU:'ec', SUI:'ch',
  DEN:'dk', SRB:'rs', POL:'pl', UKR:'ua', SWE:'se', TUR:'tr',
  EGY:'eg', NGA:'ng', GHA:'gh', TUN:'tn', ALG:'dz', CMR:'cm',
  MLI:'ml', KSA:'sa', IRN:'ir', IRQ:'iq', UAE:'ae', UZB:'uz',
  PAN:'pa', CRC:'cr', JAM:'jm', HON:'hn', SLV:'sv', NZL:'nz', PAR:'py'
};

function flagImg(code, size = 32) {
  const iso = ISO[code];
  if (!iso) return '<span class="flag-placeholder">🌍</span>';
  return `<img src="https://flagcdn.com/w${size}/${iso}.png" alt="${code}" class="flag-img">`;
}

// ─── GRUPOS ──────────────────────────────────────────────────────────────────
const GROUPS = {
  fwc: {
    label: 'FWC', sublabel: 'Símbolos & Estádios',
    times: ['FWC'], missing: [], pending: null
  },
  A: {
    label: 'Grupo A', sublabel: 'México · Coreia do Sul · África do Sul + Repescagem',
    times: ['MEX', 'KOR'],
    missing: [{ nome: 'África do Sul', cod: 'RSA' }],
    pending: { descricao: 'Repescagem Europa D', candidatos: 'Dinamarca, Macedônia do Norte, Rep. Tcheca ou Irlanda', albCods: ['DEN'] }
  },
  B: {
    label: 'Grupo B', sublabel: 'Canadá · Suíça · Catar + Repescagem',
    times: ['CAN', 'SUI'],
    missing: [{ nome: 'Catar', cod: 'QAT' }],
    pending: { descricao: 'Repescagem Europa A', candidatos: 'Itália, Irlanda do Norte, País de Gales ou Bósnia', albCods: ['ITA'] }
  },
  C: {
    label: 'Grupo C', sublabel: 'Brasil · Marrocos · Haiti · Escócia',
    times: ['BRA', 'MAR'],
    missing: [{ nome: 'Haiti', cod: 'HAI' }, { nome: 'Escócia', cod: 'SCO' }],
    pending: null
  },
  D: {
    label: 'Grupo D', sublabel: 'Estados Unidos · Paraguai · Austrália + Repescagem',
    times: ['USA', 'PAR', 'AUS'],
    missing: [],
    pending: { descricao: 'Repescagem Europa C', candidatos: 'Turquia, Romênia, Eslováquia ou Kosovo', albCods: ['TUR'] }
  },
  E: {
    label: 'Grupo E', sublabel: 'Alemanha · Equador · Curaçao · Costa do Marfim',
    times: ['GER', 'ECU'],
    missing: [{ nome: 'Curaçao', cod: 'CUW' }, { nome: 'Costa do Marfim', cod: 'CIV' }],
    pending: null
  },
  F: {
    label: 'Grupo F', sublabel: 'Holanda · Japão · Tunísia + Repescagem',
    times: ['NED', 'JPN', 'TUN'],
    missing: [],
    pending: { descricao: 'Repescagem Europa B', candidatos: 'Ucrânia, Suécia, Polônia ou Albânia', albCods: ['UKR', 'SWE', 'POL'] }
  },
  G: {
    label: 'Grupo G', sublabel: 'Bélgica · Egito · Irã · Nova Zelândia',
    times: ['BEL', 'EGY', 'IRN', 'NZL'],
    missing: [], pending: null
  },
  H: {
    label: 'Grupo H', sublabel: 'Espanha · Arábia Saudita · Uruguai · Cabo Verde',
    times: ['ESP', 'KSA', 'URU'],
    missing: [{ nome: 'Cabo Verde', cod: 'CPV' }],
    pending: null
  },
  I: {
    label: 'Grupo I', sublabel: 'França · Senegal · Noruega + Repescagem',
    times: ['FRA', 'SEN'],
    missing: [{ nome: 'Noruega', cod: 'NOR' }],
    pending: { descricao: 'Repescagem Intercontinental 2', candidatos: 'Bolívia, Suriname ou Iraque', albCods: ['IRQ'] }
  },
  J: {
    label: 'Grupo J', sublabel: 'Argentina · Argélia · Áustria · Jordânia',
    times: ['ARG', 'ALG'],
    missing: [{ nome: 'Áustria', cod: 'AUT' }, { nome: 'Jordânia', cod: 'JOR' }],
    pending: null
  },
  K: {
    label: 'Grupo K', sublabel: 'Portugal · Uzbequistão · Colômbia + Repescagem',
    times: ['POR', 'UZB', 'COL'],
    missing: [],
    pending: { descricao: 'Repescagem Intercontinental 1', candidatos: 'RD Congo, Jamaica ou Nova Caledônia', albCods: ['JAM'] }
  },
  L: {
    label: 'Grupo L', sublabel: 'Inglaterra · Croácia · Gana · Panamá',
    times: ['ENG', 'CRO', 'GHA', 'PAN'],
    missing: [], pending: null
  },
};

// Times sem grupo definido (candidatos sem grupo ainda no álbum)
const TIMES_SEM_GRUPO = ['SRB', 'NGA', 'CMR', 'MLI', 'UAE', 'CRC', 'HON', 'SLV'];

// ─── ESTADO ──────────────────────────────────────────────────────────────────
let album = {};
let currentView = 'A';
let activeFilter = 'todas';
let toastTimeout = null;

// ─── NAVEGAÇÃO DE PÁGINAS ────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`page-${btn.dataset.page}`).classList.add('active');
    if (btn.dataset.page === 'stats') loadStats();
  });
});

// ─── ABAS DE GRUPOS ──────────────────────────────────────────────────────────
document.querySelectorAll('.group-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.group-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    activeFilter = 'todas';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-filter="todas"]').classList.add('active');
    renderView(currentView);
  });
});

// ─── FILTROS ─────────────────────────────────────────────────────────────────
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

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg, color) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderLeftColor = color || 'var(--border2)';
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── CARREGAR ÁLBUM ──────────────────────────────────────────────────────────
async function loadAlbum() {
  const res = await fetch('/api/album');
  album = await res.json();
  updateSidebarProgress();
  renderView(currentView);
}

// ─── RENDERIZAR VIEW ─────────────────────────────────────────────────────────
function renderView(view) {
  const container = document.getElementById('album-sections');
  container.innerHTML = '';

  if (view === 'pendentes') {
    renderPendentes(container);
    return;
  }

  if (view === 'todas') {
    // FWC primeiro, depois todos os grupos
    renderGroupBlock(container, GROUPS.fwc);
    Object.entries(GROUPS).forEach(([key, g]) => {
      if (key !== 'fwc') renderGroupBlock(container, g);
    });
    // Times sem grupo
    if (TIMES_SEM_GRUPO.some(t => album[t])) {
      const block = document.createElement('div');
      block.className = 'group-block';
      block.innerHTML = `<div class="group-block-header"><span class="group-block-label">Outros</span><span class="group-block-sublabel">Times sem grupo definido</span></div>`;
      TIMES_SEM_GRUPO.forEach(cod => { if (album[cod]) block.appendChild(createTeamSection(cod)); });
      container.appendChild(block);
    }
    applyFilter();
    return;
  }

  if (view === 'fwc') {
    renderGroupBlock(container, GROUPS.fwc);
    applyFilter();
    return;
  }

  const group = GROUPS[view];
  if (group) {
    renderGroupBlock(container, group);
    applyFilter();
  }
}

// ─── RENDERIZAR BLOCO DE GRUPO ───────────────────────────────────────────────
function renderGroupBlock(container, group) {
  const block = document.createElement('div');
  block.className = 'group-block';

  // Cabeçalho do grupo
  if (group.label !== 'FWC') {
    block.innerHTML = `
      <div class="group-block-header">
        <span class="group-block-label">${group.label}</span>
        <span class="group-block-sublabel">${group.sublabel}</span>
      </div>
    `;
  }

  // Times confirmados com figurinhas no álbum
  group.times.forEach(cod => {
    if (album[cod]) block.appendChild(createTeamSection(cod));
  });

  // Times confirmados mas sem dados no álbum ainda
  if (group.missing && group.missing.length > 0) {
    group.missing.forEach(m => block.appendChild(createMissingTeam(m)));
  }

  // Vaga de repescagem
  if (group.pending) {
    block.appendChild(createPendingSlot(group.pending));
  }

  container.appendChild(block);
}

// ─── SEÇÃO DE TIME ───────────────────────────────────────────────────────────
function createTeamSection(selKey) {
  const sel = album[selKey];
  const total = Object.keys(sel.figurinhas).length;
  const adq   = Object.values(sel.figurinhas).filter(f => f.qtd > 0).length;
  const pct   = Math.round((adq / total) * 100);

  const section = document.createElement('div');
  section.className = 'team-section';
  section.id = `section-${selKey}`;

  section.innerHTML = `
    <div class="team-section-header">
      <div class="team-section-flag">${flagImg(selKey, 40)}</div>
      <div class="team-section-info">
        <span class="team-section-name">${sel.nome}</span>
        <div class="team-progress-wrap">
          <div class="team-progress-track">
            <div class="team-progress-fill" id="tpf-${selKey}" style="width:${pct}%"></div>
          </div>
          <span class="team-progress-label" id="tpl-${selKey}">${adq}/${total} — ${pct}%</span>
        </div>
      </div>
      <span class="team-section-code">${selKey}</span>
    </div>
    <div class="sticker-grid" id="grid-${selKey}"></div>
  `;

  const grid = section.querySelector(`#grid-${selKey}`);
  for (const [cod, dados] of Object.entries(sel.figurinhas)) {
    grid.appendChild(createStickerCard(cod, dados, selKey));
  }

  return section;
}

// ─── CARD DE FIGURINHA ────────────────────────────────────────────────────────
function createStickerCard(cod, dados, selKey) {
  const card = document.createElement('div');
  card.className = getCardClass(dados);
  card.dataset.cod = cod;
  card.dataset.selecao = selKey;

  const { emoji, status } = getCardInfo(dados);
  card.innerHTML = `
    <span class="sticker-emoji">${emoji}</span>
    <span class="sticker-cod">${cod}</span>
    <span class="sticker-status">${status}</span>
  `;

  card.addEventListener('click', () => handleIncrement(card));
  card.addEventListener('contextmenu', e => { e.preventDefault(); handleDecrement(card); });
  return card;
}

// ─── TIME FALTANDO NO ÁLBUM ──────────────────────────────────────────────────
function createMissingTeam(m) {
  const div = document.createElement('div');
  div.className = 'team-section team-missing';
  div.innerHTML = `
    <div class="team-section-header">
      <div class="team-section-flag missing-flag">?</div>
      <div class="team-section-info">
        <span class="team-section-name">${m.nome}</span>
        <span class="missing-badge">Figurinhas em breve</span>
      </div>
      <span class="team-section-code muted">${m.cod}</span>
    </div>
  `;
  return div;
}

// ─── VAGA PENDENTE (REPESCAGEM) ──────────────────────────────────────────────
function createPendingSlot(pending) {
  const div = document.createElement('div');
  div.className = 'pending-slot';
  div.innerHTML = `
    <div class="pending-slot-header">
      <span class="pending-slot-icon">⏳</span>
      <div>
        <span class="pending-slot-title">${pending.descricao}</span>
        <span class="pending-slot-sub">${pending.candidatos}</span>
      </div>
    </div>
  `;

  if (pending.albCods && pending.albCods.length > 0) {
    const label = document.createElement('p');
    label.className = 'pending-candidates-label';
    label.textContent = 'Candidatos com figurinhas no álbum:';
    div.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'pending-candidates-grid';
    pending.albCods.forEach(cod => {
      if (album[cod]) grid.appendChild(createTeamSection(cod));
    });
    div.appendChild(grid);
  }

  return div;
}

// ─── VIEW PENDENTES (REPESCAGENS) ────────────────────────────────────────────
function renderPendentes(container) {
  const header = document.createElement('div');
  header.className = 'group-block-header';
  header.innerHTML = `
    <span class="group-block-label">⏳ Vagas Pendentes</span>
    <span class="group-block-sublabel">Seleções aguardando resultado das repescagens</span>
  `;
  container.appendChild(header);

  Object.values(GROUPS).forEach(g => {
    if (!g.pending) return;
    const block = document.createElement('div');
    block.className = 'group-block';
    block.innerHTML = `<div class="group-block-header"><span class="group-block-label">${g.label}</span><span class="group-block-sublabel">${g.sublabel}</span></div>`;
    block.appendChild(createPendingSlot(g.pending));
    container.appendChild(block);
  });

  // Times no álbum sem grupo (outros candidatos)
  const semGrupo = TIMES_SEM_GRUPO.filter(t => album[t]);
  if (semGrupo.length > 0) {
    const block = document.createElement('div');
    block.className = 'group-block';
    block.innerHTML = `<div class="group-block-header"><span class="group-block-label">Outros Candidatos</span><span class="group-block-sublabel">Times no álbum sem grupo definido</span></div>`;
    semGrupo.forEach(cod => block.appendChild(createTeamSection(cod)));
    container.appendChild(block);
  }

  applyFilter();
}

// ─── INCREMENTAR / DECREMENTAR ───────────────────────────────────────────────
async function handleIncrement(card) {
  const cod = card.dataset.cod;
  const selKey = card.dataset.selecao;
  const res = await fetch(`/api/album/${cod}/increment`, { method: 'POST' });
  const data = await res.json();
  album[selKey].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[selKey].figurinhas[cod]);
  updateTeamProgress(selKey);
  updateSidebarProgress();
  const info = getCardInfo(album[selKey].figurinhas[cod]);
  showToast(`${cod}  +1 — ${info.status}`, data.qtd === 1 ? '#00e676' : '#448aff');
}

async function handleDecrement(card) {
  const cod = card.dataset.cod;
  const selKey = card.dataset.selecao;
  const res = await fetch(`/api/album/${cod}/decrement`, { method: 'POST' });
  const data = await res.json();
  album[selKey].figurinhas[cod].qtd = data.qtd;
  updateCard(card, album[selKey].figurinhas[cod]);
  updateTeamProgress(selKey);
  updateSidebarProgress();
  showToast(`${cod}  -1`, '#ff5252');
}

function updateCard(card, dados) {
  card.className = getCardClass(dados) + (card.className.includes('hidden') ? ' hidden' : '');
  const { emoji, status } = getCardInfo(dados);
  card.querySelector('.sticker-emoji').textContent = emoji;
  card.querySelector('.sticker-status').textContent = status;
  applyFilter();
}

// ─── PROGRESSO ───────────────────────────────────────────────────────────────
function updateTeamProgress(selKey) {
  const sel = album[selKey];
  const total = Object.keys(sel.figurinhas).length;
  const adq = Object.values(sel.figurinhas).filter(f => f.qtd > 0).length;
  const pct = Math.round((adq / total) * 100);
  const fill  = document.getElementById(`tpf-${selKey}`);
  const label = document.getElementById(`tpl-${selKey}`);
  if (fill)  fill.style.width = `${pct}%`;
  if (label) label.textContent = `${adq}/${total} — ${pct}%`;
}

function updateSidebarProgress() {
  const total = 980;
  const adq = Object.values(album).reduce((acc, s) =>
    acc + Object.values(s.figurinhas).filter(f => f.qtd > 0).length, 0);
  const pct = ((adq / total) * 100).toFixed(1);
  document.getElementById('sidebar-fill').style.width = `${pct}%`;
  document.getElementById('sidebar-pct').textContent = `${pct}%`;
  document.getElementById('sidebar-count').textContent = `${adq} de ${total}`;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

// ─── ESTATÍSTICAS ─────────────────────────────────────────────────────────────
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
      <td>${adq}</td><td>${falt}</td><td>${rep}</td>
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

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadAlbum();
