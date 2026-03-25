import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator,
  StyleSheet, Image
} from 'react-native';
import { getStats, getAlbum } from '../api';
import { flagUrl } from '../groups';

const T = {
  bg: '#06080f', surface: '#0b1018', surface2: '#0f1825', surface3: '#162232',
  border: '#1a2b3a', border2: '#24384d', text: '#ddeaf5', muted: '#4d6b82',
  gold: '#f5c842', green: '#00e676', greenDim: '#00c853',
  blue: '#448aff', red: '#ff5252',
};

export default function StatsScreen() {
  const [stats, setStats]   = useState(null);
  const [album, setAlbum]   = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const [s, a] = await Promise.all([getStats(), getAlbum()]);
    setStats(s);
    setAlbum(a);
    setLoading(false);
  }

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={T.gold} />
    </View>
  );

  const pct = stats?.porcentagem ?? 0;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Header */}
      <Text style={s.title}>Progresso Geral</Text>

      {/* Progress Bar */}
      <View style={s.progressWrap}>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={s.progressLabel}>
          <Text style={s.progressBold}>{pct}% Completo</Text>
          {'  '}—{'  '}{stats.adquiridas} de {stats.total} figurinhas
        </Text>
      </View>

      {/* Metrics */}
      <View style={s.metrics}>
        <View style={[s.metric, s.metricGreen]}>
          <View style={[s.metricStripe, { backgroundColor: T.green }]} />
          <Text style={s.metricIcon}>✅</Text>
          <Text style={[s.metricValue, { color: T.green }]}>{stats.adquiridas}</Text>
          <Text style={s.metricLabel}>Adquiridas</Text>
          <Text style={s.metricSub}>figurinhas únicas</Text>
        </View>
        <View style={[s.metric, s.metricRed]}>
          <View style={[s.metricStripe, { backgroundColor: T.red }]} />
          <Text style={s.metricIcon}>❌</Text>
          <Text style={[s.metricValue, { color: T.red }]}>{stats.faltam}</Text>
          <Text style={s.metricLabel}>Faltantes</Text>
          <Text style={s.metricSub}>para completar</Text>
        </View>
        <View style={[s.metric, s.metricBlue]}>
          <View style={[s.metricStripe, { backgroundColor: T.blue }]} />
          <Text style={s.metricIcon}>🔄</Text>
          <Text style={[s.metricValue, { color: T.blue }]}>{stats.repetidas}</Text>
          <Text style={s.metricLabel}>Repetidas</Text>
          <Text style={s.metricSub}>para trocar</Text>
        </View>
      </View>

      {/* Por Seleção */}
      <Text style={s.sectionTitle}>Por Seleção</Text>
      {Object.entries(album).map(([key, sel]) => {
        const total = Object.keys(sel.figurinhas).length;
        const adq   = Object.values(sel.figurinhas).filter(f => f.qtd > 0).length;
        const rep   = Object.values(sel.figurinhas).reduce((a, f) => a + Math.max(0, f.qtd - 1), 0);
        const p     = Math.round((adq / total) * 100);
        const flag  = flagUrl(key);
        return (
          <View key={key} style={s.row}>
            <View style={s.rowLeft}>
              {flag
                ? <Image source={{ uri: flag }} style={s.rowFlag} resizeMode="contain" />
                : <View style={s.rowFlagPlaceholder} />
              }
              <View>
                <Text style={s.rowName}>{sel.nome}</Text>
                <Text style={s.rowCode}>{key}</Text>
              </View>
            </View>
            <View style={s.rowRight}>
              <View style={s.miniTrack}>
                <View style={[s.miniFill, { width: `${p}%` }]} />
              </View>
              <Text style={s.rowPct}>{p}%</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' },

  title: { color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 },

  progressWrap: { backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 20, marginBottom: 20 },
  progressTrack: { height: 18, backgroundColor: T.surface3, borderRadius: 99, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: T.greenDim, borderRadius: 99 },
  progressLabel: { color: T.muted, fontSize: 13 },
  progressBold: { color: T.text, fontWeight: '700', fontSize: 16 },

  metrics: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  metric: { flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, alignItems: 'center', overflow: 'hidden' },
  metricGreen: {}, metricRed: {}, metricBlue: {},
  metricStripe: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  metricIcon: { fontSize: 18, marginBottom: 6 },
  metricValue: { fontSize: 32, fontWeight: '800', lineHeight: 36 },
  metricLabel: { color: T.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  metricSub: { color: T.muted, fontSize: 9, marginTop: 2 },

  sectionTitle: { color: T.muted, fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },

  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 12, marginBottom: 6 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowFlag: { width: 36, height: 24, borderRadius: 3 },
  rowFlagPlaceholder: { width: 36, height: 24, backgroundColor: T.surface3, borderRadius: 3 },
  rowName: { color: T.text, fontSize: 13, fontWeight: '600' },
  rowCode: { color: T.muted, fontSize: 10, fontWeight: '700', marginTop: 1 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniTrack: { width: 70, height: 5, backgroundColor: T.surface3, borderRadius: 99, overflow: 'hidden' },
  miniFill: { height: '100%', backgroundColor: T.greenDim, borderRadius: 99 },
  rowPct: { color: T.gold, fontSize: 11, fontWeight: '700', minWidth: 30, textAlign: 'right' },
});
