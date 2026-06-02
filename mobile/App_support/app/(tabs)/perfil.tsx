// ============================================
// PANTALLA: PERFIL DE USUARIO (PerfilScreen)
// Muestra la información del cliente autenticado
// y permite gestionar preferencias de la cuenta.
//
// Sub-componentes locales:
//   MenuItem       — fila navegable con ícono y
//                    chevron (→ otra pantalla).
//   MenuItemToggle — fila con Switch; el ícono
//                    rebota al cambiar el valor.
//
// Secciones:
//   CUENTA    — editar perfil, contraseña,
//               notificaciones, modo oscuro.
//   POLÍTICAS — enlace a políticas de garantía.
//   SÍGUENOS  — links a redes sociales de TBOXSA.
// ============================================

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Linking,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { s } from "@/styles/perfil.styles";
import { useNotifications } from "@/context/NotificationContext";

const SOCIAL_LINKS = [
  { icon: "logo-facebook", url: "https://www.facebook.com/tboxsahn/" },
  { icon: "logo-instagram", url: "https://www.instagram.com/tboxsahn/" },
  { icon: "globe-outline", url: "https://tboxsa.com/" },
  { icon: "logo-tiktok", url: "https://www.tiktok.com/@tboxsa?lang=es-419" },
  { icon: "logo-linkedin", url: "https://www.linkedin.com/company/tboxsahn/" },
] as const;

const AVATAR_COLORS = [
  "#3C6034",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#0891B2",
  "#059669",
  "#DC2626",
];

// Asigna un color de avatar determinista basado
// en el código ASCII de la inicial del nombre.
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// La foto es válida solo si es una URL completa
// del SSO; 'default.jpg' indica que no hay foto.
const validPhoto = (foto?: string | null) =>
  !!foto && foto !== "default.jpg" && foto.startsWith("http");

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: import("@/context/ThemeContext").ThemeColors;
}) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.menuIconWrap, { backgroundColor: colors.input }]}>
        <Ionicons name={icon as any} size={20} color={colors.textSub} />
      </View>
      <View style={s.menuText}>
        <Text style={[s.menuTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[s.menuSub, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.border} />
    </TouchableOpacity>
  );
}

function MenuItemToggle({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  colors,
}: {
  icon: string;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: import("@/context/ThemeContext").ThemeColors;
}) {
  const iconScale = useRef(new Animated.Value(1)).current;

  // Rebota el ícono al cambiar el toggle.
  // mounted evita que la animación corra en el
  // render inicial antes del primer interacción.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    Animated.sequence([
      Animated.timing(iconScale, {
        toValue: 0.55,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value]);

  return (
    <View style={s.menuItem}>
      <Animated.View
        style={[
          s.menuIconWrap,
          { backgroundColor: colors.input, transform: [{ scale: iconScale }] },
        ]}
      >
        <Ionicons name={icon as any} size={20} color={colors.textSub} />
      </Animated.View>
      <View style={s.menuText}>
        <Text style={[s.menuTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[s.menuSub, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, logout } = useAuth();
  const user = state.user;

  const { colors, isDark, toggleTheme } = useTheme();
  const { notificationsEnabled, setNotificationsEnabled } = useNotifications();

  const firstName = user?.customer_first_name ?? "U";
  const fullName = [user?.customer_first_name, user?.customer_last_name]
    .filter(Boolean)
    .join(" ");

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth" as any);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.surface }]}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top - 45, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar + info */}
      <View style={s.avatarBlock}>
        {validPhoto(user?.customer_image) ? (
          <Image source={{ uri: user!.customer_image! }} style={s.avatar} />
        ) : (
          <View
            style={[
              s.avatar,
              s.avatarFallback,
              { backgroundColor: avatarColor(firstName) },
            ]}
          >
            <Text style={s.avatarInitialText}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={[s.name, { color: colors.text }]}>{fullName}</Text>
        <Text style={[s.email, { color: colors.textMuted }]}>
          {user?.customer_email}
        </Text>
      </View>

      {/* CUENTA */}
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>CUENTA</Text>
      <View
        style={[
          s.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <MenuItem
          colors={colors}
          icon="person-outline"
          title="Editar Perfil"
          subtitle="Información personal, email"
          onPress={() => router.push("/editar-perfil" as any)}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <MenuItem
          colors={colors}
          icon="lock-closed-outline"
          title="Cambiar Contraseña"
          subtitle="Actualiza tu contraseña de acceso"
          onPress={() => router.push("/cambiar-contrasena" as any)}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <MenuItemToggle
          colors={colors}
          icon="notifications-outline"
          title="Notificaciones"
          subtitle="Activar notificaciones"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <MenuItemToggle
          colors={colors}
          icon="moon-outline"
          title="Modo Oscuro"
          subtitle={isDark ? "Modo oscuro activado" : "Modo claro activado"}
          value={isDark}
          onValueChange={toggleTheme}
        />
      </View>

      {/* POLÍTICAS */}
      <Text style={[s.sectionLabel, { color: colors.textMuted }]}>
        POLÍTICAS
      </Text>
      <View
        style={[
          s.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <MenuItem
          colors={colors}
          icon="shield-checkmark-outline"
          title="Políticas de Garantías"
          subtitle="Última actualización: Marzo 2026"
          onPress={() => router.push("/politicas-garantia" as any)}
        />
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={s.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={s.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* Síguenos */}
      <Text style={[s.siguenos, { color: colors.textMuted }]}>SÍGUENOS</Text>
      <View style={s.socialRow}>
        {SOCIAL_LINKS.map(({ icon, url }) => (
          <TouchableOpacity
            key={icon}
            style={[
              s.socialBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(url)}
          >
            <Ionicons name={icon} size={22} color={colors.textSub} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[s.copyright, { color: colors.textMuted }]}>
        Copyright © TBOXSA 2026 · Versión 1.0.0
      </Text>
    </ScrollView>
  );
}
