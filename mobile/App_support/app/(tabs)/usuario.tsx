import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Dimensions, KeyboardAvoidingView, Platform, TextInputProps
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/hooks/useAuth';
import { countries } from '@/data/countries';
import CountryPickerModal from '@/components/CountryPickerModal';
import { useNavigation } from 'expo-router';

const { width } = Dimensions.get('window');

interface CustomInputProps extends TextInputProps {
  label: string;
  icon: React.ReactNode;
  error?: boolean;
}

const InputField = ({ label, icon, value, error, ...props }: CustomInputProps) => (
  <View style={styles.inputGroup}>
    <View style={styles.labelContainer}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </View>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      placeholderTextColor="#999"
      {...props}
    />
  </View>
);

export default function UsuarioScreen() {
  const insets = useSafeAreaInsets();
  const { state, updateUser } = useAuth();
  const user = state.user;
  const navigation = useNavigation();

  // ESTADOS
  const [nombre, setNombre] = useState(String(user?.customer_name || ''));
  const [empresa] = useState(String(user?.customer_company || ''));
  const [email] = useState(String(user?.customer_email || ''));
  const [telefono, setTelefono] = useState(String(user?.customer_phone || ''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [image, setImage] = useState(user?.customer_image);
  const [loading, setLoading] = useState(false);

  //Estados de control
  const [selectedCountry, setSelectedCountry] = useState(
    countries.find(c => c.prefix === user?.customer_country_code) || countries[0]
  );

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Validacion de contraseña
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    minLength: false,
    hasSpecialChar: false,
  });

  //Funcion para colores del borde
  const getBorderColor = (type: 'nombre' | 'telefono' | 'password' | 'confirm') => {
    switch (type) {
      case 'nombre':
        if (nombre.length > 0 && nombre.length < 3) return '#D9534F';
        break;
      case 'telefono':
        if (telefono.length > 0 && telefono.length < selectedCountry.minDigits) return '#D9534F';
        break;
      case 'password':
        const isPassValid = Object.values(passwordValidation).every(v => v === true);
        if (password.length > 0 && !isPassValid) return '#D9534F';
        break;
      case 'confirm':
        if (confirmPassword.length > 0 && password !== confirmPassword) return '#D9534F';
        break;
    }
    return '#F5F5F5';
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Se necesitan permisos para acceder a la galería.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Validar espacios en blanco adicionales
  const validateInput = (text: string): string => {
    if (text.startsWith(' ')) {
      return text.trimStart();
    }
    return text;
  };

  //Valdar numero de telefono
  const validatePhoneNumber = (phoneNumber: string) => {
    const cleaned = validateInput(phoneNumber);
    const onlyNumbers = cleaned.replace(/[^0-9]/g, '');
    const limited = onlyNumbers.slice(0, selectedCountry.maxDigits);
    setTelefono(limited.trim());
  };


  // Validar requisitos de contraseña mientras escribe
  const handlePasswordChange = (pass: string) => {
    const cleaned = validateInput(pass).trim();
    setPassword(cleaned);

    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(cleaned),
      hasLowerCase: /[a-z]/.test(cleaned),
      hasNumber: /[0-9]/.test(cleaned),
      minLength: cleaned.length >= 12,
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleaned),
    });
  };

  // Efecto de vlidacion y deteccion de cambios en cambio real
  useEffect(() => {
    const isNameValid = nombre.trim().length >= 3;
    const isPhoneValid = telefono.length >= selectedCountry.minDigits;

    let isPasswordBlockValid = true;
    if (password.length > 0) {
      const requirementsMet = Object.values(passwordValidation).every(v => v === true);
      const matchesConfirm = password === confirmPassword;
      isPasswordBlockValid = requirementsMet && matchesConfirm;
    }

    const nameChanged = nombre !== String(user?.customer_name || '');
    const phoneChanged = telefono !== String(user?.customer_phone || '');
    const countryChanged = selectedCountry.prefix !== user?.customer_country_code;
    const passwordEntered = password.length > 0;

    const imageChanged = !!image && (image.startsWith('file://') || image.startsWith('content://'));
    const changed = nameChanged || phoneChanged || imageChanged || countryChanged || passwordEntered;

    setHasChanges(changed);
    setFormValid(isNameValid && isPhoneValid && isPasswordBlockValid && changed);
  }, [image, nombre, telefono, password, confirmPassword, passwordValidation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setNombre(String(user?.customer_name || ''));
      setTelefono(String(user?.customer_phone || ''));
      setImage(user?.customer_image);
      setSelectedCountry(
        countries.find(c => c.prefix === user?.customer_country_code) || countries[0]
      );

      setPassword('');
      setConfirmPassword('');

      setPasswordValidation({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        minLength: false,
        hasSpecialChar: false,
      });
    });

    return unsubscribe;
  }, [navigation, user]);

  const handleSave = async () => {
    if (!user?.customer_id) return;
    setLoading(true);

    try {
      const formData = new FormData();
      let hasData = false;

      if (nombre.trim() !== user.customer_name) {
        formData.append('customer_name', nombre.trim());
        hasData = true;
      }
      if (telefono !== user.customer_phone) {
        formData.append('customer_phone', telefono);
        hasData = true;
      }
      if (selectedCountry.prefix !== user.customer_country_code) {
        formData.append('customer_country_code', selectedCountry.prefix);
        hasData = true;
      }
      if (password.length > 0) {
        formData.append('customer_password', password);
        hasData = true;
      }

      if (image && (image.startsWith('file://') || image.startsWith('content://'))) {
        const fileName = image.split('/').pop() || `profile_${Date.now()}.webp`;
        const extension = fileName.split('.').pop()?.toLowerCase();
        let type = 'image/webp';
        if (extension === 'jpg' || extension === 'jpeg') type = 'image/jpeg';
        if (extension === 'png') type = 'image/png';

        formData.append('image', {
          uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
          name: fileName,
          type: type,
        } as any);
        hasData = true;
      }

      const response = await updateUser(user.customer_id, formData);

      if (hasData) {
        const updated = response.customer;
        setNombre(updated.customer_name);
        setTelefono(updated.customer_phone);
        setImage(updated.customer_image)
        setPassword('');
        setConfirmPassword('');

        alert("¡Perfil actualizado!");
      }

    } catch (error: any) {
      alert(error.error || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Perfil</Text>

        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImage, styles.noneImage]}>
                <Ionicons name="person" size={width * 0.15} color="white" />
              </View>
            )}

            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={width * 0.05} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formContainer}>
          <InputField
            label="Nombre Completo"
            icon={<FontAwesome5 name="user-alt" size={16} color="black" />}
            value={nombre}
            placeholder='Nombre Completo'
            onChangeText={(t) => setNombre(validateInput(t))}
            style={[styles.input, { borderColor: getBorderColor('nombre'), borderWidth: 1 }]}
          />

          <InputField
            label="Correo Electrónico"
            icon={<MaterialIcons name="email" size={18} color="black" />}
            value={email}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />

          <InputField
            label="Empresa"
            icon={<Ionicons name="business" size={18} color="black" />}
            value={empresa}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />

          {/* TELÉFONO */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <FontAwesome name="phone" size={18} color="black" />
              <Text style={styles.label}>Teléfono</Text>
            </View>
            <View style={[styles.phoneInputContainer, { borderColor: getBorderColor('telefono'), borderWidth: 1 }]}>
              <TouchableOpacity style={styles.countrySelector} onPress={() => setShowCountryPicker(true)}>
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Ionicons name="chevron-down" size={14} color="black" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                value={telefono}
                keyboardType="phone-pad"
                placeholder='Telefono'
                maxLength={selectedCountry.maxDigits}
                onChangeText={validatePhoneNumber}
              />
            </View>
          </View>

          {/* BLOQUE DE CONTRASEÑA NUEVA */}
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Cambiar Contraseña (Opcional)</Text>

            <View style={styles.inputGroup}>
              <View style={[styles.passwordContainer, { borderColor: getBorderColor('password'), borderWidth: 1 }]}>
                <TextInput
                  style={styles.passwordInputInner}
                  placeholder="Nueva contraseña"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePasswordChange}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Entypo name={showPassword ? 'eye' : 'eye-with-line'} size={20} color="#818896" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Visualizador de requisitos (solo si empezó a escribir) */}
            {password.length > 0 && (
              <View style={styles.validationBox}>
                <Text style={[styles.valText, passwordValidation.hasUpperCase && styles.valOk]}>La contraseña debe contener una Mayúscula</Text>
                <Text style={[styles.valText, passwordValidation.hasLowerCase && styles.valOk]}>La contraseña debe contener una Minúscula</Text>
                <Text style={[styles.valText, passwordValidation.hasNumber && styles.valOk]}>La contraseña debe contener un Número</Text>
                <Text style={[styles.valText, passwordValidation.hasSpecialChar && styles.valOk]}>La contraseña debe contener un carácter especial</Text>
                <Text style={[styles.valText, passwordValidation.minLength && styles.valOk]}>La contraseña debe contener un mínimo de 12 caracteres</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <View style={[styles.passwordContainer, { borderColor: getBorderColor('confirm'), borderWidth: 1 }]}>
                <TextInput
                  style={styles.passwordInputInner}
                  placeholder="Confirmar nueva contraseña"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(t) => setConfirmPassword(t.replace(/\s/g, ''))}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Entypo name={showConfirmPassword ? 'eye' : 'eye-with-line'} size={20} color="#818896" />
                </TouchableOpacity>
              </View>
            </View>
            {password !== confirmPassword && confirmPassword.length > 0 && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!formValid || loading) && { opacity: 0.5 }
          ]}
          disabled={!formValid || loading}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>

        {showCountryPicker && (
          <CountryPickerModal
            countries={countries}
            selectedCountry={selectedCountry}
            onSelect={(c) => { setSelectedCountry(c); setTelefono(''); setShowCountryPicker(false); }}
            onClose={() => setShowCountryPicker(false)}
          />
        )}
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
    marginTop: 0
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: width * 0.08,
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    width: width * 0.3,
    height: width * 0.3
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: (width * 0.35) / 2,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  noneImage: {
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0, right: 0,
    backgroundColor: '#3C6034',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white'
  },
  formContainer: {
    width: '100%'
  },
  inputGroup: {
    marginBottom: 15
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  label: {
    fontFamily: 'Poppins-Regular',
    fontSize: 15,
    marginLeft: 8
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 12,
    fontFamily: 'Poppins-Regular',
    fontSize: 14
  },
  disabledInput: {
    color: '#999',
    opacity: 0.7
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#D9534F'
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    overflow: 'hidden'
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    gap: 5
  },
  countryFlag: {
    fontSize: 30
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    fontFamily: 'Poppins-Regular'
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    marginVertical: 10,
    color: '#3C6034'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: 15
  },
  passwordInputInner: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14
  },
  validationBox: {
    marginBottom: 15,
    paddingLeft: 5
  },
  valText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
    fontFamily: 'Poppins-Regular'
  },
  valOk: {
    color: '#28a745',
    fontWeight: 'bold'
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5
  },
  saveButton: {
    backgroundColor: '#3C6034',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 16
  }
});