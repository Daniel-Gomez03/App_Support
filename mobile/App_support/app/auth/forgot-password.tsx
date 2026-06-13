// ============================================
// PANTALLA: RECUPERAR CONTRASEÑA (ForgotPasswordScreen)
// Dos estados controlados por `sent`:
//   false — formulario para ingresar el email.
//   true  — confirmación con próximos pasos y
//           botón para volver al login.
//
// El panel blanco entra con un spring desde
// abajo al montar la pantalla.
// ============================================

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";
import { styles, width, height } from "@/styles/forgot-password.styles";
import authService from "@/Services/authService";

// Ola decorativa superior: beziers cuadráticas
// ancladas a `width` para cubrir toda la pantalla.
const CURVE_PATH = `M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`;

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const NEXT_STEPS = [
  "Revisa tu bandeja de entrada",
  'Haz clic en "Restablecer Contraseña"',
  "Crea una nueva contraseña segura",
];

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // translateY inicial = height desplaza el panel
  // completamente fuera de pantalla hacia abajo.
  const panelAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(panelAnim, {
      toValue: 0,
      tension: 42,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const canSend = email.trim() !== "" && isValidEmail(email);

  const handleSend = async () => {
    setError("");
    setLoading(true);
    try {
      // toLowerCase evita errores por mayúsculas en
      // cuentas que el backend trata como case-sensitive.
      await authService.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (e: any) {
      setError(e.error || "Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/Logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      <Animated.View
        style={{ flex: 1, transform: [{ translateY: panelAnim }] }}
      >
        <Svg
          width={width}
          height={100}
          viewBox={`0 0 ${width} 100`}
          style={{
            position: "absolute",
            top: -(height * 0.07),
            left: 0,
            zIndex: 5,
          }}
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
              <>
                <View style={styles.iconCircle}>
                  <Ionicons
                    name="checkmark"
                    size={width * 0.13}
                    color="#3C6034"
                  />
                </View>

                <Text style={styles.title}>¡Correo Enviado!</Text>

                <Text style={styles.subtitle}>
                  Hemos enviado un enlace de recuperación a
                </Text>
                <Text style={styles.emailText}>
                  {email.trim().toLowerCase()}
                </Text>

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>Próximos pasos:</Text>
                  {NEXT_STEPS.map((step, i) => (
                    <View key={i} style={styles.infoRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.infoText}>{step}</Text>
                    </View>
                  ))}
                  <View style={styles.warningRow}>
                    <Ionicons
                      name="warning-outline"
                      size={15}
                      color="#d97706"
                    />
                    <Text style={styles.warningText}>
                      El enlace expirará en 15 minutos
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => router.replace("/auth/login")}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Volver al Inicio</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>¿Olvidaste tu{"\n"}contraseña?</Text>

                <Text style={styles.subtitle}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer
                  tu contraseña.
                </Text>

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
                    onChangeText={(t) => {
                      setEmail(t.trim());
                      setError("");
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {error !== "" && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.button, !canSend && styles.buttonDisabled]}
                  disabled={!canSend || loading}
                  onPress={handleSend}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Enviar Enlace</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>
                    ¿Haz recordado tú contraseña?
                  </Text>
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
