import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

const AVATAR_COLORS = [
  "#3C6034",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#0891B2",
  "#059669",
  "#DC2626",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
const validPhoto = (foto?: string | null) =>
  !!foto && foto !== "default.jpg" && foto.startsWith("http");

interface Tech {
  user_id: number;
  nombre_completo: string;
  foto?: string | null;
  cargo?: string | null;
}

interface Props {
  visible: boolean;
  ticketSubject: string;
  techs: Tech[];
  onSubmit: (score: number, comment: string) => Promise<void>;
  onSkip: () => void;
}

function StarRow({
  score,
  onChange,
}: {
  score: number;
  onChange: (s: number) => void;
}) {
  return (
    <View style={s.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={n <= score ? "star" : "star-outline"}
            size={width * 0.1}
            color={n <= score ? "#F59E0B" : "#D1D5DB"}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function RatingModal({ visible, techs, onSubmit, onSkip }: Props) {
  const { colors } = useTheme();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const commentRequired = score > 0 && score <= 3;
  const canSubmit = score > 0 && (score > 3 || comment.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      await onSubmit(score, comment);
    } finally {
      setSending(false);
      setScore(0);
      setComment("");
    }
  };

  const handleSkip = () => {
    setScore(0);
    setComment("");
    onSkip();
  };

  const mainTech = techs[0];
  const isMultiple = techs.length > 1;
  const visible3 = techs.slice(0, 3);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[s.sheet, { backgroundColor: colors.card }]}>
          {/* Handle */}
          <View style={[s.handle, { backgroundColor: colors.border }]} />

          {/* Técnico(s) */}
          <View style={s.techWrap}>
            {isMultiple ? (
              /* Stack de avatares superpuestos */
              <View style={s.avatarStack}>
                {visible3.map((t, i) => (
                  <View
                    key={t.user_id}
                    style={[
                      s.stackItem,
                      {
                        marginLeft: i > 0 ? -18 : 0,
                        zIndex: visible3.length - i,
                      },
                    ]}
                  >
                    {validPhoto(t.foto) ? (
                      <Image source={{ uri: t.foto! }} style={s.stackAvatar} />
                    ) : (
                      <View
                        style={[
                          s.stackAvatar,
                          s.stackAvatarFallback,
                          { backgroundColor: avatarColor(t.nombre_completo) },
                        ]}
                      >
                        <Text style={s.stackInitial}>
                          {t.nombre_completo.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : mainTech ? (
              validPhoto(mainTech.foto) ? (
                <Image source={{ uri: mainTech.foto! }} style={s.techAvatar} />
              ) : (
                <View
                  style={[
                    s.techAvatar,
                    s.techAvatarFallback,
                    { backgroundColor: avatarColor(mainTech.nombre_completo) },
                  ]}
                >
                  <Text style={s.techInitial}>
                    {mainTech.nombre_completo.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )
            ) : (
              <View
                style={[
                  s.techAvatar,
                  s.techAvatarFallback,
                  { backgroundColor: colors.input },
                ]}
              >
                <Ionicons
                  name="people-outline"
                  size={32}
                  color={colors.textMuted}
                />
              </View>
            )}

            <Text style={[s.techName, { color: colors.text }]}>
              {isMultiple
                ? `Equipo de ${techs.length} técnicos`
                : mainTech?.nombre_completo}
            </Text>
            <Text style={[s.techRole, { color: colors.textMuted }]}>
              {isMultiple
                ? "Equipo de soporte"
                : (mainTech?.cargo ?? "Técnico")}
            </Text>
          </View>

          {/* Título */}
          <Text style={[s.title, { color: colors.text }]}>
            ¿Cómo fue la atención?
          </Text>
          <Text style={[s.subtitle, { color: colors.textMuted }]}>
            Tu opinión nos ayuda a mejorar
          </Text>

          {/* Estrellas */}
          <StarRow score={score} onChange={setScore} />

          {/* Comentario */}
          <TextInput
            style={[
              s.input,
              { backgroundColor: colors.input, color: colors.text },
              commentRequired && comment.trim().length === 0
                ? { borderColor: "#F59E0B", borderWidth: 1.5 }
                : { borderColor: colors.border },
            ]}
            placeholder={
              commentRequired
                ? "Cuéntanos qué mejorar (obligatorio)"
                : "Deja un comentario (opcional)"
            }
            placeholderTextColor={
              commentRequired ? "#F59E0B" : colors.textMuted
            }
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={255}
          />
          {commentRequired && comment.trim().length === 0 && (
            <Text style={s.commentHint}>
              Con calificaciones bajas necesitamos saber qué ocurrió.
            </Text>
          )}

          {/* Botones */}
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.skipBtn, { borderColor: colors.border }]}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={[s.skipText, { color: colors.textSub }]}>
                Omitir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || sending}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.submitText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default React.memo(RatingModal);

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: width * 0.07,
    paddingBottom: 36,
    paddingTop: 14,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 22,
  },
  techWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stackItem: {
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: "#fff",
    overflow: "hidden",
  },
  stackAvatar: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: width * 0.08,
  },
  stackAvatarFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  stackInitial: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.065,
    color: "#fff",
  },
  techAvatar: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: width * 0.11,
    marginBottom: 10,
  },
  techAvatarFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  techInitial: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.09,
    color: "#fff",
  },
  techName: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    textAlign: "center",
  },
  techRole: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    marginTop: 2,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.05,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.031,
    textAlign: "center",
    marginBottom: 20,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  input: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 22,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  skipBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  skipText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
  },
  submitBtn: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#1B3A1F",
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: {
    backgroundColor: "#B0C4B1",
  },
  commentHint: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    color: "#F59E0B",
    alignSelf: "flex-start",
    marginTop: -14,
    marginBottom: 14,
  },
  submitText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#fff",
  },
});
