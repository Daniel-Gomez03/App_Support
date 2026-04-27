import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Octicons from '@expo/vector-icons/Octicons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import * as shape from 'd3-shape';

const { width } = Dimensions.get('window');
const BAR_HEIGHT = 72;
const NUEVO_INDEX = 2;
const CENTER_SIZE = Math.min(width * 0.155, 74);
const ICON_SIZE = width * 0.062;

interface TabBarProps {
    state: any;
    descriptors: any;
    navigation: any;
}

const buildPath = (tabWidth: number) => {
    const cx = tabWidth * NUEVO_INDEX + tabWidth / 2;
    const r = tabWidth * 0.5;
    const pts: [number, number][] = [
        [0, 0],
        [cx - r * 1.3, 0],
        [cx - r, 0],
        [cx - r * 0.4, r * 0.48],
        [cx, r * 0.48],
        [cx + r * 0.4, r * 0.48],
        [cx + r, 0],
        [cx + r * 1.3, 0],
        [width, 0],
    ];
    const line = shape.line<[number, number]>()
        .x(d => d[0])
        .y(d => d[1])
        .curve(shape.curveBasis)(pts);
    return `${line} L ${width} ${BAR_HEIGHT} L 0 ${BAR_HEIGHT} Z`;
};

export default function TabBar({ state, descriptors, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();
    const tabWidth = width / state.routes.length;
    const svgPath = buildPath(tabWidth);

    const animValues = useRef(
        state.routes.map((_: any, i: number) => new Animated.Value(i === state.index ? 1 : 0))
    ).current;

    useEffect(() => {
        state.routes.forEach((_: any, i: number) => {
            Animated.spring(animValues[i], {
                toValue: state.index === i ? 1 : 0,
                tension: 160,
                friction: 7,
                useNativeDriver: true,
            }).start();
        });
    }, [state.index]);

    return (
        <View style={styles.wrapper}>
            <View style={[styles.barArea, { overflow: 'visible' }]}>
                <View style={StyleSheet.absoluteFill}>
                    <Svg width={width} height={BAR_HEIGHT}>
                        <Path d={svgPath} fill="#09160A" />
                    </Svg>
                </View>

                <View style={[styles.row, { overflow: 'visible' }]}>
                    {state.routes.map((route: any, index: number) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;
                        const isCenter = index === NUEVO_INDEX;
                        const anim = animValues[index];

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

                        if (isCenter) {
                            const btnScale = anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.07],
                            });
                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    onPress={onPress}
                                    style={styles.centerTabItem}
                                    activeOpacity={0.75}
                                >
                                    <Animated.View style={[
                                        styles.centerBtn,
                                        isFocused && styles.centerBtnActive,
                                        { transform: [{ scale: btnScale }] },
                                    ]}>
                                        <Ionicons name="add" size={width * 0.1} color="#FFFFFF" />
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        }

                        const iconShift = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
                        const iconScale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
                        const iconOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] });
                        const labelOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] });

                        const renderIcon = () => {
                            switch (route.name) {
                                case 'index':
                                    return <Octicons name="home-fill" size={ICON_SIZE} color="#FFF" />;
                                case 'faq':
                                    return <Ionicons name="help-circle" size={ICON_SIZE + 2} color="#FFF" />;
                                case 'historial':
                                    return <Ionicons name="time-outline" size={ICON_SIZE} color="#FFF" />;
                                case 'perfil':
                                    return <FontAwesome5 name="user-alt" size={ICON_SIZE - 3} color="#FFF" />;
                                default:
                                    return null;
                            }
                        };

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                                activeOpacity={0.8}
                            >
                                <Animated.View style={{
                                    transform: [{ translateY: iconShift }, { scale: iconScale }],
                                    opacity: iconOpacity,
                                }}>
                                    {renderIcon()}
                                </Animated.View>
                                <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
                                    {options.title || route.name}
                                </Animated.Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={[styles.safeArea, { height: insets.bottom }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    barArea: {
        height: BAR_HEIGHT,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        height: BAR_HEIGHT,
        alignItems: 'center',
        paddingBottom: 4,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflow: 'visible',
    },
    label: {
        color: '#FFFFFF',
        fontSize: width * 0.028,
        fontFamily: 'Poppins-Regular',
        letterSpacing: 0.1,
    },
    centerTabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        overflow: 'visible',
    },
    centerBtn: {
        width: CENTER_SIZE,
        height: CENTER_SIZE,
        borderRadius: CENTER_SIZE / 2,
        backgroundColor: '#09160A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: BAR_HEIGHT * 1.45,
        borderWidth: 3.5,
        borderColor: 'rgba(255,255,255,0.13)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 12,
    },
    centerBtnActive: {
        backgroundColor: '#3C6034',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    safeArea: {
        width: '100%',
        backgroundColor: '#09160A',
    },
});