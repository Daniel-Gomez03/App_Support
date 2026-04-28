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
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import nuevoService from "../../Services/nuevoService";

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

const isPendingReview = (ticket: any) => ticket.status?.ticket_status_id === 2;

const AVATAR_COLORS = ['#3C6034','#2563EB','#7C3AED','#DB2777','#D97706','#0891B2','#059669','#DC2626'];
const avatarColor = (name: string) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const validPhoto = (foto?: string | null) => !!foto && foto !== 'default.jpg' && foto.startsWith('http');

const isDispositivo = (ticket: any) =>
  ticket.category?.category_name?.toLowerCase().includes("dispositivo");

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  default: { bg: "#E8F5E9", text: "#2E7D32" },
  proceso: { bg: "#FFF3E0", text: "#E65100" },
  revisión: { bg: "#F3F4F6", text: "#6B7280" },
  resuelto: { bg: "#EDE7F6", text: "#512DA8" },
};

const getStatusStyle = (name: string) => {
  const n = name?.toLowerCase() ?? "";
  if (n.includes("proceso") || n.includes("asign"))
    return STATUS_COLORS.proceso;
  if (n.includes("revis")) return STATUS_COLORS.revisión;
  if (n.includes("resuelto") || n.includes("cerrado"))
    return STATUS_COLORS.resuelto;
  return STATUS_COLORS.default;
};

function TicketCard({ ticket }: { ticket: any }) {
  const router = useRouter();
  const pending = isPendingReview(ticket);
  const dispositivo = isDispositivo(ticket);
  const hasAssigned = (ticket.assignedUsers ?? []).length > 0;
  const statusName = pending
    ? "Pendiente de revisión"
    : (ticket.status?.ticket_status_name ?? "Nuevo");
  const statusStyle = pending
    ? STATUS_COLORS.revisión
    : getStatusStyle(statusName);
  const techs: any[] = ticket.assignedUsers ?? [];

  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={hasAssigned ? 0.75 : 1}
      onPress={() =>
        hasAssigned && router.push(`/ticket/${ticket.ticket_id}` as any)
      }
    >
      <View style={s.cardTop}>
        <View
          style={[s.catIcon, dispositivo ? s.catIconDevice : s.catIconCode]}
        >
          {dispositivo ? (
            <FontAwesome5
              name="cog"
              size={16}
              color={dispositivo ? "#3C6034" : "#3B82F6"}
            />
          ) : (
            <MaterialCommunityIcons
              name="code-tags"
              size={18}
              color="#3B82F6"
            />
          )}
        </View>
        <Text style={s.subject} numberOfLines={1}>
          {ticket.ticket_subject}
        </Text>
        {!pending && (
          <View style={[s.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[s.badgeText, { color: statusStyle.text }]}>
              {statusName}
            </Text>
          </View>
        )}
      </View>

      {pending && (
        <View style={s.pendingBanner}>
          <Ionicons name="time-outline" size={13} color="#6B7280" />
          <Text style={s.pendingText}>Pendiente de revisión</Text>
        </View>
      )}

      <Text style={s.description} numberOfLines={2}>
        {ticket.ticket_description}
      </Text>

      <View style={s.divider} />

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
                  <View style={[s.techImg, s.techInitial, { backgroundColor: avatarColor(t.nombre_completo ?? '') }]}>
                    <Text style={s.techInitialText}>
                      {(t.nombre_completo ?? '?').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            <Text style={s.techName}>
              {techs.length === 1
                ? techs[0].nombre_completo
                : `${techs.length} técnicos`}
            </Text>
          </View>
        ) : (
          <View style={s.unassignedRow}>
            <View style={s.unassignedAvatar}>
              <Ionicons name="person-outline" size={16} color="#9CA3AF" />
            </View>
            <Text style={s.unassignedText}>Por asignar técnico</Text>
          </View>
        )}

        <View style={s.dateRow}>
          <Ionicons name="time-outline" size={12} color="#9CA3AF" />
          <Text style={s.dateText}>{formatDate(ticket.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      const data = await nuevoService.getActiveTicketsByCustomer();
      setTickets(data);
    } catch (e) {
      console.error("Error cargando tickets:", e);
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
    <View style={[s.container, { paddingTop: insets.top - 45 }]}>
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
          <View>
            <View style={s.searchBox}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={s.searchInput}
                placeholder="Buscar tickets..."
                placeholderTextColor="#9CA3AF"
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={16} color="#CCC" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={s.title}>Mis Tickets</Text>
          </View>
        }
        renderItem={({ item }) => <TicketCard ticket={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconBg}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={width * 0.18}
                color="#D1D1D1"
              />
              <View style={s.emptyBadge}>
                <Ionicons name="search" size={width * 0.045} color="#FFF" />
              </View>
            </View>
            <Text style={s.emptyTitle}>
              {search ? "Sin resultados" : "No tienes tickets activos"}
            </Text>
            <Text style={s.emptySub}>
              {search
                ? "Intenta con otro término de búsqueda."
                : "Cuando reportes un inconveniente técnico aparecerán aquí."}
            </Text>
            {!search && (
              <TouchableOpacity
                style={s.createBtn}
                onPress={() => navigation.navigate("nuevo")}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={22} color="#FFF" />
                <Text style={s.createBtnText}>Abrir nuevo Ticket</Text>
              </TouchableOpacity>
            )}
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
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.07,
    color: "#000",
    marginBottom: 16,
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
  pendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  pendingText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#6B7280",
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
    overflow: 'hidden',
  },
  techImg: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  techInitial: {
    backgroundColor: "#3C6034",
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
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3C6034",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 16,
    elevation: 4,
  },
  createBtnText: {
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    color: "#FFF",
  },
});
