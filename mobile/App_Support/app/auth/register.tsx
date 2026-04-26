import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Image, ScrollView, KeyboardAvoidingView,
  Platform, Animated, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import Svg, { Path } from 'react-native-svg';
import CountryPickerModal from '@/components/CountryPickerModal';
import PolicyBottomSheet from '@/components/PolicyBottomSheet';
import { countries } from '@/data/countries';
import authService, { WarrantyPolicy } from '@/Services/authService';
import { registerStyles as styles, width, height } from '@/styles/register.styles';

// ── Textos por paso ────────────────────────────────────────────────────────────
const STEP_INFO = [
  {
    title:       'Información básica',
    description: 'Ingresa tu información básica para crear tu cuenta. Tus datos serán utilizados de forma segura.',
  },
  {
    title:       'Datos empresariales',
    description: 'Proporciona la información requerida para verificar tu empresa de forma segura.',
  },
  {
    title:       'Crear contraseña',
    description: 'Establece una contraseña segura para garantizar la protección de tu cuenta.',
  },
];

// ── Tipos ──────────────────────────────────────────────────────────────────────
type WarrantyStatus = 'idle' | 'loading' | 'valid' | 'expired' | 'notfound';

// SVG path igual que CurvedBorder
const CURVE_PATH = `M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`;

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);

  // Panel sube desde abajo (mismo spring que login)
  const panelAnim = useRef(new Animated.Value(height)).current;
  useEffect(() => {
    Animated.spring(panelAnim, {
      toValue: 0, tension: 42, friction: 9, useNativeDriver: true,
    }).start();
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' } | null>(null);
  const toastY       = useRef(new Animated.Value(-80)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string, type: 'success' | 'warning') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastY.setValue(-80);
    toastOpacity.setValue(0);
    setToast({ message, type });
    Animated.parallel([
      Animated.spring(toastY,       { toValue: 0,  tension: 60, friction: 10, useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start(
        () => setToast(null)
      );
    }, 4000);
  };

  // Mostrar toast al entrar al paso 3 con el resultado de la garantía
  useEffect(() => {
    if (step !== 3 || warrantyStatus === 'idle') return;
    const found = warrantyStatus === 'valid' || warrantyStatus === 'expired';
    showToast(warrantyMsg, found ? 'success' : 'warning');
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Paso 1: Información personal ──────────────────────────────────────────
  const [firstName,       setFirstName]       = useState('');
  const [secondName,      setSecondName]      = useState('');
  const [lastName,        setLastName]        = useState('');
  const [secondLastName,  setSecondLastName]  = useState('');
  const [phone,           setPhone]           = useState('');
  const [email,           setEmail]           = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // ── Política de garantía ──────────────────────────────────────────────────
  const [policy,          setPolicy]          = useState<WarrantyPolicy | null>(null);
  const [policyAccepted,  setPolicyAccepted]  = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  useEffect(() => {
    authService.getWarrantyPolicy()
      .then(setPolicy)
      .catch(() => {}); // si falla, el backend validará igual
  }, []);

  // ── Paso 2: Empresa y garantía ────────────────────────────────────────────
  const [company,           setCompany]           = useState('');
  const [verificationType,  setVerificationType]  = useState<'serie' | 'factura' | ''>('');
  const [verificationValue, setVerificationValue] = useState('');
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const [warrantyStatus,    setWarrantyStatus]    = useState<WarrantyStatus>('idle');
  const [warrantyMsg,       setWarrantyMsg]       = useState('');

  // ── Paso 3: Contraseña ────────────────────────────────────────────────────
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [pwValidation, setPwValidation] = useState({
    hasUpperCase: false, hasLowerCase: false,
    hasNumber:    false, minLength:    false,
    hasSpecialChar: false,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const trim      = (v: string) => v.trimStart();
  const noSpaces  = (v: string) => v.replace(/\s/g, '');
  const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handlePhone = (v: string) => {
    setPhone(v.replace(/[^0-9]/g, '').slice(0, selectedCountry.maxDigits));
  };

  const handlePassword = (v: string) => {
    setPassword(v);
    setPwValidation({
      hasUpperCase:   /[A-Z]/.test(v),
      hasLowerCase:   /[a-z]/.test(v),
      hasNumber:      /[0-9]/.test(v),
      minLength:      v.length >= 12,
      hasSpecialChar: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?]/.test(v),
    });
  };

  const step1Valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length  >= 2 &&
    isEmailValid(email) &&
    phone.length >= selectedCountry.minDigits;

  const step2Valid =
    company.trim().length >= 2 &&
    verificationType !== '' &&
    verificationValue.trim().length >= 4 &&
    policyAccepted;

  const allPwValid =
    pwValidation.hasUpperCase && pwValidation.hasLowerCase &&
    pwValidation.hasNumber    && pwValidation.minLength    &&
    pwValidation.hasSpecialChar;

  const step3Valid = allPwValid && password === confirmPassword && confirmPassword !== '';

  // ── Verificar garantía ────────────────────────────────────────────────────
  const checkWarranty = async () => {
    const typeName = verificationType === 'factura' ? 'Factura' : 'Serie';
    setWarrantyStatus('loading');
    try {
      const result = await authService.validateWarranty(
        verificationType as 'serie' | 'factura',
        verificationValue.trim()
      );
      if (!result.exists) {
        setWarrantyStatus('notfound');
        setWarrantyMsg(`Número de ${typeName} no encontrado. Requiere validación manual para acceder a la aplicación.`);
      } else {
        const newStatus: WarrantyStatus = result.is_expired ? 'expired' : 'valid';
        setWarrantyStatus(newStatus);
        setWarrantyMsg(`Número de ${typeName} encontrado. Puedes continuar.`);
      }
    } catch {
      setWarrantyStatus('notfound');
      setWarrantyMsg(`Número de ${typeName} no encontrado. Requiere revisión manual.`);
    }
  };

  // ── Avanzar / Retroceder ──────────────────────────────────────────────────
  const handleNext = async () => {
    if (step === 1) {
      if (!step1Valid) return;
      setStep(2);
    } else if (step === 2) {
      if (!step2Valid) return;
      // Verificar si aún no se hizo — siempre puede continuar
      if (warrantyStatus === 'idle') {
        await checkWarranty();
      }
      setStep(3);
    } else if (step === 3) {
      if (!step3Valid) return;
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 1) router.back();
    else setStep(s => s - 1);
  };

  // ── Enviar registro ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await authService.register({
        customer_first_name:       firstName.trim(),
        customer_second_name:      secondName.trim() || undefined,
        customer_last_name:        lastName.trim(),
        customer_second_last_name: secondLastName.trim() || undefined,
        customer_email:            email.trim().toLowerCase(),
        customer_country_code:     selectedCountry.prefix,
        customer_phone:            phone,
        customer_company:          company.trim(),
        validation_type:            verificationType as 'serie' | 'factura',
        validation_value:           verificationValue.trim(),
        customer_password:          password,
        accepted_policy_version:    policy?.policy_version ?? '',
      });
      router.replace({
        pathname: '/auth/verify-email',
        params:   { email: email.trim().toLowerCase() },
      });
    } catch (error: any) {
      alert('Error: ' + (error.error || error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isStepDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && (!step2Valid || warrantyStatus === 'loading')) ||
    (step === 3 && !step3Valid) ||
    loading;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* ── Cabecera oscura (fija) ── */}
        <View style={styles.header}>
          {step >= 2 && (
            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
          <Image
            source={require('@/assets/images/Logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* ── Panel blanco animado — sube desde abajo ── */}
        <Animated.View style={{ flex: 1, transform: [{ translateY: panelAnim }] }}>

          {/* Curva SVG — se superpone sobre la cabecera oscura */}
          <Svg
            width={width}
            height={100}
            viewBox={`0 0 ${width} 100`}
            style={{ position: 'absolute', top: -(height * 0.070), left: 0, zIndex: 5 }}
          >
            <Path d={CURVE_PATH} fill="#ffffff" />
          </Svg>

          {/* Política de garantía — bottom sheet */}
          {policy && (
            <PolicyBottomSheet
              visible={showPolicyModal}
              version={policy.policy_version}
              label={policy.policy_updated_label}
              sections={policy.policy_content}
              onAccept={() => {
                setPolicyAccepted(true);
                setShowPolicyModal(false);
              }}
              onClose={() => setShowPolicyModal(false)}
            />
          )}

          {/* Toast — aparece en el área blanca, sobre el panel */}
          {toast && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.toastWrapper,
                { transform: [{ translateY: toastY }], opacity: toastOpacity },
              ]}
            >
              <View style={[styles.toastCard, toast.type === 'success' ? styles.toastSuccess : styles.toastWarning]}>
                <View style={[styles.toastIconCircle, toast.type === 'success' ? styles.toastIconSuccess : styles.toastIconWarning]}>
                  <Ionicons
                    name={toast.type === 'success' ? 'checkmark' : 'warning'}
                    size={15}
                    color="#ffffff"
                  />
                </View>
                <Text style={[styles.toastText, toast.type === 'success' ? styles.toastTextSuccess : styles.toastTextWarning]}>
                  {toast.message}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Contenedor blanco — flex:1 garantiza que llega hasta el fondo */}
          <View style={styles.panelContainer}>

            {/* Título + paso siempre visibles (fuera del ScrollView) */}
            <View style={styles.stickyHeader}>
              <Text style={styles.title}>Regístrate</Text>
              <Text style={styles.stepLabel}>Paso {step} de 3</Text>
            </View>

            {/* Contenido desplazable */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>{STEP_INFO[step - 1].title}</Text>
              <Text style={styles.description}>{STEP_INFO[step - 1].description}</Text>

              {/* ══════════ PASO 1 ══════════ */}
              {step === 1 && (
                <>
                  {/* Primer nombre */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="user-alt" size={14} color="#374151" />
                      <Text style={styles.label}>Primer nombre <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Juan"
                      placeholderTextColor="#9ca3af"
                      value={firstName}
                      onChangeText={v => setFirstName(noSpaces(v))}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Segundo nombre */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="user-alt" size={14} color="#9ca3af" />
                      <Text style={styles.label}>Segundo nombre</Text>
                      <Text style={styles.labelOptional}>(opcional)</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Alexander"
                      placeholderTextColor="#9ca3af"
                      value={secondName}
                      onChangeText={v => setSecondName(noSpaces(v))}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Primer apellido */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="user-alt" size={14} color="#374151" />
                      <Text style={styles.label}>Primer apellido <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Díaz"
                      placeholderTextColor="#9ca3af"
                      value={lastName}
                      onChangeText={v => setLastName(noSpaces(v))}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Segundo apellido */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome5 name="user-alt" size={14} color="#9ca3af" />
                      <Text style={styles.label}>Segundo apellido</Text>
                      <Text style={styles.labelOptional}>(opcional)</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Pérez"
                      placeholderTextColor="#9ca3af"
                      value={secondLastName}
                      onChangeText={v => setSecondLastName(noSpaces(v))}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Teléfono */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome name="phone" size={14} color="#374151" />
                      <Text style={styles.label}>Teléfono <Text style={styles.required}>*</Text></Text>
                    </View>
                    <View style={styles.phoneRow}>
                      <TouchableOpacity
                        style={styles.countrySelector}
                        onPress={() => setShowCountryPicker(true)}
                      >
                        <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                        <Text style={styles.countryPrefix}>{selectedCountry.prefix}</Text>
                        <FontAwesome name="chevron-down" size={12} color="#374151" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder={`${'9'.repeat(selectedCountry.maxDigits)}`}
                        placeholderTextColor="#9ca3af"
                        value={phone}
                        keyboardType="phone-pad"
                        maxLength={selectedCountry.maxDigits}
                        onChangeText={handlePhone}
                      />
                    </View>
                    {showCountryPicker && (
                      <CountryPickerModal
                        countries={countries}
                        selectedCountry={selectedCountry}
                        onSelect={c => {
                          setSelectedCountry(c);
                          setPhone('');
                          setShowCountryPicker(false);
                        }}
                        onClose={() => setShowCountryPicker(false)}
                      />
                    )}
                  </View>

                  {/* Correo */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons name="email" size={14} color="#374151" />
                      <Text style={styles.label}>Correo Electrónico <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={v => setEmail(v.trim())}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </>
              )}

              {/* ══════════ PASO 2 ══════════ */}
              {step === 2 && (
                <>
                  {/* Empresa */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Ionicons name="business" size={14} color="#374151" />
                      <Text style={styles.label}>Nombre de la empresa <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. TBOXSA S.A"
                      placeholderTextColor="#9ca3af"
                      value={company}
                      onChangeText={v => setCompany(trim(v))}
                    />
                  </View>

                  {/* Tipo de verificación */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <MaterialIcons name="verified" size={14} color="#374151" />
                      <Text style={styles.label}>Tipo de Verificación <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dropdownTrigger}
                      onPress={() => setDropdownOpen(v => !v)}
                    >
                      <Text style={[
                        styles.dropdownTriggerText,
                        verificationType !== '' && styles.dropdownTriggerSelected,
                      ]}>
                        {verificationType === 'factura' ? 'Número de Factura'
                          : verificationType === 'serie' ? 'Número de Serie'
                          : 'Selecciona el tipo de Verificación'}
                      </Text>
                      <FontAwesome
                        name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                        size={13}
                        color="#6b7280"
                      />
                    </TouchableOpacity>

                    {dropdownOpen && (
                      <View style={styles.dropdownList}>
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            setVerificationType('factura');
                            setVerificationValue('');
                            setWarrantyStatus('idle');
                            setDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Número de Factura</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.dropdownItem, styles.dropdownItemLast]}
                          onPress={() => {
                            setVerificationType('serie');
                            setVerificationValue('');
                            setWarrantyStatus('idle');
                            setDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>Número de Serie</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Valor de verificación */}
                  {verificationType !== '' && (
                    <View style={styles.inputGroup}>
                      <View style={styles.labelRow}>
                        <MaterialIcons name="tag" size={14} color="#374151" />
                        <Text style={styles.label}>
                          {verificationType === 'factura' ? 'Número de Factura' : 'Número de Serie'}
                          {' '}<Text style={styles.required}>*</Text>
                        </Text>
                      </View>
                      <TextInput
                        style={styles.input}
                        placeholder={verificationType === 'factura' ? 'Ej. FAC-00123' : 'Ej. SN-0000000000000001'}
                        placeholderTextColor="#9ca3af"
                        value={verificationValue}
                        onChangeText={v => {
                          setVerificationValue(v.trim());
                          setWarrantyStatus('idle');
                        }}
                        autoCapitalize="characters"
                      />

                      {warrantyStatus === 'loading' && (
                        <View style={[styles.warrantyResult, { backgroundColor: '#f3f4f6' }]}>
                          <ActivityIndicator size="small" color="#6b7280" />
                          <Text style={[styles.warrantyResultText, { color: '#6b7280' }]}>Verificando...</Text>
                        </View>
                      )}
                      {(warrantyStatus === 'valid' || warrantyStatus === 'expired') && (
                        <View style={[styles.warrantyResult, styles.warrantyValid]}>
                          <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                          <Text style={[styles.warrantyResultText, styles.warrantyValidText]}>{warrantyMsg}</Text>
                        </View>
                      )}
                      {warrantyStatus === 'notfound' && (
                        <View style={[styles.warrantyResult, styles.warrantyExpired]}>
                          <Ionicons name="warning" size={18} color="#d97706" />
                          <Text style={[styles.warrantyResultText, styles.warrantyExpiredText]}>{warrantyMsg}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* ── Aceptación de política ── */}
                  <TouchableOpacity
                    style={styles.policyRow}
                    onPress={() => setShowPolicyModal(true)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.policyCheckCircle, policyAccepted && styles.policyCheckCircleActive]}>
                      {policyAccepted && <Ionicons name="checkmark" size={13} color="#ffffff" />}
                    </View>
                    <Text style={styles.policyRowText}>
                      He leído y aceptado{' '}
                      <Text style={styles.policyLink}>Políticas de Garantía</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* ══════════ PASO 3 ══════════ */}
              {step === 3 && (
                <>
                  {/* Contraseña */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome name="lock" size={14} color="#374151" />
                      <Text style={styles.label}>Contraseña <Text style={styles.required}>*</Text></Text>
                    </View>
                    <View style={styles.passwordRow}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Ingrese su contraseña"
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={handlePassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                        <Entypo name={showPassword ? 'eye' : 'eye-with-line'} size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.validationList}>
                      {[
                        { ok: pwValidation.hasUpperCase,   text: 'La contraseña debe contener una Mayúscula' },
                        { ok: pwValidation.hasLowerCase,   text: 'La contraseña debe contener una Minúscula' },
                        { ok: pwValidation.hasNumber,      text: 'La contraseña debe contener un Número' },
                        { ok: pwValidation.hasSpecialChar, text: 'La contraseña debe contener un carácter especial' },
                        { ok: pwValidation.minLength,      text: 'Mínimo 12 caracteres' },
                      ].map((item, i) => (
                        <View key={i} style={styles.validationItem}>
                          <View style={[
                            styles.validationDot,
                            { backgroundColor: item.ok ? '#16a34a' : '#d1d5db' },
                          ]} />
                          <Text style={[
                            styles.validationText,
                            { color: item.ok ? '#16a34a' : '#9ca3af' },
                          ]}>
                            {item.text}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Confirmar contraseña */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <FontAwesome name="lock" size={14} color="#374151" />
                      <Text style={styles.label}>Confirmar Contraseña <Text style={styles.required}>*</Text></Text>
                    </View>
                    <View style={styles.passwordRow}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Ingrese su contraseña"
                        placeholderTextColor="#9ca3af"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirm}
                      />
                      <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                        <Entypo name={showConfirm ? 'eye' : 'eye-with-line'} size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    </View>
                    {confirmPassword.length > 0 && password !== confirmPassword && (
                      <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
                    )}
                  </View>
                </>
              )}

              {/* ── Botón principal ── */}
              <TouchableOpacity
                style={[styles.primaryButton, isStepDisabled && styles.primaryButtonDisabled]}
                onPress={handleNext}
                disabled={isStepDisabled}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text style={styles.primaryButtonText}>
                      {step === 3 ? 'Completar' : 'Siguiente'}
                    </Text>
                }
              </TouchableOpacity>

              {/* ── Link a login ── */}
              <View style={styles.loginLinkRow}>
                <Text style={styles.loginLinkText}>¿Ya tienes cuenta?</Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLinkAction}>Iniciar Sesión</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.copyright}>Copyright © TBOXSA 2026</Text>
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}