import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { SectionAnalysis, RiskLevel } from '@/utils/aiService';

interface SectionCardProps {
  section: SectionAnalysis;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function SectionCard({ section, isExpanded, onToggle }: SectionCardProps) {
  const { isDarkMode } = useThemeStore();
  
  const themeColors = isDarkMode ? {
    background: colors.darkSecondary,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    border: colors.darkBorder,
    card: colors.darkBackground,
  } : {
    background: 'white',
    text: colors.text,
    textLight: colors.textLight,
    border: colors.border,
    card: colors.secondary,
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return colors.riskHigh;
      case 'medium':
        return colors.riskMedium;
      case 'low':
        return colors.riskLow;
      default:
        return colors.textLight;
    }
  };

  const getRiskIcon = (risk: RiskLevel) => {
    const color = getRiskColor(risk);
    switch (risk) {
      case 'high':
        return <AlertTriangle size={16} color={color} />;
      case 'medium':
        return <AlertCircle size={16} color={color} />;
      case 'low':
        return <CheckCircle size={16} color={color} />;
      default:
        return null;
    }
  };

  const getRiskBackgroundColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return isDarkMode ? colors.riskHigh + '20' : colors.riskHighLight;
      case 'medium':
        return isDarkMode ? colors.riskMedium + '20' : colors.riskMediumLight;
      case 'low':
        return isDarkMode ? colors.riskLow + '20' : colors.riskLowLight;
      default:
        return themeColors.card;
    }
  };

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: themeColors.background,
        borderColor: themeColors.border,
      }
    ]}>
      <TouchableOpacity
        style={[
          styles.header,
          { backgroundColor: getRiskBackgroundColor(section.risk) }
        ]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.riskIndicator}>
            {getRiskIcon(section.risk)}
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.heading, { color: themeColors.text }]}>
              {section.heading}
            </Text>
            <Text style={[styles.category, { color: themeColors.textLight }]}>
              {section.category}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {isExpanded ? (
            <ChevronUp size={20} color={themeColors.textLight} />
          ) : (
            <ChevronDown size={20} color={themeColors.textLight} />
          )}
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          {/* AI Summary */}
          <View style={[
            styles.summaryContainer,
            { 
              backgroundColor: themeColors.card,
              borderColor: themeColors.border 
            }
          ]}>
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryLabel, { color: themeColors.textLight }]}>
                AI Summary
              </Text>
              <Text style={[styles.confidence, { color: themeColors.textLight }]}>
                Confidence: {Math.round(section.confidence * 100)}%
              </Text>
            </View>
            <Text style={[styles.summary, { color: themeColors.text }]}>
              {section.summary}
            </Text>
            {section.tooltip && (
              <View style={[
                styles.tooltip,
                { 
                  backgroundColor: getRiskBackgroundColor(section.risk),
                  borderLeftColor: getRiskColor(section.risk)
                }
              ]}>
                <Text style={[styles.tooltipText, { color: themeColors.text }]}>
                  ⚠️ {section.tooltip}
                </Text>
              </View>
            )}
          </View>

          {/* Original Text */}
          <View style={styles.originalContainer}>
            <Text style={[styles.originalLabel, { color: themeColors.textLight }]}>
              Original Text
            </Text>
            <Text style={[styles.originalText, { color: themeColors.text }]}>
              {section.originalText}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riskIndicator: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerRight: {
    marginLeft: 12,
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  summaryContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidence: {
    fontSize: 12,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  tooltip: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  tooltipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  originalContainer: {
    marginTop: 8,
  },
  originalLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});