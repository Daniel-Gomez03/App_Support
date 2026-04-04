import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import nuevoService from '../../Services/nuevoService';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const RequiredLabel = ({ text, icon }: { text: string, icon?: React.ReactNode }) => (
  <View style={styles.labelContainer}>
    {icon}
    <Text style={styles.label}>{text} <Text style={{ color: '#D9534F' }}>*</Text></Text>
  </View>
);

export default function NuevoTicketScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { state } = useAuth();
  const user = state.user;

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);

  const [selectedCat, setSelectedCat] = useState<any>(null);
  const [selectedProd, setSelectedProd] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidences, setEvidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const validateInput = (text: string): string => {
    if (text.startsWith(' ')) {
      return text.trimStart();
    }
    return text;
  };

  const isAsuntoValid = asunto.trim().length >= 10;
  const isDescValid = descripcion.trim().length >= 20;

  const isSerialValid = selectedModel ? serialNumber.trim().length >= 14 : true;

  const canSubmit = selectedCat && isAsuntoValid && isDescValid && isSerialValid && evidences.length > 0;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      limpiarFormulario();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const data = await nuevoService.getCategories();
        setCategories(data);
      } catch (e) { console.error(e); }
    };
    fetchInit();
  }, []);

  const handleCategoryChange = (val: any) => {
    setSelectedCat(val);
    setSelectedProd(null);
    setProducts([]);
    setSelectedModel(null);
    setModels([]);
    setSerialNumber('');
    if (val) fetchProducts(val);
  };

  const fetchProducts = async (catId: any) => {
    const data = await nuevoService.getProductsByCategory(catId);
    setProducts(data);
  };

  const handleProductChange = (val: any) => {
    setSelectedProd(val);
    setSelectedModel(null);
    setModels([]);
    setSerialNumber('');
    if (val) fetchModels(val);
  };

  const fetchModels = async (prodId: any) => {
    const data = await nuevoService.getModelsByProduct(prodId);
    setModels(data);
  };

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus archivos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setEvidences([...evidences, ...result.assets]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ticketData = {
        customer_id: user.customer_id,
        category_id: selectedCat,
        product_id: selectedProd,
        product_model_id: selectedModel,
        ticket_subject: asunto.trim(),
        ticket_description: descripcion.trim(),
        ticket_serial_number: serialNumber.trim() || null,
      };

      const res = await nuevoService.createTicket(ticketData, evidences);
      Alert.alert("¡Enviado!", res.message);
      limpiarFormulario();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.error || "Error al crear ticket");
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setSelectedCat(null); setSelectedProd(null); setSelectedModel(null);
    setAsunto(''); setDescripcion(''); setEvidences([]); setSerialNumber('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Nuevo Ticket</Text>

        <View style={styles.formContainer}>

          {/* CATEGORÍA */}
          <RequiredLabel text="Categoría" icon={<AntDesign name="appstore" size={16} color="black" />} />
          <View style={[styles.pickerWrapper, { borderColor: selectedCat ? '#3C6034' : '#F5F5F5' }]}>
            <Picker selectedValue={selectedCat} onValueChange={handleCategoryChange}>
              <Picker.Item label="Seleccione una Categoría" value={null} color="#999" />
              {categories.map(c => (
                <Picker.Item key={c.category_id} label={c.category_name} value={c.category_id} />
              ))}
            </Picker>
          </View>

          {/* PRODUCTO */}
          {products.length > 0 && (
            <View style={{ marginTop: 15 }}>
              <RequiredLabel text="Producto" icon={<Ionicons name="cube" size={16} color="black" />} />
              <View style={[styles.pickerWrapper, { borderColor: selectedProd ? '#3C6034' : '#F5F5F5' }]}>
                <Picker selectedValue={selectedProd} onValueChange={handleProductChange}>
                  <Picker.Item label="Seleccione un Producto" value={null} color="#999" />
                  {products.map(p => (
                    <Picker.Item key={p.product_id} label={p.product_name} value={p.product_id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* MODELO */}
          {models.length > 0 && (
            <View style={{ marginTop: 15 }}>
              <RequiredLabel text="Modelo" icon={<MaterialCommunityIcons name="tag-text-outline" size={18} color="black" />} />
              <View style={[styles.pickerWrapper, { borderColor: selectedModel ? '#3C6034' : '#F5F5F5' }]}>
                <Picker selectedValue={selectedModel} onValueChange={setSelectedModel}>
                  <Picker.Item label="Seleccione un Modelo" value={null} color="#999" />
                  {models.map(m => (
                    <Picker.Item key={m.product_model_id} label={m.product_model_name} value={m.product_model_id} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* VALIDACIO NUMERO DE SERIE*/}
          {selectedModel && (
            <View style={{ marginTop: 15 }}>
              <RequiredLabel text="Número de Serie" icon={<MaterialCommunityIcons name="barcode-scan" size={18} color="black" />} />
              <TextInput
                style={[styles.input, {
                  borderColor: serialNumber.length > 0 ? (isSerialValid ? '#3C6034' : '#D9534F') : '#F5F5F5',
                  borderWidth: 1
                }]}
                placeholder="S/N del dispositivo"
                value={serialNumber}
                onChangeText={(t) => setSerialNumber(validateInput(t))}
                autoCapitalize="characters"
                maxLength={30}
              />
            </View>
          )}

          {/* ASUNTO */}
          <View style={{ marginTop: 15 }}>
            <RequiredLabel text="Asunto" icon={<MaterialCommunityIcons name="format-title" size={18} color="black" />} />
            <TextInput
              style={[styles.input, {
                borderColor: asunto.length > 0 ? (isAsuntoValid ? '#3C6034' : '#D9534F') : '#F5F5F5',
                borderWidth: 1
              }]}
              placeholder="¿Qué sucede? "
              value={asunto}
              onChangeText={(t) => setAsunto(validateInput(t))}
            />
          </View>

          {/* DESCRIPCIÓN */}
          <View style={{ marginTop: 15 }}>
            <RequiredLabel text="Descripción" icon={<Ionicons name="document-text" size={18} color="black" />} />
            <TextInput
              style={[styles.input, styles.textArea, {
                borderColor: descripcion.length > 0 ? (isDescValid ? '#3C6034' : '#D9534F') : '#F5F5F5',
                borderWidth: 1
              }]}
              placeholder="Ayudanos a saber un poco mas sobre el Problema"
              multiline
              value={descripcion}
              onChangeText={(t) => setDescripcion(validateInput(t))}
            />
          </View>

          {/* EVIDENCIA */}
          <View style={{ marginTop: 15 }}>
            <RequiredLabel text="Adjunta Evidencia" />
            <TouchableOpacity
              style={[styles.uploadArea, { borderColor: evidences.length > 0 ? '#3C6034' : '#ddd' }]}
              onPress={pickMedia}
            >
              <View style={styles.iconCircle}>
                <AntDesign name="picture" size={width * 0.08} color="white" />
              </View>
              <Text style={styles.uploadText}>
                <Text style={{ color: '#3C6034', fontWeight: 'bold' }}>Presione Aquí</Text> Para cargar imágenes o videos
              </Text>
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {evidences.map((item, index) => (
                <View key={index} style={styles.thumbWrapper}>
                  <Image source={{ uri: item.uri }} style={styles.thumb} />
                  {item.type === 'video' && (
                    <View style={styles.videoOverlay}>
                      <Ionicons name="play" size={15} color="white" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setEvidences(evidences.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={20} color="#D9534F" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!canSubmit || loading) && { opacity: 0.5 }]}
          disabled={!canSubmit || loading}
          onPress={handleSave}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Crear Ticket</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  scrollContent: {
    paddingHorizontal: width * 0.08
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: width * 0.07,
    color: '#000',
    marginVertical: 20
  },
  formContainer: {
    width: '100%'
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginLeft: 8
  },
  pickerWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    borderWidth: 1,
    overflow: 'hidden'
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#F5F5F5'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FCFCFC'
  },
  iconCircle: {
    backgroundColor: '#3C6034',
    padding: 15,
    borderRadius: 40,
    marginBottom: 10
  },
  uploadText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  thumbWrapper: {
    marginRight: 10,
    position: 'relative'
  },
  thumb: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 10
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  removeBtn: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10
  },
  saveButton: {
    backgroundColor: '#3C6034',
    borderRadius: 25,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 16
  },
  errorText: {
    color: '#D9534F',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular'
  }
});