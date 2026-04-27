import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export { width, height };

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C0D',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.08,
    marginBottom: height * 0.04,
  },

  userImageContainer: {
    alignItems: 'center',
    marginBottom: height * -0.046,
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
    justifyContent: 'center',
    alignItems: 'center',
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
    fontFamily: 'Poppins-Regular',
  },

  loginButton: {
    backgroundColor: '#3C6034',
    paddingVertical: height * 0.015,
    borderRadius: width * 0.08,
    alignItems: 'center',
    marginBottom: height * 0.023,
  },

  loginButtonText: {
    color: '#ffffff',
    fontSize: width * 0.05,
    fontFamily: 'Poppins-Bold',
  },

  registerButton: {
    backgroundColor: '#3C6034',
    paddingVertical: height * 0.014,
    borderRadius: width * 0.08,
    alignItems: 'center',
    marginBottom: height * 0.015,
    marginTop: height * 0.015,
  },

  registerButtonText: {
    color: '#ffffff',
    fontSize: width * 0.045,
    fontFamily: 'Poppins-Bold',
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.01,
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

  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: height * 0.01,
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

  copyright: {
    textAlign: 'center',
    fontSize: width * 0.028,
    color: '#9ca3af',
    fontFamily: 'Poppins-Regular',
    marginTop: height * 0.012,
    paddingBottom: height * 0.005,
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
    fontFamily: 'Poppins-Regular',
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
  },

  countryFlag: {
    fontSize: width * 0.08,
  },

  phoneInput: {
    flex: 1,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
    fontSize: width * 0.034,
    color: '#000000',
  },
});