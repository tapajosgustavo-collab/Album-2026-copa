// -----------------------------------------------------------------------------
// API client — usa Supabase em produção e Flask em dev (opcional)
// -----------------------------------------------------------------------------
// A assinatura pública foi mantida igual à versão Flask original
// (`getAlbum`, `getStats`, `increment`, `decrement`) para que os screens não
// precisem mudar. Por baixo, chamamos o Postgres via Supabase JS SDK, que
// respeita as políticas RLS — cada usuário só enxerga o próprio álbum.
// -----------------------------------------------------------------------------

import { supabase } from './supabase';

// Fallback para modo dev local: se as env vars do Supabase não estiverem
// setadas, caímos de volta no Flask (compatibilidade com o fluxo antigo).
// Remova depois que tudo estiver em produção.
const USE_FLASK_FALLBACK =
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const FLASK_URL = process.env.EXPO_PUBLIC_FLASK_URL || 'http://192.168.0.216:5000';

export const API_URL = USE_FLASK_FALLBACK ? FLASK_URL : 'supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Flask fallback helpers (modo dev)
// ─────────────────────────────────────────────────────────────────────────────
async function flaskRequest(path, options) {
  const res = await fetch(`${FLASK_URL}${path}`, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// getAlbum — monta o álbum no formato { [section]: { nome, figurinhas: {...} } }
// que a UI já espera, a partir da tabela `stickers` do Supabase.
// ─────────────────────────────────────────────────────────────────────────────
export async function getAlbum() {
  if (USE_FLASK_FALLBACK) {
    return flaskRequest('/api/album');
  }

  const { data, error } = await supabase
    .from('stickers')
    .select('code, section, section_name, qtd, is_shiny')
    .order('code', { ascending: true });

  if (error) throw error;

  // Converte o array plano em dicionário agrupado por seção
  const album = {};
  for (const row of data) {
    if (!album[row.section]) {
      album[row.section] = {
        nome: row.section_name,
        figurinhas: {},
      };
    }
    album[row.section].figurinhas[row.code] = {
      qtd: row.qtd,
      status: row.qtd === 0 ? 'falta' : row.qtd === 1 ? 'tenho' : 'repetida',
      is_shiny: row.is_shiny,
    };
  }
  return album;
}

// ─────────────────────────────────────────────────────────────────────────────
// getStats — agrega totais no cliente (RLS já filtrou pelo usuário)
// ─────────────────────────────────────────────────────────────────────────────
export async function getStats() {
  if (USE_FLASK_FALLBACK) {
    return flaskRequest('/api/estatisticas');
  }

  const { data, error } = await supabase
    .from('stickers')
    .select('qtd');

  if (error) throw error;

  const total = data.length;
  const adquiridas = data.filter(s => s.qtd > 0).length;
  const faltam = total - adquiridas;
  const repetidas = data.reduce((acc, s) => acc + Math.max(0, s.qtd - 1), 0);
  const porcentagem = total > 0 ? Math.round((adquiridas / total) * 100) : 0;

  return { total, adquiridas, faltam, repetidas, porcentagem };
}

// ─────────────────────────────────────────────────────────────────────────────
// increment / decrement — RPCs atômicos (evitam race condition)
// ─────────────────────────────────────────────────────────────────────────────
export async function increment(cod) {
  if (USE_FLASK_FALLBACK) {
    return flaskRequest(`/api/album/${cod}/increment`, { method: 'POST' });
  }

  const { data, error } = await supabase.rpc('sticker_increment', { p_code: cod });
  if (error) throw error;
  return { qtd: data };
}

export async function decrement(cod) {
  if (USE_FLASK_FALLBACK) {
    return flaskRequest(`/api/album/${cod}/decrement`, { method: 'POST' });
  }

  const { data, error } = await supabase.rpc('sticker_decrement', { p_code: cod });
  if (error) throw error;
  return { qtd: data };
}
