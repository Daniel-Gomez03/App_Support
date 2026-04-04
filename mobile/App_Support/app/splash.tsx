import React from 'react';
import { View, StyleSheet } from 'react-native';
import AnimatedLogo from '@/components/AnimatedLogo';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1C0D',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <AnimatedLogo />
        </View>
    );
}