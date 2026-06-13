import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
export { width };

export const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 120,
    paddingTop: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.035,
    color: "#222",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  catIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  catIconDevice: {
    backgroundColor: "#E8F5E9",
  },
  catIconCode: {
    backgroundColor: "#EFF6FF",
  },
  subject: {
    flex: 1,
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.038,
    color: "#111",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.027,
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.032,
    color: "#555",
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  techRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  techAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#FFF",
    overflow: "hidden",
  },
  techImg: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  techInitial: {
    justifyContent: "center",
    alignItems: "center",
  },
  techInitialText: {
    fontFamily: "Poppins-Bold",
    fontSize: 11,
    color: "#FFF",
  },
  techName: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#555",
  },
  unassignedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  unassignedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  unassignedText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#9CA3AF",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.028,
    color: "#9CA3AF",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIconBg: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.175,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#3C6034",
    padding: 8,
    borderRadius: 20,
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: width * 0.045,
    color: "#333",
    textAlign: "center",
  },
  emptySub: {
    fontFamily: "Poppins-Regular",
    fontSize: width * 0.033,
    color: "#8A8A8A",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
