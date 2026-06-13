// ============================================
// PANTALLA: POLÍTICAS DE GARANTÍAS (PoliticasGarantiaScreen)
// Pantalla de solo lectura. Carga el contenido
// desde authService.getWarrantyPolicy al montar.
//
// Si la petición falla, policy queda null y la UI
// muestra el mensaje "No se pudo cargar la política."
// ============================================

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import authService, { WarrantyPolicy } from "@/Services/authService";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

export default function PoliticasGarantiaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [policy, setPolicy] = useState<WarrantyPolicy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getWarrantyPolicy()
      .then(setPolicy)
      // null activa el estado de error en la UI; no hay acción extra.
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            Políticas de Garantías
          </Text>
          {policy && (
            <Text style={[s.headerSub, { color: colors.textMuted }]}>
              {policy.policy_updated_label}
            </Text>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color="#3C6034" />
        </View>
      ) : !policy ? (
        <View style={s.center}>
          <Text style={[s.errorText, { color: colors.textMuted }]}>
            No se pudo cargar la política.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {policy.policy_content.map((section, si) => (
            <View key={si} style={s.section}>
              <Text style={[s.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
              {section.items.map((item) => (
                <Text
                  key={item.key}
                  style={[s.itemText, { color: colors.textSub }]}
                >
                  {item.text}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.043,
    color: "#111",
  },
  headerSub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#9CA3AF",
    marginTop: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.035,
    color: "#9CA3AF",
  },
  scroll: {
    paddingHorizontal: width * 0.055,
    paddingTop: 24,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#111",
  },
  itemText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#444",
    lineHeight: 22,
  },
});
