import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

// Lazy-load the native community slider to avoid errors on web
let NativeSlider: React.ComponentType<any> | null = null;
if (Platform.OS !== 'web') {
  try {
    NativeSlider = require('@react-native-community/slider').default;
  } catch {
    // Package not available – will fall back to non-interactive display
  }
}

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
}

export default function Slider({ value, onValueChange, min, max, step }: SliderProps) {
  const { isDarkMode } = useThemeStore();

  const primaryColor = isDarkMode ? colors.darkPrimary : colors.primary;
  const trackColor = isDarkMode ? colors.darkBorder : colors.border;

  // Web: HTML range input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            onValueChange([newValue]);
          }}
          style={{
            width: '100%',
            height: 40,
            accentColor: primaryColor,
            cursor: 'pointer',
          }}
        />
      </View>
    );
  }

  // Native: Use @react-native-community/slider when available
  if (NativeSlider) {
    return (
      <View style={styles.container}>
        <NativeSlider
          style={{ width: '100%', height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value[0]}
          onValueChange={(v: number) => onValueChange([v])}
          minimumTrackTintColor={primaryColor}
          maximumTrackTintColor={trackColor}
          thumbTintColor={primaryColor}
        />
      </View>
    );
  }

  // Fallback: static visual only (should rarely occur)
  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${((value[0] - min) / (max - min)) * 100}%`,
              backgroundColor: primaryColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  fill: {
    height: '100%',
    position: 'absolute',
    left: 0,
    borderRadius: 2,
  },
});
