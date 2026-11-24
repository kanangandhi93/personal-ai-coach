import { z } from 'zod';
import { MasteryLevel, LifecycleStage, LearningPathMode, AssessmentType, AgentType } from '../types';

export const MasteryLevelSchema = z.nativeEnum(MasteryLevel);
export const LifecycleStageSchema = z.nativeEnum(LifecycleStage);
export const LearningPathModeSchema = z.nativeEnum(LearningPathMode);
export const AssessmentTypeSchema = z.nativeEnum(AssessmentType);
export const AgentTypeSchema = z.nativeEnum(AgentType);

export const CreateLearningGoalSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  targetMasteryLevel: MasteryLevelSchema.default(MasteryLevel.L6),
  pathMode: LearningPathModeSchema.default(LearningPathMode.FULL_MASTERY)
});

export const UpdateLearningGoalSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  targetMasteryLevel: MasteryLevelSchema.optional(),
  currentMasteryLevel: MasteryLevelSchema.optional(),
  currentStage: LifecycleStageSchema.optional(),
  pathMode: LearningPathModeSchema.optional(),
  isArchived: z.boolean().optional()
});

export const LLMCompletionRequestSchema = z.object({
  systemPrompt: z.string(),
  userPrompt: z.string(),
  temperature: z.number().min(0).max(1).optional().default(0.2),
  maxTokens: z.number().positive().optional().default(1024),
  responseFormat: z.enum(['text', 'json']).optional().default('text'),
  preferredProvider: z.string().optional()
});

export type LLMCompletionInput = z.input<typeof LLMCompletionRequestSchema>;
export type LLMCompletionRequest = z.infer<typeof LLMCompletionRequestSchema>;

export const LLMStructuredOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  details: z.record(z.any()).optional()
});

// Phase 1 Curriculum Agent Schemas
export const LessonItemSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  stageNumber: z.number().min(1).max(15).default(2),
  orderIndex: z.number().default(0),
  contentMarkdown: z.string().optional(),
  codeSnippets: z.array(z.object({
    language: z.string(),
    code: z.string(),
    explanation: z.string().optional()
  })).optional(),
  diagrams: z.array(z.string()).optional()
});

export const ModuleItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  orderIndex: z.number().default(0),
  estimatedMinutes: z.number().default(60),
  lessons: z.array(LessonItemSchema)
});

export const ConceptItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  prerequisiteConceptIds: z.array(z.string()).default([])
});

export const DiagnosticQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  difficulty: z.number().min(1).max(5).default(1),
  conceptTested: z.string()
});

export const CurriculumRoadmapSchema = z.object({
  goalId: z.string(),
  versionNumber: z.number().default(1),
  overview: z.string(),
  modules: z.array(ModuleItemSchema),
  concepts: z.array(ConceptItemSchema),
  diagnosticTest: z.array(DiagnosticQuestionSchema)
});

// Phase 1 Teacher Agent Schemas
export const TeacherExplanationRequestSchema = z.object({
  goalId: z.string(),
  lessonId: z.string(),
  conceptName: z.string(),
  style: z.enum(['first_principles', 'analogy', 'code_first', 'deep_architecture', 'socratic']).default('first_principles'),
  includeDiagrams: z.boolean().default(true)
});

export const TeacherExplanationSchema = z.object({
  lessonId: z.string(),
  title: z.string(),
  overview: z.string(),
  whyWhenWhere: z.string(),
  internalMechanisms: z.string(),
  codeSnippets: z.array(z.object({
    language: z.string(),
    code: z.string(),
    explanation: z.string()
  })).default([]),
  diagramMermaid: z.string().optional(),
  edgeCasesAndLimitations: z.array(z.string()).default([]),
  understandingQuestions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).optional(),
    answer: z.string()
  })).default([])
});

// Phase 1 Orchestrator Schemas
export const OrchestratorDecisionSchema = z.object({
  goalId: z.string(),
  currentStage: LifecycleStageSchema,
  stageTitle: z.string(),
  recommendedAgent: AgentTypeSchema,
  allowedActions: z.array(z.string()),
  isOverrideAllowed: z.boolean().default(true),
  explanation: z.string()
});

export const StageOverrideRequestSchema = z.object({
  targetStage: LifecycleStageSchema,
  reason: z.string().max(200).optional()
});

export const NoteSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  lessonId: z.string().optional(),
  conceptId: z.string().optional(),
  title: z.string().min(1).max(200),
  contentMarkdown: z.string(),
  isBookmarked: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

export type CurriculumRoadmapInput = z.infer<typeof CurriculumRoadmapSchema>;
export type TeacherExplanationInput = z.infer<typeof TeacherExplanationSchema>;
export type OrchestratorDecisionInput = z.infer<typeof OrchestratorDecisionSchema>;
export type NoteInput = z.infer<typeof NoteSchema>;

// Phase 2: Doubt & Practice Schemas
export const DoubtQuerySchema = z.object({
  goalId: z.string().optional(),
  lessonId: z.string().optional(),
  conceptId: z.string().optional(),
  question: z.string().min(5).max(1000),
  previousExplanations: z.array(z.string()).default([])
});

