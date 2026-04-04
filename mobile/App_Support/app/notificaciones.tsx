import React, { StrictMode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function NotificacionesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

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
                    <Text style={styles.headerTitle}>Notificaciones</Text>
                </View>

                <View style={styles.emptyContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="notifications-off-outline" size={width * 0.15} color="#3C6034" />
                    </View>
                    <Text style={styles.emptyTitle}>Sin notificaciones</Text>
                    <Text style={styles.emptySubtitle}>
                        Te avisaremos cuando haya actualizaciones sobre tus tickets.
                    </Text>
                </View>
            </View>
        </StrictMode>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#3C6034',
        padding: 8,
        borderRadius: 8,
        marginRight: 15,
    },
    headerTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.051,
        color: '#000',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.1,
        marginTop: -100,
    },
    iconCircle: {
        width: width * 0.3,
        height: width * 0.3,
        borderRadius: (width * 0.3) / 2,
        backgroundColor: '#F4F4F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.05,
        color: '#3C6034',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.035,
        color: '#999',
        textAlign: 'center',
        lineHeight: 20,
    },
});