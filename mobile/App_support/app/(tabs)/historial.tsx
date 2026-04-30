import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
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
import { s, width } from "@/styles/historial.styles";

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
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
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
