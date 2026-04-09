import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function DoctorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 4, paddingTop: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏠</Text> }} />
      <Tabs.Screen name="appointments" options={{ title: 'Consultations', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>📅</Text> }} />
      <Tabs.Screen name="availabilities" options={{ title: 'Agenda', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗓️</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text> }} />
    </Tabs>
  );
}
