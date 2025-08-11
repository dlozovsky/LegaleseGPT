import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AlertTriangle, CheckCircle, AlertCircle, FileText } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/hooks/useThemeStore';
import { ContractAnalysis, RiskLevel } from '@/utils/aiService';

interface ContractOverviewProps {
  analysis: ContractAnalysis;
}

export default function ContractOverview({ analysis }: ContractOverviewProps) {
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
        return <AlertTriangle size={20} color={color} />;
      case 'medium':
        return <AlertCircle size={20} color={color} />;
      case 'low':
        return <CheckCircle size={20} color={color} />;
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

  const getRiskLabel = (risk: RiskLevel) => {
    switch (risk) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      default:
        return 'Unknown Risk';
    }
  };

  const riskCounts = analysis.sections.reduce(
    (acc, section) => {
      acc[section.risk]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: themeColors.background,
        borderColor: themeColors.border,
      }
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FileText size={24} color={isDarkMode ? colors.darkPrimary : colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Contract Analysis
            </Text>
            <Text style={[styles.documentType, { color: themeColors.textLight }]}>
              {analysis.documentType}
            </Text>
          </View>
        </View>
        <View style={[
          styles.overallRisk,
          { backgroundColor: getRiskBackgroundColor(analysis.overallRisk) }
        ]}>
          {getRiskIcon(analysis.overallRisk)}
          <Text style={[
            styles.overallRiskText,
            { color: getRiskColor(analysis.overallRisk) }
          ]}>
            {getRiskLabel(analysis.overallRisk)}
          </Text>
        </View>
      </View>

      {/* Risk Summary */}
      <View style={[
        styles.riskSummary,
        { 
          backgroundColor: themeColors.card,
          borderColor: themeColors.border 
        }
      ]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Risk Breakdown
        </Text>
        <View style={styles.riskCounts}>
          <View style={styles.riskCount}>
            <CheckCircle size={16} color={colors.riskLow} />
            <Text style={[styles.riskCountText, { color: themeColors.text }]}>
              {riskCounts.low} Low
            </Text>
          </View>
          <View style={styles.riskCount}>
            <AlertCircle size={16} color={colors.riskMedium} />
            <Text style={[styles.riskCountText, { color: themeColors.text }]}>
              {riskCounts.medium} Medium
            </Text>
          </View>
          <View style={styles.riskCount}>
            <AlertTriangle size={16} color={colors.riskHigh} />
            <Text style={[styles.riskCountText, { color: themeColors.text }]}>
              {riskCounts.high} High
            </Text>
          </View>
        </View>
      </View>

      {/* Key Findings */}
      {analysis.keyFindings.length > 0 && (
        <View style={[
          styles.keyFindings,
          { 
            backgroundColor: themeColors.card,
            borderColor: themeColors.border 
          }
        ]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Key Findings
          </Text>
          <ScrollView style={styles.findingsList} showsVerticalScrollIndicator={false}>
            {analysis.keyFindings.map((finding, index) => (
              <View key={index} style={styles.finding}>
                <Text style={[styles.findingBullet, { color: themeColors.textLight }]}>
                  •
                </Text>
                <Text style={[styles.findingText, { color: themeColors.text }]}>
                  {finding}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  documentType: {
    fontSize: 14,
  },
  overallRisk: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  overallRiskText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  riskSummary: {
    padding: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  riskCounts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  riskCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  riskCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  keyFindings: {
    padding: 16,
    borderTopWidth: 1,
  },
  findingsList: {
    maxHeight: 120,
  },
  finding: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  findingBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  findingText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});