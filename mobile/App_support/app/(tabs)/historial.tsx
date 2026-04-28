import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import nuevoService from "../../Services/nuevoService";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d} ${MESES[parseInt(m) - 1]} ${y}`;
};

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

const isDispositivo = (ticket: any) =>
  ticket.category?.category_name?.toLowerCase().includes("dispositivo");

const getStatusStyle = (statusId: number) => {
  if (statusId === 10) return { bg: "#F3F4F6", text: "#6B7280" }; // Cancelado
  return { bg: "#FEF2F2", text: "#DC2626" }; // Finalizado
};

function HistorialCard({ ticket }: { ticket: any }) {
  const router = useRouter();
  const { colors } = useTheme();
  const dispositivo = isDispositivo(ticket);
  const statusId = ticket.status?.ticket_status_id ?? 9;
  const statusName = ticket.status?.ticket_status_name ?? "Finalizado";
  const statusStyle = getStatusStyle(statusId);
  const techs: any[] = ticket.assignedUsers ?? [];

  return (
    <TouchableOpacity
      style={[
        s.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      activeOpacity={0.75}
      onPress={() => router.push(`/ticket/${ticket.ticket_id}` as any)}
    >
      <View style={s.cardTop}>
        <View
          style={[s.catIcon, dispositivo ? s.catIconDevice : s.catIconCode]}
        >
          {dispositivo ? (
            <FontAwesome5 name="cog" size={16} color="#3C6034" />
          ) : (
            <MaterialCommunityIcons
              name="code-tags"
              size={18}
              color="#3B82F6"
            />
          )}
        </View>
        <Text style={[s.subject, { color: colors.text }]} numberOfLines={1}>
          {ticket.ticket_subject}
        </Text>
        <View style={[s.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[s.badgeText, { color: statusStyle.text }]}>
            {statusName}
          </Text>
        </View>
      </View>

      <Text
        style={[s.description, { color: colors.textSub }]}
        numberOfLines={2}
      >
        {ticket.ticket_description}
      </Text>
      <View style={[s.divider, { backgroundColor: colors.border }]} />

      <View style={s.cardBottom}>
        {techs.length > 0 ? (
          <View style={s.techRow}>
            {techs.slice(0, 3).map((t, i) => (
              <View
                key={t.user_id}
                style={[s.techAvatar, { marginLeft: i > 0 ? -10 : 0 }]}
              >
                {validPhoto(t.foto) ? (
                  <Image source={{ uri: t.foto }} style={s.techImg} />
                ) : (
                  <View
                    style={[
                      s.techImg,
                      s.techInitial,
                      { backgroundColor: avatarColor(t.nombre_completo ?? "") },
                    ]}
                  >
                    <Text style={s.techInitialText}>
                      {(t.nombre_completo ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            <Text style={[s.techName, { color: colors.textSub }]}>
              {techs.length === 1
                ? techs[0].nombre_completo
                : `${techs.length} técnicos`}
            </Text>
          </View>
        ) : (
          <View style={[s.unassignedRow, { backgroundColor: colors.input }]}>
            <View
              style={[s.unassignedAvatar, { backgroundColor: colors.surface }]}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={colors.textMuted}
              />
            </View>
            <Text style={[s.unassignedText, { color: colors.textMuted }]}>
              Sin técnico asignado
            </Text>
          </View>
        )}
        <View style={s.dateRow}>
          <Ionicons name="time-outline" size={12} color={colors.textMuted} />
          <Text style={[s.dateText, { color: colors.textMuted }]}>
            {formatDate(ticket.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistorialScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      const data = await nuevoService.getHistoryTickets();
      setTickets(data);
    } catch (e) {
      console.error("Error cargando historial:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.ticket_subject?.toLowerCase().includes(q) ||
      t.ticket_description?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3C6034" />
      </View>
    );
  }

  return (
    <View
      style={[
        s.container,
        { paddingTop: insets.top - 45, backgroundColor: colors.background },
      ]}
    >
      <FlatList
        data={filtered}
        keyExtractor={(t) => t.ticket_id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTickets();
            }}
            colors={["#3C6034"]}
          />
        }
        ListHeaderComponent={
          <View style={[s.searchBox, { backgroundColor: colors.input }]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
            />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Buscar tickets..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => <HistorialCard ticket={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[s.emptyIconBg, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={width * 0.18}
                color={colors.border}
              />
              <View style={s.emptyBadge}>
                <Ionicons name="checkmark" size={width * 0.045} color="#FFF" />
              </View>
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>
              {search ? "Sin resultados" : "Sin historial aún"}
            </Text>
            <Text style={[s.emptySub, { color: colors.textMuted }]}>
              {search
                ? "Intenta con otro término de búsqueda."
                : "Aquí aparecerán tus tickets finalizados y cancelados."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 120,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.035,
    color: "#222",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  catIconDevice: {
    backgroundColor: "#E8F5E9",
  },
  catIconCode: {
    backgroundColor: "#EFF6FF",
  },
  subject: {
    flex: 1,
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#111",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.027,
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  techAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFF",
    overflow: "hidden",
  },
  techImg: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  techInitial: {
    justifyContent: "center",
    alignItems: "center",
  },
  techInitialText: {
    fontFamily: "Poppins-Bold",
    fontSize: 11,
    color: "#FFF",
  },
  techName: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#555",
  },
  unassignedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unassignedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  unassignedText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#9CA3AF",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#9CA3AF",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIconBg: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#3C6034",
    padding: 8,
    borderRadius: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "#333",
    textAlign: "center",
  },
  emptySub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#8A8A8A",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
