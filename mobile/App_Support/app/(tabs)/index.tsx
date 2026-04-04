import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import nuevoService from '../../Services/nuevoService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useAuth();
  const user = state.user;

  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveTickets = async () => {
    if (!user?.customer_id) return;
    try {
      const data = await nuevoService.getActiveTicketsByCustomer(user.customer_id);
      setActiveTickets(data);
    } catch (error) {
      console.error("Error al cargar tickets activos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveTickets();
  };

  const renderTicketCard = ({ item }: { item: any }) => {
    const isDispositivo = item.category_id === 1;

    const datePart = item.created_at.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const fechaBonita = `${day} ${meses[parseInt(month) - 1]} ${year}`;

    return (
      <View style={styles.ticketCard}>
        <View style={styles.topSection}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              {isDispositivo ? (
                <FontAwesome5 name="cog" size={20} color="#333" style={styles.categoryIcon} />
              ) : (
                <MaterialCommunityIcons name="code-tags" size={24} color="#333" style={styles.categoryIcon} />
              )}
              <Text style={styles.ticketSubject} numberOfLines={1}>{item.ticket_subject}</Text>
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
          <TouchableOpacity style={styles.chatButton} activeOpacity={0.8}>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3C6034" />
      </View>
    );
  }

  return (
    <View style={[styles.mainWrapper, { paddingTop: insets.top - 45 }]}>
      <FlatList
        data={activeTickets}
        keyExtractor={(item) => item.ticket_id.toString()}
        renderItem={renderTicketCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Tus Tickets Activos</Text>
            <TouchableOpacity
              style={styles.historyCircleBtn}
              onPress={() => router.push('/historial')}
            >
              <MaterialCommunityIcons name="history" size={24} color="#3C6034" />
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3C6034']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons name="ticket-outline" size={width * 0.2} color="#D1D1D1" />
              <View style={styles.smallBadge}>
                <Ionicons name="search" size={width * 0.05} color="#FFF" />
              </View>
            </View>
            <Text style={styles.infoTitle}>No tienes tickets activos</Text>
            <Text style={styles.infoSubtitle}>
              Cuando reportes un inconveniente técnico aparecerán aquí.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/nuevo')}
            >
              <Ionicons name="add-circle" size={24} color="#FFF" />
              <Text style={styles.createBtnText}>Abrir nuevo Ticket</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingTop: 5,
    paddingBottom: 120
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  headerTitle: {
    fontSize: width * 0.07,
    fontFamily: 'Poppins-Bold',
    color: '#000'
  },
  historyCircleBtn: {
    backgroundColor: '#F0F4F0',
    padding: 10,
    borderRadius: 12
  },
  ticketCard: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden'
  },
  topSection: {
    padding: 18
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  categoryIcon: {
    marginRight: 10
  },
  ticketSubject: {
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.045,
    color: '#1A1A1A',
    flex: 1
  },
  ticketDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: width * 0.03,
    color: '#B0B0B0',
    marginBottom: 8
  },
  ticketDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: width * 0.032,
    color: '#666',
    lineHeight: 18
  },
  readMore: {
    color: '#CCC'
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%'
  },
  techContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  avatarPlaceholder: {
    marginRight: 10
  },
  techName: {
    fontFamily: 'Poppins-Regular',
    fontSize: width * 0.032,
    color: '#333'
  },
  boldText: {
    fontFamily: 'Poppins-Bold'
  },
  chatButton: {
    backgroundColor: '#3C6034',
    width: 45,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40
  },
  iconBackground: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25
  },
  smallBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3C6034',
    padding: 8,
    borderRadius: 20
  },
  infoTitle: {
    fontSize: width * 0.045,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10
  },
  infoSubtitle: {
    fontSize: width * 0.035,
    fontFamily: 'Poppins-Regular',
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20
  },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: '#3C6034',
    width: '100%',
    height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 10
  },
});