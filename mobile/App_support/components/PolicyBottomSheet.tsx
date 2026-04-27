import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Modal, StyleSheet, Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PolicySection } from '@/Services/authService';

const { width, height } = Dimensions.get('window');

interface Props {
  visible: boolean;
  version: string;
  label: string;
  sections: PolicySection[];
  onAccept: () => void;
  onClose: () => void;
}

export default function PolicyBottomSheet({
  visible, version, label, sections, onAccept, onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1} />

        <View style={styles.sheet}>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <Ionicons name="shield-checkmark" size={20} color="#3C6034" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Políticas de Garantía</Text>
                <Text style={styles.headerSub}>Última actualización: {label}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, si) => (
              <View key={si} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item, ii) => (
                  <View key={ii} style={styles.item}>
                    <Text style={styles.itemKey}>{item.key}</Text>
                    <Text style={styles.itemText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.companyFooter}>
              <Text style={styles.companyFooterText}>
                © 2026 TBOXSA — Todos los derechos reservados.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
              <Text style={styles.acceptBtnText}>Aceptar Políticas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const SHEET_HEIGHT = height * 0.82;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.018,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(60,96,52,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerTitle: {
    fontSize: width * 0.040,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },

  headerSub: {
    fontSize: width * 0.028,
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    marginTop: 1,
  },

  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.022,
    gap: height * 0.022,
  },

  section: {
    gap: height * 0.010,
  },

  sectionTitle: {
    fontSize: width * 0.036,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins-Bold',
    paddingBottom: height * 0.006,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  item: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },

  itemKey: {
    fontSize: width * 0.030,
    fontWeight: '700',
    color: '#3C6034',
    minWidth: width * 0.07,
    fontFamily: 'Poppins-Regular',
    paddingTop: 2,
    flexShrink: 0,
  },

  itemText: {
    flex: 1,
    fontSize: width * 0.032,
    color: '#374151',
    lineHeight: width * 0.048,
    fontFamily: 'Poppins-Regular',
  },

  footer: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.018,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },

  acceptBtn: {
    backgroundColor: '#1B3A1F',
    paddingVertical: height * 0.018,
    borderRadius: width * 0.08,
    alignItems: 'center',
  },

  acceptBtnText: {
    color: '#ffffff',
    fontSize: width * 0.042,
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },

  companyFooter: {
    marginTop: height * 0.025,
    paddingTop: height * 0.018,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },

  companyFooterText: {
    fontSize: width * 0.026,
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});