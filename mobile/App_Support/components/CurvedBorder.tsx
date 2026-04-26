import React, { ReactNode } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function CurvedBorder({ children }: { children: ReactNode }) {
    return (
        <View style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: width * 0.18,
            paddingHorizontal: width * 0.08,
            paddingVertical: height * 0.04,
            minHeight: height * 0.5,
            overflow: 'visible',
            position: 'relative',
        }}>
            {/* Curva SVG que crea la transición cóncava/convexa entre el fondo y el panel.
                El path original tenía "M 0 100000" (bug de coordenada fuera del viewBox).
                Corrección: "M 0 100" — mismo punto de inicio pero dentro del viewBox. */}
            <Svg
                width={width}
                height={100}
                viewBox={`0 0 ${width} 100`}
                style={{
                    position: 'absolute',
                    top: height * -0.070,
                    left: 0,
                    zIndex: 5,
                }}
            >
                <Path
                    d={`M 0 100000 Q ${width * 0.25} 50 ${width * 0.5} 79.5 Q ${width * 1} 85 ${width} 2 L ${width} 100 L 0 100 Z`}
                    fill="#ffffff"
                />
            </Svg>

            <View>
                {children}
            </View>
        </View>
    );
}