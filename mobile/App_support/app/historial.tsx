// ============================================
// PANTALLA: HISTORIAL DE TICKETS (HistorialScreen)
// Lista de tickets del cliente obtenida de
// nuevoService.getTicketsByCustomer.
// Soporta pull-to-refresh.
//
// Nota: pantalla sin soporte de tema; usa colores
// hardcodeados (no consume useTheme).
// ============================================

import React, { useState, useEffect, StrictMode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import nuevoService from "../Services/nuevoService";

const { width } = Dimensions.get("window");

const MESES_CORTOS = [
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

export default function HistorialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const user = state.user;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistorial = async () => {
    if (!user?.customer_id) return;
    try {
      const data = await nuevoService.getTicketsByCustomer(user.customer_id);
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistorial();
  };

  const renderTicket = ({ item }: { item: any }) => {
    const isDispositivo = item.category_id === 1;

    const datePart = item.created_at.split("T")[0];
    const [year, month, day] = datePart.split("-");
    const fechaBonita = `${day} ${MESES_CORTOS[parseInt(month) - 1]} ${year}`;

    return (
      <View style={styles.ticketCard}>
        <View style={styles.topSection}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              {isDispositivo ? (
                <FontAwesome5
                  name="cog"
                  size={20}
                  color="#333"
                  style={styles.categoryIcon}
                />
              ) : (
                <MaterialCommunityIcons
                  name="code-tags"
                  size={24}
                  color="#333"
                  style={styles.categoryIcon}
                />
              )}
              <Text style={styles.ticketSubject} numberOfLines={1}>
                {item.ticket_subject}
              </Text>
            </View>
          </View>

          <Text style={styles.ticketDate}>Fecha de Ingreso: {fechaBonita}</Text>

          <Text style={styles.ticketDescription} numberOfLines={2}>
            Descripción: {item.ticket_description}
            <Text style={styles.readMore}> Leer más</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomSection}>
          <View style={styles.techContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-circle-outline" size={35} color="#CCC" />
            </View>
            <Text style={styles.techName}>
              Técnico Encargado: <Text style={styles.boldText}>Usuario</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.8}
            onPress={() => router.push(`/ticket/${item.ticket_id}` as any)}
          >
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <StrictMode>
      <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historial de Tickets</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#3C6034" />
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.ticket_id.toString()}
            renderItem={renderTicket}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#3C6034"]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons
                    name="clipboard-text-off-outline"
                    size={width * 0.15}
                    color="#3C6034"
                  />
                </View>
                <Text style={styles.emptyTitle}>Sin tickets</Text>
                <Text style={styles.emptySubtitle}>
                  Aún no tienes tickets cerrados en tu historial.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3C6034",
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.051,
    color: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: width * 0.05,
  },
  ticketCard: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  topSection: {
    padding: 18,
  },
  bottomSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    marginRight: 10,
  },
  ticketSubject: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "#1A1A1A",
    flex: 1,
  },
  ticketDate: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#B0B0B0",
    marginBottom: 8,
  },
  ticketDescription: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#666",
    lineHeight: 18,
  },
  readMore: {
    color: "#CCC",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  techContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarPlaceholder: {
    marginRight: 10,
  },
  techName: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#333",
  },
  boldText: {
    fontFamily: "Poppins-Bold",
  },
  chatButton: {
    backgroundColor: "#3C6034",
    width: 45,
    height: 35,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.1,
    marginTop: 100,
  },
  iconCircle: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    backgroundColor: "#F4F4F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.05,
    color: "#3C6034",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.035,
    color: "#999",
    textAlign: "center",
  },
});
