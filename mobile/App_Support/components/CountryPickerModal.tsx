import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, Modal, FlatList,
  Dimensions, TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

interface Country {
  code:      string;
  name:      string;
  flag:      string;
  prefix:    string;
  maxDigits: number;
  minDigits: number;
}

interface Props {
  countries:       Country[];
  selectedCountry: Country;
  onSelect:        (country: Country) => void;
  onClose:         () => void;
}

export default function CountryPickerModal({ countries, selectedCountry, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('');

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.prefix.includes(search)
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Semi-transparent overlay — tap to close */}
        <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Search bar */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            <Ionicons name="search" size={18} color="#9ca3af" />
          </View>

          {/* Countries list */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => onSelect(item)}
                activeOpacity={0.65}
              >
                <View style={styles.flagCircle}>
                  <Text style={styles.flagEmoji}>{item.flag}</Text>
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrefix}>{item.prefix}</Text>
                </View>
                {selectedCountry.code === item.code && (
                  <Ionicons name="checkmark" size={20} color="#3C6034" />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const SHEET_HEIGHT = height * 0.58;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    height:               SHEET_HEIGHT,
    backgroundColor:      '#ffffff',
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    paddingTop:           12,
    paddingHorizontal:    width * 0.05,
    paddingBottom:        height * 0.03,
  },

  handle: {
    width:         40,
    height:        4,
    backgroundColor: '#d1d5db',
    borderRadius:  2,
    alignSelf:     'center',
    marginBottom:  16,
  },

  searchRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   '#f3f4f6',
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   height * 0.012,
    marginBottom:      12,
    gap:               8,
  },

  searchInput: {
    flex:     1,
    fontSize: width * 0.038,
    color:    '#111827',
    padding:  0,
  },

  item: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical: height * 0.016,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 14,
  },

  flagCircle: {
    width:           46,
    height:          46,
    borderRadius:    23,
    backgroundColor: '#f3f4f6',
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },

  flagEmoji: {
    fontSize: width * 0.07,
  },

  itemText: {
    flex: 1,
  },

  itemName: {
    fontSize:   width * 0.038,
    fontWeight: '600',
    color:      '#111827',
  },

  itemPrefix: {
    fontSize:  width * 0.032,
    color:     '#6b7280',
    marginTop: 2,
  },
});