// -----------------------------------------------------------------------------
// Cliente Supabase — compartilhado entre auth e api
// -----------------------------------------------------------------------------
// Lê as credenciais de variáveis de ambiente públicas (EXPO_PUBLIC_*), que o
// Expo injeta automaticamente no bundle. Valores reais ficam em `.env` local
// (não commitado) — veja `AlbumApp/.env.example`.
// -----------------------------------------------------------------------------

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Em dev, avisa alto no console pra o desenvolvedor configurar o .env.
  // Não lança pra não quebrar o hot-reload; o app vai exibir erro de auth.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY ausentes.\n' +
    'Copie AlbumApp/.env.example para AlbumApp/.env e preencha.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'http://localhost:54321',
  SUPABASE_ANON_KEY || 'public-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
