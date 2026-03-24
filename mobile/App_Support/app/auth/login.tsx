import React, { StrictMode, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Entypo from '@expo/vector-icons/Entypo';
import CurvedBorder from '@/components/CurvedBorder';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { countries } from '@/data/countries';
import CountryPickerModal from '@/components/CountryPickerModal';
import { useAuth } from '@/hooks/useAuth';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const authContext = useAuth();

  // Estados de validación LOGIN
  const [loginTouched, setLoginTouched] = useState({
    email: false,
    password: false,
  });
  const [loginFormValid, setLoginFormValid] = useState(false);

  // Formulario de Registro
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefono, setTelefono] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordReg, setShowPasswordReg] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Animaciones
  const formTranslateY = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;
  const userOpacity = useRef(new Animated.Value(1)).current;

  const handleRegisterPress = () => {
    Animated.parallel([
      Animated.timing(formTranslateY, {
        toValue: -height * 0.29,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 0.6,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: height * 0.1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(userOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setIsRegistering(true);
  };

  const handleBackToLogin = () => {
    setNombreCompleto('');
    setEmailReg('');
    setEmpresa('');
    setTelefono('');
    setPasswordReg('');
    setConfirmPassword('');
    setShowPasswordReg(false);
    setShowConfirmPassword(false);
    setAllFieldsValid(false);
    setTouched({
      nombreCompleto: false,
      emailReg: false,
      empresa: false,
      telefono: false,
      passwordReg: false,
      confirmPassword: false,
    });

    setPasswordValidation({
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      minLength: false,
      hasSpecialChar: false,
    });

    setPasswordsMatch(true);

    setTouched({
      nombreCompleto: false,
      emailReg: false,
      empresa: false,
      telefono: false,
      passwordReg: false,
      confirmPassword: false,
    });


    Animated.parallel([
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: height * 0.10,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(userOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    setIsRegistering(false);
  };

  const validateLoginForm = () => {
    const isEmailValid = email.trim() !== '' && isEmailValidFormat(email);
    const isPasswordValid = password.trim() !== '';

    const isFormValid = isEmailValid && isPasswordValid;
    setLoginFormValid(isFormValid);
  };

  const isEmailValidFormat = (emailToCheck: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  const getLoginBorderColor = (field: 'email' | 'password', value: string): string => {
    if (!loginTouched[field]) return '#C4C4C4';
    if (value.trim() === '') return '#D9534F';
    if (field === 'email' && !isEmailValidFormat(value)) return '#D9534F';
    return '#28a745';
  };

  // Estados de validación
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    minLength: false,
    hasSpecialChar: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [allFieldsValid, setAllFieldsValid] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const validatePhoneNumber = (phoneNumber: string) => {
    const cleaned = validateInput(phoneNumber);
    const onlyNumbers = cleaned.replace(/[^0-9]/g, '');
    const limited = onlyNumbers.slice(0, selectedCountry.maxDigits);
    setTelefono(limited.trim());
  };

  const validatePassword = (pass: string) => {
    const cleaned = validateInput(pass).trim();
    setPasswordReg(cleaned);

    const validation = {
      hasUpperCase: /[A-Z]/.test(cleaned),
      hasLowerCase: /[a-z]/.test(cleaned),
      hasNumber: /[0-9]/.test(cleaned),
      minLength: cleaned.length >= 12,
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(cleaned),
    };

    setPasswordValidation(validation);
  };

  const validatePasswordMatch = (confirm: string) => {
    const cleaned = validateInput(confirm).trim();
    setConfirmPassword(cleaned);
    setPasswordsMatch(passwordReg === cleaned);
  };

  const validateAllFields = () => {
    const nombre = nombreCompleto;
    const emp = empresa;
    const tel = telefono;

    const isPasswordValid =
      passwordValidation.hasUpperCase &&
      passwordValidation.hasLowerCase &&
      passwordValidation.hasNumber &&
      passwordValidation.minLength &&
      passwordValidation.hasSpecialChar;

    const isPhoneValid = tel.length >= selectedCountry.minDigits;
    const isNameValid = nombre.length >= 3;
    const isCompanyValid = emp.length >= 3;

    const allFilled =
      isNameValid &&
      isEmailValid(emailReg) &&
      isCompanyValid &&
      isPhoneValid &&
      isPasswordValid &&
      passwordsMatch &&
      confirmPassword !== '';

    setAllFieldsValid(allFilled);
    return allFilled;
  };

  const validateInput = (text: string): string => {
    if (text.startsWith(' ')) {
      return text.trimStart();
    }
    return text;
  };

  const isEmailValid = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [touched, setTouched] = useState({
    nombreCompleto: false,
    emailReg: false,
    empresa: false,
    telefono: false,
    passwordReg: false,
    confirmPassword: false,
  });

  const getBorderColor = (fieldName: keyof typeof touched, value: string, isEmail: boolean = false, isPassword: boolean = false, isConfirmPassword: boolean = false): string => {
    if (!touched[fieldName]) return '#C4C4C4';
    if (value.trim() === '') return '#D9534F';

    if (fieldName === 'nombreCompleto') {
      return value.length >= 3 ? '#28a745' : '#D9534F';
    }

    if (fieldName === 'empresa') {
      return value.length >= 3 ? '#28a745' : '#D9534F';
    }

    if (isPassword) {
      const isPasswordValid =
        passwordValidation.hasUpperCase &&
        passwordValidation.hasLowerCase &&
        passwordValidation.hasNumber &&
        passwordValidation.minLength &&
        passwordValidation.hasSpecialChar;
      return isPasswordValid ? '#28a745' : '#D9534F';
    }

    if (fieldName === 'telefono') {
      const isPhoneValid = value.length >= selectedCountry.minDigits;
      return isPhoneValid ? '#28a745' : '#D9534F';
    }

    if (isConfirmPassword) {
      return passwordsMatch && value.trim() !== '' ? '#28a745' : '#D9534F';
    }

    if (isEmail && !isEmailValid(value)) return '#D9534F';
    return '#28a745';
  };

  const handleLogin = async () => {
    try {
      await authContext.login(email, password);

      setEmail('');
      setPassword('');

    } catch (error: any) {
      alert('Error: ' + (error.error || error.message || 'Error desconocido'));
    }
  };

  useEffect(() => {
    if (authContext.state.userToken && !isRegistering) {
      console.log('Token detectado en LoginScreen, esperando navegación...');
    }
  }, [authContext.state.userToken, isRegistering]);

  const handleRegister = async () => {
    try {

      await authContext.register({
        customer_name: nombreCompleto,
        customer_email: emailReg,
        customer_phone: telefono,
        customer_country_code: selectedCountry.prefix,
        customer_company: empresa,
        customer_password: passwordReg,
      });

      alert(
        '¡Registro exitoso!\n\n' +
        'Se ha enviado un correo de verificación a:\n' +
        emailReg +
        '\n\n' +
        'Por favor, haz clic en el enlace del correo para verificar tu email.\n\n' +
        'Una vez verificado, podrás iniciar sesión.'
      );

      setNombreCompleto('');
      setEmailReg('');
      setEmpresa('');
      setTelefono('');
      setPasswordReg('');
      setConfirmPassword('');
      setShowPasswordReg(false);
      setShowConfirmPassword(false);
      setAllFieldsValid(false);
      setTouched({
        nombreCompleto: false,
        emailReg: false,
        empresa: false,
        telefono: false,
        passwordReg: false,
        confirmPassword: false,
      });

      setIsRegistering(false);

      setTimeout(() => {
        setEmail('');
        setPassword('');
        setLoginTouched({ email: false, password: false });
      }, 500);

    } catch (error: any) {
      console.error('Error en registro:', error);
      alert('Error: ' + (error.error || error.message || 'Error desconocido'));
    }
  };

  useEffect(() => {
    validateAllFields();
    validateLoginForm();
  }, [nombreCompleto, emailReg, empresa, telefono, passwordReg, confirmPassword, passwordValidation, passwordsMatch, email, password]);

  return (
    <StrictMode>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isRegistering}
          bounces={false}
          overScrollMode="never"
        >
          {/* Logo Animado */}
          <Animated.View
            style={[
              styles.logo,
              {
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY },
                ],
              },
            ]}
          >
            <Image
              source={require('@/assets/images/Logo.png')}
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            />
          </Animated.View>

          {/* Usuario Asomado */}
          <Animated.View
            style={[
              styles.userImageContainer,
              { opacity: userOpacity },
            ]}
          >
            <Image
              source={require('@/assets/images/vector-asomado-1.png')}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Formulario Animado */}
          <Animated.View
            style={[
              { transform: [{ translateY: formTranslateY }] },
              isRegistering && { maxHeight: height * 0.67 },
            ]}
          >
            <CurvedBorder>
              {!isRegistering ? (
                // ========== LOGIN ==========
                <>
                  <Text style={styles.title}>Bienvenido</Text>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome5 name="user-alt" size={18} color="#000000" />
                      <Text style={styles.label}>Correo Electrónico</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.inputLogin,
                        {
                          borderWidth: 1,
                          borderColor: getLoginBorderColor('email', email)
                        }
                      ]}
                      placeholder="Correo electrónico o Teléfono"
                      placeholderTextColor="#99A1AF"
                      value={email}
                      onBlur={() => setLoginTouched({ ...loginTouched, email: true })}
                      onChangeText={(text) => {
                        const cleaned = validateInput(text);
                        setEmail(cleaned.trim());
                      }}
                      keyboardType="email-address"
                    />
                  </View>

                  {/* Contraseña */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome name="lock" size={18} color="#000000" />
                      <Text style={styles.label}>Contraseña</Text>
                    </View>
                    <View style={[
                      styles.passwordContainer,
                      {
                        borderWidth: 1,
                        borderColor: getLoginBorderColor('password', password)
                      }
                    ]}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Contraseña"
                        placeholderTextColor="#99A1AF"
                        value={password}
                        onBlur={() => setLoginTouched({ ...loginTouched, password: true })}
                        onChangeText={(text) => {
                          const cleaned = validateInput(text).trim();
                          setPassword(cleaned);
                        }}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Entypo
                          name={showPassword ? 'eye' : 'eye-with-line'}
                          size={22}
                          color="#818896"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Recordarme */}
                  <View style={styles.checkboxContainer}>
                    <View style={styles.checkbox} />
                    <Text style={styles.checkboxText}>Recuérdame</Text>
                    <TouchableOpacity style={styles.forgotPasswordLink}>
                      <Text style={styles.forgotPasswordText}>¿Olvidaste la Contraseña?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Botón Iniciar Sesión */}
                  <TouchableOpacity
                    style={[
                      styles.loginButton,
                      { opacity: loginFormValid ? 1 : 0.5 }
                    ]}
                    disabled={!loginFormValid}
                    onPress={handleLogin}
                  >
                    <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  </TouchableOpacity>

                  {/* Crear Cuenta */}
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>¿No tienes cuenta?</Text>
                    <TouchableOpacity onPress={handleRegisterPress}>
                      <Text style={styles.signupLink}>Crear Cuenta</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // ========== REGISTRO ==========
                <>
                  <Text style={styles.title}>Regístrate</Text>

                  {/* Nombre Completo */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome5 name="user-alt" size={18} color="#000000" />
                      <Text style={styles.label}>Nombre Completo <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderWidth: 1,
                          borderColor: getBorderColor('nombreCompleto', nombreCompleto),
                        }
                      ]}
                      placeholder="Nombre Completo"
                      placeholderTextColor="#999999"
                      value={nombreCompleto}
                      onBlur={() => setTouched({ ...touched, nombreCompleto: true })}
                      onChangeText={(text) => {
                        const cleaned = validateInput(text)
                        setNombreCompleto(cleaned);
                        validateAllFields();
                      }}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <MaterialIcons name="email" size={18} color="#000000" />
                      <Text style={styles.label}>Correo Electrónico <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderWidth: 1,
                          borderColor: getBorderColor('emailReg', emailReg, true),  // ✅ true para email
                        }
                      ]}
                      placeholder="Correo Electrónico"
                      placeholderTextColor="#999999"
                      value={emailReg}
                      onBlur={() => setTouched({ ...touched, emailReg: true })}
                      keyboardType="email-address"
                      onChangeText={(text) => {
                        const cleaned = validateInput(text);
                        setEmailReg(cleaned.trim());
                        validateAllFields();
                      }}
                    />
                  </View>

                  {/* Empresa */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <Ionicons name="business" size={18} color="#000000" />
                      <Text style={styles.label}>Empresa <Text style={styles.required}>*</Text></Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderWidth: 1,
                          borderColor: getBorderColor('empresa', empresa),
                        }
                      ]}
                      placeholder="Empresa"
                      placeholderTextColor="#999999"
                      onBlur={() => setTouched({ ...touched, empresa: true })}
                      value={empresa}
                      onChangeText={(text) => {
                        const cleaned = validateInput(text);
                        setEmpresa(cleaned);
                        validateAllFields();
                      }}
                    />
                  </View>

                  {/* Teléfono */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome name="phone" size={18} color="#000000" />
                      <Text style={styles.label}>Teléfono <Text style={styles.required}>*</Text></Text>
                    </View>

                    <View style={[
                      styles.phoneInputContainer,
                      {
                        borderWidth: 1,
                        borderColor: getBorderColor('telefono', telefono),
                      }
                    ]}>
                      {/* Selector de País */}
                      <TouchableOpacity
                        style={styles.countrySelector}
                        onPress={() => setShowCountryPicker(true)}
                      >
                        <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                        <FontAwesome name="chevron-down" size={16} color="#000000" />
                      </TouchableOpacity>

                      {/* Input de teléfono */}
                      <TextInput
                        style={[
                          styles.phoneInput,
                          {
                            borderLeftWidth: 1,
                            borderLeftColor: '#E0E0E0',
                          }
                        ]}
                        placeholder="Teléfono"
                        placeholderTextColor="#999999"
                        value={telefono}
                        keyboardType="phone-pad"
                        maxLength={selectedCountry.maxDigits}
                        onBlur={() => setTouched({ ...touched, telefono: true })}
                        onChangeText={validatePhoneNumber}
                      />
                    </View>
                  </View>

                  {showCountryPicker && (
                    <CountryPickerModal
                      countries={countries}
                      selectedCountry={selectedCountry}
                      onSelect={(country) => {
                        setSelectedCountry(country);
                        setTelefono('');
                        setShowCountryPicker(false);
                      }}
                      onClose={() => setShowCountryPicker(false)}
                    />
                  )}

                  {/* Contraseña */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome name="lock" size={18} color="#000000" />
                      <Text style={styles.label}>Contraseña <Text style={styles.required}>*</Text></Text>
                    </View>
                    <View style={[
                      styles.passwordContainer,
                      {
                        borderWidth: 1,
                        borderColor: getBorderColor('passwordReg', passwordReg, false, true),  // ✅ true para isPassword
                      }
                    ]}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Contraseña"
                        placeholderTextColor="#99A1AF"
                        value={passwordReg}
                        onBlur={() => setTouched({ ...touched, passwordReg: true })}
                        onChangeText={validatePassword}
                        secureTextEntry={!showPasswordReg}
                      />
                      <TouchableOpacity onPress={() => setShowPasswordReg(!showPasswordReg)}>
                        <Entypo
                          name={showPasswordReg ? 'eye' : 'eye-with-line'}
                          size={22}
                          color="#818896"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Validación de Contraseña */}
                    <View style={styles.validationContainer}>
                      <View style={[styles.validationItem, {
                        borderColor: passwordValidation.hasUpperCase ? '#28a745' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.validationText, {
                          color: passwordValidation.hasUpperCase ? '#28a745' : '#999999'
                        }]}>
                          La contraseña debe contener una Mayúscula
                        </Text>
                      </View>

                      <View style={[styles.validationItem, {
                        borderColor: passwordValidation.hasLowerCase ? '#28a745' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.validationText, {
                          color: passwordValidation.hasLowerCase ? '#28a745' : '#999999'
                        }]}>
                          La contraseña debe contener una Minúscula
                        </Text>
                      </View>

                      <View style={[styles.validationItem, {
                        borderColor: passwordValidation.hasNumber ? '#28a745' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.validationText, {
                          color: passwordValidation.hasNumber ? '#28a745' : '#999999'
                        }]}>
                          La contraseña debe contener un Número
                        </Text>
                      </View>

                      <View style={[styles.validationItem, {
                        borderColor: passwordValidation.hasSpecialChar ? '#28a745' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.validationText, {
                          color: passwordValidation.hasSpecialChar ? '#28a745' : '#999999'
                        }]}>
                          La contraseña debe contener un carácter especial
                        </Text>
                      </View>

                      <View style={[styles.validationItem, {
                        borderColor: passwordValidation.minLength ? '#28a745' : '#E0E0E0'
                      }]}>
                        <Text style={[styles.validationText, {
                          color: passwordValidation.minLength ? '#28a745' : '#999999'
                        }]}>
                          La contraseña debe contener un mínimo de 12 caracteres
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Repetir Contraseña */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelContainer}>
                      <FontAwesome name="lock" size={18} color="#000000" />
                      <Text style={styles.label}>Repetir Contraseña <Text style={styles.required}>*</Text></Text>
                    </View>
                    <View style={[
                      styles.passwordContainer,
                      {
                        borderWidth: 1,
                        borderColor: getBorderColor('confirmPassword', confirmPassword, false, false, true),  // ✅ true para isConfirmPassword
                      }
                    ]}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Repetir Contraseña"
                        placeholderTextColor="#99A1AF"
                        value={confirmPassword}
                        onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                        onChangeText={validatePasswordMatch}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Entypo
                          name={showConfirmPassword ? 'eye' : 'eye-with-line'}
                          size={22}
                          color="#818896"
                        />
                      </TouchableOpacity>
                    </View>

                    {!passwordsMatch && confirmPassword.trim() !== '' && (
                      <Text style={styles.errorMessage}>
                        Las contraseñas no coinciden
                      </Text>
                    )}
                  </View>

                  {/* Botón Crear Cuenta */}
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      { opacity: allFieldsValid ? 1 : 0.5 }
                    ]}
                    disabled={!allFieldsValid}
                    onPress={handleRegister}
                  >
                    <Text style={styles.registerButtonText}>Crear Cuenta</Text>
                  </TouchableOpacity>

                  {/* Link a Login */}
                  <View style={styles.loginLinkContainer}>
                    <Text style={styles.loginLinkText}>¿Ya Tienes Cuenta?</Text>
                    <TouchableOpacity onPress={handleBackToLogin}>
                      <Text style={styles.loginLink}>Iniciar Sesión</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </CurvedBorder>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C0D',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end'
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.15,
    height: height * 0.08,
  },
  userImageContainer: {
    alignItems: 'center',
    marginBottom: height * -0.043,
    zIndex: 10,
  },
  title: {
    fontSize: width * 0.09,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: height * 0.02,
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular',
  },
  inputGroup: {
    marginBottom: height * 0.02,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  label: {
    fontSize: width * 0.0313,
    fontWeight: '600',
    color: '#000000',
    marginLeft: width * 0.02,
  },
  required: {
    color: '#D9534F',
  },
  inputLogin: {
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.013,
    fontSize: width * 0.03,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.013,
    fontSize: width * 0.03,
    color: '#000000',
    backgroundColor: '#F4F4F4',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4F4F4',
    backgroundColor: '#F4F4F4',
    borderRadius: width * 0.05,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.003,
    fontSize: width * 0.03,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: height * 0.01,
    fontSize: width * 0.034,
    color: '#000000',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  checkbox: {
    width: width * 0.045,
    height: height * 0.0202,
    borderWidth: 2,
    borderColor: '#C7C3C3',
    borderRadius: width * 0.015,
    marginRight: width * 0.024,
  },
  checkboxText: {
    fontSize: width * 0.0313,
    color: '#000000',
  },
  forgotPasswordLink: {
    marginLeft: 'auto',
  },
  forgotPasswordText: {
    fontSize: width * 0.027,
    color: '#000000',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontFamily: 'Poppins-Regular'
  },
  loginButton: {
    backgroundColor: '#3C6034',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.035,
    alignItems: 'center',
    marginBottom: height * 0.023,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: width * 0.05,
    fontFamily: 'Poppins-Bold'
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: width * 0.036,
    color: '#000000',
    fontFamily: 'Poppins-Bold',
  },
  signupLink: {
    fontSize: width * 0.036,
    color: '#3C6034',
    marginLeft: width * 0.014,
    fontFamily: 'Poppins-Bold',
  },
  registerButton: {
    backgroundColor: '#3C6034',
    paddingVertical: height * 0.014,
    borderRadius: width * 0.035,
    alignItems: 'center',
    marginBottom: height * 0.015,
    marginTop: height * 0.015,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: width * 0.045,
    fontFamily: 'Poppins-Bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  loginLinkText: {
    fontSize: width * 0.032,
    color: '#000000',
    fontFamily: 'Poppins-Bold',
  },
  loginLink: {
    fontSize: width * 0.032,
    color: '#3C6034',
    marginLeft: width * 0.01,
    fontFamily: 'Poppins-Bold',
  },
  validationContainer: {
    marginVertical: height * 0.0001,
    gap: height * 0.001,
  },
  validationItem: {
    paddingVertical: height * 0.005,
    paddingHorizontal: width * 0.03,
  },
  validationText: {
    fontSize: width * 0.025,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#D9534F',
    fontSize: width * 0.025,
    marginTop: height * 0.008,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F4F4F4',
    overflow: 'hidden',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.001,
    gap: width * 0.02,
    width: 'auto',
  },
  countryFlag: {
    fontSize: width * 0.08,
  },
  countryPrefix: {
    fontSize: width * 0.03,
    fontWeight: '600',
    color: '#000000',
  },
  phoneInput: {
    flex: 1,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
    fontSize: width * 0.034,
    color: '#000000',
  },
});