// ============================================
// PANTALLA: NOTIFICACIONES (NotificacionesScreen)
// Lista de notificaciones agrupadas por fecha:
//   "Hoy" / "Esta semana" / "Antes".
//
// Al montar la pantalla se marcan todas como leídas
// (abrir la pantalla = el usuario las vio).
// Cada tarjeta navega a /ticket/[id].
// ============================================

import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";
import {
  useNotifications,
  AppNotification,
} from "@/context/NotificationContext";

const { width } = Dimensions.get("window");

const STATUS_NAMES: Record<number, string> = {
  1: "Nuevo",
  2: "Nuevo",
  3: "En Proceso",
  4: "En Proceso",
  5: "En Proceso",
  6: "En Proceso",
  7: "En Proceso",
  8: "En Proceso",
  9: "Finalizado",
  10: "Cancelado",
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

const formatTicketId = (id: number) => `TK-${String(id).padStart(3, "0")}`;

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const groupNotifications = (notifs: AppNotification[]) => {
  const now = new Date();
  const todayStart = startOfDay(now).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  const today: AppNotification[] = [];
  const thisWeek: AppNotification[] = [];
  const older: AppNotification[] = [];

  notifs.forEach((n) => {
    const t = new Date(n.timestamp).getTime();
    if (t >= todayStart) today.push(n);
    else if (t >= weekStart) thisWeek.push(n);
    else older.push(n);
  });

  const groups: { title: string; data: AppNotification[] }[] = [];
  if (today.length) groups.push({ title: "Hoy", data: today });
  if (thisWeek.length) groups.push({ title: "Esta semana", data: thisWeek });
  if (older.length) groups.push({ title: "Antes", data: older });
  return groups;
};

const NOTIF_CONFIG = {
  status_change: {
    iconBg: "#FEF9C3",
    color: "#D97706",
    label: "Cambio de estado",
    icon: (size: number) => (
      <MaterialCommunityIcons
        name="swap-horizontal"
        size={size}
        color="#D97706"
      />
    ),
  },
  message: {
    iconBg: "#EFF6FF",
    color: "#3B82F6",
    label: "Mensaje",
    icon: (size: number) => (
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={size}
        color="#3B82F6"
      />
    ),
  },
  ticket_cancelled: {
    iconBg: "#FEF2F2",
    color: "#DC2626",
    label: "Ticket cancelado",
    icon: (size: number) => (
      <Ionicons name="close-circle-outline" size={size} color="#DC2626" />
    ),
  },
  ticket_finalizado: {
    iconBg: "#F0FDF4",
    color: "#16A34A",
    label: "Ticket finalizado",
    icon: (size: number) => (
      <Ionicons name="checkmark-circle-outline" size={size} color="#16A34A" />
    ),
  },
  cancellation_rejected: {
    iconBg: "#FFF7ED",
    color: "#EA580C",
    label: "Cancelación rechazada",
    icon: (size: number) => (
      <MaterialCommunityIcons name="cancel" size={size} color="#EA580C" />
    ),
  },
  chat_paused: {
    iconBg: "#FFF7ED",
    color: "#EA580C",
    label: "Chat en pausa",
    icon: (size: number) => (
      <Ionicons name="pause-circle-outline" size={size} color="#EA580C" />
    ),
  },
};

function NotifCard({ notif, colors }: { notif: AppNotification; colors: any }) {
  const router = useRouter();
  const cfg = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.status_change;

  const detail =
    notif.type === "ticket_cancelled"
      ? "Tu ticket ha sido cancelado."
      : notif.type === "ticket_finalizado"
        ? "Tu ticket ha sido resuelto exitosamente."
        : notif.type === "cancellation_rejected"
          ? "Tu solicitud de cancelación fue rechazada. Tu ticket continúa en proceso."
          : notif.type === "chat_paused"
            ? "El equipo ha pausado la atención momentáneamente. Puedes escribir para reactivar la conversación."
            : notif.type === "status_change"
              ? `${STATUS_NAMES[notif.oldStatusId ?? 1] ?? "?"} → ${STATUS_NAMES[notif.newStatusId ?? 1] ?? "?"}`
              : `${notif.senderName}: ${notif.messagePreview}`;

  return (
    <TouchableOpacity
      style={[
        s.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={0.75}
      onPress={() => router.push(`/ticket/${notif.ticketId}` as any)}
    >
      <View style={[s.iconWrap, { backgroundColor: cfg.iconBg }]}>
        {cfg.icon(22)}
      </View>

      <View style={s.cardBody}>
        <View style={s.cardRow}>
          <Text style={[s.cardType, { color: cfg.color }]}>{cfg.label}</Text>
          <View
            style={[
              s.dot,
              { backgroundColor: notif.read ? colors.border : "#3C6034" },
            ]}
          />
          <Text style={[s.cardTime, { color: colors.textMuted }]}>
            {timeAgo(notif.timestamp)}
          </Text>
        </View>
        <Text style={[s.cardSubject, { color: colors.text }]} numberOfLines={1}>
          {notif.ticketSubject}
          <Text style={{ color: colors.textMuted }}>
            {" "}
            · {formatTicketId(notif.ticketId)}
          </Text>
        </Text>
        <Text
          style={[s.cardDetail, { color: colors.textSub }]}
          numberOfLines={2}
        >
          {detail}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificacionesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { notifications, markAllRead, clearAll } = useNotifications();

  // Abrir la pantalla se toma como señal de que el
  // usuario leyó las notificaciones pendientes.
  useEffect(() => {
    markAllRead();
  }, []);

  const groups = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          s.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <View style={[s.backCircle, { backgroundColor: colors.input }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </View>
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Notificaciones
        </Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
            <Text style={[s.clearText, { color: colors.textMuted }]}>
              Limpiar
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={s.emptyWrap}>
          <View style={[s.emptyCircle, { backgroundColor: colors.surface }]}>
            <Ionicons
              name="notifications-off-outline"
              size={width * 0.15}
              color={colors.border}
            />
          </View>
          <Text style={[s.emptyTitle, { color: colors.text }]}>
            Sin notificaciones
          </Text>
          <Text style={[s.emptySub, { color: colors.textMuted }]}>
            Te avisaremos cuando haya actualizaciones en tus tickets.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            s.list,
            { paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {groups.map((group) => (
            <View key={group.title}>
              <Text style={[s.groupLabel, { color: colors.textMuted }]}>
                {group.title}
              </Text>
              {group.data.map((notif) => (
                <NotifCard key={notif.id} notif={notif} colors={colors} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.048,
  },
  clearText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
  },

  list: {
    paddingHorizontal: width * 0.05,
    paddingTop: 16,
  },
  groupLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  cardType: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.031,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTime: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    marginLeft: "auto",
  },
  cardSubject: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.034,
    marginBottom: 2,
  },
  cardDetail: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.031,
    lineHeight: 18,
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.12,
    marginTop: -60,
    gap: 12,
  },
  emptyCircle: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.048,
    textAlign: "center",
  },
  emptySub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    textAlign: "center",
    lineHeight: 20,
  },
});
