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
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import { countries } from "@/data/countries";
import CountryPickerModal from "@/components/CountryPickerModal";

const { width } = Dimensions.get("window");

export default function EditarPerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, updateProfile } = useAuth();
  const user = state.user;

  const [firstName, setFirstName] = useState(user?.customer_first_name ?? "");
  const [secondName, setSecondName] = useState(user?.customer_second_name ?? "");
  const [lastName, setLastName] = useState(user?.customer_last_name ?? "");
  const [secondLastName, setSecondLastName] = useState(user?.customer_second_last_name ?? "");
  const [phone, setPhone] = useState(user?.customer_phone ?? "");
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find((c) => c.prefix === user?.customer_country_code) ?? countries[0]
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentPhoto = photoUri ?? user?.customer_image ?? null;
  const validPhoto = (uri?: string | null) =>
    !!uri && (uri.startsWith("http") || uri.startsWith("file") || uri.startsWith("content"));
  const avatarInitial = (user?.customer_first_name ?? "U").charAt(0).toUpperCase();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tu galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handlePhoneChange = (text: string) => {
    const onlyNums = text.replace(/[^0-9]/g, "").slice(0, selectedCountry.maxDigits);
    setPhone(onlyNums);
  };

  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.length >= selectedCountry.minDigits;

  const hasChanges =
    firstName.trim() !== (user?.customer_first_name ?? "") ||
    (secondName ?? "") !== (user?.customer_second_name ?? "") ||
    lastName.trim() !== (user?.customer_last_name ?? "") ||
    (secondLastName ?? "") !== (user?.customer_second_last_name ?? "") ||
    phone !== (user?.customer_phone ?? "") ||
    selectedCountry.prefix !== (user?.customer_country_code ?? "") ||
    !!photoUri;

  const handleSave = async () => {
    if (!isValid || !hasChanges || saving) return;
    setSaving(true);
    try {
      await updateProfile(
        {
          customer_first_name: firstName.trim(),
          customer_second_name: secondName.trim() || null,
          customer_last_name: lastName.trim(),
          customer_second_last_name: secondLastName.trim() || null,
          customer_phone: phone,
          customer_country_code: selectedCountry.prefix,
        },
        photoUri
      );
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.error ?? "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 8, backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: colors.text }]}>Editar Perfil</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Foto de perfil */}
        <View style={s.avatarBlock}>
          <View style={s.avatarWrap}>
            {validPhoto(currentPhoto) ? (
              <Image source={{ uri: currentPhoto! }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarFallback]}>
                <Text style={s.avatarInitialText}>{avatarInitial}</Text>
              </View>
            )}
            <TouchableOpacity style={s.cameraBtn} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[s.avatarHint, { color: colors.textMuted }]}>Toca para cambiar foto</Text>
        </View>

        {[
          { label: "Primer nombre", req: true, value: firstName, onChange: setFirstName, placeholder: "Primer nombre" },
          { label: "Segundo nombre", optional: true, value: secondName, onChange: setSecondName, placeholder: "Segundo nombre" },
          { label: "Primer apellido", req: true, value: lastName, onChange: setLastName, placeholder: "Primer apellido" },
          { label: "Segundo apellido", optional: true, value: secondLastName, onChange: setSecondLastName, placeholder: "Segundo apellido" },
        ].map(({ label, req, optional, value, onChange, placeholder }) => (
          <View key={label} style={s.field}>
            <Text style={[s.label, { color: colors.textSub }]}>
              {label} {req && <Text style={s.req}>*</Text>}{optional && <Text style={[s.optional, { color: colors.textMuted }]}>(opcional)</Text>}
            </Text>
            <TextInput
              style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
              value={value}
              onChangeText={onChange}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ))}

        {/* Teléfono */}
        <View style={s.field}>
          <Text style={[s.label, { color: colors.textSub }]}>Teléfono <Text style={s.req}>*</Text></Text>
          <View style={[s.phoneRow, { borderColor: colors.border }]}>
            <TouchableOpacity style={[s.flagBtn, { backgroundColor: colors.surface, borderRightColor: colors.border }]} onPress={() => setShowCountryPicker(true)} activeOpacity={0.7}>
              <Text style={s.flagText}>{selectedCountry.flag}</Text>
              <Text style={[s.prefixText, { color: colors.text }]}>{selectedCountry.prefix}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
            </TouchableOpacity>
            <TextInput
              style={[s.phoneInput, { color: colors.text, backgroundColor: colors.input }]}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholder="Número"
              placeholderTextColor={colors.textMuted}
              maxLength={selectedCountry.maxDigits}
            />
          </View>
        </View>

        {/* Correo (solo lectura) */}
        <View style={s.field}>
          <Text style={[s.label, { color: colors.textSub }]}>Correo Electrónico <Text style={s.req}>*</Text></Text>
          <TextInput style={[s.input, s.inputReadonly, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMuted }]} value={user?.customer_email ?? ""} editable={false} />
        </View>

        {/* Empresa (solo lectura) */}
        <View style={s.field}>
          <Text style={[s.label, { color: colors.textSub }]}>Empresa</Text>
          <TextInput style={[s.input, s.inputReadonly, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textMuted }]} value={user?.customer_company ?? ""} editable={false} />
        </View>

        {!showCountryPicker && (
          <TouchableOpacity style={[s.saveBtn, (!isValid || !hasChanges || saving) && s.saveBtnDisabled]} onPress={handleSave} disabled={!isValid || !hasChanges || saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Guardar cambios</Text>}
          </TouchableOpacity>
        )}
      </ScrollView>

      {showCountryPicker && (
        <CountryPickerModal
          countries={countries}
          selectedCountry={selectedCountry}
          onSelect={(c) => {
            setSelectedCountry(c);
            setPhone("");
            setShowCountryPicker(false);
          }}
          onClose={() => setShowCountryPicker(false)}
        />
      )}
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
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "#111",
  },
  scroll: { paddingHorizontal: width * 0.055, paddingTop: 24, gap: 4 },

  field: { marginBottom: 18 },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    color: "#333",
    marginBottom: 8,
  },
  req: { color: "#DC2626" },
  optional: { color: "#9CA3AF", fontStyle: "italic" },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.036,
    color: "#111",
    backgroundColor: "#fff",
  },
  inputReadonly: {
    backgroundColor: "#F9FAFB",
    color: "#9CA3AF",
  },

  phoneRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  flagBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  flagText: { fontSize: 22 },
  prefixText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    color: "#333",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.036,
    color: "#111",
  },

  // Avatar
  avatarBlock: { alignItems: "center", paddingVertical: 24 },
  avatarWrap: { position: "relative" },
  avatar: {
    width: width * 0.26,
    height: width * 0.26,
    borderRadius: width * 0.13,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarFallback: {
    backgroundColor: "#3C6034",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitialText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.1,
    color: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3C6034",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarHint: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    color: "#9CA3AF",
    marginTop: 8,
  },

  // Save
  saveBtn: {
    backgroundColor: "#3C6034",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { backgroundColor: "#A8C5A0" },
  saveBtnText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.04,
    color: "#fff",
  },
});