import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Dimensions } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

interface Country {
  code: string;
  name: string;
  flag: string;
  prefix: string;
  maxDigits: number;
  minDigits: number;
}

interface CountryPickerModalProps {
  countries: Country[];
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export default function CountryPickerModal({
  countries,
  selectedCountry,
  onSelect,
  onClose,
}: CountryPickerModalProps) {
  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seleccionar País</Text>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome5 name="times" size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Lista de países */}
        <FlatList
          data={countries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.countryItem,
                selectedCountry.code === item.code && styles.selectedCountryItem,
              ]}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.countryItemFlag}>{item.flag}</Text>
              <View style={styles.countryItemInfo}>
                <Text style={styles.countryItemName}>{item.name}</Text>
              </View>
              {selectedCountry.code === item.code && (
                <FontAwesome5 name="check" size={20} color="#28a745" />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: height * 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#000000',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedCountryItem: {
    backgroundColor: '#F0F8F0',
  },
  countryItemFlag: {
    fontSize: width * 0.08,
    marginRight: width * 0.03,
  },
  countryItemInfo: {
    flex: 1,
  },
  countryItemName: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#000000',
  },
  countryItemPrefix: {
    fontSize: width * 0.035,
    color: '#999999',
    marginTop: height * 0.003,
  },
});