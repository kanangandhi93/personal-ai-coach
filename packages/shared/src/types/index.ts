export enum MasteryLevel {
  L0 = 'L0', // Not Started
  L1 = 'L1', // Intuitive / Familiar
  L2 = 'L2', // Core Recall & Definition
  L3 = 'L3', // Guided Application
  L4 = 'L4', // Independent Problem Solving
  L5 = 'L5', // Deep Transfer & Edge Cases
  L6 = 'L6'  // Demonstrated Mastery & Teach Others
}

export enum LifecycleStage {
  STAGE_1_PREREQUISITE_ASSESSMENT = 1,
  STAGE_2_BASIC_CONCEPTS = 2,
  STAGE_3_FUNDAMENTALS = 3,
  STAGE_4_CORE_UNDERSTANDING = 4,
  STAGE_5_ADVANCED_CONCEPTS = 5,
  STAGE_6_INTERNAL_ARCHITECTURE = 6,
  STAGE_7_EDGE_CASES_LIMITATIONS = 7,
  STAGE_8_GUIDED_PRACTICE = 8,
  STAGE_9_INDEPENDENT_PRACTICE = 9,
  STAGE_10_PRACTICAL_APPLICATION = 10,
  STAGE_11_THEORY_EXAM = 11,
  STAGE_12_INTERVIEW_VIVA = 12,
  STAGE_13_PRACTICAL_EXAM = 13,
  STAGE_14_FINAL_EVALUATION = 14,
  STAGE_15_REVISION_MASTERY_VERIFICATION = 15
}

export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  CURRICULUM = 'curriculum',
  TEACHER = 'teacher',
  DOUBT_SOLVER = 'doubt_solver',
  PRACTICE = 'practice',
  EXAM_INTERVIEW = 'exam_interview',
  PRACTICAL = 'practical',
  EVALUATOR = 'evaluator',
  RESEARCH = 'research'
}

export type FreeAIProvider = 'gemini' | 'groq' | 'openrouter' | 'cerebras' | 'mock';

export enum AssessmentType {
  MCQ = 'mcq',
  MULTI_SELECT = 'multi_select',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  SCENARIO = 'scenario',
  CODING = 'coding',
  INTERVIEW_VIVA = 'interview_viva'
}

export enum LearningPathMode {
  FULL_MASTERY = 'full_mastery', // All 15 stages
  COMPACT_REVISION = 'compact_revision', // Fast track
  EXAM_CRAM = 'exam_cram', // Theory & practical exam focus
  PRACTICAL_LAB = 'practical_lab' // Hands-on heavy
}

export type ExplanationStyle = 
  | 'first_principles' 
  | 'analogy' 
  | 'code_first' 
  | 'deep_architecture' 
  | 'socratic';

export interface ProviderCapability {
  provider: FreeAIProvider;
  model: string;
  maxTokens: number;
  supportsJsonMode: boolean;
  requestsPerMinuteLimit: number;
  requestsPerDayLimit: number;
  isFreeTierOnly: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetMasteryLevel: MasteryLevel;
  currentMasteryLevel: MasteryLevel;
  pathMode: LearningPathMode;
  currentStage: LifecycleStage;
  isArchived: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ConceptItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  prerequisiteConceptIds: string[];
}

export interface LessonItem {
  id: string;
  moduleId: string;
  title: string;
  summary?: string;
  stageNumber: number;
  orderIndex: number;
  contentMarkdown?: string;
  codeSnippets?: Array<{ language: string; code: string; explanation?: string }>;
  diagrams?: string[];
}

export interface ModuleItem {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  estimatedMinutes: number;
  lessons: LessonItem[];
}

export interface DiagnosticQuestion {
  id: string;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  difficulty: number;
  conceptTested: string;
}

export interface CurriculumRoadmap {
  goalId: string;
  versionNumber: number;
  overview: string;
  modules: ModuleItem[];
  concepts: ConceptItem[];
  diagnosticTest: DiagnosticQuestion[];
}

export interface OrchestratorDecision {
  goalId: string;
  currentStage: LifecycleStage;
  stageTitle: string;
  recommendedAgent: AgentType;
  allowedActions: string[];
  isOverrideAllowed: boolean;
  explanation: string;
}

export interface TeacherExplanation {
  lessonId: string;
  title: string;
  overview: string;
  whyWhenWhere: string;
  internalMechanisms: string;
  codeSnippets: Array<{ language: string; code: string; explanation: string }>;
  diagramMermaid?: string;
  edgeCasesAndLimitations: string[];
  understandingQuestions: Array<{ question: string; options?: string[]; answer: string }>;
}

