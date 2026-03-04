const colors = {
  primary: '#6366F1', // indigo-600
  primaryDark: '#4F46E5', // indigo-700
  primaryLight: '#A5B4FC', // indigo-300
  secondary: '#F9FAFB', // gray-50
  accent: '#818CF8', // indigo-400
  background: '#FFFFFF',
  text: '#111827', // gray-900
  textLight: '#6B7280', // gray-500
  border: '#E5E7EB', // gray-200
  error: '#EF4444', // red-500
  success: '#10B981', // emerald-500
  warning: '#F59E0B', // amber-500
  
  // Dark theme colors
  darkPrimary: '#818CF8', // indigo-400
  darkPrimaryLight: '#C7D2FE', // indigo-200
  darkBackground: '#1F2937', // gray-800
  darkSecondary: '#374151', // gray-700
  darkText: '#F9FAFB', // gray-50
  darkTextLight: '#9CA3AF', // gray-400
  darkBorder: '#4B5563', // gray-600
  
  // Risk level colors
  riskLow: '#10B981', // emerald-500
  riskMedium: '#F59E0B', // amber-500
  riskHigh: '#EF4444', // red-500
  riskLowLight: '#D1FAE5', // emerald-100
  riskMediumLight: '#FEF3C7', // amber-100
  riskHighLight: '#FEE2E2', // red-100

  // Annotation highlight colors
  highlightYellow: '#FBBF24', // amber-400
  highlightGreen: '#34D399', // emerald-400
  highlightBlue: '#60A5FA', // blue-400
  highlightPink: '#F472B6', // pink-400
  highlightYellowLight: '#FEF9C3', // amber-100
  highlightGreenLight: '#D1FAE5', // emerald-100
  highlightBlueLight: '#DBEAFE', // blue-100
  highlightPinkLight: '#FCE7F3', // pink-100
};

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export const highlightColorMap: Record<HighlightColor, { bg: string; bgLight: string }> = {
  yellow: { bg: colors.highlightYellow, bgLight: colors.highlightYellowLight },
  green: { bg: colors.highlightGreen, bgLight: colors.highlightGreenLight },
  blue: { bg: colors.highlightBlue, bgLight: colors.highlightBlueLight },
  pink: { bg: colors.highlightPink, bgLight: colors.highlightPinkLight },
};

export default colors;
