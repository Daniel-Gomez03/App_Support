import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const AVATAR_SIZE = width * 0.112;

export default function CustomHeader() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { state } = useAuth();

    const user = state.user;
    const firstName = user?.customer_first_name || 'Usuario';
    const initial = firstName.charAt(0).toUpperCase();
    const userImage = user?.customer_image;

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.greeting}>
                <Text style={styles.greetingText}>Hola, {firstName}</Text>
                <Text style={styles.subText}>En qué podemos ayudarte hoy?</Text>
            </View>

            <View style={styles.right}>
                <TouchableOpacity
                    style={styles.bellBtn}
                    onPress={() => router.push('/notificaciones')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="notifications" size={width * 0.068} color="#3C6034" />
                    <View style={styles.badge} />
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
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: width * 0.055,
        paddingBottom: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    greeting: {
        flex: 1,
    },
    greetingText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.055,
        color: '#000',
        lineHeight: width * 0.068,
    },
    subText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.03,
        color: '#999',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    bellBtn: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 1,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E53E3E',
        borderWidth: 1.5,
        borderColor: 'white',
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
        backgroundColor: '#3C6034',
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.045,
        color: 'white',
    },
});