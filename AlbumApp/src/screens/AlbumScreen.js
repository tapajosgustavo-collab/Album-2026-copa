import { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Dimensions
} from 'react-native';
import { getAlbum, increment, decrement } from '../api';
import { GROUPS, flagUrl } from '../groups';

const { width: SW } = Dimensions.get('window');
const NUM_COLS = 5;
const GRID_PAD = 10;
const GAP = 5;
const CARD_W = (SW - GRID_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

const T = {
  bg: '#06080f', surface: '#0b1018', surface2: '#0f1825', surface3: '#162232',
  border: '#1a2b3a', border2: '#24384d', text: '#ddeaf5', muted: '#4d6b82',
  gold: '#f5c842', green: '#00e676', greenDim: '#00c853',
  blue: '#448aff', red: '#ff5252',
};

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'fwc',   label: '🏆 FWC' },
  ...['A','B','C','D','E','F','G','H','I','J','K','L'].map(k => ({ key: k, label: `Gr. ${k}` })),
  { key: 'pendentes', label: '⏳ Pendentes' },
];

const FILTERS = [
  { key: 'todas',    label: 'Todas' },
  { key: 'falta',    label: 'Faltam' },
  { key: 'tenho',    label: 'Tenho' },
  { key: 'repetida', label: 'Repetidas' },
  { key: 'shiny',    label: '✨ Shiny' },
];

// ── Sticker Card (memo = só re-renderiza se os dados mudarem) ─────────────────
const StickerCard = memo(({ cod, dados, onPress, onLongPress }) => {
  const { is_shiny: isShiny, qtd } = dados;

  let emoji = '❌', statusTxt = 'Falta', cardStyle = s.cardFalta;
  if (qtd === 1) { emoji = '✅'; statusTxt = 'Tenho'; cardStyle = s.cardTenho; }
  if (qtd > 1)   { emoji = '🔄'; statusTxt = `×${qtd}`; cardStyle = s.cardRep; }

  return (
    <TouchableOpacity
      style={[s.card, cardStyle, isShiny && s.cardShiny]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[s.cardStripe,
        isShiny ? s.stripeGold : qtd === 0 ? s.stripeFalta : qtd === 1 ? s.stripeGreen : s.stripeBlue
      ]} />
      <Text style={s.cardEmoji}>{emoji}</Text>
      <Text style={[s.cardCod, isShiny && s.codGold]}>{cod}</Text>
      <Text style={[s.cardStatus, qtd === 1 && s.statusGreen, qtd > 1 && s.statusBlue]}>{statusTxt}</Text>
    </TouchableOpacity>
  );
});

