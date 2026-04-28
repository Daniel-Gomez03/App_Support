import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Dimensions,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
// ── URLs de redes sociales — edita aquí ──────────────────────
const SOCIAL_LINKS = [
  { icon: "logo-facebook", url: "https://www.facebook.com/tboxsahn/" },
  { icon: "logo-instagram", url: "https://www.instagram.com/tboxsahn/" },
  { icon: "globe-outline", url: "https://tboxsa.com/" },
  { icon: "logo-tiktok", url: "https://www.tiktok.com/@tboxsa?lang=es-419" },
  { icon: "logo-linkedin", url: "https://www.linkedin.com/company/tboxsahn/" },
] as const;
// ─────────────────────────────────────────────────────────────

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
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
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
  return (
    <View style={s.menuItem}>
      <View style={[s.menuIconWrap, { backgroundColor: colors.input }]}>
        <Ionicons name={icon as any} size={20} color={colors.textSub} />
      </View>
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
  const [notifEnabled, setNotifEnabled] = useState(false);

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
          value={notifEnabled}
          onValueChange={setNotifEnabled}
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

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    paddingHorizontal: width * 0.05,
  },

  avatarBlock: {
    alignItems: "center",
    paddingVertical: 28,
  },
  avatar: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: width * 0.12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitialText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.1,
    color: "#fff",
  },
  name: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.048,
    color: "#111",
    marginTop: 12,
  },
  email: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#888",
    marginTop: 2,
  },

  // Section
  sectionLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 16,
  },

  // Menu item
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: { flex: 1 },
  menuTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.036,
    color: "#111",
  },
  menuSub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    color: "#9CA3AF",
    marginTop: 1,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 28,
  },
  logoutText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#DC2626",
  },

  // Social
  siguenos: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#9CA3AF",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 20,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  copyright: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.027,
    color: "#CCC",
    textAlign: "center",
  },
});
