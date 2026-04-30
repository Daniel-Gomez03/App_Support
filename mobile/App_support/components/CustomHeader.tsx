import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";

const { width } = Dimensions.get("window");
const AVATAR_SIZE = width * 0.112;

const ROUTE_HEADERS: Record<
  string,
  { title: string; subtitle?: string; simple?: boolean } | null
> = {
  faq: {
    title: "Preguntas Frecuentes",
    subtitle: "Resuelve tus dudas de forma rápida y sencilla.",
  },
  historial: {
    title: "Historial",
    subtitle: "Revisa el detalle de tus tickets finalizados.",
  },
  nuevo: {
    title: "Crear Ticket",
    subtitle: "Describe tu problema y te ayudaremos lo antes posible.",
  },
  perfil: { title: "Mi Perfil", simple: true },
};

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAuth();
  const segments = useSegments();

  const { colors } = useTheme();
  const { unreadCount } = useNotifications();
  const user = state.user;
  const firstName = user?.customer_first_name || "Usuario";
  const initial = firstName.charAt(0).toUpperCase();
  const userImage = user?.customer_image;

  const currentRoute = segments[segments.length - 1] as string;
  const routeHeader = ROUTE_HEADERS[currentRoute];

  if (routeHeader?.simple) {
    return (
      <View
        style={[
          styles.containerSimple,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Text style={[styles.routeTitleCentered, { color: colors.text }]}>
          {routeHeader.title}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 10, backgroundColor: colors.headerBg },
      ]}
    >
      <View style={styles.left}>
        {routeHeader ? (
          <>
            <Text style={[styles.routeTitle, { color: colors.text }]}>
              {routeHeader.title}
            </Text>
            <Text style={[styles.subText, { color: colors.textMuted }]}>
              {routeHeader.subtitle}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.greetingText, { color: colors.text }]}>
              Hola, {firstName}
            </Text>
            <Text style={[styles.subText, { color: colors.textMuted }]}>
              En qué podemos ayudarte hoy?
            </Text>
          </>
        )}
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push("/notificaciones")}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications" size={width * 0.068} color="#3C6034" />
          {unreadCount > 0 && <View style={styles.badge} />}
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarInitial}>
              <Text style={styles.initialText}>{initial}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerSimple: {
    backgroundColor: "white",
    paddingHorizontal: width * 0.055,
    paddingBottom: 16,
    alignItems: "center",
  },
  routeTitleCentered: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.052,
    color: "#000",
  },
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: width * 0.055,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  greetingText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.055,
    color: "#000",
    lineHeight: width * 0.068,
  },
  routeTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.048,
    color: "#000",
    lineHeight: width * 0.062,
  },
  subText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.03,
    color: "#999",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bellBtn: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E53E3E",
    borderWidth: 1.5,
    borderColor: "white",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarInitial: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "#3C6034",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "white",
  },
});