// ── Team Section (collapsível) ────────────────────────────────────────────────
const TeamSection = memo(({ selKey, sel, onInc, onDec, filter, defaultExpanded }) => {
  const [expanded, setExpanded] = useState(defaultExpanded ?? true);

  const figurinhas = Object.entries(sel.figurinhas);
  const total = figurinhas.length;
  const adq   = figurinhas.filter(([, d]) => d.qtd > 0).length;
  const pct   = Math.round((adq / total) * 100);
  const flag  = flagUrl(selKey);

  const filtered = expanded ? figurinhas.filter(([, d]) => {
    if (filter === 'todas')    return true;
    if (filter === 'falta')    return d.qtd === 0;
    if (filter === 'tenho')    return d.qtd === 1;
    if (filter === 'repetida') return d.qtd > 1;
    if (filter === 'shiny')    return d.is_shiny;
    return true;
  }) : [];

  return (
    <View style={s.teamSection}>
      {/* Header clicável para expandir/colapsar */}
      <TouchableOpacity style={s.teamHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        {flag
          ? <Image source={{ uri: flag }} style={s.teamFlag} resizeMode="contain" />
          : <View style={s.teamFlagPlaceholder}><Text>🌍</Text></View>
        }
        <View style={s.teamInfo}>
          <Text style={s.teamName}>{sel.nome}</Text>
          <View style={s.teamProgressRow}>
            <View style={s.teamProgressTrack}>
              <View style={[s.teamProgressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.teamProgressLabel}>{adq}/{total} — {pct}%</Text>
          </View>
        </View>
        <Text style={s.expandIcon}>{expanded ? '▲' : '▼'}</Text>
        <Text style={s.teamCode}>{selKey}</Text>
      </TouchableOpacity>

      {/* Grid só aparece se expandido */}
      {expanded && (
        <View style={s.grid}>
          {filtered.map(([cod, dados]) => (
            <StickerCard
              key={cod}
              cod={cod}
              dados={dados}
              onPress={() => onInc(cod, selKey)}
              onLongPress={() => onDec(cod, selKey)}
            />
          ))}
          {filtered.length === 0 && (
            <Text style={s.emptyFilter}>Nenhuma figurinha nesse filtro</Text>
          )}
        </View>
      )}
    </View>
  );
});

// ── Missing Team ──────────────────────────────────────────────────────────────
function MissingTeam({ nome, cod }) {
  return (
    <View style={[s.teamSection, s.teamMissing]}>
      <View style={s.teamHeader}>
        <View style={s.teamFlagPlaceholder}><Text style={s.missingQ}>?</Text></View>
        <View style={s.teamInfo}>
          <Text style={s.teamName}>{nome}</Text>
          <Text style={s.missingBadge}>Figurinhas em breve</Text>
        </View>
        <Text style={[s.teamCode, { opacity: 0.4 }]}>{cod}</Text>
      </View>
    </View>
  );
}

// ── Pending Slot ──────────────────────────────────────────────────────────────
function PendingSlot({ pending, album, filter, onInc, onDec }) {
  return (
    <View style={s.pendingSlot}>
      <View style={s.pendingHeader}>
        <Text style={s.pendingIcon}>⏳</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.pendingTitle}>{pending.descricao}</Text>
          <Text style={s.pendingSub}>{pending.candidatos}</Text>
        </View>
      </View>
      {pending.albCods?.map(cod => album[cod] && (
        <TeamSection key={cod} selKey={cod} sel={album[cod]} onInc={onInc} onDec={onDec} filter={filter} defaultExpanded={false} />
      ))}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AlbumScreen() {
  const [album, setAlbum]     = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [view, setView]       = useState('A');
  const [filter, setFilter]   = useState('todas');

  useEffect(() => { loadAlbum(); }, []);

  async function loadAlbum() {
    try {
      setError(null);
      const data = await getAlbum();
      setAlbum(data);
    } catch {
      setError('Não foi possível conectar à API.\nVerifique se o servidor Flask está rodando.');
    } finally {
      setLoading(false);
    }
  }

  // Optimistic update: atualiza a UI imediatamente, sincroniza API em background
  const handleInc = useCallback((cod, selKey) => {
    setAlbum(prev => {
      const qtd = prev[selKey].figurinhas[cod].qtd + 1;
      return {
        ...prev,
        [selKey]: {
          ...prev[selKey],
          figurinhas: { ...prev[selKey].figurinhas, [cod]: { ...prev[selKey].figurinhas[cod], qtd } }
        }
      };
    });
    increment(cod); // fire-and-forget
  }, []);

  const handleDec = useCallback((cod, selKey) => {
    setAlbum(prev => {
      const qtd = Math.max(0, prev[selKey].figurinhas[cod].qtd - 1);
      return {
        ...prev,
        [selKey]: {
          ...prev[selKey],
          figurinhas: { ...prev[selKey].figurinhas, [cod]: { ...prev[selKey].figurinhas[cod], qtd } }
        }
      };
    });
    decrement(cod); // fire-and-forget
  }, []);

  // Na aba "Todas", times ficam colapsados por padrão para não travar
  const defaultExpanded = view !== 'todas';

  function renderContent() {
    if (view === 'pendentes') {
      return Object.entries(GROUPS)
        .filter(([, g]) => g.pending)
        .map(([key, g]) => (
          <View key={key} style={s.groupBlock}>
            <View style={s.groupHeader}>
              <Text style={s.groupLabel}>{g.label}</Text>
              <Text style={s.groupSublabel}>{g.sublabel}</Text>
            </View>
            <PendingSlot pending={g.pending} album={album} filter={filter} onInc={handleInc} onDec={handleDec} />
          </View>
        ));
    }

    const groupsToRender = view === 'todas'
      ? Object.entries(GROUPS)
      : view === 'fwc'
        ? [['fwc', GROUPS.fwc]]
        : [[view, GROUPS[view]]];

    return groupsToRender.map(([key, g]) => (
      <View key={key} style={s.groupBlock}>
        {key !== 'fwc' && (
          <View style={s.groupHeader}>
            <Text style={s.groupLabel}>{g.label}</Text>
            <Text style={s.groupSublabel}>{g.sublabel}</Text>
          </View>
        )}
        {g.times.map(cod => album[cod] && (
          <TeamSection key={cod} selKey={cod} sel={album[cod]} onInc={handleInc} onDec={handleDec} filter={filter} defaultExpanded={defaultExpanded} />
        ))}
        {g.missing?.map(m => <MissingTeam key={m.cod} nome={m.nome} cod={m.cod} />)}
        {g.pending && (
          <PendingSlot pending={g.pending} album={album} filter={filter} onInc={handleInc} onDec={handleDec} />
        )}
      </View>
    ));
  }

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={T.gold} />
      <Text style={s.loadingTxt}>Carregando álbum...</Text>
    </View>
  );

  if (error) return (
    <View style={s.center}>
      <Text style={s.errorIcon}>⚠️</Text>
      <Text style={s.errorTxt}>{error}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={loadAlbum}>
        <Text style={s.retryTxt}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.root}>
      {/* Group Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={s.tabsContent}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} style={[s.tab, view === tab.key && s.tabActive, tab.key === 'pendentes' && s.tabPending]} onPress={() => setView(tab.key)}>
            <Text style={[s.tabTxt, view === tab.key && s.tabTxtActive, tab.key === 'pendentes' && s.tabTxtPending]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterWrap} contentContainerStyle={s.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} style={[s.filterBtn, filter === f.key && s.filterActive]} onPress={() => setFilter(f.key)}>
            <Text style={[s.filterTxt, filter === f.key && s.filterTxtActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={s.hint}>Toque +1 · Segure -1 · Toque no time para expandir</Text>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingTxt: { color: T.muted, marginTop: 12, fontSize: 14 },
  errorIcon: { fontSize: 40, marginBottom: 12 },
  errorTxt: { color: T.muted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  retryBtn: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border2, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryTxt: { color: T.text, fontWeight: '700' },

  tabsWrap: { backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, maxHeight: 50 },
  tabsContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 6, flexDirection: 'row' },
  tab: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  tabActive: { backgroundColor: 'rgba(245,200,66,0.12)', borderColor: T.gold },
  tabPending: { borderStyle: 'dashed' },
  tabTxt: { color: T.muted, fontSize: 12, fontWeight: '700' },
  tabTxtActive: { color: T.gold },
  tabTxtPending: { color: 'orange' },

  filterWrap: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: T.border },
  filterContent: { paddingHorizontal: 10, paddingVertical: 6, gap: 6, flexDirection: 'row' },
  filterBtn: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5 },
  filterActive: { backgroundColor: 'rgba(68,138,255,0.15)', borderColor: T.blue },
  filterTxt: { color: T.muted, fontSize: 12, fontWeight: '600' },
  filterTxtActive: { color: T.blue },

  hint: { color: T.muted, fontSize: 10, textAlign: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: T.border },

  scroll: { flex: 1 },
  scrollContent: { padding: 12, paddingBottom: 40 },

  groupBlock: { marginBottom: 28 },
  groupHeader: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: T.border },
  groupLabel: { color: T.gold, fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  groupSublabel: { color: T.muted, fontSize: 11, marginTop: 2 },

  teamSection: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  teamMissing: { opacity: 0.45 },
  teamHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  teamFlag: { width: 44, height: 30, borderRadius: 3 },
  teamFlagPlaceholder: { width: 44, height: 30, backgroundColor: T.surface3, borderRadius: 3, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border2 },
  teamInfo: { flex: 1 },
  teamName: { color: T.text, fontSize: 15, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  teamProgressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamProgressTrack: { flex: 1, height: 4, backgroundColor: T.surface3, borderRadius: 99, overflow: 'hidden' },
  teamProgressFill: { height: '100%', backgroundColor: T.greenDim, borderRadius: 99 },
  teamProgressLabel: { color: T.gold, fontSize: 10, fontWeight: '700' },
  expandIcon: { color: T.muted, fontSize: 10, marginRight: 4 },
  teamCode: { color: T.muted, fontSize: 11, fontWeight: '700', backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  missingQ: { color: T.muted, fontSize: 16 },
  missingBadge: { color: T.muted, fontSize: 11 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: GRID_PAD, gap: GAP },
  emptyFilter: { color: T.muted, fontSize: 12, padding: 12 },

  card: { width: CARD_W, minHeight: 80, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 2, overflow: 'hidden' },
  cardStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  stripeFalta: { backgroundColor: T.border },
  stripeGreen: { backgroundColor: T.green },
  stripeBlue:  { backgroundColor: T.blue },
  stripeGold:  { backgroundColor: T.gold },
  cardFalta: { opacity: 0.4 },
  cardTenho: { borderColor: 'rgba(0,230,118,0.3)', backgroundColor: '#030b07' },
  cardRep:   { borderColor: 'rgba(68,138,255,0.3)', backgroundColor: '#020810' },
  cardShiny: { borderColor: 'rgba(245,200,66,0.4)' },
  cardEmoji:  { fontSize: 16, marginBottom: 2 },
  cardCod:    { color: T.text, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  codGold:    { color: T.gold },
  cardStatus: { color: T.muted, fontSize: 9, fontWeight: '600', marginTop: 1 },
  statusGreen: { color: T.green },
  statusBlue:  { color: T.blue },

  pendingSlot: { backgroundColor: 'rgba(255,168,0,0.04)', borderWidth: 1, borderColor: 'rgba(255,168,0,0.25)', borderRadius: 12, padding: 14, marginBottom: 10 },
  pendingHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  pendingIcon: { fontSize: 20 },
  pendingTitle: { color: 'orange', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  pendingSub: { color: T.muted, fontSize: 11 },
});
