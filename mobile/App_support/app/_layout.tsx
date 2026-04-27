import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!state.isLoading) {
            if (state.userToken) {
                router.replace('/(tabs)');
            }
        }
    }, [state.userToken, state.isLoading]);

    if (state.isLoading) {
        return null;
    }

    if (state.userToken != null) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="ticket/[id]" />
                </Stack>
            </GestureHandlerRootView>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="auth" />
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        'Poppins-Regular': require('@expo-google-fonts/poppins').Poppins_400Regular,
        'Poppins-Bold': require('@expo-google-fonts/poppins').Poppins_700Bold,
        'MICROGBE': require('@/assets/Fonts/MICROGBE.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <AuthProvider>
            <RootLayoutNav />
        </AuthProvider>
    );
}