"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchVerificationResultSchema = exports.SourceReferenceSchema = exports.VerifyClaimRequestSchema = exports.RecordReviewResultSchema = exports.ConceptMasterySchema = exports.EvaluateMasteryRequestSchema = exports.EvidenceBreakdownSchema = exports.SubmitPracticalSchema = exports.PracticalTaskSchema = exports.GeneratePracticalRequestSchema = exports.SubmitAssessmentAttemptSchema = exports.AssessmentSchema = exports.ExamQuestionSchema = exports.GenerateAssessmentRequestSchema = exports.PracticeEvaluationSchema = exports.PracticeSubmissionSchema = exports.PracticeExerciseSchema = exports.PracticeExerciseRequestSchema = exports.DoubtResolutionSchema = exports.DoubtQuerySchema = exports.NoteSchema = exports.StageOverrideRequestSchema = exports.OrchestratorDecisionSchema = exports.TeacherExplanationSchema = exports.TeacherExplanationRequestSchema = exports.CurriculumRoadmapSchema = exports.DiagnosticQuestionSchema = exports.ConceptItemSchema = exports.ModuleItemSchema = exports.LessonItemSchema = exports.LLMStructuredOutputSchema = exports.LLMCompletionRequestSchema = exports.UpdateLearningGoalSchema = exports.CreateLearningGoalSchema = exports.AgentTypeSchema = exports.AssessmentTypeSchema = exports.LearningPathModeSchema = exports.LifecycleStageSchema = exports.MasteryLevelSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
exports.MasteryLevelSchema = zod_1.z.nativeEnum(types_1.MasteryLevel);
exports.LifecycleStageSchema = zod_1.z.nativeEnum(types_1.LifecycleStage);
exports.LearningPathModeSchema = zod_1.z.nativeEnum(types_1.LearningPathMode);
exports.AssessmentTypeSchema = zod_1.z.nativeEnum(types_1.AssessmentType);
exports.AgentTypeSchema = zod_1.z.nativeEnum(types_1.AgentType);
exports.CreateLearningGoalSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120),
    description: zod_1.z.string().max(1000).optional(),
    targetMasteryLevel: exports.MasteryLevelSchema.default(types_1.MasteryLevel.L6),
    pathMode: exports.LearningPathModeSchema.default(types_1.LearningPathMode.FULL_MASTERY)
});
exports.UpdateLearningGoalSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(120).optional(),
    description: zod_1.z.string().max(1000).optional(),
    targetMasteryLevel: exports.MasteryLevelSchema.optional(),
    currentMasteryLevel: exports.MasteryLevelSchema.optional(),
    currentStage: exports.LifecycleStageSchema.optional(),
    pathMode: exports.LearningPathModeSchema.optional(),
    isArchived: zod_1.z.boolean().optional()
});
exports.LLMCompletionRequestSchema = zod_1.z.object({
    systemPrompt: zod_1.z.string(),
    userPrompt: zod_1.z.string(),
    temperature: zod_1.z.number().min(0).max(1).optional().default(0.2),
    maxTokens: zod_1.z.number().positive().optional().default(1024),
    responseFormat: zod_1.z.enum(['text', 'json']).optional().default('text'),
    preferredProvider: zod_1.z.string().optional()
});
exports.LLMStructuredOutputSchema = zod_1.z.object({
    title: zod_1.z.string(),
    summary: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    details: zod_1.z.record(zod_1.z.any()).optional()
});
// Phase 1 Curriculum Agent Schemas
exports.LessonItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    moduleId: zod_1.z.string(),
    title: zod_1.z.string(),
    summary: zod_1.z.string().optional(),
    stageNumber: zod_1.z.number().min(1).max(15).default(2),
    orderIndex: zod_1.z.number().default(0),
    contentMarkdown: zod_1.z.string().optional(),
    codeSnippets: zod_1.z.array(zod_1.z.object({
        language: zod_1.z.string(),
        code: zod_1.z.string(),
        explanation: zod_1.z.string().optional()
    })).optional(),
    diagrams: zod_1.z.array(zod_1.z.string()).optional()
});
exports.ModuleItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    orderIndex: zod_1.z.number().default(0),
    estimatedMinutes: zod_1.z.number().default(60),
    lessons: zod_1.z.array(exports.LessonItemSchema)
});
exports.ConceptItemSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    slug: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    prerequisiteConceptIds: zod_1.z.array(zod_1.z.string()).default([])
});
exports.DiagnosticQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    prompt: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    correctAnswer: zod_1.z.string(),
    difficulty: zod_1.z.number().min(1).max(5).default(1),
    conceptTested: zod_1.z.string()
});
exports.CurriculumRoadmapSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    versionNumber: zod_1.z.number().default(1),
    overview: zod_1.z.string(),
    modules: zod_1.z.array(exports.ModuleItemSchema),
    concepts: zod_1.z.array(exports.ConceptItemSchema),
    diagnosticTest: zod_1.z.array(exports.DiagnosticQuestionSchema)
});
// Phase 1 Teacher Agent Schemas
exports.TeacherExplanationRequestSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    lessonId: zod_1.z.string(),
    conceptName: zod_1.z.string(),
    style: zod_1.z.enum(['first_principles', 'analogy', 'code_first', 'deep_architecture', 'socratic']).default('first_principles'),
    includeDiagrams: zod_1.z.boolean().default(true)
});
exports.TeacherExplanationSchema = zod_1.z.object({
    lessonId: zod_1.z.string(),
    title: zod_1.z.string(),
    overview: zod_1.z.string(),
    whyWhenWhere: zod_1.z.string(),
    internalMechanisms: zod_1.z.string(),
    codeSnippets: zod_1.z.array(zod_1.z.object({
        language: zod_1.z.string(),
        code: zod_1.z.string(),
        explanation: zod_1.z.string()
    })).default([]),
    diagramMermaid: zod_1.z.string().optional(),
    edgeCasesAndLimitations: zod_1.z.array(zod_1.z.string()).default([]),
    understandingQuestions: zod_1.z.array(zod_1.z.object({
        question: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        answer: zod_1.z.string()
    })).default([])
});
// Phase 1 Orchestrator Schemas
exports.OrchestratorDecisionSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    currentStage: exports.LifecycleStageSchema,
    stageTitle: zod_1.z.string(),
    recommendedAgent: exports.AgentTypeSchema,
    allowedActions: zod_1.z.array(zod_1.z.string()),
    isOverrideAllowed: zod_1.z.boolean().default(true),
    explanation: zod_1.z.string()
});
exports.StageOverrideRequestSchema = zod_1.z.object({
    targetStage: exports.LifecycleStageSchema,
    reason: zod_1.z.string().max(200).optional()
});
exports.NoteSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    userId: zod_1.z.string().optional(),
    lessonId: zod_1.z.string().optional(),
    conceptId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1).max(200),
    contentMarkdown: zod_1.z.string(),
    isBookmarked: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).default([])
});
// Phase 2: Doubt & Practice Schemas
exports.DoubtQuerySchema = zod_1.z.object({
    goalId: zod_1.z.string().optional(),
    lessonId: zod_1.z.string().optional(),
    conceptId: zod_1.z.string().optional(),
    question: zod_1.z.string().min(5).max(1000),
    previousExplanations: zod_1.z.array(zod_1.z.string()).default([])
});
exports.DoubtResolutionSchema = zod_1.z.object({
    rootMisconception: zod_1.z.string(),
    backtrackedPrerequisite: zod_1.z.object({
        needed: zod_1.z.boolean(),
        conceptName: zod_1.z.string().optional(),
        explanation: zod_1.z.string()
    }),
    alternativeExplanation: zod_1.z.string(),
    analogousContrast: zod_1.z.string(),
    verificationQuestion: zod_1.z.object({
        prompt: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.string()),
        correctAnswer: zod_1.z.string()
    }),
    status: zod_1.z.enum(['open', 'resolved']).default('resolved')
});
exports.PracticeExerciseRequestSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    conceptId: zod_1.z.string().optional(),
    topic: zod_1.z.string().min(3),
    difficulty: zod_1.z.number().min(1).max(5).default(1)
});
exports.PracticeExerciseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    goalId: zod_1.z.string(),
    conceptId: zod_1.z.string().optional(),
    topic: zod_1.z.string(),
    difficulty: zod_1.z.number().min(1).max(5),
    prompt: zod_1.z.string(),
    contextCode: zod_1.z.string().optional(),
    progressiveHints: zod_1.z.array(zod_1.z.object({
        hintLevel: zod_1.z.number(),
        hint: zod_1.z.string()
    })).default([]),
    testCases: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.string(),
        expectedOutput: zod_1.z.string()
    })).default([]),
    solutionRubric: zod_1.z.string()
});
exports.PracticeSubmissionSchema = zod_1.z.object({
    exerciseId: zod_1.z.string(),
    userCodeOrAnswer: zod_1.z.string().min(1),
    hintsUsedCount: zod_1.z.number().default(0)
});
exports.PracticeEvaluationSchema = zod_1.z.object({
    exerciseId: zod_1.z.string(),
    isCorrect: zod_1.z.boolean(),
    score: zod_1.z.number().min(0).max(100),
    feedback: zod_1.z.string(),
    weakConceptsFlagged: zod_1.z.array(zod_1.z.string()).default([]),
    recommendedNextStep: zod_1.z.string()
});
// Phase 3: Assessment & Practical Schemas
exports.GenerateAssessmentRequestSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    title: zod_1.z.string().min(3),
    assessmentType: zod_1.z.enum(['theory_exam', 'mock_interview', 'viva', 'diagnostic', 'topic_test']),
    questionCount: zod_1.z.number().min(2).max(30).default(5),
    timeLimitMinutes: zod_1.z.number().optional()
});
exports.ExamQuestionSchema = zod_1.z.object({
    id: zod_1.z.string(),
    questionType: exports.AssessmentTypeSchema,
    prompt: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    correctAnswer: zod_1.z.any(),
    explanation: zod_1.z.string(),
    marks: zod_1.z.number().default(10)
});
exports.AssessmentSchema = zod_1.z.object({
    id: zod_1.z.string(),
    goalId: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string(),
    assessmentType: zod_1.z.enum(['theory_exam', 'mock_interview', 'viva', 'diagnostic', 'topic_test']),
    timeLimitMinutes: zod_1.z.number().optional(),
    passingScore: zod_1.z.number().default(70),
    questions: zod_1.z.array(exports.ExamQuestionSchema)
});
exports.SubmitAssessmentAttemptSchema = zod_1.z.object({
    assessmentId: zod_1.z.string(),
    idempotencyKey: zod_1.z.string().min(6),
    answers: zod_1.z.array(zod_1.z.object({
        questionId: zod_1.z.string(),
        learnerAnswer: zod_1.z.any()
    }))
});
exports.GeneratePracticalRequestSchema = zod_1.z.object({
    goalId: zod_1.z.string(),
    title: zod_1.z.string().min(3),
    domain: zod_1.z.string().default('coding'),
    difficulty: zod_1.z.number().min(1).max(5).default(2)
});
exports.PracticalTaskSchema = zod_1.z.object({
    id: zod_1.z.string(),
    goalId: zod_1.z.string(),
    userId: zod_1.z.string(),
    title: zod_1.z.string(),
    domain: zod_1.z.string(),
    instructionsMarkdown: zod_1.z.string(),
    starterTemplate: zod_1.z.record(zod_1.z.any()).default({}),
    validationCriteria: zod_1.z.array(zod_1.z.string())
});
exports.SubmitPracticalSchema = zod_1.z.object({
    taskId: zod_1.z.string(),
    submissionPayload: zod_1.z.record(zod_1.z.any()),
    attachmentIds: zod_1.z.array(zod_1.z.string()).default([])
});
// Phase 4: Mastery & Review Schemas
exports.EvidenceBreakdownSchema = zod_1.z.object({
    recall: zod_1.z.number().min(0).max(100),
    application: zod_1.z.number().min(0).max(100),
    practical: zod_1.z.number().min(0).max(100),
    viva: zod_1.z.number().min(0).max(100),
    transfer: zod_1.z.number().min(0).max(100),
    retention: zod_1.z.number().min(0).max(100)
});
exports.EvaluateMasteryRequestSchema = zod_1.z.object({
    conceptId: zod_1.z.string(),
    conceptName: zod_1.z.string(),
    evidence: exports.EvidenceBreakdownSchema
});
exports.ConceptMasterySchema = zod_1.z.object({
    conceptId: zod_1.z.string(),
    conceptName: zod_1.z.string().optional(),
    userId: zod_1.z.string(),
    currentLevel: exports.MasteryLevelSchema,
    confidenceScore: zod_1.z.number().min(0).max(100),
    evidenceBreakdown: exports.EvidenceBreakdownSchema,
    reasoningSummary: zod_1.z.string(),
    evaluatedAt: zod_1.z.string()
});
exports.RecordReviewResultSchema = zod_1.z.object({
    scheduleId: zod_1.z.string(),
    recallScore: zod_1.z.number().min(0).max(100)
});
// Phase 5: Research & Resource Schemas
exports.VerifyClaimRequestSchema = zod_1.z.object({
    claim: zod_1.z.string().min(5),
    topic: zod_1.z.string(),
    targetVersion: zod_1.z.string().optional()
});
exports.SourceReferenceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    conceptId: zod_1.z.string().optional(),
    lessonId: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    url: zod_1.z.string().url(),
    authorOrOrg: zod_1.z.string().optional(),
    versionTag: zod_1.z.string().optional(),
    isVerified: zod_1.z.boolean().default(true),
    snippet: zod_1.z.string().optional(),
    createdAt: zod_1.z.string()
});
exports.ResearchVerificationResultSchema = zod_1.z.object({
    claim: zod_1.z.string(),
    isVerified: zod_1.z.boolean(),
    authoritativeSource: exports.SourceReferenceSchema,
    explanation: zod_1.z.string(),
    versionWarning: zod_1.z.string().optional()
});
