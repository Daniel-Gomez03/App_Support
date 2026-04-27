import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export { width };

export const dropdownStyles = StyleSheet.create({
    wrapper: {
        marginTop: 14,
    },
    label: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.032,
        color: "#555",
        marginBottom: 6,
    },
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F7F7F7",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "#ECECEC",
    },
    triggerText: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.035,
        color: "#222",
        flex: 1,
    },
    placeholder: {
        color: "#AAA",
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
        fontSize: width * 0.04,
        color: "#000",
        marginBottom: 16,
    },
    option: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    optionActive: {
        backgroundColor: "#F0F7EE",
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    optionText: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.036,
        color: "#333",
    },
    optionTextActive: {
        color: "#3C6034",
        fontFamily: "Poppins-Bold",
    },
});

export const paginationStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 24,
    },
    arrow: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    arrowDisabled: {
        opacity: 0.4,
    },
    pageBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    pageBtnActive: {
        backgroundColor: "#3C6034",
    },
    pageText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.035,
        color: "#333",
    },
    pageTextActive: {
        color: "#fff",
    },
});

export const faqStyles = StyleSheet.create({
    scroll: {
        flex: 1,
        backgroundColor: "#fff",
    },
    content: {
        paddingHorizontal: width * 0.05,
        paddingTop: 16,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: 16,
        paddingHorizontal: 14,
        marginBottom: 16,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.036,
        color: "#222",
    },
    filterCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EFEFEF",
        marginBottom: 16,
        overflow: "hidden",
    },
    filterHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16
    },
    filterIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#EDF4EB",
        justifyContent: "center",
        alignItems: "center",
    },
    filterIconBgActive: {
        backgroundColor: "#3C6034"
    },
    filterTitle: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.038,
        color: "#000",
    },
    filterSub: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.03,
        color: "#999",
        marginTop: 1,
    },
    filterBody: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    filterLabel: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.032,
        color: "#555",
        marginBottom: 10,
    },
    catRow: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap"
    },
    catBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
        borderWidth: 1,
        borderColor: "#ECECEC",
    },
    catBtnActive: {
        backgroundColor: "#3C6034",
        borderColor: "#3C6034"
    },
    catBtnText: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.033,
        color: "#555",
    },
    catBtnTextActive: {
        color: "#fff",
        fontFamily: "Poppins-Bold"
    },
    catCount: {
        backgroundColor: "#E8E8E8",
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    catCountActive: {
        backgroundColor: "rgba(255,255,255,0.25)"
    },
    catCountText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.028,
        color: "#555",
    },
    catCountTextActive: {
        color: "#fff"
    },
    clearBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        marginTop: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#FFF0F0",
    },
    clearBtnText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.033,
        color: "#E53E3E",
    },
    breadcrumbRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        marginBottom: 4,
    },
    breadItem: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.032,
        color: "#3C6034",
    },
    breadSep: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.032,
        color: "#999",
    },
    resultCount: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.03,
        color: "#999",
        marginBottom: 14,
    },
    empty: {
        alignItems: "center",
        paddingVertical: 60,
        gap: 12
    },
    emptyText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.042,
        color: "#555",
    },
    emptySub: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.033,
        color: "#999",
        textAlign: "center",
        paddingHorizontal: 30,
    },
    faqCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EFEFEF",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    faqCardExpanded: {
        borderColor: "#3C6034",
        borderWidth: 1.5
    },
    faqHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16
    },
    faqIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#EDF4EB",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    faqIconBgActive: {
        backgroundColor: "#3C6034"
    },
    faqQuestion: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.037,
        color: "#000",
        lineHeight: width * 0.052,
    },
    tagRow: {
        flexDirection: "row",
        gap: 6,
        marginTop: 6,
        flexWrap: "wrap"
    },
    tagCat: {
        backgroundColor: "#FFF3E0",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagCatText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.028,
        color: "#E65100",
    },
    tagModel: {
        backgroundColor: "#F3F3F3",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    tagModelText: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.028,
        color: "#555",
    },
    faqBody: {
        paddingHorizontal: 16,
        paddingBottom: 16
    },
    divider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginBottom: 14
    },
    faqAnswer: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.034,
        color: "#444",
        lineHeight: width * 0.052,
    },
    videoBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 14,
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#3C6034",
    },
    videoBtnText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.032,
        color: "#3C6034",
    },
    ctaBanner: {
        position: "absolute",
        left: width * 0.04,
        right: width * 0.04,
        backgroundColor: "#09160A",
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    ctaIconBg: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#3C6034",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    ctaTitle: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.035,
        color: "#fff",
    },
    ctaSub: {
        fontFamily: "Poppins-Regular",
        fontSize: width * 0.028,
        color: "rgba(255,255,255,0.6)",
        marginTop: 1,
    },
    ctaBtn: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexShrink: 0,
    },
    ctaBtnText: {
        fontFamily: "Poppins-Bold",
        fontSize: width * 0.032,
        color: "#09160A",
    },
    arrowHint: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center"
    },
    arrowPill: {
        backgroundColor: "#fff",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1.5,
        borderColor: "#3C6034",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
});
