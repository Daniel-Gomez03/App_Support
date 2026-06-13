// ============================================
// PANTALLA: CAMBIAR CONTRASEÑA (CambiarContrasenaScreen)
// Requiere la contraseña actual + nueva (5 reglas
// evaluadas en tiempo real) + confirmación.
//
// PasswordField — sub-componente con su propio estado
// `show` para mostrar/ocultar el texto; desacoplado
// para no duplicar lógica en los tres campos.
//
// En éxito: logout() invalida la sesión actual y
// redirige al flujo de auth.
// ============================================

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import authService from "@/Services/authService";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const REQUIREMENTS = [
  {
    key: "upper",
    label: "Una letra mayúscula",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lower",
    label: "Una letra minúscula",
    test: (p: string) => /[a-z]/.test(p),
  },
  { key: "number", label: "Un número", test: (p: string) => /[0-9]/.test(p) },
  {
    key: "special",
    label: "Un carácter especial",
    test: (p: string) => /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(p),
  },
  {
    key: "length",
    label: "Mínimo 12 caracteres",
    test: (p: string) => p.length >= 12,
  },
];

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  colors: import("@/context/ThemeContext").ThemeColors;
}) {
  const [show, setShow] = useState(false);
  return (
    <View style={s.field}>
      <Text style={[s.label, { color: colors.textSub }]}>{label}</Text>
      <View
        style={[
          s.inputWrap,
          { borderColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <TextInput
          style={[
            s.input,
            { color: colors.text, backgroundColor: colors.input },
          ]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShow(!show)}
          style={s.eyeBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={show ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function CambiarContrasenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();
  const { colors } = useTheme();

  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const reqs = REQUIREMENTS.map((r) => ({ ...r, ok: r.test(newPass) }));
  const allReqsMet = reqs.every((r) => r.ok);
  const passMatch = newPass === confirm && confirm.length > 0;
  const isValid = current.length > 0 && allReqsMet && passMatch;

  const handleSubmit = async () => {
    if (!isValid || saving) return;
    setSaving(true);
    try {
      await authService.changePassword(current, newPass);
      Alert.alert(
        "Contraseña actualizada",
        "Tu contraseña fue cambiada correctamente. Por seguridad, inicia sesión nuevamente.",
        [
          {
            text: "Aceptar",
            onPress: async () => {
              // logout invalida la sesión actual para que
              // el token anterior no siga siendo válido.
              await logout();
              router.replace("/auth" as any);
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert("Error", e.error ?? "No se pudo cambiar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          s.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>
          Cambiar contraseña
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={true}
      >
        <Text style={[s.description, { color: colors.textMuted }]}>
          Restablece tu contraseña por una nueva. Tu contraseña debe ser
          diferente a la anterior.
        </Text>

        <PasswordField
          colors={colors}
          label="Contraseña actual"
          value={current}
          onChange={setCurrent}
          placeholder="Ingresa tu contraseña actual"
        />
        <PasswordField
          colors={colors}
          label="Nueva contraseña"
          value={newPass}
          onChange={setNewPass}
          placeholder="Ingresa tu nueva contraseña"
        />

        {newPass.length > 0 && (
          <View style={s.reqBox}>
            {reqs.map((r) => (
              <View key={r.key} style={s.reqRow}>
                <Ionicons
                  name={r.ok ? "checkmark-circle" : "ellipse-outline"}
                  size={14}
                  color={r.ok ? colors.primary : colors.border}
                />
                <Text
                  style={[
                    s.reqText,
                    { color: r.ok ? colors.primary : colors.textMuted },
                  ]}
                >
                  {r.label}
                </Text>
              </View>
            ))}
          </View>
        )}

        <PasswordField
          colors={colors}
          label="Confirmar nueva contraseña"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repite la nueva contraseña"
        />

        {confirm.length > 0 && !passMatch && (
          <Text style={s.errorText}>Las contraseñas no coinciden</Text>
        )}

        <TouchableOpacity
          style={[s.btn, !isValid && s.btnDisabled]}
          onPress={handleSubmit}
          disabled={!isValid || saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={s.btnText}>Cambiar contraseña</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "#111",
  },
  scroll: {
    paddingHorizontal: width * 0.055,
    paddingTop: 20,
  },

  description: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
  },

  field: {
    marginBottom: 18,
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    color: "#333",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.036,
    color: "#111",
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },

  reqBox: {
    marginTop: -8,
    marginBottom: 16,
    gap: 5,
  },
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  reqText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    color: "#CCC",
  },

  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.03,
    color: "#DC2626",
    marginTop: -10,
    marginBottom: 12,
  },

  btn: {
    backgroundColor: "#3C6034",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: "#A8C5A0",
  },
  btnText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.04,
    color: "#fff",
  },
});
