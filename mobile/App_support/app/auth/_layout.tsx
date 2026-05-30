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
