// ============================================
// LAYOUT: FLUJO DE AUTENTICACIÓN (AuthLayout)
// Stack sin header para las pantallas de auth:
//   login, register, verify-email,
//   forgot-password, reset-password.
//
// animation: "none" — evita el slide entre
//   pantallas de fondo visual similar.
// gestureEnabled: false — impide el swipe-back
//   en todo el flujo para que el usuario no
//   pueda retroceder a una pantalla anterior
//   con datos ya enviados.
// ============================================

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="register" options={{ gestureEnabled: false }} />
      <Stack.Screen name="verify-email" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="forgot-password"
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="reset-password" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
