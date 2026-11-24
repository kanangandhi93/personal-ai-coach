import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Goal {
  id: string;
  title: string;
  currentStage: number;
  currentMasteryLevel: string;
  targetMasteryLevel: string;
}

interface TeacherData {
  title: string;
  overview: string;
  whyWhenWhere: string;
  internalMechanisms: string;
  codeSnippets: Array<{ language: string; code: string; explanation: string }>;
  edgeCasesAndLimitations: string[];
}

export default function App() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'g-1',
      title: 'TypeScript Architecture & Mastery',
      currentStage: 2,
      currentMasteryLevel: 'L1',
      targetMasteryLevel: 'L6'
    }
  ]);
  const [activeGoal, setActiveGoal] = useState<Goal>(goals[0]);
  const [teacherData, setTeacherData] = useState<TeacherData | null>({
    title: 'Foundations & Mental Models',
    overview: 'Structural typing creates a contract based on shape rather than declared name.',
    whyWhenWhere: 'Why: Guarantees compile-time safety across complex microservice boundaries.',
    internalMechanisms: 'Typechecker performs structural subtype recursion, validating property descriptors in O(N).',
    codeSnippets: [
      {
        language: 'typescript',
        code: 'type Result<T> = { ok: true; value: T } | { ok: false; error: Error };',
        explanation: 'Discriminated union pattern ensuring exhaustive pattern matching.'
      }
    ],
    edgeCasesAndLimitations: [
      'Excess property checks are disabled when assigning object literals through intermediaries.'
    ]
  });

  const advanceStage = () => {
    setActiveGoal(prev => ({
      ...prev,
      currentStage: Math.min(15, prev.currentStage + 1)
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Learning Coach</Text>
          <Text style={styles.subtitle}>Autonomous Multi-Agent Teaching</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>₹0 Budget Active</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2GB RAM Guardrail</Text>
            </View>
          </View>
        </View>

        {/* Goal Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Active Learning Goal</Text>
          <Text style={styles.goalTitle}>{activeGoal.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Stage {activeGoal.currentStage} of 15</Text>
            <Text style={styles.masteryText}>{activeGoal.currentMasteryLevel} → {activeGoal.targetMasteryLevel}</Text>
          </View>

          <TouchableOpacity style={styles.stageButton} onPress={advanceStage}>
            <Text style={styles.stageButtonText}>Advance to Stage {activeGoal.currentStage + 1}</Text>
          </TouchableOpacity>
        </View>

        {/* Teacher Agent Explanation */}
        {teacherData && (
          <View style={styles.lessonCard}>
            <Text style={styles.lessonHeader}>Teacher Agent: {teacherData.title}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Intuition & Overview</Text>
              <Text style={styles.sectionText}>{teacherData.overview}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Why, When & Where</Text>
              <Text style={styles.sectionText}>{teacherData.whyWhenWhere}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Internal Architecture</Text>
              <Text style={styles.sectionText}>{teacherData.internalMechanisms}</Text>
            </View>

            {teacherData.codeSnippets.map((cs, idx) => (
              <View key={idx} style={styles.codeBlock}>
                <Text style={styles.codeSnippet}>{cs.code}</Text>
                <Text style={styles.codeExplanation}>{cs.explanation}</Text>
              </View>
            ))}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Edge Cases</Text>
              {teacherData.edgeCasesAndLimitations.map((ec, idx) => (
                <Text key={idx} style={styles.sectionText}>• {ec}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scroll: {
    padding: 18,
  },
  header: {
    marginBottom: 20,
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#38bdf8',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  goalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  masteryText: {
    fontSize: 12,
    color: '#f59e0b',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  stageButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  stageButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  lessonCard: {
    backgroundColor: '#0b1329',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 20,
  },
  lessonHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#818cf8',
    marginBottom: 12,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  codeBlock: {
    backgroundColor: '#020617',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  codeSnippet: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#6ee7b7',
    marginBottom: 6,
  },
  codeExplanation: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
