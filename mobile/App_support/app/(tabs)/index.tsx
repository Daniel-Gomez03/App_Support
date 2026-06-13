// ============================================
// PANTALLA: INICIO / TICKETS ACTIVOS (HomeScreen)
// Lista los tickets activos del cliente con
// búsqueda en tiempo real y actualizaciones
// via Socket.IO sin necesidad de recargar.
//
// Sub-componente local:
//   TicketCard — tarjeta con ícono de categoría,
//                badge de estado y avatares de
//                técnicos apilados.
//
// Eventos socket:
//   mobile_notification_{id} — nuevo mensaje en
//     un ticket: sube la tarjeta al tope de la
//     lista sin refetch.
//   new_ticket_created — el cliente creó un nuevo
//     ticket: refetch completo.
//   ticket_updated — el admin actualizó el ticket:
//     refetch completo.
// ============================================

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import nuevoService from "../../Services/nuevoService";
import { useTheme } from "@/context/ThemeContext";
import { s, width } from "@/styles/home.styles";
import { useAuth } from "@/hooks/useAuth";
import socket from "@/Services/socket";

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

// Parsea la parte de fecha del ISO sin construir
// un objeto Date para evitar problemas de zona
// horaria en dispositivos móviles.
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

// Asigna un color de avatar determinista basado
// en el código ASCII de la inicial del nombre.
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

// La foto es válida solo si es una URL completa
// del SSO; 'default.jpg' indica que no hay foto.
const validPhoto = (foto?: string | null) =>
  !!foto && foto !== "default.jpg" && foto.startsWith("http");

// Heurística por nombre de categoría para mostrar
// el ícono correcto (dispositivo vs software).
const isDispositivo = (ticket: any) =>
  ticket.category?.category_name?.toLowerCase().includes("dispositivo");

// Colapsa los estados internos 4-8 ("Asignado",
// "En proceso", etc.) en un único label "En Proceso"
// para simplificar la vista del cliente.
const getCustomerLabel = (statusId: number): string => {
  if (statusId === 10) return "Cancelado";
  if (statusId === 9) return "Finalizado";
  if (statusId >= 4) return "En Proceso";
  return "Nuevo";
};

const getCustomerStyle = (statusId: number) => {
  if (statusId === 10) return { bg: "#FEF2F2", text: "#DC2626" };
  if (statusId === 9) return { bg: "#F0FDF4", text: "#16A34A" };
  if (statusId >= 4) return { bg: "#FFF3E0", text: "#E65100" };
  return { bg: "#E8F5E9", text: "#2E7D32" };
};

function TicketCard({ ticket }: { ticket: any }) {
  const router = useRouter();
  const { colors } = useTheme();
  const dispositivo = isDispositivo(ticket);
  const statusId = ticket.status?.ticket_status_id ?? 1;
  const statusLabel = getCustomerLabel(statusId);
  const statusStyle = getCustomerStyle(statusId);
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
            {statusLabel}
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
              Por asignar técnico
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { state } = useAuth();
  const customerId = state.user?.customer_id;

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

  // Nuevo mensaje en un ticket: sube la tarjeta al
  // tope de la lista localmente sin refetch.
  // idx <= 0: ya está primero (-1 no existe, 0 ya es top).
  useEffect(() => {
    if (!customerId) return;
    const event = `mobile_notification_${customerId}`;

    const handle = (data: { type: string; ticketId: number }) => {
      if (data.type !== "message") return;
      setTickets((prev) => {
        const idx = prev.findIndex((t) => t.ticket_id === data.ticketId);
        if (idx <= 0) return prev;
        const moved = prev[idx];
        return [moved, ...prev.filter((_, i) => i !== idx)];
      });
    };

    socket.on(event, handle);
    return () => {
      socket.off(event, handle);
    };
  }, [customerId]);

  // Nuevo ticket creado por el cliente: refetch
  // para incluirlo en la lista inmediatamente.
  useEffect(() => {
    if (!customerId) return;

    const handle = (data: { customer_id: number }) => {
      if (data.customer_id !== customerId) return;
      fetchTickets();
    };

    socket.on("new_ticket_created", handle);
    return () => {
      socket.off("new_ticket_created", handle);
    };
  }, [customerId, fetchTickets]);

  // El admin actualizó el ticket (estado, técnico,
  // pausa de chat, etc.): refetch para reflejar
  // el cambio en la tarjeta.
  useEffect(() => {
    if (!customerId) return;

    const handle = (updatedTicket: any) => {
      if (updatedTicket?.customer_id !== customerId) return;
      fetchTickets();
    };

    socket.on("ticket_updated", handle);
    return () => {
      socket.off("ticket_updated", handle);
    };
  }, [customerId, fetchTickets]);

  const filtered = useMemo(
    () =>
      tickets.filter((t) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          t.ticket_subject?.toLowerCase().includes(q) ||
          t.ticket_description?.toLowerCase().includes(q)
        );
      }),
    [tickets, search],
  );

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
          <View>
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
            <Text style={[s.title, { color: colors.text }]}>Mis Tickets</Text>
          </View>
        }
        renderItem={({ item }) => <TicketCard ticket={item} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={[s.emptyIconBg, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={width * 0.18}
                color={colors.border}
              />
              <View style={s.emptyBadge}>
                <Ionicons name="search" size={width * 0.045} color="#FFF" />
              </View>
            </View>
            <Text style={[s.emptyTitle, { color: colors.text }]}>
              {search ? "Sin resultados" : "No tienes tickets activos"}
            </Text>
            <Text style={[s.emptySub, { color: colors.textMuted }]}>
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
