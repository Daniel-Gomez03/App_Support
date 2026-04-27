import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HistorialScreen() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="ticket-outline" size={width * 0.2} color="#D1D1D1" />
      <Text style={styles.title}>Sin historial aún</Text>
      <Text style={styles.subtitle}>Aquí aparecerán tus tickets anteriores.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.05,
    color: '#333',
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: width * 0.035,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});