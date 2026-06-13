// ============================================
// PANTALLA: DETALLE DE TICKET (TicketDetailScreen)
// Dos tabs:
//   "chat"  — mensajes en tiempo real vía Socket.IO
//             (canal `ticket_comment_${id}`).
//   "info"  — detalles, técnicos asignados y
//             solicitud de cancelación.
//
// Flujo de cancelación:
//   1. Cliente pulsa "Solicitar cancelación".
//   2. statusId pasa a 8 (pendiente); el chat muestra
//      un banner y permite escribir el motivo.
//   3. Si un Admin responde después del mensaje 🔴,
//      `cancellationPending` se vuelve false y el
//      chat vuelve al modo normal.
//
// ProgressBar: Nuevo (1) → En Proceso (2) → Finalizado (3).
// Modal de imagen: zoom con ScrollView + maximumZoomScale.
// ============================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  FlatList,
  Modal,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import socket from "@/Services/socket";
import ticketService from "@/Services/ticketService";
import { s } from "@/styles/ticket.styles";
import { useTheme } from "@/context/ThemeContext";

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

const fmtDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getDate()} de ${["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][d.getMonth()]} de ${d.getFullYear()}, ${d.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit", hour12: true })}`;
};
const fmtTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-HN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStep = (statusId: number): number => {
  if (statusId === 9 || statusId === 10) return 3;
  if (statusId >= 3) return 2;
  return 1;
};

const getCustomerLabel = (statusId: number): string => {
  if (statusId === 10) return "Cancelado";
  if (statusId === 9) return "Finalizado";
  if (statusId >= 3) return "En Proceso";
  return "Nuevo";
};

const isOutsideBusinessHours = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  const total = now.getHours() * 60 + now.getMinutes();

  if (day === 0 || day === 6) return true;
  if (day >= 1 && day <= 4) return total < 8 * 60 + 30 || total >= 17 * 60 + 30;
  if (day === 5) return total < 9 * 60 || total >= 17 * 60;
  return true;
};

function Avatar({
  uri,
  name,
  size = 38,
}: {
  uri?: string | null;
  name?: string;
  size?: number;
}) {
  const initial = (name ?? "?").charAt(0).toUpperCase();
  if (validPhoto(uri))
    return (
      <Image
        source={{ uri: uri! }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: avatarColor(name ?? ""),
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontFamily: "Poppins-Bold",
          fontSize: size * 0.38,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["Nuevo", "En Proceso", "Finalizado"];
  return (
    <View style={s.progress}>
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step >= num;
        const current = step === num;
        return (
          <React.Fragment key={label}>
            <View style={s.progressStep}>
              <View
                style={[
                  s.progressDot,
                  active && s.progressDotActive,
                  current && s.progressDotCurrent,
                ]}
              >
                {active && <View style={s.progressDotInner} />}
              </View>
              <Text style={[s.progressLabel, active && s.progressLabelActive]}>
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[s.progressLine, step > num && s.progressLineActive]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const { colors } = useTheme();

  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "info">("chat");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState(false);
  // Stable keyboard height — only updates on show/hide, not on suggestion bar changes
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const show = Keyboard.addListener("keyboardDidShow", (e) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () => setKbHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync("userToken").then((t) => setCustomerId(Number(t)));
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [tData, cData] = await Promise.all([
        ticketService.getTicketById(id),
        ticketService.getTicketComments(id),
      ]);
      setTicket(tData);
      setComments(cData);
    } catch (e) {
      console.error(e);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();

    // Descarta el evento si el comentario ya existe en
    // la lista — evita duplicados cuando el socket llega
    // mientras la respuesta HTTP aún está en vuelo.
    const commentHandler = (comment: any) =>
      setComments((prev) =>
        prev.some((c) => c.comment_id === comment.comment_id)
          ? prev
          : [...prev, comment],
      );

    const ticketHandler = (updated: any) => {
      if (Number(updated.ticket_id) === Number(id)) {
        setTicket((prev: any) => (prev ? { ...prev, ...updated } : prev));
      }
    };

    socket.on(`ticket_comment_${id}`, commentHandler);
    socket.on("ticket_updated", ticketHandler);
    return () => {
      socket.off(`ticket_comment_${id}`, commentHandler);
      socket.off("ticket_updated", ticketHandler);
    };
  }, [id]);

  useEffect(() => {
    if (comments.length > 0) {
      // 100 ms de delay para que FlatList renderice el nuevo
      // ítem antes de llamar scrollToEnd; sin él, scrollea
      // al penúltimo mensaje.
      setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [comments]);

  const pickFiles = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permiso denegado", "Necesitamos acceso a tus archivos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled)
      setPendingFiles((prev) => [...prev, ...result.assets]);
  };

  const canSend = msg.trim().length > 0 || pendingFiles.length > 0;

  const sendComment = async () => {
    if (!canSend || sending) return;
    setSending(true);
    try {
      await ticketService.sendComment(id, msg.trim(), pendingFiles);
      setMsg("");
      setPendingFiles([]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  const requestCancel = () => {
    Alert.alert(
      "Solicitar cancelación",
      "¿Estás seguro de que deseas solicitar la cancelación de este ticket? Un agente revisará tu solicitud.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, solicitar",
          style: "destructive",
          onPress: async () => {
            try {
              await ticketService.requestCancellation(id);
              await fetchAll();
            } catch {}
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3C6034" />
      </View>
    );
  }

  if (fetchError || !ticket) {
    return (
      <View style={s.center}>
        <Ionicons name="cloud-offline-outline" size={52} color="#9CA3AF" />
        <Text style={s.errorTitle}>No se pudo cargar el ticket</Text>
        <Text style={s.errorSub}>Verifica tu conexión e intenta de nuevo.</Text>
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => {
            setFetchError(false);
            setLoading(true);
            fetchAll();
          }}
          activeOpacity={0.8}
        >
          <Text style={s.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusId = ticket.status?.ticket_status_id ?? 0;
  const step = getStep(statusId);
  const isClosed = statusId === 9 || statusId === 10;
  const isCancelled = statusId === 10;

  // Busca el índice del mensaje de sistema 🔴 de cancelación
  // más reciente. Si un Admin escribió después de ese mensaje,
  // el equipo ya tomó nota y la cancelación deja de estar
  // "pendiente" — se libera el chat normal.
  const cancelCommentIdx = comments.reduce(
    (acc: number, c: any, i: number) =>
      !c.user_id &&
      c.comment_text?.startsWith("🔴") &&
      c.comment_text?.includes("cancelaci")
        ? i
        : acc,
    -1,
  );
  const adminWroteAfterCancel =
    cancelCommentIdx >= 0 &&
    comments
      .slice(cancelCommentIdx + 1)
      .some((c: any) => !!c.user_id && c.author?.rol === "Admin");
  const cancellationPending = statusId === 8 && !adminWroteAfterCancel;

  const isChatPaused = !!ticket?.chat_paused;
  const techs: any[] = ticket.assignedUsers ?? [];
  const techHasWritten = comments.some(
    (c) => !!c.user_id && !c.comment_text?.startsWith("🔴"),
  );
  const warranty = ticket.warranty;
  // null cuando el ticket no tiene número de serie;
  // en ese caso el badge de garantía no se renderiza.
  const warrantyLabel = !ticket.ticket_serial_number
    ? null
    : warranty?.is_expired
      ? "Vencida"
      : "Activa";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* ── HEADER ── */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {ticket.ticket_subject}
          </Text>
          <Text style={s.headerSub}>ID:{ticket.ticket_id}</Text>
        </View>
        <View style={s.headerBadge}>
          <Text style={s.headerBadgeText}>{getCustomerLabel(statusId)}</Text>
        </View>
      </View>

      {/* ── PROGRESS ── */}
      <View style={s.progressWrapper}>
        <ProgressBar step={step} />
      </View>

      {/* ── TABS ── */}
      <View style={s.tabsRow}>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === "chat" && s.tabBtnActive]}
          onPress={() => setActiveTab("chat")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="chatbubble-outline"
            size={16}
            color={activeTab === "chat" ? "#fff" : "#ccc"}
          />
          <Text style={[s.tabLabel, activeTab === "chat" && s.tabLabelActive]}>
            Chat
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tabBtn, activeTab === "info" && s.tabBtnActive]}
          onPress={() => setActiveTab("info")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={activeTab === "info" ? "#fff" : "#ccc"}
          />
          <Text style={[s.tabLabel, activeTab === "info" && s.tabLabelActive]}>
            Información
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={{
              flex: 1,
              paddingBottom: Platform.OS === "android" ? kbHeight : 0,
            }}
          >
            {/* Técnico(s) asignado(s) */}
            {techs.length > 0 && (
              <View
                style={[
                  s.techCard,
                  {
                    backgroundColor: colors.card,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {techs.length === 1 ? (
                  <>
                    <Avatar
                      uri={techs[0].foto}
                      name={techs[0].nombre_completo}
                      size={46}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[s.techCardName, { color: colors.text }]}>
                        {techs[0].nombre_completo}
                      </Text>
                      <Text
                        style={[s.techCardRole, { color: colors.textMuted }]}
                      >
                        {techs[0].cargo ?? "Técnico"}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={s.techAvatarStack}>
                      {techs.slice(0, 3).map((t, i) => (
                        <View
                          key={t.user_id}
                          style={[
                            s.techStackItem,
                            { marginLeft: i > 0 ? -14 : 0, zIndex: 10 - i },
                          ]}
                        >
                          <Avatar
                            uri={t.foto}
                            name={t.nombre_completo}
                            size={40}
                          />
                        </View>
                      ))}
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[s.techCardName, { color: colors.text }]}>
                        Equipo de soporte
                      </Text>
                      <Text
                        style={[s.techCardRole, { color: colors.textMuted }]}
                      >
                        {techs.length} técnicos asignados
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Mensajes */}
            <FlatList
              ref={flatRef}
              data={comments}
              keyExtractor={(c) => c.comment_id.toString()}
              contentContainerStyle={s.chatList}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isCustomer =
                  !!item.customer_id && item.customer_id === customerId;
                const isSystem = item.comment_text?.startsWith("🔴");
                const hasAttachments = (item.attachments?.length ?? 0) > 0;
                // Oculta el texto placeholder "📎 Archivo adjunto"
                // cuando hay adjuntos reales; solo se muestran las imágenes.
                const showText =
                  !hasAttachments || item.comment_text !== "📎 Archivo adjunto";

                if (isSystem) {
                  const displayText = (item.comment_text as string).replace(
                    /^🔴\s*/,
                    "",
                  );
                  return (
                    <View
                      style={[
                        s.sysMsg,
                        {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={s.sysMsgHeader}>
                        <Ionicons
                          name="information-circle"
                          size={13}
                          color={colors.primary}
                        />
                        <Text
                          style={[s.sysMsgLabel, { color: colors.primary }]}
                        >
                          Sistema
                        </Text>
                      </View>
                      <Text style={[s.sysMsgText, { color: colors.textSub }]}>
                        {displayText}
                      </Text>
                    </View>
                  );
                }
                return (
                  <View style={[s.msgRow, isCustomer && s.msgRowRight]}>
                    {!isCustomer && (
                      <Avatar
                        uri={item.author?.foto}
                        name={item.author?.nombre_completo}
                        size={28}
                      />
                    )}
                    <View
                      style={[
                        s.bubble,
                        isCustomer
                          ? s.bubbleCustomer
                          : [s.bubbleTech, { backgroundColor: colors.card }],
                      ]}
                    >
                      {!isCustomer && (
                        <View style={s.bubbleAuthorRow}>
                          <Text
                            style={[s.bubbleAuthor, { color: colors.textSub }]}
                          >
                            {item.author?.nombre_completo ?? "Técnico"}
                          </Text>
                          {item.author?.rol === "Admin" && (
                            <View
                              style={[
                                s.supportBadge,
                                { backgroundColor: colors.primarySoft },
                              ]}
                            >
                              <Text
                                style={[
                                  s.supportBadgeText,
                                  { color: colors.primary },
                                ]}
                              >
                                Admin
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                      {showText && (
                        <Text
                          style={[
                            s.bubbleText,
                            isCustomer
                              ? s.bubbleTextCustomer
                              : { color: colors.text },
                          ]}
                        >
                          {item.comment_text}
                        </Text>
                      )}
                      {hasAttachments &&
                        item.attachments.map((a: any) => (
                          <TouchableOpacity
                            key={a.attachment_id}
                            onPress={() => setViewingImage(a.file_path)}
                            activeOpacity={0.85}
                          >
                            <Image
                              source={{ uri: a.file_path }}
                              style={s.attachImg}
                              resizeMode="cover"
                            />
                          </TouchableOpacity>
                        ))}
                      <Text
                        style={[
                          s.bubbleTime,
                          isCustomer && s.bubbleTimeCustomer,
                          !isCustomer && { color: colors.textMuted },
                        ]}
                      >
                        {fmtTime(item.created_at)}
                      </Text>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={
                <View style={s.chatEmpty}>
                  <Text style={[s.chatEmptyText, { color: colors.textMuted }]}>
                    Aún no hay mensajes. Escribe algo para iniciar la
                    conversación.
                  </Text>
                </View>
              }
            />

            {/* Banner fuera de horario laboral */}
            {!isClosed && isOutsideBusinessHours() && (
              <View
                style={[
                  s.offHoursBanner,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={16} color="#D97706" />
                <Text style={[s.offHoursText, { color: colors.textSub }]}>
                  Estás fuera del horario laboral (L–J 8:30–17:30, V
                  9:00–17:00). Tu mensaje será atendido en el próximo horario
                  hábil.
                </Text>
              </View>
            )}

            {/* Preview de adjuntos pendientes */}
            {!isClosed && pendingFiles.length > 0 && (
              <View
                style={[
                  s.pendingRow,
                  {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                {pendingFiles.map((f, i) => (
                  <View key={i} style={s.pendingThumb}>
                    <Image source={{ uri: f.uri }} style={s.pendingImg} />
                    <TouchableOpacity
                      style={[
                        s.pendingRemove,
                        { backgroundColor: colors.card },
                      ]}
                      onPress={() =>
                        setPendingFiles((prev) =>
                          prev.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <Ionicons name="close-circle" size={18} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {isChatPaused && !isClosed && !cancellationPending && (
              <View
                style={[
                  s.pausedBanner,
                  { backgroundColor: "#FFF7ED", borderTopColor: "#FED7AA" },
                ]}
              >
                <Ionicons
                  name="pause-circle-outline"
                  size={16}
                  color="#EA580C"
                />
                <Text style={[s.pausedBannerText, { color: "#EA580C" }]}>
                  El equipo ha pausado la atención. Puedes escribir para
                  reactivar la conversación.
                </Text>
              </View>
            )}

            {isClosed ? (
              <View
                style={[
                  s.chatClosedBanner,
                  {
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={
                    isCancelled
                      ? "close-circle-outline"
                      : "checkmark-circle-outline"
                  }
                  size={18}
                  color={isCancelled ? "#DC2626" : colors.primary}
                />
                <Text style={[s.chatClosedText, { color: colors.textMuted }]}>
                  {isCancelled
                    ? "Este ticket fue cancelado. No puedes enviar mensajes."
                    : "Este ticket está finalizado. No puedes enviar mensajes."}
                </Text>
              </View>
            ) : cancellationPending ? (
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    s.cancelJustifyHint,
                    {
                      backgroundColor: "#FFF7ED",
                      borderBottomColor: "#FED7AA",
                    },
                  ]}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color="#EA580C"
                  />
                  <Text style={[s.cancelJustifyText, { color: "#EA580C" }]}>
                    Cancelación solicitada. Puedes escribir el motivo para que
                    el equipo lo revise.
                  </Text>
                </View>
                <View
                  style={[
                    s.inputRow,
                    {
                      paddingBottom: Math.max(insets.bottom, 8),
                      backgroundColor: colors.card,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      s.chatInput,
                      { backgroundColor: colors.input, color: colors.text },
                    ]}
                    placeholder="Escribe el motivo de tu cancelación..."
                    placeholderTextColor={colors.textMuted}
                    value={msg}
                    onChangeText={setMsg}
                    multiline
                  />
                  <TouchableOpacity
                    style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
                    onPress={sendComment}
                    disabled={!canSend || sending}
                    activeOpacity={0.8}
                  >
                    {sending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="send" size={18} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : techs.length === 0 ? (
              <View
                style={[
                  s.chatClosedBanner,
                  {
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="hourglass-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={[s.chatClosedText, { color: colors.textMuted }]}>
                  Tu ticket aún no tiene un técnico asignado. Podrás chatear una
                  vez que sea asignado.
                </Text>
              </View>
            ) : techs.length > 0 && !techHasWritten ? (
              <View
                style={[
                  s.chatClosedBanner,
                  {
                    paddingBottom: Math.max(insets.bottom, 12),
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name="hourglass-outline"
                  size={18}
                  color={colors.textMuted}
                />
                <Text style={[s.chatClosedText, { color: colors.textMuted }]}>
                  El técnico iniciará la conversación en breve.
                </Text>
              </View>
            ) : (
              <View
                style={[
                  s.inputRow,
                  {
                    paddingBottom: Math.max(insets.bottom, 8),
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={s.attachBtn}
                  onPress={pickFiles}
                  activeOpacity={0.7}
                >
                  <Ionicons name="attach" size={22} color={colors.textMuted} />
                </TouchableOpacity>
                <TextInput
                  style={[
                    s.chatInput,
                    { backgroundColor: colors.input, color: colors.text },
                  ]}
                  placeholder="Escribe un mensaje..."
                  placeholderTextColor={colors.textMuted}
                  value={msg}
                  onChangeText={setMsg}
                  multiline
                />
                <TouchableOpacity
                  style={[s.sendBtn, !canSend && s.sendBtnDisabled]}
                  onPress={sendComment}
                  disabled={!canSend || sending}
                  activeOpacity={0.8}
                >
                  {sending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ── IMAGE VIEWER MODAL ── */}
      <Modal
        visible={!!viewingImage}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewingImage(null)}
      >
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <View style={s.imgModalBg}>
          <TouchableOpacity
            style={s.imgModalClose}
            onPress={() => setViewingImage(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            contentContainerStyle={s.imgModalScroll}
            maximumZoomScale={4}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent
          >
            {viewingImage && (
              <Image
                source={{ uri: viewingImage }}
                style={s.imgModalImg}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ── INFO TAB ── */}
      {activeTab === "info" && (
        <ScrollView
          contentContainerStyle={[
            s.infoScroll,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Estado del ticket */}
          <View
            style={[
              s.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[s.infoCardTitle, { color: colors.text }]}>
              Estado del ticket
            </Text>
            <View style={s.stepsRow}>
              {["Nuevo", "En Proceso", "Finalizado"].map((label, i) => {
                const num = i + 1;
                const active = step >= num;
                return (
                  <React.Fragment key={label}>
                    <View style={s.stepItem}>
                      <View
                        style={[
                          s.stepCircle,
                          active && s.stepCircleActive,
                          !active && {
                            backgroundColor: colors.input,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.stepNum,
                            active && s.stepNumActive,
                            !active && { color: colors.textMuted },
                          ]}
                        >
                          {num}
                        </Text>
                      </View>
                      <Text
                        style={[
                          s.stepLabel,
                          active && s.stepLabelActive,
                          !active && { color: colors.textMuted },
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                    {i < 2 && (
                      <View
                        style={[
                          s.stepLine,
                          step > num && s.stepLineActive,
                          !active && { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Detalles */}
          <View
            style={[
              s.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[s.infoCardTitle, { color: colors.text }]}>
              Detalles del ticket
            </Text>
            {[
              { label: "Asunto", value: ticket.ticket_subject },
              { label: "Categoría", value: ticket.category?.category_name },
              ticket.product && {
                label: "Dispositivo",
                value: ticket.product?.product_name,
              },
              ticket.productModel && {
                label: "Modelo",
                value: ticket.productModel?.product_model_name,
              },
              ticket.ticket_serial_number && {
                label: "No. de Serie",
                value: ticket.ticket_serial_number,
              },
            ]
              .filter(Boolean)
              .map((row: any) => (
                <View
                  key={row.label}
                  style={[s.detailRow, { borderBottomColor: colors.border }]}
                >
                  <Text style={[s.detailLabel, { color: colors.textMuted }]}>
                    {row.label}
                  </Text>
                  <Text style={[s.detailValue, { color: colors.text }]}>
                    {row.value}
                  </Text>
                </View>
              ))}

            {warrantyLabel && (
              <View style={[s.detailRow, { borderBottomColor: colors.border }]}>
                <Text style={[s.detailLabel, { color: colors.textMuted }]}>
                  Garantía
                </Text>
                <View
                  style={[
                    s.warrantyBadge,
                    warrantyLabel === "Activa"
                      ? s.warrantyActive
                      : s.warrantyExpired,
                  ]}
                >
                  <View
                    style={[
                      s.warrantyDot,
                      {
                        backgroundColor:
                          warrantyLabel === "Activa" ? "#16A34A" : "#DC2626",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      s.warrantyText,
                      {
                        color:
                          warrantyLabel === "Activa" ? "#16A34A" : "#DC2626",
                      },
                    ]}
                  >
                    {warrantyLabel}
                  </Text>
                </View>
              </View>
            )}

            <View style={[s.detailRow, { borderBottomColor: colors.border }]}>
              <Text style={[s.detailLabel, { color: colors.textMuted }]}>
                Creado
              </Text>
              <Text style={[s.detailValue, { color: colors.text }]}>
                {fmtDate(ticket.created_at)}
              </Text>
            </View>
          </View>

          {/* Descripción */}
          <View
            style={[
              s.infoCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[s.infoCardTitle, { color: colors.text }]}>
              Descripción
            </Text>
            <Text style={[s.infoDesc, { color: colors.textSub }]}>
              {ticket.ticket_description}
            </Text>
          </View>

          {/* Técnicos */}
          {techs.length > 0 && (
            <View
              style={[
                s.infoCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[s.infoCardTitle, { color: colors.text }]}>
                Técnicos asignados
              </Text>
              {techs.map((t) => (
                <View key={t.user_id} style={s.techRow}>
                  <Avatar uri={t.foto} name={t.nombre_completo} size={44} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[s.techName, { color: colors.text }]}>
                      {t.nombre_completo}
                    </Text>
                    <Text style={[s.techRole, { color: colors.textMuted }]}>
                      {t.cargo ?? "Técnico"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Solicitar cancelación / estado final */}
          {isClosed ? (
            <View
              style={[
                s.closedInfoBanner,
                isCancelled ? s.closedInfoBannerRed : s.closedInfoBannerGreen,
              ]}
            >
              <Ionicons
                name={isCancelled ? "close-circle" : "checkmark-circle"}
                size={28}
                color={isCancelled ? "#DC2626" : "#3C6034"}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    s.closedInfoTitle,
                    { color: isCancelled ? "#DC2626" : "#3C6034" },
                  ]}
                >
                  {isCancelled ? "Ticket cancelado" : "Ticket finalizado"}
                </Text>
                <Text style={s.closedInfoSub}>
                  {isCancelled
                    ? "Este ticket fue cerrado por solicitud de cancelación."
                    : "La atención de este ticket ha sido completada satisfactoriamente."}
                </Text>
              </View>
            </View>
          ) : cancellationPending ? (
            <View style={[s.closedInfoBanner, s.closedInfoBannerRed]}>
              <Ionicons name="time-outline" size={28} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[s.closedInfoTitle, { color: "#DC2626" }]}>
                  Cancelación en revisión
                </Text>
                <Text style={s.closedInfoSub}>
                  Tu solicitud fue enviada. Un administrador la atenderá pronto.
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={requestCancel}
              activeOpacity={0.8}
            >
              <Text style={s.cancelBtnText}>Solicitar cancelación</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}
