import React, { StrictMode, useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Image, Text, Dimensions, } from 'react-native';
import { useRouter } from 'expo-router';

const { height, width } = Dimensions.get('window');

export default function AnimatedLogo() {
  const router = useRouter();

  // Círculo gira
  const circleRotateAnim = useRef(new Animated.Value(0)).current;
  const circleOpacityAnim = useRef(new Animated.Value(1)).current;

  // Logo sale pequeño y crece con rebote
  const iconScaleAnim = useRef(new Animated.Value(0.3)).current;
  const iconOpacityAnim = useRef(new Animated.Value(0)).current;
  const iconTranslateYAnim = useRef(new Animated.Value(80)).current;

  // Nombre aparece
  const nameOpacityAnim = useRef(new Animated.Value(0)).current;
  const nameScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Logo se mueve hacia la izquierda
  const logoTranslateXAnim = useRef(new Animated.Value(0)).current;

  // Animaciones para cada letra
  const letterAnim1 = useRef(new Animated.Value(-300)).current;
  const letterAnim2 = useRef(new Animated.Value(-300)).current;
  const letterAnim3 = useRef(new Animated.Value(-300)).current;
  const letterAnim4 = useRef(new Animated.Value(-300)).current;
  const letterAnim5 = useRef(new Animated.Value(-300)).current;
  const letterAnim6 = useRef(new Animated.Value(-300)).current;
  const letterAnim7 = useRef(new Animated.Value(200)).current;
  const letterAnim8 = useRef(new Animated.Value(200)).current;
  const letterAnim9 = useRef(new Animated.Value(200)).current;
  const letterAnim10 = useRef(new Animated.Value(200)).current;
  const letterAnim11 = useRef(new Animated.Value(200)).current;
  const letterAnim12 = useRef(new Animated.Value(200)).current;
  const letterAnim13 = useRef(new Animated.Value(200)).current;
  const letterAnim14 = useRef(new Animated.Value(200)).current;
  const letterAnim15 = useRef(new Animated.Value(200)).current;
  const letterAnim16 = useRef(new Animated.Value(200)).current;
  const letterAnim17 = useRef(new Animated.Value(200)).current;
  const letterAnim18 = useRef(new Animated.Value(200)).current;
  const letterAnim19 = useRef(new Animated.Value(200)).current;
  const letterAnim20 = useRef(new Animated.Value(200)).current;
  const letterAnim21 = useRef(new Animated.Value(200)).current;
  const letterAnim22 = useRef(new Animated.Value(200)).current;
  const letterAnim23 = useRef(new Animated.Value(200)).current;
  const letterAnim24 = useRef(new Animated.Value(200)).current;
  const letterAnim25 = useRef(new Animated.Value(200)).current;
  const letterAnim26 = useRef(new Animated.Value(200)).current;
  const letterAnim27 = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    Animated.sequence([
      // Fase 1-4: Círculo gira y logo sale
      Animated.parallel([
        Animated.timing(circleRotateAnim, {
          toValue: 1,
          duration: 1500,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacityAnim, {
          toValue: 1,
          duration: 300,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 35,
          delay: 1500,
          useNativeDriver: true,
        }),
        Animated.spring(iconTranslateYAnim, {
          toValue: -150,
          friction: 5,
          tension: 35,
          delay: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(circleOpacityAnim, {
          toValue: 0,
          duration: 700,
          delay: 1300,
          useNativeDriver: true,
        }),
      ]),

      // Fase 5: Logo se empequeñece y sube
      Animated.parallel([
        Animated.timing(iconScaleAnim, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(iconTranslateYAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(logoTranslateXAnim, {
        toValue: -200,  // Ajusta este valor para mover más o menos
        duration: 500,
        useNativeDriver: true,
      }),

      // Fase 6: Nombre aparece
      Animated.parallel([
        Animated.timing(nameOpacityAnim, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.spring(nameScaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Fase 7: Letras aparecen una por una
      Animated.stagger(50, [
        Animated.timing(letterAnim1, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim2, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim3, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim4, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim5, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim6, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),

      Animated.parallel([
        Animated.timing(letterAnim7, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim8, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim9, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim10, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim11, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim12, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim13, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim14, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim15, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim16, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim17, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim18, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim19, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim20, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim21, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim22, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim23, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim24, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim25, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim26, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(letterAnim27, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      router.push('/auth/login');
    });
  }, );

  const circleRotate = circleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <StrictMode>
      <View style={styles.container}>
        {/* Círculo que gira y desaparece */}
        <View style={styles.circleContainer}>
          <Animated.Image
            source={require('@/assets/images/circle.png')}
            style={[
              styles.circleImage,
              {
                transform: [
                  { rotate: circleRotate },
                ],
                opacity: circleOpacityAnim,
              },
            ]}
            resizeMode="contain"
          />
          <Animated.View
            style={[
              styles.nameContainer,
              {
                transform: [{ scale: nameScaleAnim }],
                opacity: nameOpacityAnim,
              },
            ]}
          >
            <Animated.View style={{ flexDirection: 'row', overflow: 'hidden' }}>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim1 }], opacity: nameOpacityAnim }]}>T</Animated.Text>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim2 }], opacity: nameOpacityAnim }]}>B</Animated.Text>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim3 }], opacity: nameOpacityAnim }]}>O</Animated.Text>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim4 }], opacity: nameOpacityAnim }]}>X</Animated.Text>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim5 }], opacity: nameOpacityAnim }]}>S</Animated.Text>
              <Animated.Text style={[styles.mainTittle, { transform: [{ translateX: letterAnim6 }], opacity: nameOpacityAnim }]}>A</Animated.Text>
            </Animated.View>
            <Animated.View style={{ flexDirection: 'row', overflow: 'hidden' }}>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim7 }], opacity: nameOpacityAnim }]}>T</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim8 }], opacity: nameOpacityAnim }]}>H</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim9 }], opacity: nameOpacityAnim }]}>I</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim10 }], opacity: nameOpacityAnim }]}>N</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim11 }], opacity: nameOpacityAnim }]}>K</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim12 }], opacity: nameOpacityAnim }]}> </Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim13 }], opacity: nameOpacityAnim }]}>O</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim14 }], opacity: nameOpacityAnim }]}>U</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim15 }], opacity: nameOpacityAnim }]}>T</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim16 }], opacity: nameOpacityAnim }]}>S</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim17 }], opacity: nameOpacityAnim }]}>I</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim18 }], opacity: nameOpacityAnim }]}>D</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim19 }], opacity: nameOpacityAnim }]}>E</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim20 }], opacity: nameOpacityAnim }]}> </Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim21 }], opacity: nameOpacityAnim }]}>T</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim22 }], opacity: nameOpacityAnim }]}>H</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim23 }], opacity: nameOpacityAnim }]}>E</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim24 }], opacity: nameOpacityAnim }]}> </Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim25 }], opacity: nameOpacityAnim }]}>B</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim26 }], opacity: nameOpacityAnim }]}>O</Animated.Text>
              <Animated.Text style={[styles.subtittle, { transform: [{ translateY: letterAnim27 }], opacity: nameOpacityAnim }]}>X</Animated.Text>
            </Animated.View>
          </Animated.View>

          {/* Logo que sale del círculo con rebote */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [
                  { scale: iconScaleAnim },
                  { translateY: iconTranslateYAnim },
                  { translateX: logoTranslateXAnim },
                ],
                opacity: iconOpacityAnim,
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

        {/* Copyright */}

        <View style={styles.footer}>
          <Text style={styles.copyrightText}>COPYRIGHT © TBOXSA 2026</Text>
        </View>

      </View>
    </StrictMode>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: width * 0.05,
  },
  circleImage: {
    position: 'absolute'
  },
  nameContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginLeft: width * 0.30,
    flex: 1,
  },
  mainTittle: {
    fontSize: width * 0.10,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 1,
    lineHeight: width * 0.09,
    fontFamily: 'MICROGBE',
  },
  subtittle: {
    fontSize: width * 0.03,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 4,
    lineHeight: width * 0.03,
    fontFamily: 'MICROGBE',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginBottom: 0,
    marginRight: 0,
    position: 'absolute'
  },
  icon: {
    width: width * 0.4,
    height: height * 0.22,
  },
  footer: {
    position: 'absolute',
    bottom: height * 0.05,
    width: '100%',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: width * 0.03,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 1,
    fontFamily: 'Poppins-Regular',
  },
});