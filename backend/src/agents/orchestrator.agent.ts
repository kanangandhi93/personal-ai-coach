import { 
  AgentType, 
  LifecycleStage, 
  LearningGoal, 
  LearningPathMode,
  OrchestratorDecision 
} from '@coach/shared';
import { GoalsRepository } from '../db/repositories/goals.repository';

export class LearningOrchestrator {
  private static stageAgentMap: Record<LifecycleStage, { agent: AgentType; title: string }> = {
    [LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT]: {
      agent: AgentType.EXAM_INTERVIEW,
      title: 'Prerequisite Assessment & Diagnostic'
    },
    [LifecycleStage.STAGE_2_BASIC_CONCEPTS]: {
      agent: AgentType.TEACHER,
      title: 'Basic Concepts & Terminology'
    },
    [LifecycleStage.STAGE_3_FUNDAMENTALS]: {
      agent: AgentType.TEACHER,
      title: 'Core Fundamentals & Mental Models'
    },
    [LifecycleStage.STAGE_4_CORE_UNDERSTANDING]: {
      agent: AgentType.TEACHER,
      title: 'Deep Core Understanding'
    },
    [LifecycleStage.STAGE_5_ADVANCED_CONCEPTS]: {
      agent: AgentType.TEACHER,
      title: 'Advanced Idioms & Patterns'
    },
    [LifecycleStage.STAGE_6_INTERNAL_ARCHITECTURE]: {
      agent: AgentType.TEACHER,
      title: 'Internal Architecture & Engine Mechanics'
    },
    [LifecycleStage.STAGE_7_EDGE_CASES_LIMITATIONS]: {
      agent: AgentType.TEACHER,
      title: 'Edge Cases, Gotchas & Limitations'
    },
    [LifecycleStage.STAGE_8_GUIDED_PRACTICE]: {
      agent: AgentType.PRACTICE,
      title: 'Guided Problem Solving & Progressive Hints'
    },
    [LifecycleStage.STAGE_9_INDEPENDENT_PRACTICE]: {
      agent: AgentType.PRACTICE,
      title: 'Independent Challenge Work'
    },
    [LifecycleStage.STAGE_10_PRACTICAL_APPLICATION]: {
      agent: AgentType.PRACTICAL,
      title: 'Real-World Hands-on Lab Project'
    },
    [LifecycleStage.STAGE_11_THEORY_EXAM]: {
      agent: AgentType.EXAM_INTERVIEW,
      title: 'Comprehensive Theory Exam'
    },
    [LifecycleStage.STAGE_12_INTERVIEW_VIVA]: {
      agent: AgentType.EXAM_INTERVIEW,
      title: 'Simulated Technical Interview & Viva'
    },
    [LifecycleStage.STAGE_13_PRACTICAL_EXAM]: {
      agent: AgentType.PRACTICAL,
      title: 'Time-Constrained Practical Benchmark'
    },
    [LifecycleStage.STAGE_14_FINAL_EVALUATION]: {
      agent: AgentType.EVALUATOR,
      title: 'Final Mastery Multi-Evidence Evaluation'
    },
    [LifecycleStage.STAGE_15_REVISION_MASTERY_VERIFICATION]: {
      agent: AgentType.EVALUATOR,
      title: 'Spaced Repetition & Long-Term Retention Verification'
    }
  };

  /**
   * Route to the minimal necessary agent for the current stage,
   * conserving tokens and strictly avoiding wasted LLM calls.
   */
  public static async evaluateNextAction(goal: LearningGoal): Promise<OrchestratorDecision> {
    const stageInfo = this.stageAgentMap[goal.currentStage] || {
      agent: AgentType.TEACHER,
      title: `Stage ${goal.currentStage}`
    };

    let allowedActions: string[] = ['continue_lesson', 'request_doubt_solving', 'view_curriculum'];

    if (stageInfo.agent === AgentType.PRACTICE) {
      allowedActions = ['start_practice_exercise', 'request_hint', 'submit_solution'];
    } else if (stageInfo.agent === AgentType.EXAM_INTERVIEW) {
      allowedActions = ['start_assessment', 'submit_answers', 'review_results'];
    } else if (stageInfo.agent === AgentType.PRACTICAL) {
      allowedActions = ['view_lab_instructions', 'submit_code_solution'];
    } else if (stageInfo.agent === AgentType.EVALUATOR) {
      allowedActions = ['generate_mastery_report', 'verify_retention'];
    }

    return {
      goalId: goal.id,
      currentStage: goal.currentStage,
      stageTitle: stageInfo.title,
      recommendedAgent: stageInfo.agent,
      allowedActions,
      isOverrideAllowed: true,
      explanation: `Current learning milestone is at Stage ${goal.currentStage} (${stageInfo.title}). Delegating to ${stageInfo.agent} agent to minimize token overhead.`
    };
  }

  /**
   * Allows learner to explicitly override the current stage or jump forward/backward.
   */
  public static async overrideStage(goalId: string, targetStage: LifecycleStage, userId: string, reason?: string): Promise<LearningGoal> {
    const goal = await GoalsRepository.getGoalById(goalId, userId);
    if (!goal) {
      throw new Error(`Learning goal ${goalId} not found`);
    }

    const updated = await GoalsRepository.updateGoal(goalId, {
      currentStage: targetStage,
      metadata: {
        ...goal.metadata,
        lastStageOverride: {
          previousStage: goal.currentStage,
          targetStage,
          timestamp: new Date().toISOString(),
          reason: reason || 'Learner manual navigation override'
        }
      }
    }, userId);

    if (!updated) {
      throw new Error('Failed to update stage override');
    }

    return updated;
  }

  /**
   * Transition to next logical stage based on path mode (Full vs Compact)
   */
  public static async advanceStage(goalId: string, userId: string): Promise<LearningGoal> {
    const goal = await GoalsRepository.getGoalById(goalId, userId);
    if (!goal) throw new Error(`Goal ${goalId} not found`);

    let nextStage: LifecycleStage;

    if (goal.pathMode === LearningPathMode.COMPACT_REVISION) {
      // Compact jumps: 1 -> 3 -> 4 -> 8 -> 11 -> 15
      switch (goal.currentStage) {
        case LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT:
          nextStage = LifecycleStage.STAGE_3_FUNDAMENTALS;
          break;
        case LifecycleStage.STAGE_3_FUNDAMENTALS:
          nextStage = LifecycleStage.STAGE_4_CORE_UNDERSTANDING;
          break;
        case LifecycleStage.STAGE_4_CORE_UNDERSTANDING:
          nextStage = LifecycleStage.STAGE_8_GUIDED_PRACTICE;
          break;
        case LifecycleStage.STAGE_8_GUIDED_PRACTICE:
          nextStage = LifecycleStage.STAGE_11_THEORY_EXAM;
          break;
        case LifecycleStage.STAGE_11_THEORY_EXAM:
          nextStage = LifecycleStage.STAGE_15_REVISION_MASTERY_VERIFICATION;
          break;
        default:
          nextStage = Math.min(15, goal.currentStage + 1) as LifecycleStage;
      }
    } else {
      nextStage = Math.min(15, goal.currentStage + 1) as LifecycleStage;
    }

    const updated = await GoalsRepository.updateGoal(goalId, {
      currentStage: nextStage
    }, userId);

    return updated!;
  }
}
