import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#2db87a';

export default function PatientTabsLayout() {
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Médecins',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'medical' : 'medical-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'RDV',
          tabBarIcon: () => (
            <View style={{
              width: 50, height: 50, borderRadius: 999, backgroundColor: PRIMARY,
              alignItems: 'center', justifyContent: 'center', marginBottom: 22,
              shadowColor: PRIMARY, shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
            }}>
              <Ionicons name="add" size={30} color="#fff" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="prescriptions" options={{ href: null }} />
      <Tabs.Screen name="doctor" options={{ href: null }} />
    </Tabs>
  );
}
