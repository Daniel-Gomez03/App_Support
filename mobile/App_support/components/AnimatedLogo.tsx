import React, { useEffect, useRef } from 'react';
import { View, Animated, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { splashStyles as styles, S } from '@/styles/splash.styles';

// ── Contenido del texto ───────────────────────────────────────────────────────
const TITLE_LETTERS    = ['T', 'B', 'O', 'X', 'S', 'A'];
const SUBTITLE_LETTERS = [
  'T','H','I','N','K',' ',
  'O','U','T','S','I','D','E',' ',
  'T','H','E',' ',
  'B','O','X',
];
const TITLE_COUNT    = TITLE_LETTERS.length;    // 6
const SUBTITLE_COUNT = SUBTITLE_LETTERS.length; // 21
const TOTAL_LETTERS  = TITLE_COUNT + SUBTITLE_COUNT;

// ─────────────────────────────────────────────────────────────────────────────

export default function AnimatedLogo() {
  const router = useRouter();

  // Círculo
  const circleRotate  = useRef(new Animated.Value(0)).current;
  const circleOpacity = useRef(new Animated.Value(1)).current;

  // Logo/ícono
  const iconScale     = useRef(new Animated.Value(0.3)).current;
  const iconOpacity   = useRef(new Animated.Value(0)).current;
  const iconY         = useRef(new Animated.Value(S.LOGO_START_Y)).current;
  const iconX         = useRef(new Animated.Value(0)).current;

  // Nombre empresa
  const nameOpacity   = useRef(new Animated.Value(0)).current;
  const nameScale     = useRef(new Animated.Value(0.85)).current;

  // Letras: primeras TITLE_COUNT vienen de izquierda (translateX),
  // el resto vienen de abajo (translateY).
  const letterAnims = useRef(
    Array.from({ length: TOTAL_LETTERS }, (_, i) =>
      new Animated.Value(i < TITLE_COUNT ? S.LETTER_TITLE_START : S.LETTER_SUB_START)
    )
  ).current;

  // Interpolación de rotación del círculo
  const circleRotateDeg = circleRotate.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  useEffect(() => {
    Animated.sequence([

      // ── Fase 1: Círculo gira y se desvanece, logo sube con rebote ──────────
      Animated.parallel([
        Animated.timing(circleRotate, {
          toValue: 1,
          duration: 1500,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 300,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 6,
          tension: 35,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(iconY, {
          toValue: S.LOGO_PEAK_Y,   // sube por encima del centro
          friction: 5,
          tension: 35,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacity, {
          toValue: 0,
          duration: 700,
          delay: 1300,
          useNativeDriver: true,
        }),
      ]),

      // ── Fase 2: Logo se encoge y vuelve al centro ─────────────────────────
      Animated.parallel([
        Animated.timing(iconScale, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(iconY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // ── Fase 3: Logo se desplaza a la izquierda ───────────────────────────
      Animated.timing(iconX, {
        toValue: S.LOGO_FINAL_X,
        duration: 500,
        useNativeDriver: true,
      }),

      // ── Fase 4: Nombre de la empresa aparece ──────────────────────────────
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(nameScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // ── Fase 5: Letras del título entran escalonadas desde la izquierda ───
      Animated.stagger(
        50,
        letterAnims.slice(0, TITLE_COUNT).map(anim =>
          Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true })
        )
      ),

      // ── Fase 6: Subtítulo entra en bloque desde abajo ─────────────────────
      Animated.parallel(
        letterAnims.slice(TITLE_COUNT).map(anim =>
          Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true })
        )
      ),

    ]).start(() => {
      // replace evita que el usuario regrese a la intro con el botón atrás
      router.replace('/auth/login');
    });
  }, []);

  return (
    <View style={styles.container}>

      {/* ── Área central ──────────────────────────────────────────────── */}
      <View style={styles.circleContainer}>

        {/* Círculo giratorio */}
        <Animated.Image
          source={require('@/assets/images/circle.png')}
          style={[
            styles.circleImage,
            {
              transform: [{ rotate: circleRotateDeg }],
              opacity: circleOpacity,
            },
          ]}
          resizeMode="contain"
        />

        {/* Nombre de la empresa */}
        <Animated.View
          style={[
            styles.nameContainer,
            {
              opacity:   nameOpacity,
              transform: [{ scale: nameScale }],
            },
          ]}
        >
          {/* "TBOXSA" — letras entran desde la izquierda */}
          <View style={styles.titleRow}>
            {TITLE_LETTERS.map((letter, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.mainTitle,
                  {
                    opacity:   nameOpacity,
                    transform: [{ translateX: letterAnims[i] }],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>

          {/* "THINK OUTSIDE THE BOX" — letras entran desde abajo */}
          <View style={styles.subtitleRow}>
            {SUBTITLE_LETTERS.map((letter, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.subtitle,
                  {
                    opacity:   nameOpacity,
                    transform: [{ translateY: letterAnims[TITLE_COUNT + i] }],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>

        {/* Logo / ícono */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: iconOpacity,
              transform: [
                { scale:      iconScale },
                { translateY: iconY     },
                { translateX: iconX     },
              ],
            },
          ]}
        >
          <Image
            source={require('@/assets/images/tboxsa-ico.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

      </View>

      {/* ── Copyright ─────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Animated.Text style={styles.copyrightText}>
          COPYRIGHT © TBOXSA 2026
        </Animated.Text>
      </View>

    </View>
  );
}