import React, { useState, useEffect, StrictMode } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, LayoutAnimation, Linking, Dimensions
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { getFAQs } from '@/Services/qaService';
import socket from '@/Services/socket';

const { width } = Dimensions.get('window');

export default function QAScreen() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFAQs();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFaqs(data);
        setFilteredFaqs(data);
      } catch (error) {
        console.error("Error cargando FAQs:", error);
      }
    };

    loadData();

    const handleUpdate = () => loadData();

    socket.on('faq_created', handleUpdate);
    socket.on('faq_updated', handleUpdate);
    socket.on('faq_toggled', handleUpdate);

    const unsubscribeFocus = navigation.addListener('focus', () => loadData());
    const unsubscribeBlur = navigation.addListener('blur', () => setExpandedId(null));

    return () => {
      socket.off('faq_created', handleUpdate);
      socket.off('faq_updated', handleUpdate);
      socket.off('faq_toggled', handleUpdate);

      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = faqs.filter(item =>
      item.faq_question.toLowerCase().includes(text.toLowerCase()) ||
      item.faq_answer.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFaqs(filtered);
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const openVideo = (url: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <StrictMode>
      <View style={styles.mainWrapper}>
        {/* Usamos ScrollView como contenedor principal del flujo para evitar cortes */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={width * 0.05} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Específicanos tú búsqueda"
              placeholderTextColor="#999"
              value={search}
              onChangeText={handleSearch}
            />
          </View>

          {filteredFaqs.map((item) => (
            <View key={item.faq_id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.questionButton}
                onPress={() => toggleExpand(item.faq_id)}
                activeOpacity={0.6}
              >
                <Text style={styles.questionText}>{item.faq_question}</Text>
                <Ionicons
                  name={expandedId === item.faq_id ? "chevron-up" : "chevron-down"}
                  size={width * 0.055}
                  color="black"
                />
              </TouchableOpacity>

              {expandedId === item.faq_id && (
                <View style={styles.answerBox}>
                  <Text style={styles.answerText}>{item.faq_answer}</Text>

                  {item.faq_video_url && (
                    <TouchableOpacity
                      style={styles.videoButton}
                      onPress={() => openVideo(item.faq_video_url)}
                    >
                      <View style={styles.videoIconBg}>
                        <FontAwesome5 name="play" size={width * 0.025} color="white" />
                      </View>
                      <Text style={styles.videoText}>Ver video de referencia</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContent: {
    paddingHorizontal: width * 0.07,
    paddingTop: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: width * 0.07,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    paddingHorizontal: width * 0.04,
    marginBottom: 20,
    height: width * 0.12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: width * 0.035,
    fontFamily: 'Poppins-Regular',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingVertical: width * 0.05,
  },
  questionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: width * 0.038,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    flex: 1,
    paddingRight: 10,
  },
  answerBox: {
    marginTop: 12,
  },
  answerText: {
    fontSize: width * 0.034,
    color: '#4A4A4A',
    lineHeight: width * 0.05,
    fontFamily: 'Poppins-Regular',
    marginBottom: 15
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: width * 0.025,
    paddingHorizontal: width * 0.04,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  videoIconBg: {
    backgroundColor: '#3C6034',
    width: width * 0.055,
    height: width * 0.055,
    borderRadius: (width * 0.055) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  videoText: {
    fontSize: width * 0.031,
    fontFamily: 'Poppins-Bold',
    color: '#3C6034',
  }
});