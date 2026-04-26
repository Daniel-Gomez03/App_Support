import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, Animated, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import Svg, { Path } from 'react-native-svg';
import authService from '@/Services/authService';

const { width, height } = Dimensions.get('window');
const CURVE_PATH = `M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`;

interface ValidationRule {
  label: string;
  test:  (v: string) => boolean;
}

const RULES: ValidationRule[] = [
  { label: 'La contraseña debe contener una Mayúscula',            test: v => /[A-Z]/.test(v) },
  { label: 'La contraseña debe contener una Minúscula',            test: v => /[a-z]/.test(v) },
  { label: 'La contraseña debe contener un Número',                test: v => /[0-9]/.test(v) },
  { label: 'La contraseña debe contener un Carácter especial',     test: v => /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(v) },
  { label: 'La contraseña debe tener un mínimo de 12 caracteres',  test: v => v.length >= 12 },
];

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const panelAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(panelAnim, {
      toValue: 0, tension: 42, friction: 9, useNativeDriver: true,
    }).start();
  }, []);

  const allRulesPass  = RULES.every(r => r.test(newPassword));
  const passwordsMatch = newPassword !== '' && newPassword === confirmPassword;
  const canSubmit = allRulesPass && passwordsMatch && !loading;

  const handleConfirm = async () => {
    if (!token) {
      setError('Token inválido. Por favor solicita un nuevo enlace.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      router.replace('/auth/login');
    } catch (e: any) {
      setError(e.error || 'Ocurrió un error. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Cabecera oscura ── */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* ── Panel blanco animado ── */}
      <Animated.View style={{ flex: 1, transform: [{ translateY: panelAnim }] }}>
        <Svg
          width={width}
          height={100}
          viewBox={`0 0 ${width} 100`}
          style={{ position: 'absolute', top: -(height * 0.070), left: 0, zIndex: 5 }}
        >
          <Path d={CURVE_PATH} fill="#ffffff" />
        </Svg>

        <View style={styles.panel}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Restablecer{'\n'}Contraseña</Text>

            <Text style={styles.subtitle}>
              Restablece tu contraseña por una nueva. Tu contraseña debe ser diferente a tu contraseña anterior.
            </Text>

            {/* Nueva contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nueva Contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#9ca3af"
                  value={newPassword}
                  onChangeText={t => { setNewPassword(t); setError(''); }}
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                  <Entypo name={showNew ? 'eye' : 'eye-with-line'} size={22} color="#818896" />
                </TouchableOpacity>
              </View>

              {/* Validaciones */}
              <View style={styles.validationList}>
                {RULES.map((rule, i) => {
                  const pass = rule.test(newPassword);
                  return (
                    <View key={i} style={styles.validationItem}>
                      <View style={[
                        styles.validationDot,
                        { backgroundColor: newPassword.length === 0 ? '#d1d5db' : pass ? '#16a34a' : '#ef4444' },
                      ]} />
                      <Text style={[
                        styles.validationText,
                        { color: newPassword.length === 0 ? '#9ca3af' : pass ? '#16a34a' : '#ef4444' },
                      ]}>
                        {rule.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={t => { setConfirmPassword(t); setError(''); }}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                  <Entypo name={showConfirm ? 'eye' : 'eye-with-line'} size={22} color="#818896" />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Las contraseñas no coinciden.</Text>
              )}
            </View>

            {error !== '' && (
              <Text style={[styles.errorText, { marginBottom: height * 0.010 }]}>{error}</Text>
            )}

            {/* Botón */}
            <TouchableOpacity
              style={[styles.button, !canSubmit && styles.buttonDisabled]}
              disabled={!canSubmit}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Confirmar</Text>
              }
            </TouchableOpacity>

            <Text style={styles.copyright}>Copyright © TBOXSA 2026</Text>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#0B1C0D',
  },

  header: {
    paddingTop:        height * 0.06,
    paddingBottom:     height * 0.02,
    paddingHorizontal: width  * 0.06,
    alignItems:        'center',
    justifyContent:    'center',
  },

  headerLogo: {
    width:  width  * 0.52,
    height: height * 0.065,
  },

  panel: {
    flex:                1,
    backgroundColor:     '#ffffff',
    borderTopLeftRadius: width * 0.18,
    overflow:            'hidden',
  },

  scrollContent: {
    paddingHorizontal: width  * 0.08,
    paddingTop:        height * 0.045,
    paddingBottom:     height * 0.04,
  },

  title: {
    fontSize:     width * 0.072,
    fontWeight:   'bold',
    color:        '#111827',
    fontFamily:   'Poppins-Bold',
    textAlign:    'center',
    marginBottom: height * 0.014,
  },

  subtitle: {
    fontSize:     width * 0.034,
    color:        '#6b7280',
    textAlign:    'center',
    fontFamily:   'Poppins-Regular',
    lineHeight:   width * 0.05,
    marginBottom: height * 0.030,
  },

  inputGroup: {
    marginBottom: height * 0.022,
  },

  label: {
    fontSize:     width * 0.034,
    fontWeight:   '600',
    color:        '#111827',
    fontFamily:   'Poppins-Regular',
    marginBottom: height * 0.008,
  },

  passwordRow: {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       '#e5e7eb',
    borderRadius:      12,
    paddingHorizontal: width  * 0.04,
    paddingVertical:   height * 0.005,
    backgroundColor:   '#ffffff',
  },

  passwordInput: {
    flex:            1,
    fontSize:        width  * 0.034,
    color:           '#111827',
    paddingVertical: height * 0.010,
    fontFamily:      'Poppins-Regular',
  },

  validationList: {
    gap:       height * 0.005,
    marginTop: height * 0.010,
  },

  validationItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },

  validationDot: {
    width:        7,
    height:       7,
    borderRadius: 4,
    flexShrink:   0,
  },

  validationText: {
    fontSize:   width * 0.028,
    fontFamily: 'Poppins-Regular',
  },

  errorText: {
    fontSize:   width * 0.028,
    color:      '#ef4444',
    fontFamily: 'Poppins-Regular',
    marginTop:  4,
  },

  button: {
    backgroundColor: '#1B3A1F',
    paddingVertical: height * 0.018,
    borderRadius:    width  * 0.08,
    alignItems:      'center',
    marginTop:       height * 0.010,
    marginBottom:    height * 0.015,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color:      '#ffffff',
    fontSize:   width * 0.048,
    fontFamily: 'Poppins-Bold',
  },

  copyright: {
    textAlign:  'center',
    fontSize:   width * 0.026,
    color:      '#9ca3af',
    fontFamily: 'Poppins-Regular',
  },
});