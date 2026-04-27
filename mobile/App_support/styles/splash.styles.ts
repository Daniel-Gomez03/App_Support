import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const S = {
  width,
  height,
  LOGO_START_Y: height * 0.095,
  LOGO_PEAK_Y: -(height * 0.178),
  LOGO_FINAL_X: -(width * 0.513),
  LETTER_TITLE_START: -(width * 0.77),
  LETTER_SUB_START: height * 0.237,
};

export const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1C0D',
    justifyContent: 'center',
    alignItems: 'center',
  },

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
    width: width * 0.78,
    height: width * 0.78,
  },


  nameContainer: {
    marginLeft: width * 0.30,
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
    fontSize: width * 0.10,
    lineHeight: width * 0.09,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 1,
    fontFamily: 'MICROGBE',
  },

  subtitle: {
    fontSize: width * 0.03,
    lineHeight: width * 0.03,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginTop: 4,
    fontFamily: 'MICROGBE',
  },

  iconWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  icon: {
    width: width * 0.40,
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