export const DoubtResolutionSchema = z.object({
  rootMisconception: z.string(),
  backtrackedPrerequisite: z.object({
    needed: z.boolean(),
    conceptName: z.string().optional(),
    explanation: z.string()
  }),
  alternativeExplanation: z.string(),
  analogousContrast: z.string(),
  verificationQuestion: z.object({
    prompt: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string()
  }),
  status: z.enum(['open', 'resolved']).default('resolved')
});

export const PracticeExerciseRequestSchema = z.object({
  goalId: z.string(),
  conceptId: z.string().optional(),
  topic: z.string().min(3),
  difficulty: z.number().min(1).max(5).default(1)
});

export const PracticeExerciseSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  conceptId: z.string().optional(),
  topic: z.string(),
  difficulty: z.number().min(1).max(5),
  prompt: z.string(),
  contextCode: z.string().optional(),
  progressiveHints: z.array(z.object({
    hintLevel: z.number(),
    hint: z.string()
  })).default([]),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string()
  })).default([]),
  solutionRubric: z.string()
});

export const PracticeSubmissionSchema = z.object({
  exerciseId: z.string(),
  userCodeOrAnswer: z.string().min(1),
  hintsUsedCount: z.number().default(0)
});

export const PracticeEvaluationSchema = z.object({
  exerciseId: z.string(),
  isCorrect: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  weakConceptsFlagged: z.array(z.string()).default([]),
  recommendedNextStep: z.string()
});

export type DoubtQueryInput = z.infer<typeof DoubtQuerySchema>;
export type DoubtResolutionInput = z.infer<typeof DoubtResolutionSchema>;
export type PracticeExerciseInput = z.infer<typeof PracticeExerciseSchema>;
export type PracticeEvaluationInput = z.infer<typeof PracticeEvaluationSchema>;

// Phase 3: Assessment & Practical Schemas
export const GenerateAssessmentRequestSchema = z.object({
  goalId: z.string(),
  title: z.string().min(3),
  assessmentType: z.enum(['theory_exam', 'mock_interview', 'viva', 'diagnostic', 'topic_test']),
  questionCount: z.number().min(2).max(30).default(5),
  timeLimitMinutes: z.number().optional()
});

export const ExamQuestionSchema = z.object({
  id: z.string(),
  questionType: AssessmentTypeSchema,
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.any(),
  explanation: z.string(),
  marks: z.number().default(10)
});

export const AssessmentSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  userId: z.string(),
  title: z.string(),
  assessmentType: z.enum(['theory_exam', 'mock_interview', 'viva', 'diagnostic', 'topic_test']),
  timeLimitMinutes: z.number().optional(),
  passingScore: z.number().default(70),
  questions: z.array(ExamQuestionSchema)
});

export const SubmitAssessmentAttemptSchema = z.object({
  assessmentId: z.string(),
  idempotencyKey: z.string().min(6),
  answers: z.array(z.object({
    questionId: z.string(),
    learnerAnswer: z.any()
  }))
});

export const GeneratePracticalRequestSchema = z.object({
  goalId: z.string(),
  title: z.string().min(3),
  domain: z.string().default('coding'),
  difficulty: z.number().min(1).max(5).default(2)
});

export const PracticalTaskSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  userId: z.string(),
  title: z.string(),
  domain: z.string(),
  instructionsMarkdown: z.string(),
  starterTemplate: z.record(z.any()).default({}),
  validationCriteria: z.array(z.string())
});

export const SubmitPracticalSchema = z.object({
  taskId: z.string(),
  submissionPayload: z.record(z.any()),
  attachmentIds: z.array(z.string()).default([])
});

// Phase 4: Mastery & Review Schemas
export const EvidenceBreakdownSchema = z.object({
  recall: z.number().min(0).max(100),
  application: z.number().min(0).max(100),
  practical: z.number().min(0).max(100),
  viva: z.number().min(0).max(100),
  transfer: z.number().min(0).max(100),
  retention: z.number().min(0).max(100)
});

export const EvaluateMasteryRequestSchema = z.object({
  conceptId: z.string(),
  conceptName: z.string(),
  evidence: EvidenceBreakdownSchema
});

export const ConceptMasterySchema = z.object({
  conceptId: z.string(),
  conceptName: z.string().optional(),
  userId: z.string(),
  currentLevel: MasteryLevelSchema,
  confidenceScore: z.number().min(0).max(100),
  evidenceBreakdown: EvidenceBreakdownSchema,
  reasoningSummary: z.string(),
  evaluatedAt: z.string()
});

export const RecordReviewResultSchema = z.object({
  scheduleId: z.string(),
  recallScore: z.number().min(0).max(100)
});

// Phase 5: Research & Resource Schemas
export const VerifyClaimRequestSchema = z.object({
  claim: z.string().min(5),
  topic: z.string(),
  targetVersion: z.string().optional()
});

export const SourceReferenceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  conceptId: z.string().optional(),
  lessonId: z.string().optional(),
  title: z.string(),
  url: z.string().url(),
  authorOrOrg: z.string().optional(),
  versionTag: z.string().optional(),
  isVerified: z.boolean().default(true),
  snippet: z.string().optional(),
  createdAt: z.string()
});

export const ResearchVerificationResultSchema = z.object({
  claim: z.string(),
  isVerified: z.boolean(),
  authoritativeSource: SourceReferenceSchema,
  explanation: z.string(),
  versionWarning: z.string().optional()
});
