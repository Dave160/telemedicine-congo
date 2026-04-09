import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../stores/authStore';

export default function RootLayout() {
  const { user, isAuthenticated, loading, init } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (user?.role === 'DOCTOR') router.replace('/doctor');
      else if (user?.role === 'ADMIN') router.replace('/admin');
      else router.replace('/patient');
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) return null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="patient" />
        <Stack.Screen name="doctor" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="chat/[conversationId]" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
