import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import AlbumScreen from './src/screens/AlbumScreen';
import StatsScreen from './src/screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
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
            headerTitle: '🏆  Álbum Copa 2026',
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
