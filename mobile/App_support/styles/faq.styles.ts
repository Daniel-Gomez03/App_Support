import { StyleSheet, Dimensions } from "react-native";
import { ThemeColors } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
export { width };

export const makeDropdownStyles = (c: ThemeColors) =>
    StyleSheet.create({
        wrapper: {
            marginTop: 14
        },
        label: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.032,
            color: c.textSub,
            marginBottom: 6,
        },
        trigger: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: c.input,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: c.border,
        },
        triggerText: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.035,
            color: c.text,
            flex: 1,
        },
        placeholder: {
            color: c.textMuted
        },
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
        },
        sheet: {
            backgroundColor: c.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: 40,
            maxHeight: "60%" as any,
        },
        sheetTitle: {
            fontFamily: "Poppins-Bold",
            fontSize: width * 0.04,
            color: c.text,
            marginBottom: 16,
        },
        option: {
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },
        optionActive: {
            backgroundColor: c.primarySoft,
            borderRadius: 8,
            paddingHorizontal: 8,
        },
        optionText: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.036,
            color: c.text,
        },
        optionTextActive: {
            color: "#3C6034",
            fontFamily: "Poppins-Bold"
        },
    });

export const makePaginationStyles = (c: ThemeColors) =>
    StyleSheet.create({
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
            backgroundColor: c.input,
            justifyContent: "center",
            alignItems: "center",
        },
        arrowDisabled: {
            opacity: 0.4
        },
        pageBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: c.input,
            justifyContent: "center",
            alignItems: "center",
        },
        pageBtnActive: {
            backgroundColor: "#3C6034"
        },
        pageText: {
            fontFamily: "Poppins-Bold",
            fontSize: width * 0.035,
            color: c.text,
        },
        pageTextActive: {
            color: "#fff"
        },
    });

export const makeFaqStyles = (c: ThemeColors) =>
    StyleSheet.create({
        scroll: {
            flex: 1,
            backgroundColor: c.background
        },
        content: {
            paddingHorizontal: width * 0.05,
            paddingTop: 16
        },
        center: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center"
        },
        searchBox: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: c.input,
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
            color: c.text,
        },
        filterCard: {
            backgroundColor: c.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: c.border,
            marginBottom: 16,
            overflow: "hidden" as any,
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
            backgroundColor: c.primarySoft,
            justifyContent: "center",
            alignItems: "center",
        },
        filterIconBgActive: {
            backgroundColor: "#3C6034"
        },
        filterTitle: {
            fontFamily: "Poppins-Bold",
            fontSize: width * 0.038,
            color: c.text,
        },
        filterSub: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.03,
            color: c.textMuted,
            marginTop: 1,
        },
        filterBody: {
            paddingHorizontal: 16,
            paddingBottom: 16
        },
        filterLabel: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.032,
            color: c.textSub,
            marginBottom: 10,
        },
        catRow: {
            flexDirection: "row",
            gap: 10,
            flexWrap: "wrap" as any
        },
        catBtn: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: c.input,
            borderWidth: 1,
            borderColor: c.border,
        },
        catBtnActive: {
            backgroundColor: "#3C6034",
            borderColor: "#3C6034"
        },
        catBtnText: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.033,
            color: c.textSub,
        },
        catBtnTextActive: {
            color: "#fff",
            fontFamily: "Poppins-Bold"
        },
        catCount: {
            backgroundColor: c.surface,
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
            color: c.textSub,
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
            flexWrap: "wrap" as any,
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
            color: c.textMuted,
        },
        resultCount: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.03,
            color: c.textMuted,
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
            color: c.textSub,
        },
        emptySub: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.033,
            color: c.textMuted,
            textAlign: "center",
            paddingHorizontal: 30,
        },
        faqCard: {
            backgroundColor: c.card,
            borderRadius: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: c.border,
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
            backgroundColor: c.primarySoft,
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
            color: c.text,
            lineHeight: width * 0.052,
        },
        tagRow: {
            flexDirection: "row",
            gap: 6,
            marginTop: 6,
            flexWrap: "wrap" as any,
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
            backgroundColor: c.input,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
        },
        tagModelText: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.028,
            color: c.textSub,
        },
        faqBody: {
            paddingHorizontal: 16,
            paddingBottom: 16
        },
        divider: {
            height: 1,
            backgroundColor: c.border,
            marginBottom: 14
        },
        faqAnswer: {
            fontFamily: "Poppins-Regular",
            fontSize: width * 0.034,
            color: c.textSub,
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
            alignItems: "center",
        },
        arrowPill: {
            backgroundColor: c.card,
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
