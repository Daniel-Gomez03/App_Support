import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { nuevoStyles as s } from "@/styles/nuevo.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import nuevoService from "../../Services/nuevoService";

interface Option {
  label: string;
  value: any;
}
function DropdownField({
  label,
  required = false,
  placeholder,
  options,
  value,
  onChange,
  icon,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  options: Option[];
  value: any;
  onChange: (v: any) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const active = value !== null && value !== undefined;

  return (
    <View style={s.fieldWrapper}>
      <View style={s.labelRow}>
        {icon}
        <Text style={s.label}>
          {label}
          {required && <Text style={s.req}> *</Text>}
        </Text>
      </View>
      <TouchableOpacity
        style={[s.dropTrigger, active && s.dropTriggerActive]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[s.dropText, !active && s.dropPlaceholder]}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={active ? "#3C6034" : "#999"}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(i) => String(i.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    s.sheetOption,
                    item.value === value && s.sheetOptionActive,
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      s.sheetOptionText,
                      item.value === value && s.sheetOptionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={18} color="#3C6034" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function NuevoTicketScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [categories, setCategories] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [models, setModels] = useState<Option[]>([]);

  const [asunto, setAsunto] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedProd, setSelectedProd] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [serial, setSerial] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const clean = (t: string) => (t.startsWith(" ") ? t.trimStart() : t);

  const isAsuntoValid = asunto.trim().length >= 5;
  const isDescValid = descripcion.trim().length >= 20;
  const canSubmit =
    selectedCat && isAsuntoValid && isDescValid && evidences.length > 0;

  useEffect(() => {
    const unsub = navigation.addListener("focus", reset);
    return unsub;
  }, [navigation]);

  useEffect(() => {
    nuevoService
      .getCategories()
      .then((data) =>
        setCategories(
          data.map((c: any) => ({
            label: c.category_name,
            value: c.category_id,
          })),
        ),
      )
      .catch(console.error);
  }, []);

  const handleCategoryChange = async (val: number) => {
    setSelectedCat(val);
    setSelectedProd(null);
    setProducts([]);
    setSelectedModel(null);
    setModels([]);
    setSerial("");
    try {
      const data = await nuevoService.getProductsByCategory(val);
      setProducts(
        data.map((p: any) => ({ label: p.product_name, value: p.product_id })),
      );
    } catch {}
  };

  const handleProductChange = async (val: number) => {
    setSelectedProd(val);
    setSelectedModel(null);
    setModels([]);
    setSerial("");
    try {
      const data = await nuevoService.getModelsByProduct(val);
      setModels(
        data.map((m: any) => ({
          label: m.product_model_name,
          value: m.product_model_id,
        })),
      );
    } catch {}
  };

  const pickMedia = async () => {
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
    if (!result.canceled) setEvidences((prev) => [...prev, ...result.assets]);
  };

  const submitTicket = async () => {
    setLoading(true);
    try {
      await nuevoService.createTicket(
        {
          category_id: selectedCat,
          product_id: selectedProd,
          product_model_id: selectedModel,
          ticket_subject: asunto.trim(),
          ticket_description: descripcion.trim(),
          ticket_serial_number: serial.trim() || null,
        },
        evidences,
      );
      Alert.alert(
        "¡Ticket enviado!",
        "Tu ticket fue creado correctamente. Un técnico se te asignará lo más pronto posible.",
      );
      reset();
    } catch (err: any) {
      Alert.alert("Error", err.message || "No se pudo crear el ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    if (!serial.trim()) {
      await submitTicket();
      return;
    }

    setLoading(true);
    try {
      const warranty = await nuevoService.checkWarrantyBySerial(serial.trim());
      if (warranty.exists && !warranty.is_expired) {
        await submitTicket();
      } else if (warranty.exists && warranty.is_expired) {
        setShowExpiredModal(true);
      } else {
        setShowNotFoundModal(true);
      }
    } catch {
      await submitTicket();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAsunto("");
    setDescripcion("");
    setSerial("");
    setSelectedCat(null);
    setSelectedProd(null);
    setSelectedModel(null);
    setProducts([]);
    setModels([]);
    setEvidences([]);
  };

  return (
    <>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingBottom: insets.bottom + 140 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.fieldWrapper}>
            <View style={s.labelRow}>
              <MaterialCommunityIcons
                name="format-title"
                size={16}
                color="#333"
              />
              <Text style={s.label}>
                Asunto<Text style={s.req}> *</Text>
              </Text>
            </View>
            <TextInput
              style={[
                s.input,
                asunto.length > 0 && {
                  borderColor: isAsuntoValid ? "#3C6034" : "#D9534F",
                },
              ]}
              placeholder="Ej: Pantalla táctil no responde"
              placeholderTextColor="#BBB"
              value={asunto}
              onChangeText={(t) => setAsunto(clean(t))}
              maxLength={100}
            />
            {asunto.length > 0 && !isAsuntoValid && (
              <Text style={s.hint}>Mínimo 5 caracteres</Text>
            )}
          </View>

          <DropdownField
            label="Categoría"
            required
            placeholder="¿Es un dispositivo o una solución?"
            icon={
              <MaterialCommunityIcons
                name="shape-outline"
                size={16}
                color="#333"
              />
            }
            options={categories}
            value={selectedCat}
            onChange={handleCategoryChange}
          />

          {products.length > 0 && (
            <DropdownField
              label="Tipo de dispositivo"
              required
              placeholder="Seleccionar dispositivo"
              icon={
                <MaterialCommunityIcons name="monitor" size={16} color="#333" />
              }
              options={products}
              value={selectedProd}
              onChange={handleProductChange}
            />
          )}

          {models.length > 0 && (
            <DropdownField
              label="Modelo"
              placeholder="Seleccionar modelo"
              icon={
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={16}
                  color="#333"
                />
              }
              options={models}
              value={selectedModel}
              onChange={setSelectedModel}
            />
          )}

          <View style={s.fieldWrapper}>
            <View style={s.labelRow}>
              <MaterialCommunityIcons
                name="barcode-scan"
                size={16}
                color="#333"
              />
              <Text style={s.label}>
                No. de Serie<Text style={s.req}> *</Text>
              </Text>
            </View>
            <TextInput
              style={[s.input, serial.length > 0 && { borderColor: "#3C6034" }]}
              placeholder="Ej: SN-KT31-001"
              placeholderTextColor="#BBB"
              value={serial}
              onChangeText={(t) => setSerial(clean(t).toUpperCase())}
              autoCapitalize="characters"
              maxLength={40}
            />
          </View>

          <View style={s.fieldWrapper}>
            <View style={s.labelRow}>
              <Ionicons name="document-text-outline" size={16} color="#333" />
              <Text style={s.label}>
                Descripción del problema<Text style={s.req}> *</Text>
              </Text>
            </View>
            <TextInput
              style={[
                s.input,
                s.textArea,
                descripcion.length > 0 && {
                  borderColor: isDescValid ? "#3C6034" : "#D9534F",
                },
              ]}
              placeholder={
                "Describe el problema con el mayor detalle posible. Si es posible incluye pasos para reproducirlo, mensajes de error, etc."
              }
              placeholderTextColor="#BBB"
              multiline
              value={descripcion}
              onChangeText={(t) => setDescripcion(clean(t))}
            />
            {descripcion.length > 0 && !isDescValid && (
              <Text style={s.hint}>Mínimo 20 caracteres</Text>
            )}
          </View>

          <View style={s.fieldWrapper}>
            <View style={s.labelRow}>
              <Ionicons name="attach-outline" size={16} color="#333" />
              <Text style={s.label}>
                Evidencias<Text style={s.req}> *</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[s.uploadBtn, evidences.length > 0 && s.uploadBtnActive]}
              onPress={pickMedia}
              activeOpacity={0.8}
            >
              <Ionicons
                name="attach"
                size={18}
                color={evidences.length > 0 ? "#3C6034" : "#999"}
              />
              <Text
                style={[
                  s.uploadText,
                  evidences.length > 0 && s.uploadTextActive,
                ]}
              >
                {evidences.length > 0
                  ? `${evidences.length} archivo${evidences.length > 1 ? "s" : ""} adjunto${evidences.length > 1 ? "s" : ""}`
                  : "Adjuntar archivo"}
              </Text>
            </TouchableOpacity>

            {evidences.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                {evidences.map((item, i) => (
                  <View key={i} style={s.thumb}>
                    <Image source={{ uri: item.uri }} style={s.thumbImg} />
                    {item.type === "video" && (
                      <View style={s.thumbOverlay}>
                        <Ionicons name="play" size={14} color="white" />
                      </View>
                    )}
                    <TouchableOpacity
                      style={s.thumbRemove}
                      onPress={() =>
                        setEvidences((prev) => prev.filter((_, j) => j !== i))
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            style={[
              s.submitBtn,
              (!canSubmit || loading) && s.submitBtnDisabled,
            ]}
            disabled={!canSubmit || loading}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={s.submitText}>Crear Ticket</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showExpiredModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExpiredModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalIconWrap}>
              <Ionicons name="warning-outline" size={32} color="#D97706" />
            </View>
            <Text style={s.modalTitle}>Garantía vencida</Text>
            <Text style={s.modalBody}>
              El número de serie ingresado tiene la garantía vencida. Esta
              revisión podría generar un{" "}
              <Text style={{ fontFamily: "Poppins-Bold" }}>
                costo adicional
              </Text>
              .{"\n\n"}
              ¿Deseas continuar de todas formas?
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalBtnCancel}
                onPress={() => setShowExpiredModal(false)}
              >
                <Text style={s.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalBtnConfirm}
                onPress={() => {
                  setShowExpiredModal(false);
                  submitTicket();
                }}
              >
                <Text style={s.modalBtnConfirmText}>Sí, continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNotFoundModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNotFoundModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={[s.modalIconWrap, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons
                name="information-circle-outline"
                size={32}
                color="#3B82F6"
              />
            </View>
            <Text style={s.modalTitle}>Número de serie no registrado</Text>
            <Text style={s.modalBody}>
              No encontramos ese número de serie en nuestros registros. Puedes
              continuar con tu solicitud, aunque ten en cuenta que podría
              aplicar un cargo por la revisión.
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalBtnCancel}
                onPress={() => setShowNotFoundModal(false)}
              >
                <Text style={s.modalBtnCancelText}>Revisar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtnConfirm, { backgroundColor: "#3B82F6" }]}
                onPress={() => {
                  setShowNotFoundModal(false);
                  submitTicket();
                }}
              >
                <Text style={s.modalBtnConfirmText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
