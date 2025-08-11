import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

// Use a web-compatible approach for sliders
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
  
  // For web, use a simple HTML input slider
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

  // For native platforms, use a custom implementation
  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${((value[0] - min) / (max - min)) * 100}%`,
              backgroundColor: primaryColor
            }
          ]} 
        />
        <View 
          style={[
            styles.thumb, 
            { 
              left: `${((value[0] - min) / (max - min)) * 100}%`,
              backgroundColor: primaryColor
            }
          ]} 
        />
      </View>
      <View style={styles.steps}>
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.step,
              { backgroundColor: value[0] >= i + min ? primaryColor : trackColor }
            ]}
          />
        ))}
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
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    top: -8,
    marginLeft: -10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});