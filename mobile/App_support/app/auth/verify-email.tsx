import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");
const CURVE_PATH = `M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`;

const STEPS = [
  "Revisa tu bandeja de entrada",
  "Busca el correo de TBOXSA",
  'Haz clic en el botón "Verificar Email"',
];

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const panelAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(panelAnim, {
      toValue: 0,
      tension: 42,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

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
          >
            <View style={styles.iconCircle}>
              <Ionicons
                name="mail-outline"
                size={width * 0.13}
                color="#6366f1"
              />
            </View>

            <Text style={styles.title}>Verifica tu Email</Text>

            <Text style={styles.subtitle}>
              Hemos enviado un correo de verificación a
            </Text>
            <Text style={styles.emailText}>{email}</Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Para completar tu registro:</Text>

              {STEPS.map((step, i) => (
                <View key={i} style={styles.infoRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.infoText}>{step}</Text>
                </View>
              ))}

              <View style={styles.warningRow}>
                <Ionicons name="warning-outline" size={15} color="#d97706" />
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

            <Text style={styles.copyright}>Copyright © TBOXSA 2026</Text>
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1C0D",
  },

  header: {
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },

  headerLogo: {
    width: width * 0.52,
    height: height * 0.065,
  },

  panel: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: width * 0.18,
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.045,
    paddingBottom: height * 0.04,
    alignItems: "center",
  },

  iconCircle: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: width * 0.12,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.025,
  },

  title: {
    fontSize: width * 0.072,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: height * 0.012,
  },

  subtitle: {
    fontSize: width * 0.034,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: width * 0.05,
  },

  emailText: {
    fontSize: width * 0.038,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginTop: height * 0.005,
    marginBottom: height * 0.03,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: width * 0.05,
    marginBottom: height * 0.035,
    gap: height * 0.01,
  },

  infoTitle: {
    fontSize: width * 0.032,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "Poppins-Regular",
    marginBottom: height * 0.004,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  bullet: {
    fontSize: width * 0.04,
    color: "#6b7280",
    lineHeight: width * 0.052,
  },

  infoText: {
    flex: 1,
    fontSize: width * 0.032,
    color: "#374151",
    fontFamily: "Poppins-Regular",
    lineHeight: width * 0.048,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: height * 0.004,
  },

  warningText: {
    fontSize: width * 0.03,
    color: "#d97706",
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },

  button: {
    width: "100%",
    backgroundColor: "#1B3A1F",
    paddingVertical: height * 0.018,
    borderRadius: width * 0.08,
    alignItems: "center",
    marginBottom: height * 0.015,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: width * 0.048,
    fontFamily: "Poppins-Bold",
  },

  copyright: {
    fontSize: width * 0.026,
    color: "#9ca3af",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});
