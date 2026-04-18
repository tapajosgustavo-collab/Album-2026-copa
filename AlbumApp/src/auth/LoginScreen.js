// -----------------------------------------------------------------------------
// LoginScreen — e-mail + senha
// -----------------------------------------------------------------------------
// Alterna entre modos `login` e `signup` via `onToggleMode`. O estado global
// de sessão mora no AuthContext — esta tela só dispara as ações.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from './AuthContext';

const T = {
  bg: '#020b1e', surface: '#04112a', surface2: '#071633', surface3: '#0c1e42',
  border: '#112244', border2: '#1a3060', text: '#e8f2ff', muted: '#4e6e9a',
  gold: '#f5c518', green: '#00e676', red: '#e8112d',
};

export default function LoginScreen({ onToggleMode }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // sucesso: o AuthProvider detecta a mudança e troca a tela automaticamente
    } catch (err) {
      setError(traduzErro(err?.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.logoWrap}>
          <Text style={s.logoEmoji}>🏆</Text>
          <Text style={s.logoTitle}>Meu Álbum 2026</Text>
          <Text style={s.logoSub}>Sua coleção, do seu jeito.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Entrar</Text>

          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input}
            value={email}
            onChangeText={setEmail}
            placeholder="voce@exemplo.com"
            placeholderTextColor={T.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={s.label}>Senha</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={T.muted}
            secureTextEntry
            editable={!loading}
          />

          {error && <Text style={s.error}>{error}</Text>}

          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={T.bg} />
              : <Text style={s.btnPrimaryTxt}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnLink}
            onPress={onToggleMode}
            disabled={loading}
          >
            <Text style={s.btnLinkTxt}>
              Não tem conta? <Text style={s.btnLinkTxtStrong}>Criar uma</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traduzErro(msg) {
  if (!msg) return 'Erro ao entrar. Tente novamente.';
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (lower.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (lower.includes('network')) return 'Sem conexão com o servidor.';
  return msg;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoTitle: { color: T.gold, fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  logoSub: { color: T.muted, fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.border,
    borderRadius: 16, padding: 20,
  },
  cardTitle: {
    color: T.text, fontSize: 18, fontWeight: '800',
    letterSpacing: 1, marginBottom: 18,
  },

  label: { color: T.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, letterSpacing: 1 },
  input: {
    backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border2,
    borderRadius: 10, color: T.text, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 15, marginBottom: 14,
  },

  error: {
    color: '#ff7575',
    backgroundColor: 'rgba(255,82,82,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,82,82,0.2)',
    borderRadius: 8, padding: 10,
    fontSize: 13, marginBottom: 14,
  },

  btnPrimary: {
    backgroundColor: T.gold, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center', marginTop: 4,
  },
  btnPrimaryTxt: { color: T.bg, fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  btnDisabled: { opacity: 0.6 },

  btnLink: { alignItems: 'center', paddingVertical: 14 },
  btnLinkTxt: { color: T.muted, fontSize: 13 },
  btnLinkTxtStrong: { color: T.gold, fontWeight: '800' },
});
