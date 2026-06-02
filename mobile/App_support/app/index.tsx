// Punto de entrada para usuarios sin sesión.
// Redirige a splash (pantalla de bienvenida) antes
// de llegar al flujo de auth.
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}