import { z } from 'zod';
import { MasteryLevel, LifecycleStage, LearningPathMode, AssessmentType, AgentType } from '../types';
export declare const MasteryLevelSchema: z.ZodNativeEnum<typeof MasteryLevel>;
export declare const LifecycleStageSchema: z.ZodNativeEnum<typeof LifecycleStage>;
export declare const LearningPathModeSchema: z.ZodNativeEnum<typeof LearningPathMode>;
export declare const AssessmentTypeSchema: z.ZodNativeEnum<typeof AssessmentType>;
export declare const AgentTypeSchema: z.ZodNativeEnum<typeof AgentType>;
export declare const CreateLearningGoalSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    targetMasteryLevel: z.ZodDefault<z.ZodNativeEnum<typeof MasteryLevel>>;
    pathMode: z.ZodDefault<z.ZodNativeEnum<typeof LearningPathMode>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    targetMasteryLevel: MasteryLevel;
    pathMode: LearningPathMode;
    description?: string | undefined;
}, {
    title: string;
    description?: string | undefined;
    targetMasteryLevel?: MasteryLevel | undefined;
    pathMode?: LearningPathMode | undefined;
}>;
export declare const UpdateLearningGoalSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    targetMasteryLevel: z.ZodOptional<z.ZodNativeEnum<typeof MasteryLevel>>;
    currentMasteryLevel: z.ZodOptional<z.ZodNativeEnum<typeof MasteryLevel>>;
    currentStage: z.ZodOptional<z.ZodNativeEnum<typeof LifecycleStage>>;
    pathMode: z.ZodOptional<z.ZodNativeEnum<typeof LearningPathMode>>;
    isArchived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    targetMasteryLevel?: MasteryLevel | undefined;
    pathMode?: LearningPathMode | undefined;
    currentMasteryLevel?: MasteryLevel | undefined;
    currentStage?: LifecycleStage | undefined;
    isArchived?: boolean | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    targetMasteryLevel?: MasteryLevel | undefined;
    pathMode?: LearningPathMode | undefined;
    currentMasteryLevel?: MasteryLevel | undefined;
    currentStage?: LifecycleStage | undefined;
    isArchived?: boolean | undefined;
}>;
export declare const LLMCompletionRequestSchema: z.ZodObject<{
    systemPrompt: z.ZodString;
    userPrompt: z.ZodString;
    temperature: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxTokens: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    responseFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["text", "json"]>>>;
    preferredProvider: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
    responseFormat: "text" | "json";
    preferredProvider?: string | undefined;
}, {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    responseFormat?: "text" | "json" | undefined;
    preferredProvider?: string | undefined;
}>;
export type LLMCompletionInput = z.input<typeof LLMCompletionRequestSchema>;
export type LLMCompletionRequest = z.infer<typeof LLMCompletionRequestSchema>;
export declare const LLMStructuredOutputSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    confidence: z.ZodNumber;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    summary: string;
    confidence: number;
    details?: Record<string, any> | undefined;
}, {
    title: string;
    summary: string;
    confidence: number;
    details?: Record<string, any> | undefined;
}>;
export declare const LessonItemSchema: z.ZodObject<{
    id: z.ZodString;
    moduleId: z.ZodString;
    title: z.ZodString;
    summary: z.ZodOptional<z.ZodString>;
    stageNumber: z.ZodDefault<z.ZodNumber>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
    contentMarkdown: z.ZodOptional<z.ZodString>;
    codeSnippets: z.ZodOptional<z.ZodArray<z.ZodObject<{
        language: z.ZodString;
        code: z.ZodString;
        explanation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        language: string;
        explanation?: string | undefined;
    }, {
        code: string;
        language: string;
        explanation?: string | undefined;
    }>, "many">>;
    diagrams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    moduleId: string;
    stageNumber: number;
    orderIndex: number;
    summary?: string | undefined;
    contentMarkdown?: string | undefined;
    codeSnippets?: {
        code: string;
        language: string;
        explanation?: string | undefined;
    }[] | undefined;
    diagrams?: string[] | undefined;
}, {
    title: string;
    id: string;
    moduleId: string;
    summary?: string | undefined;
    stageNumber?: number | undefined;
    orderIndex?: number | undefined;
    contentMarkdown?: string | undefined;
    codeSnippets?: {
        code: string;
        language: string;
        explanation?: string | undefined;
    }[] | undefined;
    diagrams?: string[] | undefined;
}>;
export declare const ModuleItemSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    orderIndex: z.ZodDefault<z.ZodNumber>;
    estimatedMinutes: z.ZodDefault<z.ZodNumber>;
    lessons: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        moduleId: z.ZodString;
        title: z.ZodString;
        summary: z.ZodOptional<z.ZodString>;
        stageNumber: z.ZodDefault<z.ZodNumber>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
        contentMarkdown: z.ZodOptional<z.ZodString>;
        codeSnippets: z.ZodOptional<z.ZodArray<z.ZodObject<{
            language: z.ZodString;
            code: z.ZodString;
            explanation: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            language: string;
            explanation?: string | undefined;
        }, {
            code: string;
            language: string;
            explanation?: string | undefined;
        }>, "many">>;
        diagrams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        moduleId: string;
        stageNumber: number;
        orderIndex: number;
        summary?: string | undefined;
        contentMarkdown?: string | undefined;
        codeSnippets?: {
            code: string;
            language: string;
            explanation?: string | undefined;
        }[] | undefined;
        diagrams?: string[] | undefined;
    }, {
        title: string;
        id: string;
        moduleId: string;
        summary?: string | undefined;
        stageNumber?: number | undefined;
        orderIndex?: number | undefined;
        contentMarkdown?: string | undefined;
        codeSnippets?: {
            code: string;
            language: string;
            explanation?: string | undefined;
        }[] | undefined;
        diagrams?: string[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    orderIndex: number;
    estimatedMinutes: number;
    lessons: {
        title: string;
        id: string;
        moduleId: string;
        stageNumber: number;
        orderIndex: number;
        summary?: string | undefined;
        contentMarkdown?: string | undefined;
        codeSnippets?: {
            code: string;
            language: string;
            explanation?: string | undefined;
        }[] | undefined;
        diagrams?: string[] | undefined;
    }[];
    description?: string | undefined;
}, {
    title: string;
    id: string;
    lessons: {
        title: string;
        id: string;
        moduleId: string;
        summary?: string | undefined;
        stageNumber?: number | undefined;
        orderIndex?: number | undefined;
        contentMarkdown?: string | undefined;
        codeSnippets?: {
            code: string;
            language: string;
            explanation?: string | undefined;
        }[] | undefined;
        diagrams?: string[] | undefined;
    }[];
    description?: string | undefined;
    orderIndex?: number | undefined;
    estimatedMinutes?: number | undefined;
}>;
export declare const ConceptItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    prerequisiteConceptIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    slug: string;
    prerequisiteConceptIds: string[];
    description?: string | undefined;
}, {
    id: string;
    name: string;
    slug: string;
    description?: string | undefined;
    prerequisiteConceptIds?: string[] | undefined;
}>;
export declare const DiagnosticQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    prompt: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctAnswer: z.ZodString;
    difficulty: z.ZodDefault<z.ZodNumber>;
    conceptTested: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    correctAnswer: string;
    difficulty: number;
    conceptTested: string;
    options?: string[] | undefined;
}, {
    id: string;
    prompt: string;
    correctAnswer: string;
    conceptTested: string;
    options?: string[] | undefined;
    difficulty?: number | undefined;
}>;
export declare const CurriculumRoadmapSchema: z.ZodObject<{
    goalId: z.ZodString;
    versionNumber: z.ZodDefault<z.ZodNumber>;
    overview: z.ZodString;
    modules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
        estimatedMinutes: z.ZodDefault<z.ZodNumber>;
        lessons: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            moduleId: z.ZodString;
            title: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
            stageNumber: z.ZodDefault<z.ZodNumber>;
            orderIndex: z.ZodDefault<z.ZodNumber>;
            contentMarkdown: z.ZodOptional<z.ZodString>;
            codeSnippets: z.ZodOptional<z.ZodArray<z.ZodObject<{
                language: z.ZodString;
                code: z.ZodString;
                explanation: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                code: string;
                language: string;
                explanation?: string | undefined;
            }, {
                code: string;
                language: string;
                explanation?: string | undefined;
            }>, "many">>;
            diagrams: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            id: string;
            moduleId: string;
            stageNumber: number;
            orderIndex: number;
            summary?: string | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }, {
            title: string;
            id: string;
            moduleId: string;
            summary?: string | undefined;
            stageNumber?: number | undefined;
            orderIndex?: number | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        orderIndex: number;
        estimatedMinutes: number;
        lessons: {
            title: string;
            id: string;
            moduleId: string;
            stageNumber: number;
            orderIndex: number;
            summary?: string | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }[];
        description?: string | undefined;
    }, {
        title: string;
        id: string;
        lessons: {
            title: string;
            id: string;
            moduleId: string;
            summary?: string | undefined;
            stageNumber?: number | undefined;
            orderIndex?: number | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }[];
        description?: string | undefined;
        orderIndex?: number | undefined;
        estimatedMinutes?: number | undefined;
    }>, "many">;
    concepts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        slug: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        prerequisiteConceptIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        slug: string;
        prerequisiteConceptIds: string[];
        description?: string | undefined;
    }, {
        id: string;
        name: string;
        slug: string;
        description?: string | undefined;
        prerequisiteConceptIds?: string[] | undefined;
    }>, "many">;
    diagnosticTest: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        prompt: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        correctAnswer: z.ZodString;
        difficulty: z.ZodDefault<z.ZodNumber>;
        conceptTested: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        prompt: string;
        correctAnswer: string;
        difficulty: number;
        conceptTested: string;
        options?: string[] | undefined;
    }, {
        id: string;
        prompt: string;
        correctAnswer: string;
        conceptTested: string;
        options?: string[] | undefined;
        difficulty?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    goalId: string;
    versionNumber: number;
    overview: string;
    modules: {
        title: string;
        id: string;
        orderIndex: number;
        estimatedMinutes: number;
        lessons: {
            title: string;
            id: string;
            moduleId: string;
            stageNumber: number;
            orderIndex: number;
            summary?: string | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }[];
        description?: string | undefined;
    }[];
    concepts: {
        id: string;
        name: string;
        slug: string;
        prerequisiteConceptIds: string[];
        description?: string | undefined;
    }[];
    diagnosticTest: {
        id: string;
        prompt: string;
        correctAnswer: string;
        difficulty: number;
        conceptTested: string;
        options?: string[] | undefined;
    }[];
}, {
    goalId: string;
    overview: string;
    modules: {
        title: string;
        id: string;
        lessons: {
            title: string;
            id: string;
            moduleId: string;
            summary?: string | undefined;
            stageNumber?: number | undefined;
            orderIndex?: number | undefined;
            contentMarkdown?: string | undefined;
            codeSnippets?: {
                code: string;
                language: string;
                explanation?: string | undefined;
            }[] | undefined;
            diagrams?: string[] | undefined;
        }[];
        description?: string | undefined;
        orderIndex?: number | undefined;
        estimatedMinutes?: number | undefined;
    }[];
    concepts: {
        id: string;
        name: string;
        slug: string;
        description?: string | undefined;
        prerequisiteConceptIds?: string[] | undefined;
    }[];
    diagnosticTest: {
        id: string;
        prompt: string;
        correctAnswer: string;
        conceptTested: string;
        options?: string[] | undefined;
        difficulty?: number | undefined;
    }[];
    versionNumber?: number | undefined;
}>;
export declare const TeacherExplanationRequestSchema: z.ZodObject<{
    goalId: z.ZodString;
    lessonId: z.ZodString;
    conceptName: z.ZodString;
    style: z.ZodDefault<z.ZodEnum<["first_principles", "analogy", "code_first", "deep_architecture", "socratic"]>>;
    includeDiagrams: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    goalId: string;
    lessonId: string;
    conceptName: string;
    style: "first_principles" | "analogy" | "code_first" | "deep_architecture" | "socratic";
    includeDiagrams: boolean;
}, {
    goalId: string;
    lessonId: string;
    conceptName: string;
    style?: "first_principles" | "analogy" | "code_first" | "deep_architecture" | "socratic" | undefined;
    includeDiagrams?: boolean | undefined;
}>;
export declare const TeacherExplanationSchema: z.ZodObject<{
    lessonId: z.ZodString;
    title: z.ZodString;
    overview: z.ZodString;
    whyWhenWhere: z.ZodString;
    internalMechanisms: z.ZodString;
    codeSnippets: z.ZodDefault<z.ZodArray<z.ZodObject<{
        language: z.ZodString;
        code: z.ZodString;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: string;
        language: string;
        explanation: string;
    }, {
        code: string;
        language: string;
        explanation: string;
    }>, "many">>;
    diagramMermaid: z.ZodOptional<z.ZodString>;
    edgeCasesAndLimitations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    understandingQuestions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        question: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        answer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        question: string;
        answer: string;
        options?: string[] | undefined;
    }, {
        question: string;
        answer: string;
        options?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    codeSnippets: {
        code: string;
        language: string;
        explanation: string;
    }[];
    overview: string;
    lessonId: string;
    whyWhenWhere: string;
    internalMechanisms: string;
    edgeCasesAndLimitations: string[];
    understandingQuestions: {
        question: string;
        answer: string;
        options?: string[] | undefined;
    }[];
    diagramMermaid?: string | undefined;
}, {
    title: string;
    overview: string;
    lessonId: string;
    whyWhenWhere: string;
    internalMechanisms: string;
    codeSnippets?: {
        code: string;
        language: string;
        explanation: string;
    }[] | undefined;
    diagramMermaid?: string | undefined;
    edgeCasesAndLimitations?: string[] | undefined;
    understandingQuestions?: {
        question: string;
        answer: string;
        options?: string[] | undefined;
    }[] | undefined;
}>;
export declare const OrchestratorDecisionSchema: z.ZodObject<{
    goalId: z.ZodString;
    currentStage: z.ZodNativeEnum<typeof LifecycleStage>;
    stageTitle: z.ZodString;
    recommendedAgent: z.ZodNativeEnum<typeof AgentType>;
    allowedActions: z.ZodArray<z.ZodString, "many">;
    isOverrideAllowed: z.ZodDefault<z.ZodBoolean>;
    explanation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentStage: LifecycleStage;
    explanation: string;
    goalId: string;
    stageTitle: string;
    recommendedAgent: AgentType;
    allowedActions: string[];
    isOverrideAllowed: boolean;
}, {
    currentStage: LifecycleStage;
    explanation: string;
    goalId: string;
    stageTitle: string;
    recommendedAgent: AgentType;
    allowedActions: string[];
    isOverrideAllowed?: boolean | undefined;
}>;
export declare const StageOverrideRequestSchema: z.ZodObject<{
    targetStage: z.ZodNativeEnum<typeof LifecycleStage>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    targetStage: LifecycleStage;
    reason?: string | undefined;
}, {
    targetStage: LifecycleStage;
    reason?: string | undefined;
}>;
export declare const NoteSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    lessonId: z.ZodOptional<z.ZodString>;
    conceptId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    contentMarkdown: z.ZodString;
    isBookmarked: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    contentMarkdown: string;
    isBookmarked: boolean;
    tags: string[];
    id?: string | undefined;
    lessonId?: string | undefined;
    userId?: string | undefined;
    conceptId?: string | undefined;
}, {
    title: string;
    contentMarkdown: string;
    id?: string | undefined;
    lessonId?: string | undefined;
    userId?: string | undefined;
    conceptId?: string | undefined;
    isBookmarked?: boolean | undefined;
    tags?: string[] | undefined;
}>;
export type CurriculumRoadmapInput = z.infer<typeof CurriculumRoadmapSchema>;
export type TeacherExplanationInput = z.infer<typeof TeacherExplanationSchema>;
export type OrchestratorDecisionInput = z.infer<typeof OrchestratorDecisionSchema>;
export type NoteInput = z.infer<typeof NoteSchema>;
export declare const DoubtQuerySchema: z.ZodObject<{
    goalId: z.ZodOptional<z.ZodString>;
    lessonId: z.ZodOptional<z.ZodString>;
    conceptId: z.ZodOptional<z.ZodString>;
    question: z.ZodString;
    previousExplanations: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    question: string;
    previousExplanations: string[];
    goalId?: string | undefined;
    lessonId?: string | undefined;
    conceptId?: string | undefined;
}, {
    question: string;
    goalId?: string | undefined;
    lessonId?: string | undefined;
    conceptId?: string | undefined;
    previousExplanations?: string[] | undefined;
}>;
export declare const DoubtResolutionSchema: z.ZodObject<{
    rootMisconception: z.ZodString;
    backtrackedPrerequisite: z.ZodObject<{
        needed: z.ZodBoolean;
        conceptName: z.ZodOptional<z.ZodString>;
        explanation: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        explanation: string;
        needed: boolean;
        conceptName?: string | undefined;
    }, {
        explanation: string;
        needed: boolean;
        conceptName?: string | undefined;
    }>;
    alternativeExplanation: z.ZodString;
    analogousContrast: z.ZodString;
    verificationQuestion: z.ZodObject<{
        prompt: z.ZodString;
        options: z.ZodArray<z.ZodString, "many">;
        correctAnswer: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        options: string[];
        prompt: string;
        correctAnswer: string;
    }, {
        options: string[];
        prompt: string;
        correctAnswer: string;
    }>;
    status: z.ZodDefault<z.ZodEnum<["open", "resolved"]>>;
}, "strip", z.ZodTypeAny, {
    status: "open" | "resolved";
    rootMisconception: string;
    backtrackedPrerequisite: {
        explanation: string;
        needed: boolean;
        conceptName?: string | undefined;
    };
    alternativeExplanation: string;
    analogousContrast: string;
    verificationQuestion: {
        options: string[];
        prompt: string;
        correctAnswer: string;
    };
}, {
    rootMisconception: string;
    backtrackedPrerequisite: {
        explanation: string;
        needed: boolean;
        conceptName?: string | undefined;
    };
    alternativeExplanation: string;
    analogousContrast: string;
    verificationQuestion: {
        options: string[];
        prompt: string;
        correctAnswer: string;
    };
    status?: "open" | "resolved" | undefined;
}>;
export declare const PracticeExerciseRequestSchema: z.ZodObject<{
    goalId: z.ZodString;
    conceptId: z.ZodOptional<z.ZodString>;
    topic: z.ZodString;
    difficulty: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    difficulty: number;
    goalId: string;
    topic: string;
    conceptId?: string | undefined;
}, {
    goalId: string;
    topic: string;
    difficulty?: number | undefined;
    conceptId?: string | undefined;
}>;
export declare const PracticeExerciseSchema: z.ZodObject<{
    id: z.ZodString;
    goalId: z.ZodString;
    conceptId: z.ZodOptional<z.ZodString>;
    topic: z.ZodString;
    difficulty: z.ZodNumber;
    prompt: z.ZodString;
    contextCode: z.ZodOptional<z.ZodString>;
    progressiveHints: z.ZodDefault<z.ZodArray<z.ZodObject<{
        hintLevel: z.ZodNumber;
        hint: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        hintLevel: number;
        hint: string;
    }, {
        hintLevel: number;
        hint: string;
    }>, "many">>;
    testCases: z.ZodDefault<z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        expectedOutput: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        input: string;
        expectedOutput: string;
    }, {
        input: string;
        expectedOutput: string;
    }>, "many">>;
    solutionRubric: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    prompt: string;
    difficulty: number;
    goalId: string;
    topic: string;
    progressiveHints: {
        hintLevel: number;
        hint: string;
    }[];
    testCases: {
        input: string;
        expectedOutput: string;
    }[];
    solutionRubric: string;
    conceptId?: string | undefined;
    contextCode?: string | undefined;
}, {
    id: string;
    prompt: string;
    difficulty: number;
    goalId: string;
    topic: string;
    solutionRubric: string;
    conceptId?: string | undefined;
    contextCode?: string | undefined;
    progressiveHints?: {
        hintLevel: number;
        hint: string;
    }[] | undefined;
    testCases?: {
        input: string;
        expectedOutput: string;
    }[] | undefined;
}>;
export declare const PracticeSubmissionSchema: z.ZodObject<{
    exerciseId: z.ZodString;
    userCodeOrAnswer: z.ZodString;
    hintsUsedCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    exerciseId: string;
    userCodeOrAnswer: string;
    hintsUsedCount: number;
}, {
    exerciseId: string;
    userCodeOrAnswer: string;
    hintsUsedCount?: number | undefined;
}>;
export declare const PracticeEvaluationSchema: z.ZodObject<{
    exerciseId: z.ZodString;
    isCorrect: z.ZodBoolean;
    score: z.ZodNumber;
    feedback: z.ZodString;
    weakConceptsFlagged: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    recommendedNextStep: z.ZodString;
}, "strip", z.ZodTypeAny, {
    exerciseId: string;
    isCorrect: boolean;
    score: number;
    feedback: string;
    weakConceptsFlagged: string[];
    recommendedNextStep: string;
}, {
    exerciseId: string;
    isCorrect: boolean;
    score: number;
    feedback: string;
    recommendedNextStep: string;
    weakConceptsFlagged?: string[] | undefined;
}>;
export type DoubtQueryInput = z.infer<typeof DoubtQuerySchema>;
export type DoubtResolutionInput = z.infer<typeof DoubtResolutionSchema>;
export type PracticeExerciseInput = z.infer<typeof PracticeExerciseSchema>;
export type PracticeEvaluationInput = z.infer<typeof PracticeEvaluationSchema>;
export declare const GenerateAssessmentRequestSchema: z.ZodObject<{
    goalId: z.ZodString;
    title: z.ZodString;
    assessmentType: z.ZodEnum<["theory_exam", "mock_interview", "viva", "diagnostic", "topic_test"]>;
    questionCount: z.ZodDefault<z.ZodNumber>;
    timeLimitMinutes: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    goalId: string;
    assessmentType: "theory_exam" | "mock_interview" | "viva" | "diagnostic" | "topic_test";
    questionCount: number;
    timeLimitMinutes?: number | undefined;
}, {
    title: string;
    goalId: string;
    assessmentType: "theory_exam" | "mock_interview" | "viva" | "diagnostic" | "topic_test";
    questionCount?: number | undefined;
    timeLimitMinutes?: number | undefined;
}>;
export declare const ExamQuestionSchema: z.ZodObject<{
    id: z.ZodString;
    questionType: z.ZodNativeEnum<typeof AssessmentType>;
    prompt: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    correctAnswer: z.ZodAny;
    explanation: z.ZodString;
    marks: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    explanation: string;
    prompt: string;
    questionType: AssessmentType;
    marks: number;
    options?: string[] | undefined;
    correctAnswer?: any;
}, {
    id: string;
    explanation: string;
    prompt: string;
    questionType: AssessmentType;
    options?: string[] | undefined;
    correctAnswer?: any;
    marks?: number | undefined;
}>;
export declare const AssessmentSchema: z.ZodObject<{
    id: z.ZodString;
    goalId: z.ZodString;
    userId: z.ZodString;
    title: z.ZodString;
    assessmentType: z.ZodEnum<["theory_exam", "mock_interview", "viva", "diagnostic", "topic_test"]>;
    timeLimitMinutes: z.ZodOptional<z.ZodNumber>;
    passingScore: z.ZodDefault<z.ZodNumber>;
    questions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        questionType: z.ZodNativeEnum<typeof AssessmentType>;
        prompt: z.ZodString;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        correctAnswer: z.ZodAny;
        explanation: z.ZodString;
        marks: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        explanation: string;
        prompt: string;
        questionType: AssessmentType;
        marks: number;
        options?: string[] | undefined;
        correctAnswer?: any;
    }, {
        id: string;
        explanation: string;
        prompt: string;
        questionType: AssessmentType;
        options?: string[] | undefined;
        correctAnswer?: any;
        marks?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    goalId: string;
    userId: string;
    assessmentType: "theory_exam" | "mock_interview" | "viva" | "diagnostic" | "topic_test";
    passingScore: number;
    questions: {
        id: string;
        explanation: string;
        prompt: string;
        questionType: AssessmentType;
        marks: number;
        options?: string[] | undefined;
        correctAnswer?: any;
    }[];
    timeLimitMinutes?: number | undefined;
}, {
    title: string;
    id: string;
    goalId: string;
    userId: string;
    assessmentType: "theory_exam" | "mock_interview" | "viva" | "diagnostic" | "topic_test";
    questions: {
        id: string;
        explanation: string;
        prompt: string;
        questionType: AssessmentType;
        options?: string[] | undefined;
        correctAnswer?: any;
        marks?: number | undefined;
    }[];
    timeLimitMinutes?: number | undefined;
    passingScore?: number | undefined;
}>;
export declare const SubmitAssessmentAttemptSchema: z.ZodObject<{
    assessmentId: z.ZodString;
    idempotencyKey: z.ZodString;
    answers: z.ZodArray<z.ZodObject<{
        questionId: z.ZodString;
        learnerAnswer: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        questionId: string;
        learnerAnswer?: any;
    }, {
        questionId: string;
        learnerAnswer?: any;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    assessmentId: string;
    idempotencyKey: string;
    answers: {
        questionId: string;
        learnerAnswer?: any;
    }[];
}, {
    assessmentId: string;
    idempotencyKey: string;
    answers: {
        questionId: string;
        learnerAnswer?: any;
    }[];
}>;
export declare const GeneratePracticalRequestSchema: z.ZodObject<{
    goalId: z.ZodString;
    title: z.ZodString;
    domain: z.ZodDefault<z.ZodString>;
    difficulty: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    title: string;
    difficulty: number;
    goalId: string;
    domain: string;
}, {
    title: string;
    goalId: string;
    difficulty?: number | undefined;
    domain?: string | undefined;
}>;
export declare const PracticalTaskSchema: z.ZodObject<{
    id: z.ZodString;
    goalId: z.ZodString;
    userId: z.ZodString;
    title: z.ZodString;
    domain: z.ZodString;
    instructionsMarkdown: z.ZodString;
    starterTemplate: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    validationCriteria: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    goalId: string;
    userId: string;
    domain: string;
    instructionsMarkdown: string;
    starterTemplate: Record<string, any>;
    validationCriteria: string[];
}, {
    title: string;
    id: string;
    goalId: string;
    userId: string;
    domain: string;
    instructionsMarkdown: string;
    validationCriteria: string[];
    starterTemplate?: Record<string, any> | undefined;
}>;
export declare const SubmitPracticalSchema: z.ZodObject<{
    taskId: z.ZodString;
    submissionPayload: z.ZodRecord<z.ZodString, z.ZodAny>;
    attachmentIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    taskId: string;
    submissionPayload: Record<string, any>;
    attachmentIds: string[];
}, {
    taskId: string;
    submissionPayload: Record<string, any>;
    attachmentIds?: string[] | undefined;
}>;
export declare const EvidenceBreakdownSchema: z.ZodObject<{
    recall: z.ZodNumber;
    application: z.ZodNumber;
    practical: z.ZodNumber;
    viva: z.ZodNumber;
    transfer: z.ZodNumber;
    retention: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    practical: number;
    viva: number;
    recall: number;
    application: number;
    transfer: number;
    retention: number;
}, {
    practical: number;
    viva: number;
    recall: number;
    application: number;
    transfer: number;
    retention: number;
}>;
export declare const EvaluateMasteryRequestSchema: z.ZodObject<{
    conceptId: z.ZodString;
    conceptName: z.ZodString;
    evidence: z.ZodObject<{
        recall: z.ZodNumber;
        application: z.ZodNumber;
        practical: z.ZodNumber;
        viva: z.ZodNumber;
        transfer: z.ZodNumber;
        retention: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    }, {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    }>;
}, "strip", z.ZodTypeAny, {
    conceptName: string;
    conceptId: string;
    evidence: {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    };
}, {
    conceptName: string;
    conceptId: string;
    evidence: {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    };
}>;
export declare const ConceptMasterySchema: z.ZodObject<{
    conceptId: z.ZodString;
    conceptName: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    currentLevel: z.ZodNativeEnum<typeof MasteryLevel>;
    confidenceScore: z.ZodNumber;
    evidenceBreakdown: z.ZodObject<{
        recall: z.ZodNumber;
        application: z.ZodNumber;
        practical: z.ZodNumber;
        viva: z.ZodNumber;
        transfer: z.ZodNumber;
        retention: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    }, {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    }>;
    reasoningSummary: z.ZodString;
    evaluatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    conceptId: string;
    currentLevel: MasteryLevel;
    confidenceScore: number;
    evidenceBreakdown: {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    };
    reasoningSummary: string;
    evaluatedAt: string;
    conceptName?: string | undefined;
}, {
    userId: string;
    conceptId: string;
    currentLevel: MasteryLevel;
    confidenceScore: number;
    evidenceBreakdown: {
        practical: number;
        viva: number;
        recall: number;
        application: number;
        transfer: number;
        retention: number;
    };
    reasoningSummary: string;
    evaluatedAt: string;
    conceptName?: string | undefined;
}>;
export declare const RecordReviewResultSchema: z.ZodObject<{
    scheduleId: z.ZodString;
    recallScore: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    scheduleId: string;
    recallScore: number;
}, {
    scheduleId: string;
    recallScore: number;
}>;
export declare const VerifyClaimRequestSchema: z.ZodObject<{
    claim: z.ZodString;
    topic: z.ZodString;
    targetVersion: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    topic: string;
    claim: string;
    targetVersion?: string | undefined;
}, {
    topic: string;
    claim: string;
    targetVersion?: string | undefined;
}>;
export declare const SourceReferenceSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    conceptId: z.ZodOptional<z.ZodString>;
    lessonId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    url: z.ZodString;
    authorOrOrg: z.ZodOptional<z.ZodString>;
    versionTag: z.ZodOptional<z.ZodString>;
    isVerified: z.ZodDefault<z.ZodBoolean>;
    snippet: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    id: string;
    userId: string;
    url: string;
    isVerified: boolean;
    createdAt: string;
    lessonId?: string | undefined;
    conceptId?: string | undefined;
    authorOrOrg?: string | undefined;
    versionTag?: string | undefined;
    snippet?: string | undefined;
}, {
    title: string;
    id: string;
    userId: string;
    url: string;
    createdAt: string;
    lessonId?: string | undefined;
    conceptId?: string | undefined;
    authorOrOrg?: string | undefined;
    versionTag?: string | undefined;
    isVerified?: boolean | undefined;
    snippet?: string | undefined;
}>;
export declare const ResearchVerificationResultSchema: z.ZodObject<{
    claim: z.ZodString;
    isVerified: z.ZodBoolean;
    authoritativeSource: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        conceptId: z.ZodOptional<z.ZodString>;
        lessonId: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        url: z.ZodString;
        authorOrOrg: z.ZodOptional<z.ZodString>;
        versionTag: z.ZodOptional<z.ZodString>;
        isVerified: z.ZodDefault<z.ZodBoolean>;
        snippet: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
        id: string;
        userId: string;
        url: string;
        isVerified: boolean;
        createdAt: string;
        lessonId?: string | undefined;
        conceptId?: string | undefined;
        authorOrOrg?: string | undefined;
        versionTag?: string | undefined;
        snippet?: string | undefined;
    }, {
        title: string;
        id: string;
        userId: string;
        url: string;
        createdAt: string;
        lessonId?: string | undefined;
        conceptId?: string | undefined;
        authorOrOrg?: string | undefined;
        versionTag?: string | undefined;
        isVerified?: boolean | undefined;
        snippet?: string | undefined;
    }>;
    explanation: z.ZodString;
    versionWarning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    explanation: string;
    claim: string;
    isVerified: boolean;
    authoritativeSource: {
        title: string;
        id: string;
        userId: string;
        url: string;
        isVerified: boolean;
        createdAt: string;
        lessonId?: string | undefined;
        conceptId?: string | undefined;
        authorOrOrg?: string | undefined;
        versionTag?: string | undefined;
        snippet?: string | undefined;
    };
    versionWarning?: string | undefined;
}, {
    explanation: string;
    claim: string;
    isVerified: boolean;
    authoritativeSource: {
        title: string;
        id: string;
        userId: string;
        url: string;
        createdAt: string;
        lessonId?: string | undefined;
        conceptId?: string | undefined;
        authorOrOrg?: string | undefined;
        versionTag?: string | undefined;
        isVerified?: boolean | undefined;
        snippet?: string | undefined;
    };
    versionWarning?: string | undefined;
}>;
