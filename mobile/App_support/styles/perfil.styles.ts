import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export { width };

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    paddingHorizontal: width * 0.05,
  },

  avatarBlock: {
    alignItems: "center",
    paddingVertical: 28,
  },
  avatar: {
    width: width * 0.24,
    height: width * 0.24,
    borderRadius: width * 0.12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarFallback: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitialText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.1,
    color: "#fff",
  },
  name: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.048,
    color: "#111",
    marginTop: 12,
  },
  email: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#888",
    marginTop: 2,
  },

  sectionLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#9CA3AF",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.036,
    color: "#111",
  },
  menuSub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.029,
    color: "#9CA3AF",
    marginTop: 1,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 28,
  },
  logoutText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#DC2626",
  },

  siguenos: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.028,
    color: "#9CA3AF",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 14,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginBottom: 20,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  copyright: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.027,
    color: "#CCC",
    textAlign: "center",
  },
});
