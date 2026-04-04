import React, { StrictMode, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import * as shape from 'd3-shape';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 82;

interface TabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

// Generador de la curva SVG
const getPath = (tabWidth: number) => {
    const center = width + (tabWidth / 2);
    const curveWidth = width * 0.20;
    const curveDepth = curveWidth * 0.35;
    const sideOffset = curveWidth * 0.25;

    const points: [number, number][] = [
        [0, 0],
        //lado izquierdo
        [center - curveWidth / 2 - sideOffset, 0],
        [center - curveWidth / 2, 0],
        [center - sideOffset, curveDepth],
        //centro        
        [center, curveDepth],
        //lado dereho
        [center + sideOffset, curveDepth],
        [center + curveWidth / 2, 0],
        [center + curveWidth / 2 + sideOffset, 0],

        [width * 3, 0],
    ];

    const topEdge = shape.line()
        .x((d: [number, number]) => d[0])
        .y((d: [number, number]) => d[1])
        .curve(shape.curveBasis)(points);

    return `${topEdge} L ${width * 3} ${TAB_BAR_HEIGHT} L 0 ${TAB_BAR_HEIGHT} Z`;
};

export default function TabBar({ state, descriptors, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();
    const tabWidth = width / state.routes.length;

    const animatedValue = useRef(new Animated.Value(state.index)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: state.index,
            tension: 60,
            friction: 10,
            useNativeDriver: false,
        }).start();
    }, [state.index]);

    const translateX = animatedValue.interpolate({
        inputRange: state.routes.map((_: any, i: number) => i),
        outputRange: state.routes.map((_: any, i: number) => -width + (tabWidth * i)),
    });

    return (
        <StrictMode>
            <View style={[styles.container, { paddingBottom: insets.bottom }]}>
                <View style={styles.svgContainer}>
                    <View style={styles.svgContainer}>
                        <Animated.View style={{ transform: [{ translateX }] }}>
                            <Svg width={width * 3} height={TAB_BAR_HEIGHT}>
                                <Path
                                    d={getPath(tabWidth)}
                                    fill="#09160A"
                                />
                            </Svg>
                        </Animated.View>
                    </View>
                </View>

                {/* Botones y Círculos Flotantes */}
                <View style={styles.buttonsContainer}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const renderIcon = () => {
                            const iconColor = isFocused ? '#FFFFFF' : '#FFFFFF';
                            const iconSize = isFocused ? (width * 0.0581) : (width * 0.069);

                            switch (route.name) {
                                case 'index':
                                    return <Octicons name="home-fill" size={iconSize} color={iconColor} />;
                                case 'qa':
                                    return (
                                        <Image
                                            source={require('@/assets/icons/qa-icon.png')}
                                            style={{
                                                width: iconSize,
                                                height: iconSize,
                                                tintColor: iconColor
                                            }}
                                        />
                                    );
                                case 'nuevo':
                                    return (
                                        <Image
                                            source={require('@/assets/icons/newTicket-icon.png')}
                                            style={{
                                                width: iconSize,
                                                height: iconSize,
                                                tintColor: iconColor
                                            }}
                                        />
                                    )
                                case 'usuario':
                                    return <FontAwesome5 name="user-alt" size={iconSize} color={iconColor} />;
                                default:
                                    return null;
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                                activeOpacity={1}
                            >
                                {isFocused ? (
                                    <View style={styles.activeCircle}>
                                        <View style={styles.innerCircle}>
                                            {renderIcon()}
                                        </View>
                                        <Text style={styles.activeText}>{options.title || route.name}</Text>
                                    </View>
                                ) : (
                                    <View style={styles.inactiveIcon}>
                                        {renderIcon()}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </StrictMode>
    );
}

const circle_size = Math.min(width * 0.103, 60);

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'transparent',
        elevation: 0,
    },
    svgContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        flexDirection: 'row',
        height: TAB_BAR_HEIGHT,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    activeCircle: {
        position: 'absolute',
        top: -TAB_BAR_HEIGHT * 0.03,
        alignItems: 'center',
    },
    innerCircle: {
        width: circle_size,
        height: circle_size,
        borderRadius: circle_size / 2,
        backgroundColor: '#3C6034',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeText: {
        color: '#FFFFFF',
        fontSize: width * 0.0358,
        marginTop: TAB_BAR_HEIGHT * 0.25,
        fontWeight: '500',
        fontFamily: 'Poppins-Regular'
    },
    inactiveIcon: {
        marginTop: TAB_BAR_HEIGHT * 0.48,
        opacity: 0.9,
    }
});