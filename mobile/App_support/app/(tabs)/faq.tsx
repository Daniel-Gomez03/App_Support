import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Linking,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { getFAQs } from "@/Services/qaService";
import socket from "@/Services/socket";
import {
  makeFaqStyles,
  makeDropdownStyles,
  makePaginationStyles,
  width,
} from "@/styles/faq.styles";
import { useTheme } from "@/context/ThemeContext";
const PAGE_SIZE = 10;

interface Faq {
  faq_id: number;
  category_id: number;
  product_id: number;
  product_model_id: number | null;
  faq_question: string;
  faq_answer: string;
  faq_video_url: string;
  category: {
    category_id: number;
    category_name: string;
  };
  product: {
    product_id: number;
    product_name: string;
  };
  product_model: {
    product_model_id: number;
    product_model_name: string;
  } | null;
}

interface DropdownOption {
  label: string;
  value: number | null;
}
interface DropdownProps {
  label: string;
  options: DropdownOption[];
  selected: number | null;
  onSelect: (v: number | null) => void;
  placeholder: string;
}
function Dropdown({
  label,
  options,
  selected,
  onSelect,
  placeholder,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  const dd = useMemo(() => makeDropdownStyles(colors), [colors]);
  const selectedLabel =
    options.find((o) => o.value === selected)?.label ?? placeholder;
  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity
        style={dd.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[dd.triggerText, !selected && dd.placeholder]}>
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#555" />
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={dd.overlay}
          onPress={() => setOpen(false)}
          activeOpacity={1}
        >
          <View style={dd.sheet}>
            <Text style={dd.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(i) => String(i.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    dd.option,
                    item.value === selected && dd.optionActive,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      dd.optionText,
                      item.value === selected && dd.optionTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selected && (
                    <Ionicons name="checkmark" size={18} color="#3C6034" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

interface PaginationProps {
  current: number;
  total: number;
  onPage: (p: number) => void;
}
function Pagination({ current, total, onPage }: PaginationProps) {
  const { colors } = useTheme();
  const pag = useMemo(() => makePaginationStyles(colors), [colors]);
  if (total <= 1) return null;

  const getPages = () => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2)
      return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  return (
    <View style={pag.row}>
      <TouchableOpacity
        style={[pag.arrow, current === 1 && pag.arrowDisabled]}
        onPress={() => current > 1 && onPage(current - 1)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={current === 1 ? "#CCC" : "#333"}
        />
      </TouchableOpacity>

      {getPages().map((p) => (
        <TouchableOpacity
          key={p}
          style={[pag.pageBtn, p === current && pag.pageBtnActive]}
          onPress={() => onPage(p)}
          activeOpacity={0.8}
        >
          <Text style={[pag.pageText, p === current && pag.pageTextActive]}>
            {p}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[pag.arrow, current === total && pag.arrowDisabled]}
        onPress={() => current < total && onPage(current + 1)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={current === total ? "#CCC" : "#333"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function FAQScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const s = useMemo(() => makeFaqStyles(colors), [colors]);

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ctaAnim = useRef(new Animated.Value(0)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const ctaVisible = useRef(false);
  const arrowVisible = useRef(false);
  const bounceLoop = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const paginationY = useRef(0);

  const startArrow = () => {
    Animated.timing(arrowAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    bounceLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounce, {
          toValue: -9,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounce, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
    );
    bounceLoop.current.start();
  };

  const stopArrow = () => {
    bounceLoop.current?.stop();
    arrowBounce.setValue(0);
    Animated.timing(arrowAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const loadFaqs = async () => {
    try {
      const data = await getFAQs();
      setFaqs(data);
    } catch (e) {
      console.error("Error cargando FAQs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
    socket.on("faq_created", loadFaqs);
    socket.on("faq_updated", loadFaqs);
    socket.on("faq_toggled", loadFaqs);
    return () => {
      socket.off("faq_created", loadFaqs);
      socket.off("faq_updated", loadFaqs);
      socket.off("faq_toggled", loadFaqs);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedProduct, selectedModel, search]);

  const categories = useMemo(() => {
    const map = new Map<number, { id: number; name: string; count: number }>();
    faqs.forEach((f) => {
      const c = f.category;
      if (!map.has(c.category_id))
        map.set(c.category_id, {
          id: c.category_id,
          name: c.category_name,
          count: 0,
        });
      map.get(c.category_id)!.count++;
    });
    return Array.from(map.values());
  }, [faqs]);

  const isDeviceCategory = useMemo(() => {
    if (!selectedCategory) return false;
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.name.toLowerCase().includes("dispositivo") ?? false;
  }, [selectedCategory, categories]);

  const productOptions = useMemo((): DropdownOption[] => {
    if (!selectedCategory) return [];
    const map = new Map<number, string>();
    faqs
      .filter((f) => f.category_id === selectedCategory)
      .forEach((f) => {
        map.set(f.product.product_id, f.product.product_name);
      });
    return [
      {
        label: isDeviceCategory
          ? "Todos los dispositivos"
          : "Todas las soluciones",
        value: null,
      },
      ...Array.from(map.entries()).map(([id, name]) => ({
        label: name,
        value: id,
      })),
    ];
  }, [faqs, selectedCategory, isDeviceCategory]);

  const modelOptions = useMemo((): DropdownOption[] => {
    if (!selectedProduct) return [];
    const map = new Map<number, string>();
    faqs
      .filter((f) => f.product_id === selectedProduct && f.product_model)
      .forEach((f) => {
        map.set(
          f.product_model!.product_model_id,
          f.product_model!.product_model_name,
        );
      });
    if (map.size === 0) return [];
    return [
      { label: "Todos los modelos", value: null },
      ...Array.from(map.entries()).map(([id, name]) => ({
        label: name,
        value: id,
      })),
    ];
  }, [faqs, selectedProduct]);

  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      if (selectedCategory && f.category_id !== selectedCategory) return false;
      if (selectedProduct && f.product_id !== selectedProduct) return false;
      if (selectedModel && f.product_model_id !== selectedModel) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.faq_question.toLowerCase().includes(q) ||
          f.faq_answer.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [faqs, selectedCategory, selectedProduct, selectedModel, search]);

  const totalPages = Math.ceil(filteredFaqs.length / PAGE_SIZE);

  const paginatedFaqs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFaqs.slice(start, start + PAGE_SIZE);
  }, [filteredFaqs, currentPage]);

  const activeCount = [selectedCategory, selectedProduct, selectedModel].filter(
    Boolean,
  ).length;

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSelectedModel(null);
  };

  const selectCategory = (id: number) => {
    if (selectedCategory === id) {
      clearFilters();
      return;
    }
    setSelectedCategory(id);
    setSelectedProduct(null);
    setSelectedModel(null);
  };

  const breadcrumb = useMemo(() => {
    const parts: string[] = [];
    if (selectedCategory)
      parts.push(categories.find((c) => c.id === selectedCategory)?.name ?? "");
    if (selectedProduct)
      parts.push(
        productOptions.find((o) => o.value === selectedProduct)?.label ?? "",
      );
    if (selectedModel)
      parts.push(
        modelOptions.find((o) => o.value === selectedModel)?.label ?? "",
      );
    return parts;
  }, [
    selectedCategory,
    selectedProduct,
    selectedModel,
    categories,
    productOptions,
    modelOptions,
  ]);

  const toggle = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const goToPage = (p: number) => {
    setCurrentPage(p);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = useCallback((e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const scrollY = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;

    if (maxScroll <= 10) return;

    const nearBottom = scrollY >= maxScroll - 50;
    const atBottom = scrollY >= maxScroll - 4;

    if (nearBottom && !atBottom && !arrowVisible.current) {
      arrowVisible.current = true;
      startArrow();
    } else if (!nearBottom && arrowVisible.current) {
      arrowVisible.current = false;
      stopArrow();
    }

    if (atBottom && !ctaVisible.current) {
      ctaVisible.current = true;
      if (arrowVisible.current) {
        arrowVisible.current = false;
        stopArrow();
      }
      Animated.spring(ctaAnim, {
        toValue: 1,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    } else if (!nearBottom && ctaVisible.current) {
      ctaVisible.current = false;
      Animated.spring(ctaAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  }, []);

  const ctaTranslateY = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const ctaOpacity = ctaAnim;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#3C6034" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + 220 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={width * 0.05} color="#999" />
          <TextInput
            style={s.searchInput}
            placeholder="Busca tu pregunta aquí..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        <View style={s.filterCard}>
          <TouchableOpacity
            style={s.filterHeader}
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setFilterOpen((p) => !p);
            }}
            activeOpacity={0.8}
          >
            <View
              style={[s.filterIconBg, activeCount > 0 && s.filterIconBgActive]}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={20}
                color={activeCount > 0 ? "#fff" : "#3C6034"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.filterTitle}>Filtrar preguntas</Text>
              <Text style={s.filterSub}>
                {activeCount > 0
                  ? `${activeCount} filtro${activeCount > 1 ? "s" : ""} activo${activeCount > 1 ? "s" : ""}`
                  : "Por categoría, dispositivo o modelo"}
              </Text>
            </View>
            <Ionicons
              name={filterOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#555"
            />
          </TouchableOpacity>

          {filterOpen && (
            <View style={s.filterBody}>
              <Text style={s.filterLabel}>Categoría</Text>
              <View style={s.catRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      s.catBtn,
                      selectedCategory === cat.id && s.catBtnActive,
                    ]}
                    onPress={() => selectCategory(cat.id)}
                    activeOpacity={0.8}
                  >
                    {cat.name.toLowerCase().includes("dispositivo") ? (
                      <MaterialCommunityIcons
                        name="monitor"
                        size={15}
                        color={selectedCategory === cat.id ? "#fff" : "#555"}
                      />
                    ) : (
                      <Ionicons
                        name="bulb-outline"
                        size={15}
                        color={selectedCategory === cat.id ? "#fff" : "#555"}
                      />
                    )}
                    <Text
                      style={[
                        s.catBtnText,
                        selectedCategory === cat.id && s.catBtnTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    <View
                      style={[
                        s.catCount,
                        selectedCategory === cat.id && s.catCountActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.catCountText,
                          selectedCategory === cat.id && s.catCountTextActive,
                        ]}
                      >
                        {cat.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedCategory && (
                <Dropdown
                  label={isDeviceCategory ? "Dispositivo" : "Solución"}
                  options={productOptions}
                  selected={selectedProduct}
                  onSelect={(v) => {
                    setSelectedProduct(v);
                    setSelectedModel(null);
                  }}
                  placeholder={
                    isDeviceCategory
                      ? "Todos los dispositivos"
                      : "Todas las soluciones"
                  }
                />
              )}
              {selectedProduct && modelOptions.length > 1 && (
                <Dropdown
                  label="Modelo"
                  options={modelOptions}
                  selected={selectedModel}
                  onSelect={setSelectedModel}
                  placeholder="Todos los modelos"
                />
              )}
              {activeCount > 0 && (
                <TouchableOpacity
                  style={s.clearBtn}
                  onPress={clearFilters}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={16}
                    color="#E53E3E"
                  />
                  <Text style={s.clearBtnText}>Limpiar todos los filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {breadcrumb.length > 0 && (
          <View style={s.breadcrumbRow}>
            {breadcrumb.map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={s.breadSep}> › </Text>}
                <Text style={s.breadItem}>{part}</Text>
              </React.Fragment>
            ))}
          </View>
        )}
        {(breadcrumb.length > 0 || search) && (
          <Text style={s.resultCount}>
            {filteredFaqs.length} resultado
            {filteredFaqs.length !== 1 ? "s" : ""} encontrado
            {filteredFaqs.length !== 1 ? "s" : ""}
          </Text>
        )}

        {paginatedFaqs.length === 0 ? (
          <View style={s.empty}>
            <FontAwesome5 name="question-circle" size={48} color="#ddd" />
            <Text style={s.emptyText}>No se encontraron preguntas</Text>
            <Text style={s.emptySub}>
              Intenta con otros filtros o términos de búsqueda.
            </Text>
          </View>
        ) : (
          paginatedFaqs.map((faq) => {
            const expanded = expandedId === faq.faq_id;
            return (
              <View
                key={faq.faq_id}
                style={[s.faqCard, expanded && s.faqCardExpanded]}
              >
                <TouchableOpacity
                  style={s.faqHeader}
                  onPress={() => toggle(faq.faq_id)}
                  activeOpacity={0.8}
                >
                  <View style={[s.faqIconBg, expanded && s.faqIconBgActive]}>
                    <FontAwesome5
                      name="question"
                      size={14}
                      color={expanded ? "#fff" : "#3C6034"}
                    />
                  </View>
                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text
                      style={s.faqQuestion}
                      numberOfLines={expanded ? undefined : 2}
                    >
                      {faq.faq_question}
                    </Text>
                    <View style={s.tagRow}>
                      <View style={s.tagCat}>
                        <Text style={s.tagCatText}>
                          {faq.product.product_name}
                        </Text>
                      </View>
                      {faq.product_model && (
                        <View style={s.tagModel}>
                          <Text style={s.tagModelText}>
                            {faq.product_model.product_model_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#999"
                  />
                </TouchableOpacity>

                {expanded && (
                  <View style={s.faqBody}>
                    <View style={s.divider} />
                    <Text style={s.faqAnswer}>{faq.faq_answer}</Text>
                    {faq.faq_video_url && (
                      <TouchableOpacity
                        style={s.videoBtn}
                        onPress={() => Linking.openURL(faq.faq_video_url)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="open-outline"
                          size={15}
                          color="#3C6034"
                        />
                        <Text style={s.videoBtnText}>Video Referencia</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View
          onLayout={(e) => {
            paginationY.current = e.nativeEvent.layout.y;
          }}
        >
          <Pagination
            current={currentPage}
            total={totalPages}
            onPage={goToPage}
          />
        </View>
      </ScrollView>

      <Animated.View
        style={[
          s.arrowHint,
          { bottom: insets.bottom + 200 },
          { opacity: arrowAnim, transform: [{ translateY: arrowBounce }] },
        ]}
        pointerEvents="none"
      >
        <View style={s.arrowPill}>
          <Ionicons name="chevron-up" size={18} color="#3C6034" />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          s.ctaBanner,
          { bottom: insets.bottom + 130 },
          { opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }] },
        ]}
        pointerEvents={ctaVisible.current ? "auto" : "none"}
      >
        <View style={s.ctaIconBg}>
          <Ionicons name="flash" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.ctaTitle}>¿No encontraste respuesta?</Text>
          <Text style={s.ctaSub}>Crea un ticket y te ayudamos</Text>
        </View>
        <TouchableOpacity
          style={s.ctaBtn}
          onPress={() => navigation.navigate("nuevo")}
          activeOpacity={0.85}
        >
          <Text style={s.ctaBtnText}>Crear ticket</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
