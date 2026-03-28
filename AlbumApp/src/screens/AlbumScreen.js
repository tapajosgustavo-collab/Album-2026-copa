import { useState, useEffect, useCallback, memo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, StyleSheet, ActivityIndicator, Dimensions, Modal, Share
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { getAlbum, increment, decrement } from '../api';
import { GROUPS, flagUrl } from '../groups';

const { width: SW } = Dimensions.get('window');
const NUM_COLS = 5;
const GRID_PAD = 10;
const GAP = 5;
const CARD_W = (SW - GRID_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

const T = {
  bg: '#020b1e', surface: '#04112a', surface2: '#071633', surface3: '#0c1e42',
  border: '#112244', border2: '#1a3060', text: '#e8f2ff', muted: '#4e6e9a',
  gold: '#f5c518', greenDim: '#00c853', green: '#00e676',
  blue: '#4d90ff', red: '#e8112d',
};

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'fwc',   label: '🏆 FWC' },
  ...['A','B','C','D','E','F','G','H','I','J','K','L'].map(k => ({ key: k, label: `Gr. ${k}` })),
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
const TeamSection = memo(({ selKey, sel, onInc, onDec, filter, defaultExpanded, search }) => {
  const [expanded, setExpanded] = useState(defaultExpanded ?? true);

  const figurinhas = Object.entries(sel.figurinhas).sort((a, b) => {
    const numA = parseInt(a[0].replace(/\D/g, ''));
    const numB = parseInt(b[0].replace(/\D/g, ''));
    return numA - numB;
  });
  const total = figurinhas.length;
  const adq   = figurinhas.filter(([, d]) => d.qtd > 0).length;
  const pct   = Math.round((adq / total) * 100);
  const flag  = flagUrl(selKey);

  const searchUpper = (search || '').toUpperCase();
  const filtered = expanded ? figurinhas.filter(([cod, d]) => {
    if (searchUpper && !cod.toUpperCase().includes(searchUpper)) return false;
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

// ── Trade Modal ──────────────────────────────────────────────────────────────
function TradeModal({ visible, onClose, album }) {
  const repetidas = [];
  const faltam    = [];

  for (const sel of Object.values(album)) {
    for (const [cod, f] of Object.entries(sel.figurinhas)) {
      if (f.qtd > 1) repetidas.push({ cod, qtd: f.qtd - 1 });
      if (f.qtd === 0) faltam.push(cod);
    }
  }

  const texto =
    `🏆 *Álbum Copa 2026 - Lista para Troca*\n\n` +
    `🔄 *TENHO REPETIDAS:*\n${repetidas.length ? repetidas.map(r => `${r.cod} (×${r.qtd})`).join(', ') : 'Nenhuma'}\n\n` +
    `❌ *PRECISO:*\n${faltam.length ? faltam.join(', ') : 'Nenhuma'}\n\n` +
    `📲 Me chama pra trocar!`;

  async function handleShare() {
    await Share.share({ message: texto });
  }

  async function handleCopy() {
    await Clipboard.setStringAsync(texto);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalBox}>
          {/* Header */}
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>🔄 Lista para Troca</Text>
            <TouchableOpacity style={s.modalClose} onPress={onClose}>
              <Text style={s.modalCloseTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={s.modalBody} contentContainerStyle={{ gap: 20 }}>
            {/* Repetidas */}
            <View>
              <Text style={s.tradeLabel}>🔄 TENHO REPETIDAS</Text>
              <View style={s.tagWrap}>
                {repetidas.length
                  ? repetidas.map(r => (
                      <View key={r.cod} style={s.tagRep}>
                        <Text style={s.tagRepTxt}>{r.cod} ×{r.qtd}</Text>
                      </View>
                    ))
                  : <Text style={s.tradeEmpty}>Nenhuma repetida ainda</Text>
                }
              </View>
            </View>

            {/* Faltam */}
            <View>
              <Text style={[s.tradeLabel, s.tradeLabelRed]}>❌ PRECISO</Text>
              <View style={s.tagWrap}>
                {faltam.length
                  ? faltam.map(cod => (
                      <View key={cod} style={s.tagFalta}>
                        <Text style={s.tagFaltaTxt}>{cod}</Text>
                      </View>
                    ))
                  : <Text style={s.tradeEmpty}>Coleção completa! 🏆</Text>
                }
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={s.modalFooter}>
            <TouchableOpacity style={s.tradeBtnCopy} onPress={handleCopy}>
              <Text style={s.tradeBtnTxt}>📋 Copiar texto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.tradeBtnShare} onPress={handleShare}>
              <Text style={[s.tradeBtnTxt, { color: '#25d366' }]}>💬 Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Progresso por grupo ──────────────────────────────────────────────────────
function getGroupPct(tabKey, album) {
  const group = GROUPS[tabKey];
  if (!group) return null; // "todas"
  let total = 0, adq = 0;
  group.times.forEach(cod => {
    if (!album[cod]) return;
    const figs = Object.values(album[cod].figurinhas);
    total += figs.length;
    adq += figs.filter(f => f.qtd > 0).length;
  });
  return total > 0 ? Math.round((adq / total) * 100) : 0;
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AlbumScreen() {
  const [album, setAlbum]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [view, setView]         = useState('A');
  const [filter, setFilter]     = useState('todas');
  const [tradeOpen, setTradeOpen] = useState(false);
  const [search, setSearch]       = useState('');

  useEffect(() => { loadAlbum(); }, []);

  async function loadAlbum() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAlbum();
      setAlbum(data);
    } catch {
      setError('Não foi possível conectar à API.\nVerifique se o servidor Flask está rodando.');
    } finally {
      setLoading(false);
    }
  }

  // Optimistic update: atualiza a UI imediatamente, reverte se falhar
  const handleInc = useCallback((cod, selKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    increment(cod).catch(() => {
      // Reverte se a API falhar
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
    });
  }, []);

  const handleDec = useCallback((cod, selKey) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
    decrement(cod).catch(() => {
      // Reverte se a API falhar
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
    });
  }, []);

  // Na aba "Todas", times ficam colapsados por padrão para não travar
  const defaultExpanded = view !== 'todas';

  function renderContent() {
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
          <TeamSection key={cod} selKey={cod} sel={album[cod]} onInc={handleInc} onDec={handleDec} filter={filter} defaultExpanded={defaultExpanded} search={search} />
        ))}
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

  // Calcular progresso geral
  const totalFig = 980; // 48 seleções + FWC × 20 (repescagem dupla não conta)
  const adqFig   = Object.values(album).reduce((a, sel) => a + Object.values(sel.figurinhas).filter(f => f.qtd > 0).length, 0);
  const repFig   = Object.values(album).reduce((a, sel) => a + Object.values(sel.figurinhas).reduce((acc, f) => acc + Math.max(0, f.qtd - 1), 0), 0);
  const pctGeral = totalFig > 0 ? ((adqFig / totalFig) * 100).toFixed(1) : '0.0';

  return (
    <View style={s.root}>
      <TradeModal visible={tradeOpen} onClose={() => setTradeOpen(false)} album={album} />

      {/* Botão flutuante com badge */}
      <TouchableOpacity style={s.fab} onPress={() => setTradeOpen(true)}>
        <Text style={s.fabTxt}>🔄</Text>
        {repFig > 0 && (
          <View style={s.fabBadge}>
            <Text style={s.fabBadgeTxt}>{repFig}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Busca */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="Buscar figurinha (ex: BRA5)"
          placeholderTextColor={T.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity style={s.searchClear} onPress={() => setSearch('')}>
            <Text style={s.searchClearTxt}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progresso geral */}
      <View style={s.topProgress}>
        <View style={s.topProgressInfo}>
          <Text style={s.topPct}>{pctGeral}%</Text>
          <Text style={s.topCount}>{adqFig}/{totalFig} figurinhas  ·  🔄 {repFig} repetidas</Text>
        </View>
        <View style={s.topTrack}>
          <View style={[s.topFill, { width: `${pctGeral}%` }]} />
        </View>
      </View>

      {/* Group Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsWrap} contentContainerStyle={s.tabsContent}>
        {TABS.map(tab => {
          const grpPct = getGroupPct(tab.key, album);
          return (
            <TouchableOpacity key={tab.key} style={[s.tab, view === tab.key && s.tabActive]} onPress={() => setView(tab.key)}>
              <Text style={[s.tabTxt, view === tab.key && s.tabTxtActive]}>
                {tab.label}
                {grpPct !== null && <Text style={[s.tabPct, view === tab.key && s.tabPctActive]}> {grpPct}%</Text>}
              </Text>
            </TouchableOpacity>
          );
        })}
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

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 10, color: T.text, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  searchClear: { marginLeft: 8, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  searchClearTxt: { color: T.muted, fontSize: 12 },

  // Top progress
  topProgress: { backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, paddingHorizontal: 14, paddingVertical: 10 },
  topProgressInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  topPct: { color: T.gold, fontSize: 18, fontWeight: '800' },
  topCount: { color: T.muted, fontSize: 11, fontWeight: '600' },
  topTrack: { height: 6, backgroundColor: T.surface3, borderRadius: 99, overflow: 'hidden' },
  topFill: { height: '100%', backgroundColor: T.greenDim, borderRadius: 99 },

  tabsWrap: { backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, maxHeight: 50 },
  tabsContent: { paddingHorizontal: 10, paddingVertical: 8, gap: 6, flexDirection: 'row' },
  tab: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  tabActive: { backgroundColor: 'rgba(245,200,66,0.12)', borderColor: T.gold },
  tabTxt: { color: T.muted, fontSize: 12, fontWeight: '700' },
  tabTxtActive: { color: T.gold },
  tabPct: { fontSize: 9, fontWeight: '800', color: T.greenDim },
  tabPctActive: { color: T.gold },

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

  // FAB
  fab: { position: 'absolute', bottom: 24, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.green, alignItems: 'center', justifyContent: 'center', zIndex: 50, shadowColor: T.green, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  fabTxt: { fontSize: 24 },
  fabBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: T.red, borderRadius: 12, minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  fabBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // Trade Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: T.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, borderColor: T.border2, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  modalTitle: { color: T.text, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  modalClose: { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border, borderRadius: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  modalCloseTxt: { color: T.muted, fontSize: 14 },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: T.border },
  tradeLabel: { color: T.blue, fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, backgroundColor: 'rgba(68,138,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, alignSelf: 'flex-start' },
  tradeLabelRed: { color: T.red, backgroundColor: 'rgba(255,82,82,0.1)' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagRep: { backgroundColor: 'rgba(68,138,255,0.12)', borderWidth: 1, borderColor: 'rgba(68,138,255,0.25)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagRepTxt: { color: T.blue, fontSize: 12, fontWeight: '700' },
  tagFalta: { backgroundColor: 'rgba(255,82,82,0.08)', borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  tagFaltaTxt: { color: '#ff7575', fontSize: 12, fontWeight: '700' },
  tradeEmpty: { color: T.muted, fontSize: 13, fontStyle: 'italic' },
  tradeBtnCopy: { flex: 1, backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border2, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  tradeBtnShare: { flex: 1, backgroundColor: 'rgba(37,211,102,0.1)', borderWidth: 1, borderColor: 'rgba(37,211,102,0.3)', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  tradeBtnTxt: { color: T.text, fontSize: 13, fontWeight: '700' },
});
