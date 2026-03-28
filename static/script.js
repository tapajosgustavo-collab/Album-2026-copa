// ─── MAPA DE FLAGS ───────────────────────────────────────────────────────────
const ISO = {
  FWC:'un', USA:'us', MEX:'mx', CAN:'ca', BRA:'br', ARG:'ar',
  FRA:'fr', ENG:'gb-eng', GER:'de', ESP:'es', ITA:'it', POR:'pt',
  NED:'nl', BEL:'be', CRO:'hr', URU:'uy', COL:'co', MAR:'ma',
  SEN:'sn', JPN:'jp', KOR:'kr', AUS:'au', ECU:'ec', SUI:'ch',
  DEN:'dk', POL:'pl', SWE:'se', TUR:'tr',
  EGY:'eg', GHA:'gh', TUN:'tn', ALG:'dz',
  KSA:'sa', IRN:'ir', IRQ:'iq', UZB:'uz',
  PAN:'pa', JAM:'jm', NZL:'nz', PAR:'py',
  RSA:'za', QAT:'qa', HAI:'ht', SCO:'gb-sct', CUW:'cw', CIV:'ci',
  CPV:'cv', NOR:'no', AUT:'at', JOR:'jo'
};

function flagImg(code, size = 32) {
  const iso = ISO[code];
  if (!iso) return '<span class="flag-placeholder">🌍</span>';
  return `<img src="https://flagcdn.com/w${size}/${iso}.png" alt="${code}" class="flag-img">`;
}

// ─── GRUPOS ──────────────────────────────────────────────────────────────────
const GROUPS = {
  fwc: { label: 'FWC', sublabel: 'Símbolos & Estádios', times: ['FWC'] },
  A: { label: 'Grupo A', sublabel: 'México · Coreia do Sul · África do Sul · Dinamarca', times: ['MEX', 'KOR', 'RSA', 'DEN'] },
  B: { label: 'Grupo B', sublabel: 'Canadá · Suíça · Catar · Itália', times: ['CAN', 'SUI', 'QAT', 'ITA'] },
  C: { label: 'Grupo C', sublabel: 'Brasil · Marrocos · Haiti · Escócia', times: ['BRA', 'MAR', 'HAI', 'SCO'] },
  D: { label: 'Grupo D', sublabel: 'Estados Unidos · Paraguai · Austrália · Turquia', times: ['USA', 'PAR', 'AUS', 'TUR'] },
  E: { label: 'Grupo E', sublabel: 'Alemanha · Equador · Curaçao · Costa do Marfim', times: ['GER', 'ECU', 'CUW', 'CIV'] },
  F: { label: 'Grupo F', sublabel: 'Holanda · Japão · Tunísia · Suécia · Polônia', times: ['NED', 'JPN', 'TUN', 'SWE', 'POL'] },
  G: { label: 'Grupo G', sublabel: 'Bélgica · Egito · Irã · Nova Zelândia', times: ['BEL', 'EGY', 'IRN', 'NZL'] },
  H: { label: 'Grupo H', sublabel: 'Espanha · Cabo Verde · Arábia Saudita · Uruguai', times: ['ESP', 'CPV', 'KSA', 'URU'] },
  I: { label: 'Grupo I', sublabel: 'França · Senegal · Noruega · Iraque', times: ['FRA', 'SEN', 'NOR', 'IRQ'] },
  J: { label: 'Grupo J', sublabel: 'Argentina · Argélia · Áustria · Jordânia', times: ['ARG', 'ALG', 'AUT', 'JOR'] },
  K: { label: 'Grupo K', sublabel: 'Portugal · Uzbequistão · Colômbia · Jamaica', times: ['POR', 'UZB', 'COL', 'JAM'] },
  L: { label: 'Grupo L', sublabel: 'Inglaterra · Croácia · Gana · Panamá', times: ['ENG', 'CRO', 'GHA', 'PAN'] },
};

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
  try {
    const res = await fetch('/api/album');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    album = await res.json();
    updateSidebarProgress();
    renderView(currentView);
  } catch (e) {
    console.error('[loadAlbum]', e);
    document.getElementById('album-sections').innerHTML = `
      <div style="text-align:center;padding:60px 20px;">
        <div style="font-size:40px;margin-bottom:12px;">⚠️</div>
        <p style="color:var(--muted);margin-bottom:20px;">Não foi possível conectar à API.<br>Verifique se o servidor Flask está rodando.</p>
        <button onclick="loadAlbum()" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:10px 24px;border-radius:10px;cursor:pointer;font-weight:700;">Tentar novamente</button>
      </div>`;
  }
}