export interface AIUsageRecord {
  id?: string;
  userId: string;
  provider: FreeAIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
  createdAt?: string;
}

// Phase 2: Doubt & Practice Interfaces
export interface DoubtRecord {
  id: string;
  userId: string;
  goalId?: string;
  lessonId?: string;
  conceptId?: string;
  question: string;
  rootMisconception?: string;
  backtrackedPrerequisite?: {
    needed: boolean;
    conceptName?: string;
    explanation: string;
  };
  alternativeExplanation?: string;
  analogousContrast?: string;
  verificationQuestion?: {
    prompt: string;
    options: string[];
    correctAnswer: string;
  };
  status: 'open' | 'resolved';
  resolvedAt?: string;
  createdAt: string;
}

export interface PracticeExercise {
  id: string;
  goalId: string;
  conceptId?: string;
  topic: string;
  difficulty: number; // 1 to 5
  prompt: string;
  contextCode?: string;
  progressiveHints: Array<{ hintLevel: number; hint: string }>;
  testCases: Array<{ input: string; expectedOutput: string }>;
  solutionRubric: string;
}

export interface PracticeEvaluation {
  exerciseId: string;
  isCorrect: boolean;
  score: number; // 0 - 100
  feedback: string;
  weakConceptsFlagged: string[];
  recommendedNextStep: string;
}

// Phase 3: Exam, Interview & Practical Types
export interface ExamQuestion {
  id: string;
  questionType: AssessmentType;
  prompt: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  marks: number;
}

export interface AssessmentRecord {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  assessmentType: 'theory_exam' | 'mock_interview' | 'viva' | 'diagnostic' | 'topic_test';
  timeLimitMinutes?: number;
  passingScore: number;
  questions: ExamQuestion[];
  createdAt: string;
}

export interface AssessmentAttemptRecord {
  id: string;
  assessmentId: string;
  userId: string;
  score?: number;
  status: 'in_progress' | 'submitted' | 'graded';
  idempotencyKey?: string;
  startedAt: string;
  submittedAt?: string;
  feedback?: Record<string, any>;
  responses?: Array<{
    questionId: string;
    learnerAnswer: any;
    isCorrect: boolean;
    scoreAwarded: number;
    remarks: string;
  }>;
}

export interface PracticalTaskRecord {
  id: string;
  goalId: string;
  userId: string;
  title: string;
  domain: string;
  instructionsMarkdown: string;
  starterTemplate: Record<string, any>;
  validationCriteria: string[];
  createdAt: string;
}

export interface PracticalSubmissionRecord {
  id: string;
  taskId: string;
  userId: string;
  submissionPayload: Record<string, any>;
  status: 'submitted' | 'evaluating' | 'passed' | 'needs_revision';
  score?: number;
  evaluationReport?: Record<string, any>;
  submittedAt: string;
}

// Phase 4: Mastery & Spaced Repetition Types
export interface ConceptMasteryRecord {
  id?: string;
  conceptId: string;
  conceptName?: string;
  userId: string;
  currentLevel: MasteryLevel;
  confidenceScore: number;
  evidenceBreakdown: {
    recall: number;
    application: number;
    practical: number;
    viva: number;
    transfer: number;
    retention: number;
  };
  reasoningSummary: string;
  evaluatedAt: string;
}

export interface ReviewScheduleRecord {
  id: string;
  conceptId: string;
  conceptName?: string;
  userId: string;
  intervalStage: number; // 1, 3, 7, 30
  dueDate: string;
  status: 'pending' | 'due' | 'overdue' | 'completed';
  lastReviewedAt?: string;
  retentionScore: number;
}

export interface ReviewQueueSummary {
  upcomingRevisions: ReviewScheduleRecord[];
  overdueRevisions: ReviewScheduleRecord[];
  weakConceptPriority: Array<{
    conceptId: string;
    conceptName: string;
    currentLevel: MasteryLevel;
    confidenceScore: number;
  }>;
}

// Phase 5: Research & Resource Manager Types
export interface SourceReferenceRecord {
  id: string;
  userId: string;
  conceptId?: string;
  lessonId?: string;
  title: string;
  url: string;
  authorOrOrg?: string;
  versionTag?: string;
  isVerified: boolean;
  snippet?: string;
  createdAt: string;
}

export interface ResearchVerificationResult {
  claim: string;
  isVerified: boolean;
  authoritativeSource: SourceReferenceRecord;
  explanation: string;
  versionWarning?: string;
}

export interface UserExportData {
  exportTimestamp: string;
  userId: string;
  goals: LearningGoal[];
  notes: any[];
  masterySummary: any;
  reviewSchedule: any[];
}
