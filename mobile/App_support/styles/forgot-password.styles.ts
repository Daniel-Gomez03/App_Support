import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export { width, height };

export const styles = StyleSheet.create({
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
  },

  headerLogo: {
    width: width * 0.52,
    height: height * 0.065,
  },

  panel: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: width * 0.18,
    overflow: "hidden",
  },

  scrollContent: {
    paddingHorizontal: width * 0.08,
    paddingTop: height * 0.045,
    paddingBottom: height * 0.04,
    alignItems: "center",
  },

  title: {
    fontSize: width * 0.072,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginBottom: height * 0.014,
  },

  subtitle: {
    fontSize: width * 0.034,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    lineHeight: width * 0.05,
    marginBottom: height * 0.03,
  },

  inputGroup: {
    width: "100%",
    marginBottom: height * 0.01,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: height * 0.007,
  },

  label: {
    fontSize: width * 0.032,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "Poppins-Regular",
  },

  input: {
    width: "100%",
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

  errorText: {
    width: "100%",
    fontSize: width * 0.03,
    color: "#ef4444",
    fontFamily: "Poppins-Regular",
    marginBottom: height * 0.01,
  },

  button: {
    width: "100%",
    backgroundColor: "#1B3A1F",
    paddingVertical: height * 0.018,
    borderRadius: width * 0.08,
    alignItems: "center",
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: width * 0.048,
    fontFamily: "Poppins-Bold",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.02,
  },

  loginText: {
    fontSize: width * 0.032,
    color: "#6b7280",
    fontFamily: "Poppins-Regular",
  },

  loginLink: {
    fontSize: width * 0.032,
    color: "#3C6034",
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
  },

  iconCircle: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: width * 0.12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.025,
  },

  emailText: {
    fontSize: width * 0.038,
    fontWeight: "bold",
    color: "#111827",
    fontFamily: "Poppins-Bold",
    textAlign: "center",
    marginTop: height * 0.005,
    marginBottom: height * 0.03,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: width * 0.05,
    marginBottom: height * 0.035,
    gap: height * 0.01,
  },

  infoTitle: {
    fontSize: width * 0.032,
    fontWeight: "700",
    color: "#374151",
    fontFamily: "Poppins-Regular",
    marginBottom: height * 0.004,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  bullet: {
    fontSize: width * 0.04,
    color: "#6b7280",
    lineHeight: width * 0.052,
  },

  infoText: {
    flex: 1,
    fontSize: width * 0.032,
    color: "#374151",
    fontFamily: "Poppins-Regular",
    lineHeight: width * 0.048,
  },

  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: height * 0.004,
  },

  warningText: {
    fontSize: width * 0.03,
    color: "#d97706",
    fontWeight: "600",
    fontFamily: "Poppins-Regular",
  },

  copyright: {
    fontSize: width * 0.026,
    color: "#9ca3af",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
});