// ─── RENDERIZAR VIEW ─────────────────────────────────────────────────────────
function renderView(view) {
  const container = document.getElementById('album-sections');
  container.innerHTML = '';

  if (view === 'todas') {
    // FWC primeiro, depois todos os grupos
    renderGroupBlock(container, GROUPS.fwc);
    Object.entries(GROUPS).forEach(([key, g]) => {
      if (key !== 'fwc') renderGroupBlock(container, g);
    });
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

  // Times com figurinhas no álbum
  group.times.forEach(cod => {
    if (album[cod]) block.appendChild(createTeamSection(cod));
  });

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
  const sorted = Object.entries(sel.figurinhas).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, ''));
    const numB = parseInt(b[0].replace(/\D/g, ''));
    return numA - numB;
  });
  for (const [cod, dados] of sorted) {
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

// ─── INCREMENTAR / DECREMENTAR ───────────────────────────────────────────────
async function handleIncrement(card) {
  const cod = card.dataset.cod;
  const selKey = card.dataset.selecao;
  // Optimistic update
  album[selKey].figurinhas[cod].qtd += 1;
  updateCard(card, album[selKey].figurinhas[cod]);
  updateTeamProgress(selKey);
  updateSidebarProgress();
  const info = getCardInfo(album[selKey].figurinhas[cod]);
  showToast(`${cod}  +1 — ${info.status}`, album[selKey].figurinhas[cod].qtd === 1 ? '#00e676' : '#448aff');
  try {
    const res = await fetch(`/api/album/${cod}/increment`, { method: 'POST' });
    if (!res.ok) throw new Error();
  } catch {
    album[selKey].figurinhas[cod].qtd -= 1;
    updateCard(card, album[selKey].figurinhas[cod]);
    showToast('Erro ao salvar — sem conexão?', 'var(--red)');
  }
}

async function handleDecrement(card) {
  const cod = card.dataset.cod;
  const selKey = card.dataset.selecao;
  const oldQtd = album[selKey].figurinhas[cod].qtd;
  if (oldQtd <= 0) return;
  // Optimistic update
  album[selKey].figurinhas[cod].qtd -= 1;
  updateCard(card, album[selKey].figurinhas[cod]);
  updateTeamProgress(selKey);
  updateSidebarProgress();
  showToast(`${cod}  -1`, '#ff5252');
  try {
    const res = await fetch(`/api/album/${cod}/decrement`, { method: 'POST' });
    if (!res.ok) throw new Error();
  } catch {
    album[selKey].figurinhas[cod].qtd = oldQtd;
    updateCard(card, album[selKey].figurinhas[cod]);
    showToast('Erro ao salvar — sem conexão?', 'var(--red)');
  }
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
  const total = 980; // 48 seleções + FWC × 20 (repescagem dupla não conta)
  const adq = Object.values(album).reduce((acc, s) =>
    acc + Object.values(s.figurinhas).filter(f => f.qtd > 0).length, 0);
  const pct = ((adq / total) * 100).toFixed(1);
  document.getElementById('sidebar-fill').style.width = `${pct}%`;
  document.getElementById('sidebar-pct').textContent = `${pct}%`;
  document.getElementById('sidebar-count').textContent = `${adq} de ${total} figurinhas`;
  updateGroupTabsProgress();
}

function updateGroupTabsProgress() {
  document.querySelectorAll('.group-tab').forEach(tab => {
    const view = tab.dataset.view;
    const group = GROUPS[view];
    if (!group) return; // "todas"
    let total = 0, adq = 0;
    group.times.forEach(cod => {
      if (!album[cod]) return;
      const figs = Object.values(album[cod].figurinhas);
      total += figs.length;
      adq += figs.filter(f => f.qtd > 0).length;
    });
    const pct = total > 0 ? Math.round((adq / total) * 100) : 0;
    // Atualiza o texto da tab com porcentagem
    const baseLabel = tab.dataset.label || tab.textContent.replace(/\s*\d+%$/, '');
    if (!tab.dataset.label) tab.dataset.label = baseLabel;
    tab.innerHTML = `${baseLabel} <span class="tab-pct">${pct}%</span>`;
  });
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
  let stats;
  try {
    const res = await fetch('/api/estatisticas');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    stats = await res.json();
  } catch (e) {
    showToast('Erro ao carregar estatísticas', 'var(--red)');
    console.error('[loadStats]', e);
    return;
  }

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
      <td>${flagImg(key, 40)} ${key}</td>
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

// ─── LISTA PARA TROCA ────────────────────────────────────────────────────────
document.getElementById('btn-trade').addEventListener('click', openTradeModal);
document.getElementById('trade-close').addEventListener('click', closeTradeModal);
document.getElementById('trade-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('trade-overlay')) closeTradeModal();
});

function openTradeModal() {
  const repetidas = [];
  const faltam    = [];

  for (const [, sel] of Object.entries(album)) {
    for (const [cod, f] of Object.entries(sel.figurinhas)) {
      if (f.qtd > 1) repetidas.push({ cod, qtd: f.qtd - 1 });
      if (f.qtd === 0) faltam.push(cod);
    }
  }

  // Renderiza tags de repetidas
  const repEl = document.getElementById('trade-repetidas');
  repEl.innerHTML = repetidas.length
    ? repetidas.map(r => `<span class="trade-tag trade-tag-rep">${r.cod} ×${r.qtd}</span>`).join('')
    : '<span class="trade-empty">Nenhuma repetida ainda</span>';

  // Renderiza tags de faltam
  const faltEl = document.getElementById('trade-faltam');
  faltEl.innerHTML = faltam.length
    ? faltam.map(c => `<span class="trade-tag trade-tag-falta">${c}</span>`).join('')
    : '<span class="trade-empty">Coleção completa! 🏆</span>';

  // Monta texto para compartilhar
  const textoRep   = repetidas.length ? repetidas.map(r => `${r.cod} (×${r.qtd})`).join(', ') : 'Nenhuma';
  const textoFalta = faltam.length    ? faltam.join(', ') : 'Nenhuma';
  const texto = `🏆 *Álbum Copa 2026 - Lista para Troca*\n\n🔄 *TENHO REPETIDAS:*\n${textoRep}\n\n❌ *PRECISO:*\n${textoFalta}\n\n📲 Me chama pra trocar!`;

  // Copiar
  document.getElementById('btn-copy').onclick = () => {
    navigator.clipboard.writeText(texto);
    showToast('Texto copiado!', 'var(--green)');
    setTimeout(closeTradeModal, 800);
  };

  // WhatsApp
  document.getElementById('btn-whatsapp').href =
    `https://wa.me/?text=${encodeURIComponent(texto)}`;

  document.getElementById('trade-overlay').classList.remove('hidden');
}

function closeTradeModal() {
  document.getElementById('trade-overlay').classList.add('hidden');
}

// ─── BUSCA DE FIGURINHA ──────────────────────────────────────────────────────
const searchInput = document.getElementById('search-input');
const searchClear = document.getElementById('search-clear');

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.dispatchEvent(new Event('input'));
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toUpperCase();
  searchClear.classList.toggle('hidden', !query);
  if (!query) {
    // Limpa busca, volta ao normal
    document.querySelectorAll('.sticker-card').forEach(c => c.style.display = '');
    document.querySelectorAll('.team-section').forEach(t => t.style.display = '');
    document.querySelectorAll('.group-block').forEach(b => b.style.display = '');
    document.querySelectorAll('.group-block-header').forEach(h => h.style.display = '');
    return;
  }
  // Esconde todos os cards que não batem, mostra os que batem
  document.querySelectorAll('.sticker-card').forEach(card => {
    const cod = card.dataset.cod.toUpperCase();
    card.style.display = cod.includes(query) ? '' : 'none';
  });
  // Esconde seções de time sem resultados visíveis
  document.querySelectorAll('.team-section').forEach(section => {
    const visibleCards = section.querySelectorAll('.sticker-card:not([style*="display: none"])');
    section.style.display = visibleCards.length > 0 ? '' : 'none';
  });
  // Esconde blocos de grupo que ficaram sem conteúdo visível
  document.querySelectorAll('.group-block').forEach(block => {
    const visibleSections = block.querySelectorAll('.team-section:not([style*="display: none"])');
    block.style.display = visibleSections.length > 0 ? '' : 'none';
  });
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
loadAlbum();
