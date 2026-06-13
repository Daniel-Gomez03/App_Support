// Pantalla de bienvenida animada que se muestra
// después del splash nativo de Expo (gestionado en
// _layout.tsx). AnimatedLogo maneja su propia
// navegación al terminar la animación.
import React from "react";
import AnimatedLogo from "@/components/AnimatedLogo";

export default function SplashScreen() {
  return <AnimatedLogo />;
}
