// -----------------------------------------------------------------------------
// SignupScreen — criação de conta com e-mail + senha
// -----------------------------------------------------------------------------

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from './AuthContext';

const T = {
  bg: '#020b1e', surface: '#04112a', surface2: '#071633',
  border: '#112244', border2: '#1a3060', text: '#e8f2ff', muted: '#4e6e9a',
  gold: '#f5c518', green: '#00e676',
};

export default function SignupScreen({ onToggleMode }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  async function handleSubmit() {
    setError(null);
    setInfo(null);

    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const data = await signUp(email.trim(), password);
      if (data?.session) {
        // já logado (caso confirmação de e-mail esteja desativada no projeto)
        return;
      }
      setInfo(
        'Conta criada! Verifique seu e-mail para confirmar e depois faça login.'
      );
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
          <Text style={s.logoSub}>Crie sua conta grátis.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Criar conta</Text>

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

          <Text style={s.label}>Senha (mín. 6 caracteres)</Text>
          <TextInput
            style={s.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={T.muted}
            secureTextEntry
            editable={!loading}
          />

          <Text style={s.label}>Confirmar senha</Text>
          <TextInput
            style={s.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor={T.muted}
            secureTextEntry
            editable={!loading}
          />

          {error && <Text style={s.error}>{error}</Text>}
          {info && <Text style={s.info}>{info}</Text>}

          <TouchableOpacity
            style={[s.btnPrimary, loading && s.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color={T.bg} />
              : <Text style={s.btnPrimaryTxt}>Criar conta</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnLink}
            onPress={onToggleMode}
            disabled={loading}
          >
            <Text style={s.btnLinkTxt}>
              Já tem conta? <Text style={s.btnLinkTxtStrong}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function traduzErro(msg) {
  if (!msg) return 'Erro ao criar conta. Tente novamente.';
  const lower = msg.toLowerCase();
  if (lower.includes('already registered')) return 'Esse e-mail já tem conta.';
  if (lower.includes('password')) return 'Senha inválida (mínimo 6 caracteres).';
  if (lower.includes('email')) return 'E-mail inválido.';
  return msg;
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logoEmoji: { fontSize: 56, marginBottom: 8 },
  logoTitle: { color: T.gold, fontSize: 26, fontWeight: '900', letterSpacing: 2 },
  logoSub: { color: T.muted, fontSize: 13, marginTop: 4 },

  card: {
    backgroundColor: T.surface,
    borderWidth: 1, borderColor: T.border,
    borderRadius: 16, padding: 20,
  },
  cardTitle: { color: T.text, fontSize: 18, fontWeight: '800', letterSpacing: 1, marginBottom: 18 },

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
    borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 14,
  },
  info: {
    color: T.green,
    backgroundColor: 'rgba(0,230,118,0.08)',
    borderWidth: 1, borderColor: 'rgba(0,230,118,0.2)',
    borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 14,
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
