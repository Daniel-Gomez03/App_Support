import React, { StrictMode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function CustomHeader({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { state } = useAuth();

    const userImage = state.user?.customer_image;

    return (
        <StrictMode>
            <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.openDrawer()}
                >
                    <Entypo name="menu" size={width * 0.07} color="white" />
                </TouchableOpacity>

                <View style={styles.greetingContainer}>
                    <Text style={styles.welcomeText}>Bienvenido</Text>
                    <Text style={styles.subText}>En que podemos ayudarte hoy?</Text>
                </View>

                <View style={styles.rightContainer}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/notificaciones')}
                    >
                        <Ionicons name="notifications" size={width * 0.065} color="#3C6034" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileContainer}>
                        {userImage ? (
                            <Image source={{ uri: userImage }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.noneImage]}>
                                <Ionicons name="person" size={width * 0.05} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </StrictMode>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: width * 0.05,
        paddingBottom: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuButton: {
        backgroundColor: '#3C6034',
        padding: width * 0.008,
        borderRadius: width * 0.007,
        justifyContent: 'center',
        alignItems: 'center',
    },
    greetingContainer: {
        flex: 1,
        marginLeft: 15,
    },
    welcomeText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.045,
        color: '#000',
        marginBottom: -2,
    },
    subText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.03,
        color: '#999',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginRight: 15,
        position: 'relative',
    },
    profileContainer: {
        width: width * 0.11,
        height: width * 0.11,
        borderRadius: (width * 0.11) / 2,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    noneImage: {
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    }
});