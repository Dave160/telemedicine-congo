import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#2db87a';

export default function DoctorTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { paddingBottom: 6, paddingTop: 4, height: 64, borderTopColor: '#f0f0f0' },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"         options={{ title: 'Accueil',       tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="appointments"  options={{ title: 'Consultations',  tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="patients"      options={{ title: 'Patients',       tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="availabilities"options={{ title: 'Agenda',         tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="profile"       options={{ title: 'Profil',         tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} /> }} />
      <Tabs.Screen name="subscription"  options={{ href: null }} />
      <Tabs.Screen name="earnings"      options={{ href: null }} />
    </Tabs>
  );
}
