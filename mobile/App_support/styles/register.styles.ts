import { StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");
export { width, height };

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1C0D",
  },

  header: {
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    left: width * 0.05,
    top: height * 0.065,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerLogo: {
    width: width * 0.52,
    height: height * 0.065,
  },

  panelContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: width * 0.18,
    overflow: "hidden",
  },

  stickyHeader: {
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.008,
  },

  scrollContent: {
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.04,
  },

  title: {
    fontSize: width * 0.09,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: height * 0.005,
    fontStyle: "italic",
    fontFamily: "Poppins-Regular",
  },

  stepLabel: {
    fontSize: width * 0.03,
    color: "#3C6034",
    fontWeight: "600",
    marginBottom: height * 0.005,
    fontFamily: "Poppins-Regular",
  },

  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: "800",
    color: "#111827",
    marginBottom: height * 0.004,
    fontFamily: "Poppins-Bold",
  },

  description: {
    fontSize: width * 0.03,
    color: "#6b7280",
    lineHeight: width * 0.044,
    marginBottom: height * 0.025,
    fontFamily: "Poppins-Regular",
  },

  inputGroup: {
    marginBottom: height * 0.018,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.007,
    gap: 6,
  },

  label: {
    fontSize: width * 0.032,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Poppins-Regular",
  },

  labelOptional: {
    fontSize: width * 0.026,
    color: "#9ca3af",
    fontStyle: "italic",
    fontFamily: "Poppins-Regular",
  },

  required: {
    color: "#ef4444",
    fontSize: width * 0.034,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.014,
    fontSize: width * 0.034,
    color: "#111827",
    backgroundColor: "#ffffff",
    fontFamily: "Poppins-Regular",
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.005,
    backgroundColor: "#ffffff",
  },

  passwordInput: {
    flex: 1,
    fontSize: width * 0.034,
    color: "#111827",
    paddingVertical: height * 0.01,
    fontFamily: "Poppins-Regular",
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.014,
    gap: width * 0.015,
    borderRightWidth: 1,
    borderRightColor: "#e5e7eb",
  },

  countryFlag: {
    fontSize: width * 0.065,
  },

  countryPrefix: {
    fontSize: width * 0.032,
    color: "#374151",
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },

  phoneInput: {
    flex: 1,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.014,
    fontSize: width * 0.034,
    color: "#111827",
    fontFamily: "Poppins-Regular",
  },

  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.014,
    backgroundColor: "#ffffff",
  },

  dropdownTriggerText: {
    fontSize: width * 0.034,
    color: "#9ca3af",
    fontFamily: "Poppins-Regular",
  },

  dropdownTriggerSelected: {
    color: "#111827",
  },

  dropdownList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    marginTop: 4,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.016,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  dropdownItemLast: {
    borderBottomWidth: 0,
  },

  dropdownItemText: {
    fontSize: width * 0.034,
    color: "#374151",
    fontFamily: "Poppins-Regular",
  },

  warrantyResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },

  warrantyResultText: {
    fontSize: width * 0.03,
    fontWeight: "600",
    flex: 1,
    fontFamily: "Poppins-Regular",
  },

  warrantyValid: { backgroundColor: "#f0fdf4" },
  warrantyExpired: { backgroundColor: "#fffbeb" },
  warrantyNotFound: { backgroundColor: "#fff1f2" },

  warrantyValidText: { color: "#16a34a" },
  warrantyExpiredText: { color: "#d97706" },
  warrantyNotFoundText: { color: "#e11d48" },

  validationList: {
    gap: height * 0.004,
    marginTop: height * 0.008,
  },

  validationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  validationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  validationText: {
    fontSize: width * 0.028,
    fontFamily: "Poppins-Regular",
  },

  errorText: {
    fontSize: width * 0.028,
    color: "#ef4444",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },

  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: height * 0.01,
    paddingVertical: height * 0.008,
  },

  policyCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  policyCheckCircleActive: {
    backgroundColor: "#3C6034",
    borderColor: "#3C6034",
  },

  policyRowText: {
    flex: 1,
    fontSize: width * 0.031,
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
    lineHeight: width * 0.046,
  },

  policyLink: {
    color: "#1B3A1F",
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },

  primaryButton: {
    backgroundColor: "#1B3A1F",
    paddingVertical: height * 0.018,
    borderRadius: width * 0.08,
    alignItems: "center",
    marginTop: height * 0.025,
    marginBottom: height * 0.015,
  },

  primaryButtonDisabled: {
    opacity: 0.5,
  },

  primaryButtonText: {
    color: "#ffffff",
    fontSize: width * 0.048,
    fontFamily: "Poppins-Bold",
  },

  loginLinkRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.01,
  },

  loginLinkText: {
    fontSize: width * 0.032,
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
  },

  loginLinkAction: {
    fontSize: width * 0.032,
    color: "#3C6034",
    marginLeft: 4,
    fontFamily: "Poppins-Bold",
  },

  copyright: {
    textAlign: "center",
    fontSize: width * 0.026,
    color: "#9ca3af",
    fontFamily: "Poppins-Regular",
    paddingBottom: height * 0.01,
  },

  toastWrapper: {
    position: "absolute",
    top: height * 0.05,
    left: width * 0.04,
    right: width * 0.04,
    zIndex: 20,
  },

  toastCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: width * 0.04,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },

  toastSuccess: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  toastWarning: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  toastIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  toastIconSuccess: { backgroundColor: "#16a34a" },
  toastIconWarning: { backgroundColor: "#dc2626" },

  toastText: {
    flex: 1,
    fontSize: width * 0.032,
    lineHeight: width * 0.046,
    fontFamily: "Poppins-Regular",
  },

  toastTextSuccess: { color: "#166534" },
  toastTextWarning: { color: "#991b1b" },
});
