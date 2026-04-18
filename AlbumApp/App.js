// -----------------------------------------------------------------------------
// App raiz — AuthProvider + gate de autenticação
// -----------------------------------------------------------------------------
// Se o usuário não estiver autenticado, mostra LoginScreen/SignupScreen.
// Se estiver, renderiza o app normal (tabs).
// Quando o Supabase não está configurado (sem .env), o AuthProvider libera
// acesso sem login para manter o modo dev Flask funcionando.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import AlbumScreen from './src/screens/AlbumScreen';
import StatsScreen from './src/screens/StatsScreen';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import LoginScreen from './src/auth/LoginScreen';
import SignupScreen from './src/auth/SignupScreen';

const Tab = createBottomTabNavigator();

// Se o Supabase não está configurado, roda no modo dev (Flask) sem gate de auth.
const AUTH_REQUIRED =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ─── Tabs principais (mesmo layout do app antigo) ────────────────────────────
function MainTabs() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#0b1018',
            borderTopColor: '#1a2b3a',
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#f5c842',
          tabBarInactiveTintColor: '#4d6b82',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
          headerStyle: { backgroundColor: '#06080f', borderBottomColor: '#1a2b3a', borderBottomWidth: 1 },
          headerTintColor: '#ddeaf5',
          headerTitleStyle: { fontWeight: '800', fontSize: 16, letterSpacing: 1 },
          headerShadowVisible: false,
        }}
      >
        <Tab.Screen
          name="Álbum"
          component={AlbumScreen}
          options={{
            headerTitle: '🏆  Meu Álbum 2026',
            tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Estatísticas"
          component={StatsScreen}
          options={{
            headerTitle: '📊  Estatísticas',
            tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Gate: decide entre Login/Signup/Tabs ────────────────────────────────────
function RootGate() {
  const { session, loading } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Em modo dev (sem Supabase), libera direto
  if (!AUTH_REQUIRED) return <MainTabs />;

  if (loading) {
    return (
      <View style={styles.loadingBg}>
        <ActivityIndicator size="large" color="#f5c518" />
      </View>
    );
  }

  if (!session) {
    const toggle = () => setMode(m => (m === 'login' ? 'signup' : 'login'));
    return mode === 'login'
      ? <LoginScreen onToggleMode={toggle} />
      : <SignupScreen onToggleMode={toggle} />;
  }

  return <MainTabs />;
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingBg: {
    flex: 1,
    backgroundColor: '#020b1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
