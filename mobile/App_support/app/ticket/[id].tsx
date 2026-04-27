import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import socket from "@/Services/socket";

const { width } = Dimensions.get("window");
const API_URL = "http://10.10.0.84:8000/api";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
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

const getStep = (name: string): number => {
  const n = name?.toLowerCase() ?? "";
  if (n.includes("finaliz") || n.includes("resuelt") || n.includes("cerrad"))
    return 3;
  if (n.includes("proceso") || n.includes("asign") || n.includes("progres"))
    return 2;
  return 1;
};

const authHeader = async (): Promise<Record<string, string>> => {
  const token = await SecureStore.getItemAsync("userToken");
  return { Authorization: `Bearer ${token ?? ""}` };
};

// ── Avatar ────────────────────────────────────────────────────
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
  if (uri)
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#3C6034",
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

// ── Progress bar ──────────────────────────────────────────────
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

// ── Main screen ───────────────────────────────────────────────
export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const [ticket, setTicket] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "info">("chat");
  const [customerId, setCustomerId] = useState<number | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync("userToken").then((t) => setCustomerId(Number(t)));
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const h = await authHeader();
      const [tRes, cRes] = await Promise.all([
        fetch(`${API_URL}/mobile/tickets/${id}`, { headers: h }),
        fetch(`${API_URL}/mobile/tickets/${id}/comments`, { headers: h }),
      ]);
      const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
      setTicket(tData);
      setComments(Array.isArray(cData) ? cData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
    const handler = (comment: any) => setComments((prev) => [...prev, comment]);
    socket.on(`ticket_comment_${id}`, handler);
    return () => {
      socket.off(`ticket_comment_${id}`, handler);
    };
  }, [id]);

  useEffect(() => {
    if (comments.length > 0) {
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
      const token = await SecureStore.getItemAsync("userToken");
      const formData = new FormData();
      formData.append("comment_text", msg.trim() || "📎 Archivo adjunto");
      pendingFiles.forEach((file) => {
        const uri = file.uri;
        const fileName = uri.split("/").pop() ?? "file";
        const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
        const type =
          file.type === "video"
            ? "video/mp4"
            : `image/${ext === "png" ? "png" : "jpeg"}`;
        formData.append("attachments", {
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          name: fileName,
          type,
        } as any);
      });
      const res = await fetch(`${API_URL}/mobile/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
              const h = await authHeader();
              await fetch(`${API_URL}/mobile/tickets/${id}/cancel`, {
                method: "PATCH",
                headers: h,
              });
              Alert.alert(
                "Solicitud enviada",
                "Un agente revisará tu solicitud de cancelación.",
              );
            } catch {
              /* silencioso */
            }
          },
        },
      ],
    );
  };

  if (loading || !ticket) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3C6034" />
      </View>
    );
  }

  const step = getStep(ticket.status?.ticket_status_name ?? "");
  const techs: any[] = ticket.assignedUsers ?? [];
  const warranty = ticket.warranty;
  const warrantyLabel = !ticket.ticket_serial_number
    ? null
    : warranty?.is_expired
      ? "Vencida"
      : "Activa";

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
          <Text style={s.headerBadgeText}>
            {ticket.status?.ticket_status_name ?? "Nuevo"}
          </Text>
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Técnico principal */}
          {techs.length > 0 && (
            <View style={s.techCard}>
              <Avatar
                uri={techs[0].foto}
                name={techs[0].nombre_completo}
                size={46}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={s.techCardName}>{techs[0].nombre_completo}</Text>
                <Text style={s.techCardRole}>
                  {techs[0].cargo ?? "Técnico"}
                </Text>
              </View>
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
              if (isSystem) {
                return (
                  <View style={s.sysMsg}>
                    <Text style={s.sysMsgText}>{item.comment_text}</Text>
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
                      isCustomer ? s.bubbleCustomer : s.bubbleTech,
                    ]}
                  >
                    {!isCustomer && (
                      <Text style={s.bubbleAuthor}>
                        {item.author?.nombre_completo ?? "Técnico"}
                      </Text>
                    )}
                    <Text
                      style={[s.bubbleText, isCustomer && s.bubbleTextCustomer]}
                    >
                      {item.comment_text}
                    </Text>
                    {item.attachments?.map((a: any) => (
                      <Image
                        key={a.attachment_id}
                        source={{ uri: a.file_path }}
                        style={s.attachImg}
                        resizeMode="cover"
                      />
                    ))}
                    <Text
                      style={[s.bubbleTime, isCustomer && s.bubbleTimeCustomer]}
                    >
                      {fmtTime(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={s.chatEmpty}>
                <Text style={s.chatEmptyText}>
                  Aún no hay mensajes. Escribe algo para iniciar la
                  conversación.
                </Text>
              </View>
            }
          />

          {/* Preview de adjuntos pendientes */}
          {pendingFiles.length > 0 && (
            <View style={s.pendingRow}>
              {pendingFiles.map((f, i) => (
                <View key={i} style={s.pendingThumb}>
                  <Image source={{ uri: f.uri }} style={s.pendingImg} />
                  <TouchableOpacity
                    style={s.pendingRemove}
                    onPress={() =>
                      setPendingFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <Ionicons name="close-circle" size={18} color="#E53E3E" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Input */}
          <View
            style={[s.inputRow, { paddingBottom: Math.max(insets.bottom, 8) }]}
          >
            <TouchableOpacity
              style={s.attachBtn}
              onPress={pickFiles}
              activeOpacity={0.7}
            >
              <Ionicons name="attach" size={22} color="#9CA3AF" />
            </TouchableOpacity>
            <TextInput
              style={s.chatInput}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
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
        </KeyboardAvoidingView>
      )}

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
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>Estado del ticket</Text>
            <View style={s.stepsRow}>
              {["Nuevo", "En Proceso", "Finalizado"].map((label, i) => {
                const num = i + 1;
                const active = step >= num;
                return (
                  <React.Fragment key={label}>
                    <View style={s.stepItem}>
                      <View
                        style={[s.stepCircle, active && s.stepCircleActive]}
                      >
                        <Text style={[s.stepNum, active && s.stepNumActive]}>
                          {num}
                        </Text>
                      </View>
                      <Text style={[s.stepLabel, active && s.stepLabelActive]}>
                        {label}
                      </Text>
                    </View>
                    {i < 2 && (
                      <View
                        style={[s.stepLine, step > num && s.stepLineActive]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          </View>

          {/* Detalles */}
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>Detalles del ticket</Text>
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
                <View key={row.label} style={s.detailRow}>
                  <Text style={s.detailLabel}>{row.label}</Text>
                  <Text style={s.detailValue}>{row.value}</Text>
                </View>
              ))}

            {warrantyLabel && (
              <View style={s.detailRow}>
                <Text style={s.detailLabel}>Garantía</Text>
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

            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Creado</Text>
              <Text style={s.detailValue}>{fmtDate(ticket.created_at)}</Text>
            </View>
          </View>

          {/* Descripción */}
          <View style={s.infoCard}>
            <Text style={s.infoCardTitle}>Descripción</Text>
            <Text style={s.infoDesc}>{ticket.ticket_description}</Text>
          </View>

          {/* Técnicos */}
          {techs.length > 0 && (
            <View style={s.infoCard}>
              <Text style={s.infoCardTitle}>Técnicos asignados</Text>
              {techs.map((t) => (
                <View key={t.user_id} style={s.techRow}>
                  <Avatar uri={t.foto} name={t.nombre_completo} size={44} />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.techName}>{t.nombre_completo}</Text>
                    <Text style={s.techRole}>{t.cargo ?? "Técnico"}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Solicitar cancelación */}
          <TouchableOpacity
            style={s.cancelBtn}
            onPress={requestCancel}
            activeOpacity={0.8}
          >
            <Text style={s.cancelBtnText}>Solicitar cancelación</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  // Header
  header: {
    backgroundColor: "#1B3A1F",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.042,
    color: "#fff",
  },
  headerSub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "rgba(255,255,255,0.6)",
  },
  headerBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerBadgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#fff",
  },
  // Progress bar in header
  progressWrapper: {
    backgroundColor: "#1B3A1F",
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  progress: { flexDirection: "row", alignItems: "center" },
  progressStep: { alignItems: "center", gap: 4 },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  progressDotActive: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "#fff",
  },
  progressDotCurrent: {
    backgroundColor: "#fff",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1B3A1F",
  },
  progressLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 16,
  },
  progressLineActive: { backgroundColor: "rgba(255,255,255,0.6)" },
  progressLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.025,
    color: "rgba(255,255,255,0.5)",
  },
  progressLabelActive: { color: "#fff" },
  // Tabs
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#1B3A1F",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  tabLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#ccc",
  },
  tabLabelActive: { color: "#fff", fontFamily: "Poppins-Bold" },
  // Tech card
  techCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  techCardName: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#111",
  },
  techCardRole: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.03,
    color: "#888",
  },
  // Chat
  chatList: { paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  chatEmpty: { alignItems: "center", paddingTop: 40 },
  chatEmptyText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#aaa",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowRight: { flexDirection: "row-reverse" },
  bubble: { maxWidth: width * 0.65, borderRadius: 16, padding: 12 },
  bubbleTech: { backgroundColor: "#F5F5F5", borderBottomLeftRadius: 4 },
  bubbleCustomer: { backgroundColor: "#3C6034", borderBottomRightRadius: 4 },
  bubbleAuthor: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#555",
    marginBottom: 2,
  },
  bubbleText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    color: "#222",
  },
  bubbleTextCustomer: { color: "#fff" },
  bubbleTime: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.026,
    color: "#aaa",
    marginTop: 4,
    textAlign: "right",
  },
  bubbleTimeCustomer: { color: "rgba(255,255,255,0.6)" },
  sysMsg: {
    alignSelf: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 4,
  },
  sysMsgText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.03,
    color: "#92400E",
  },
  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  attachBtn: { padding: 6 },
  chatInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    maxHeight: 100,
    color: "#222",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3C6034",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { backgroundColor: "#B0C4B1" },
  // Attachments in bubble
  attachImg: {
    width: width * 0.5,
    height: width * 0.4,
    borderRadius: 10,
    marginTop: 6,
  },
  // Pending files preview
  pendingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    backgroundColor: "#fff",
  },
  pendingThumb: { position: "relative" },
  pendingImg: { width: 56, height: 56, borderRadius: 8 },
  pendingRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  // Info tab
  infoScroll: { padding: 16, gap: 14 },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.04,
    color: "#111",
    marginBottom: 14,
  },
  // Steps
  stepsRow: { flexDirection: "row", alignItems: "center" },
  stepItem: { alignItems: "center", gap: 6, width: 70 },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  stepCircleActive: { backgroundColor: "#3C6034", borderColor: "#3C6034" },
  stepNum: { fontFamily: "Poppins-Bold", fontSize: 15, color: "#aaa" },
  stepNumActive: { color: "#fff" },
  stepLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#aaa",
    textAlign: "center",
  },
  stepLabelActive: { color: "#3C6034", fontFamily: "Poppins-Bold" },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E8E8E8",
    marginBottom: 20,
  },
  stepLineActive: { backgroundColor: "#3C6034" },
  // Details
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#888",
  },
  detailValue: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#111",
    textAlign: "right",
    flex: 1,
    paddingLeft: 20,
  },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  warrantyActive: { backgroundColor: "#F0FDF4" },
  warrantyExpired: { backgroundColor: "#FEF2F2" },
  warrantyDot: { width: 7, height: 7, borderRadius: 3.5 },
  warrantyText: { fontFamily: "Poppins-Bold", fontSize: width * 0.03 },
  // Info description
  infoDesc: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.034,
    color: "#444",
    lineHeight: 22,
  },
  // Techs in info
  techRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  techName: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.036,
    color: "#111",
  },
  techRole: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.03,
    color: "#888",
  },
  // Cancel
  cancelBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelBtnText: { fontFamily: "Poppins-Bold", fontSize: 15, color: "#DC2626" },
});
