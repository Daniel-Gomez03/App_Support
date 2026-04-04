import React, { StrictMode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Linking } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, FontAwesome5, Foundation } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();
    const { state, logout } = useAuth();
    const { navigation } = props;

    const user = state.user;
    const userName = user?.customer_name;
    const userEmail = user?.customer_email;
    const userImage = user?.customer_image;

    const navigateTo = (screenName: string) => {
        const tabScreens = ['index', 'qa', 'usuario'];

        if (tabScreens.includes(screenName)) {
            navigation.navigate('(tabs)', {
                screen: screenName
            });
        } else {
            navigation.navigate(screenName);
        }
        navigation.closeDrawer();
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    const openUrl = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Error al abrir URL:", err));
    };

    return (
        <StrictMode>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <DrawerContentScrollView
                    {...props}
                    contentContainerStyle={{ paddingTop: 0 }}
                >
                    {/*SECCIÓN DE CABECERA */}
                    <View style={[styles.headerContainer, { paddingTop: insets.top + 20 }]}>
                        <TouchableOpacity style={styles.profileContainer}>
                            {userImage ? (
                                <Image source={{ uri: userImage }} style={styles.profileImage} />
                            ) : (
                                <View style={[styles.profileImage, styles.noneImage]}>
                                    <Ionicons name="person" size={width * 0.12} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.userNameText}>{userName}</Text>
                        <Text style={styles.userEmailText}>{userEmail}</Text>
                    </View>

                    <View style={styles.separator} />

                    {/*BOTONES PRINCIPALES */}
                    <View style={styles.navButtonsContainer}>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('usuario')}>
                            <View style={styles.iconContainer}>
                                <FontAwesome5 name="user-alt" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.navItemText}>Usuario</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.navItem} onPress={() => navigateTo('index')}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="gear" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.navItemText}>Mis Tickets</Text>
                        </TouchableOpacity>
                    </View>

                    {/*PREFERENCIAS Y REDES */}
                    <View style={styles.externalLinksContainer}>
                        <Text style={styles.sectionTitle}>Preferencias de la Aplicación</Text>

                        <TouchableOpacity style={styles.linkItem} onPress={() => navigateTo('qa')}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="help-circle-outline" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.linkItemText}>Preguntas Frecuentes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkItem} onPress={() => openUrl('https://tboxsa.com/')}>
                            <View style={styles.iconContainer}>
                                <Foundation name="web" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.linkItemText}>Sitio Web</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkItem} onPress={() => openUrl('https://www.instagram.com/tboxsahn/')}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="instagram" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.linkItemText}>Instagram</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkItem} onPress={() => openUrl('https://www.facebook.com/tboxsahn/')}>
                            <View style={styles.iconContainer}>
                                <FontAwesome name="facebook-square" size={width * 0.067} color="#3C6034" />
                            </View>
                            <Text style={styles.linkItemText}>Facebook</Text>
                        </TouchableOpacity>
                    </View>
                </DrawerContentScrollView>

                {/*CERRAR SESIÓN */}
                <View style={[styles.logoutContainer, { paddingBottom: insets.bottom + 10 }]}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={width * 0.07} color="red" />
                        <Text style={styles.logoutText}>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </StrictMode>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: width * 0.06,
        backgroundColor: 'white',
        paddingBottom: 25,
    },
    profileContainer: {
        width: width * 0.22,
        height: width * 0.22,
        borderRadius: (width * 0.22) / 2,
        overflow: 'hidden',
        marginBottom: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    noneImage: {
        backgroundColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userNameText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.045,
        color: '#000',
    },
    userEmailText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.027,
        color: '#999',
        marginTop: -5,
    },
    separator: {
        height: 1,
        backgroundColor: '#eee',
        width: '100%',
    },
    navButtonsContainer: {
        paddingVertical: 15,
        paddingHorizontal: width * 0.03,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: width * 0.1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    navItemText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.045,
        color: 'black',
        marginLeft: 9
    },
    externalLinksContainer: {
        paddingHorizontal: width * 0.03,
        paddingTop: 10,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.035,
        color: '#999',
        marginBottom: 15,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    linkItemText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.045,
        color: 'black',
        marginLeft: 9,
        textDecorationLine: 'underline',
    },
    logoutContainer: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: width * 0.06,
    },
    logoutText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.045,
        color: 'black',
        marginLeft: 15,
    }
});