import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export { width };

export const nuevoStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    scroll: {
        paddingHorizontal: width * 0.06,
        paddingTop: 8
    },
    fieldWrapper: {
        marginBottom: 20
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 6,
    },
    label: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#222"
    },
    req: {
        color: "#D9534F"
    },
    hint: {
        fontFamily: "Poppins-Regular",
        fontSize: 11,
        color: "#D9534F",
        marginTop: 4,
        marginLeft: 2,
    },
    input: {
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 13,
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#222",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    textArea: {
        height: 110,
        textAlignVertical: "top"
    },
    dropTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    dropTriggerActive: {
        borderColor: "#3C6034"
    },
    dropText: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#222",
        flex: 1,
    },
    dropPlaceholder: {
        color: "#BBB"
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: "60%",
    },
    sheetTitle: {
        fontFamily: "Poppins-Bold",
        fontSize: 16,
        color: "#000",
        marginBottom: 16,
    },
    sheetOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sheetOptionActive: {
        backgroundColor: "#F0F7EE",
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    sheetOptionText: {
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        color: "#333",
    },
    sheetOptionTextActive: {
        color: "#3C6034",
        fontFamily: "Poppins-Bold"
    },
    uploadBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: "#DDD",
        borderRadius: 14,
        paddingVertical: 16,
        backgroundColor: "#FAFAFA",
    },
    uploadBtnActive: {
        borderColor: "#3C6034",
        backgroundColor: "#F0F7EE"
    },
    uploadText: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#999"
    },
    uploadTextActive: {
        color: "#3C6034",
        fontFamily: "Poppins-Bold"
    },
    thumb: {
        marginRight: 10,
        position: "relative"
    },
    thumbImg: {
        width: width * 0.22,
        height: width * 0.22,
        borderRadius: 10
    },
    thumbOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    thumbRemove: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#fff",
        borderRadius: 10,
    },
    submitBtn: {
        backgroundColor: "#3C6034",
        borderRadius: 25,
        paddingVertical: 17,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    submitBtnDisabled: {
        opacity: 0.45
    },
    submitText: {
        color: "#fff",
        fontFamily: "Poppins-Bold",
        fontSize: 16
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        width: "100%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    modalIconWrap: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#FEF3C7",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontFamily: "Poppins-Bold",
        fontSize: 18,
        color: "#111",
        marginBottom: 10,
        textAlign: "center",
    },
    modalBody: {
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        color: "#555",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
        width: "100%"
    },
    modalBtnCancel: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#DDD",
        alignItems: "center",
    },
    modalBtnCancelText: {
        fontFamily: "Poppins-Bold",
        fontSize: 14,
        color: "#555",
    },
    modalBtnConfirm: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 12,
        backgroundColor: "#D97706",
        alignItems: "center",
    },
    modalBtnConfirmText: {
        fontFamily: "Poppins-Bold",
        fontSize: 14,
        color: "#fff",
    },
});
