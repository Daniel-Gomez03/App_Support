import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ScrollView, Animated, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import authService from '@/Services/authService';

const { width, height } = Dimensions.get('window');
const CURVE_PATH = `M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`;

const NEXT_STEPS = [
  'Revisa tu bandeja de entrada',
  "Haz clic en \"Restablecer Contraseña\"",
  'Crea una nueva contraseña segura',
];

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const panelAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(panelAnim, {
      toValue: 0, tension: 42, friction: 9, useNativeDriver: true,
    }).start();
  }, []);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const canSend = email.trim() !== '' && isValidEmail(email);

  const handleSend = async () => {
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
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

            {sent ? (
              /* ─── Estado: correo enviado ─────────────────────────────── */
              <>
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark" size={width * 0.13} color="#3C6034" />
                </View>

                <Text style={styles.title}>¡Correo Enviado!</Text>

                <Text style={styles.subtitle}>
                  Hemos enviado un enlace de recuperación a
                </Text>
                <Text style={styles.emailText}>{email.trim().toLowerCase()}</Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Próximos pasos:</Text>
                  {NEXT_STEPS.map((step, i) => (
                    <View key={i} style={styles.infoRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.infoText}>{step}</Text>
                    </View>
                  ))}
                  <View style={styles.warningRow}>
                    <Ionicons name="warning-outline" size={15} color="#d97706" />
                    <Text style={styles.warningText}>El enlace expirará en 15 minutos</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.replace('/auth/login')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Volver al Inicio</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ─── Estado: formulario ─────────────────────────────────── */
              <>
                <Text style={styles.title}>¿Olvidaste tu{'\n'}contraseña?</Text>

                <Text style={styles.subtitle}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </Text>

                {/* Input correo */}
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Ionicons name="mail-outline" size={16} color="#374151" />
                    <Text style={styles.label}>Correo Electrónico</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={t => { setEmail(t.trim()); setError(''); }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {error !== '' && (
                  <Text style={styles.errorText}>{error}</Text>
                )}

                {/* Botón enviar */}
                <TouchableOpacity
                  style={[styles.button, !canSend && styles.buttonDisabled]}
                  disabled={!canSend || loading}
                  onPress={handleSend}
                  activeOpacity={0.85}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Enviar Enlace</Text>
                  }
                </TouchableOpacity>

                {/* Link a login */}
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>¿Haz recordado tú contraseña?</Text>
                  <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.loginLink}> Iniciar Sesión</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

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
    alignItems:        'center',
  },

  // ── Form ─────────────────────────────────────────────────────────────────────
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
    width:        '100%',
    marginBottom: height * 0.010,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginBottom:  height * 0.007,
  },

  label: {
    fontSize:   width * 0.032,
    fontWeight: '600',
    color:      '#111827',
    fontFamily: 'Poppins-Regular',
  },

  input: {
    width:             '100%',
    borderWidth:       1,
    borderColor:       '#e5e7eb',
    borderRadius:      12,
    paddingHorizontal: width  * 0.04,
    paddingVertical:   height * 0.014,
    fontSize:          width  * 0.034,
    color:             '#111827',
    backgroundColor:   '#ffffff',
    fontFamily:        'Poppins-Regular',
  },

  errorText: {
    width:      '100%',
    fontSize:   width * 0.030,
    color:      '#ef4444',
    fontFamily: 'Poppins-Regular',
    marginBottom: height * 0.010,
  },

  button: {
    width:           '100%',
    backgroundColor: '#1B3A1F',
    paddingVertical: height * 0.018,
    borderRadius:    width  * 0.08,
    alignItems:      'center',
    marginTop:       height * 0.020,
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

  loginRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    marginBottom:   height * 0.020,
  },

  loginText: {
    fontSize:   width * 0.032,
    color:      '#6b7280',
    fontFamily: 'Poppins-Regular',
  },

  loginLink: {
    fontSize:   width * 0.032,
    color:      '#3C6034',
    fontFamily: 'Poppins-Bold',
    fontWeight: '700',
  },

  // ── Success ───────────────────────────────────────────────────────────────────
  iconCircle: {
    width:           width * 0.24,
    height:          width * 0.24,
    borderRadius:    width * 0.12,
    backgroundColor: '#dcfce7',
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    height * 0.025,
  },

  emailText: {
    fontSize:     width * 0.038,
    fontWeight:   'bold',
    color:        '#111827',
    fontFamily:   'Poppins-Bold',
    textAlign:    'center',
    marginTop:    height * 0.005,
    marginBottom: height * 0.030,
  },

  infoBox: {
    width:           '100%',
    backgroundColor: '#f9fafb',
    borderRadius:    14,
    padding:         width * 0.05,
    marginBottom:    height * 0.035,
    gap:             height * 0.010,
  },

  infoTitle: {
    fontSize:     width * 0.032,
    fontWeight:   '700',
    color:        '#374151',
    fontFamily:   'Poppins-Regular',
    marginBottom: height * 0.004,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           8,
  },

  bullet: {
    fontSize:   width * 0.04,
    color:      '#6b7280',
    lineHeight: width * 0.052,
  },

  infoText: {
    flex:       1,
    fontSize:   width * 0.032,
    color:      '#374151',
    fontFamily: 'Poppins-Regular',
    lineHeight: width * 0.048,
  },

  warningRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    marginTop:     height * 0.004,
  },

  warningText: {
    fontSize:   width * 0.030,
    color:      '#d97706',
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  copyright: {
    fontSize:   width * 0.026,
    color:      '#9ca3af',
    fontFamily: 'Poppins-Regular',
    textAlign:  'center',
  },
});