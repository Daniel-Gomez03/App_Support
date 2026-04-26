import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Constantes proporcionales calibradas para que coincidan con el comportamiento
// original en un iPhone estándar (390×844px)
export const S = {
  width,
  height,
  // Logo cae desde abajo (fase 1) y luego vuelve al centro (fase 2)
  LOGO_START_Y:    height * 0.095,   // ≈  80px en 844px alto
  LOGO_PEAK_Y:    -(height * 0.178), // ≈ -150px en 844px alto
  // Logo se mueve a la izquierda (fase 3)
  LOGO_FINAL_X:   -(width  * 0.513), // ≈ -200px en 390px ancho
  // Letras del título entran desde la izquierda
  LETTER_TITLE_START: -(width * 0.77),  // ≈ -300px en 390px
  // Letras del subtítulo entran desde abajo
  LETTER_SUB_START:    height * 0.237,  // ≈  200px en 844px
};

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C0D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Área central ──────────────────────────────────
  circleContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },

  circleImage: {
    position: 'absolute',
    width:  width  * 0.78,
    height: width  * 0.78,   // cuadrado proporcional
  },

  // ── Texto del nombre ──────────────────────────────
  nameContainer: {
    marginLeft: width * 0.30,  // valor original
    flex: 1,
    alignItems: 'flex-start',
  },

  titleRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },

  subtitleRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: height * 0.005,
  },

  mainTitle: {
    fontSize:      width * 0.10,
    lineHeight:    width * 0.09,
    fontWeight:    '500',
    color:         '#ffffff',
    letterSpacing: 1,
    fontFamily:    'MICROGBE',
  },

  subtitle: {
    fontSize:      width * 0.03,
    lineHeight:    width * 0.03,
    fontWeight:    '500',
    color:         '#ffffff',
    letterSpacing: 0.5,
    marginTop:     4,
    fontFamily:    'MICROGBE',
  },

  // ── Logo/ícono ────────────────────────────────────
  iconWrapper: {
    position:   'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  icon: {
    width:  width  * 0.40,
    height: height * 0.22,
  },

  // ── Footer ───────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom:   height * 0.05,
    width:    '100%',
    alignItems: 'center',
  },

  copyrightText: {
    fontSize:      width * 0.03,
    color:         '#ffffff',
    fontWeight:    '600',
    letterSpacing: 1,
    fontFamily:    'Poppins-Regular',
  },
});