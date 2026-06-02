// ============================================
// ROOT LAYOUT (RootLayout)
// Carga fuentes y gestiona el SplashScreen.
// Árbol de providers:
//   ThemeProvider > AuthProvider >
//   NotificationProvider > RatingProvider
//
// RootLayoutNav bifurca según el token:
//   sin token → Stack de auth (index / splash / auth).
//   con token  → Stack de tabs + pantallas adicionales
//               (ticket/[id], editar-perfil, etc.)
//               envuelto en GestureHandlerRootView y
//               Animated.View para la transición de tema.
// ============================================

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Animated } from "react-native";
import { Stack } from "expo-router";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { RatingProvider, useRating } from "@/context/RatingContext";
import RatingModal from "@/components/RatingModal";

// Mantiene el splash visible hasta que las fuentes estén
// listas; debe llamarse antes del primer render.
SplashScreen.preventAutoHideAsync();

function GlobalModals() {
  const { pendingRating, submitRating, skipRating } = useRating();
  return (
    <RatingModal
      visible={!!pendingRating}
      ticketSubject={pendingRating?.ticketSubject ?? ""}
      techs={pendingRating?.techs ?? []}
      onSubmit={submitRating}
      onSkip={skipRating}
    />
  );
}

function RootLayoutNav() {
  const { state } = useAuth();
  const { fadeAnim } = useTheme();
  const router = useRouter();

  // Redirige a tabs cuando el token cambia mientras el
  // componente ya está montado (p.ej. al hacer login
  // desde la pantalla de auth).
  useEffect(() => {
    if (!state.isLoading) {
      if (state.userToken) {
        router.replace("/(tabs)");
      }
    }
  }, [state.userToken, state.isLoading]);

  // Evita el flash de la pantalla incorrecta mientras
  // se lee el token de SecureStore al arrancar.
  if (state.isLoading) {
    return null;
  }

  if (state.userToken != null) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* fadeAnim suaviza la transición entre temas claro/oscuro. */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ticket/[id]" />
            <Stack.Screen name="editar-perfil" />
            <Stack.Screen name="cambiar-contrasena" />
            <Stack.Screen name="politicas-garantia" />
          </Stack>
        </Animated.View>
        <GlobalModals />
      </GestureHandlerRootView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("@expo-google-fonts/poppins").Poppins_400Regular,
    "Poppins-Bold": require("@expo-google-fonts/poppins").Poppins_700Bold,
    MICROGBE: require("@/assets/Fonts/MICROGBE.ttf"),
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
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <RatingProvider>
            <RootLayoutNav />
          </RatingProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
