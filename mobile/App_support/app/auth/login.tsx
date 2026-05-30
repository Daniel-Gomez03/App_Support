import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import CurvedBorder from "@/components/CurvedBorder";
import { useAuth } from "@/hooks/useAuth";
import * as SecureStore from "expo-secure-store";
import { loginStyles as styles, height } from "@/styles/login.styles";

export default function LoginScreen() {
  const router = useRouter();
  const authContext = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginTouched, setLoginTouched] = useState({
    email: false,
    password: false,
  });

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const panelEntranceAnim = useRef(new Animated.Value(height)).current;
  const userOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(80),
        Animated.spring(panelEntranceAnim, {
          toValue: 0,
          tension: 42,
          friction: 9,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await SecureStore.getItemAsync("remembered_email");
        if (saved) {
          setEmail(saved);
          setRememberMe(true);
        }
      } catch {}
    };
    load();
  }, []);

  const isEmailValidFormat = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const loginFormValid = email.trim() !== "" && password.trim() !== "";

  const getLoginBorderColor = (field: "email" | "password", value: string) => {
    if (!loginTouched[field]) return "#C4C4C4";
    if (value.trim() === "") return "#D9534F";
    if (field === "email" && !isEmailValidFormat(value)) return "#D9534F";
    return "#28a745";
  };

  const handleLogin = async () => {
    try {
      await authContext.login(email, password);
      if (rememberMe) {
        await SecureStore.setItemAsync("remembered_email", email);
      } else {
        await SecureStore.deleteItemAsync("remembered_email");
      }
      setEmail("");
      setPassword("");
    } catch (error: any) {
      alert("Error: " + (error.error || error.message || "Error desconocido"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      enabled={Platform.OS === "ios"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      >
        <Animated.View style={[styles.logo, { opacity: logoOpacity }]}>
          <Image
            source={require("@/assets/images/Logo.png")}
            style={{ width: "100%", height: "100%", resizeMode: "contain" }}
          />
        </Animated.View>

        <Animated.View
          style={{ transform: [{ translateY: panelEntranceAnim }] }}
        >
          <Animated.View
            style={[styles.userImageContainer, { opacity: userOpacity }]}
          >
            <Image
              source={require("@/assets/images/vector-asomado-1.png")}
              resizeMode="contain"
            />
          </Animated.View>

          <CurvedBorder>
            <Text style={styles.title}>Bienvenido</Text>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <FontAwesome5 name="user-alt" size={18} color="#000000" />
                <Text style={styles.label}>Correo Electrónico</Text>
              </View>
              <TextInput
                style={[
                  styles.inputLogin,
                  { borderColor: getLoginBorderColor("email", email) },
                ]}
                placeholder="Correo electrónico o Teléfono"
                placeholderTextColor="#99A1AF"
                value={email}
                onBlur={() => setLoginTouched((p) => ({ ...p, email: true }))}
                onChangeText={(t) => setEmail(t.trim())}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <FontAwesome name="lock" size={18} color="#000000" />
                <Text style={styles.label}>Contraseña</Text>
              </View>
              <View
                style={[
                  styles.passwordContainer,
                  { borderColor: getLoginBorderColor("password", password) },
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Ingrese su contraseña"
                  placeholderTextColor="#99A1AF"
                  value={password}
                  onBlur={() =>
                    setLoginTouched((p) => ({ ...p, password: true }))
                  }
                  onChangeText={(t) => setPassword(t.trim())}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Entypo
                    name={showPassword ? "eye" : "eye-with-line"}
                    size={22}
                    color="#818896"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe ? "#3C6034" : "transparent",
                    borderColor: rememberMe ? "#3C6034" : "#C7C3C3",
                  },
                ]}
                onPress={() => setRememberMe((v) => !v)}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={12} color="white" />
                )}
              </TouchableOpacity>
              <Text style={styles.checkboxText}>Recuérdame</Text>
              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => router.push("/auth/forgot-password")}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste la contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { opacity: loginFormValid ? 1 : 0.5 },
              ]}
              disabled={!loginFormValid}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>Ingresar</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.push("/auth/register")}>
                <Text style={styles.signupLink}>Crear Cuenta</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.copyright}>Copyright © TBOXSA 2026</Text>
          </CurvedBorder>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
