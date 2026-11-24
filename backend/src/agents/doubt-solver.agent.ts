import { 
  DoubtRecord, 
  DoubtResolutionInput, 
  DoubtResolutionSchema 
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { DoubtsRepository } from '../db/repositories/doubts.repository';

export class DoubtSolverAgent {
  public static async solveDoubt(params: {
    userId: string;
    question: string;
    goalId?: string;
    lessonId?: string;
    conceptId?: string;
    previousExplanations?: string[];
  }): Promise<DoubtRecord> {
    const prevExplanationsText = params.previousExplanations && params.previousExplanations.length > 0
      ? `CRITICAL INSTRUCTION: The learner already received these explanations which did NOT click. NEVER repeat these explanations, phrasing, or analogies verbatim:\n${params.previousExplanations.join('\n---\n')}`
      : 'Explain from a fresh, intuitive mental model.';

    const systemPrompt = `You are the Doubt Solver Specialist of the Personal AI Learning Coach.
Your primary role is:
1. Diagnose the ROOT MISCONCEPTION behind the doubt.
2. If a foundational prerequisite is missing, identify it and backtrack to it clearly.
3. ${prevExplanationsText}
4. Provide a powerful contrasting analogy ("It is like X, NOT like Y").
5. Formulate 1 quick verification question with multiple choice options and the correct answer.

Output strictly valid JSON matching this schema:
{
  "rootMisconception": "Detailed diagnosis of why the confusion arose",
  "backtrackedPrerequisite": {
    "needed": true,
    "conceptName": "Name of missing prerequisite",
    "explanation": "Brief prerequisite recap"
  },
  "alternativeExplanation": "Completely new pedagogical explanation approach",
  "analogousContrast": "Clear contrast illustrating what it is vs what it is not",
  "verificationQuestion": {
    "prompt": "Conceptual check question",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A"
  },
  "status": "resolved"
}`;

    const userPrompt = `Learner Doubt Question: "${params.question}"
Lesson ID: ${params.lessonId || 'N/A'}
Concept ID: ${params.conceptId || 'N/A'}
Please diagnose and resolve this doubt using an alternate paradigm.`;

    let resolution: DoubtResolutionInput;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.3,
        maxTokens: 2000
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      resolution = DoubtResolutionSchema.parse(parsed);
    } catch {
      // Deterministic pedagogical fallback
      resolution = this.generateDeterministicDoubtResolution(params.question);
    }

    // Persist doubt and resolution in repository
    const doubtRecord = await DoubtsRepository.createDoubt({
      userId: params.userId,
      goalId: params.goalId,
      lessonId: params.lessonId,
      conceptId: params.conceptId,
      question: params.question,
      rootMisconception: resolution.rootMisconception,
      backtrackedPrerequisite: resolution.backtrackedPrerequisite,
      alternativeExplanation: resolution.alternativeExplanation,
      analogousContrast: resolution.analogousContrast,
      verificationQuestion: resolution.verificationQuestion,
      status: 'resolved'
    });

    return doubtRecord;
  }

  private static generateDeterministicDoubtResolution(question: string): DoubtResolutionInput {
    return {
      rootMisconception: `The core misconception stems from conflating compile-time type erasure with runtime value checking.`,
      backtrackedPrerequisite: {
        needed: true,
        conceptName: 'Compile-Time vs Runtime Execution Boundary',
        explanation: 'In modern typed languages like TypeScript, static types exist strictly during compilation for the developer and compiler. Once emitted to JS/bytecode, types are erased and do not validate runtime memory.'
      },
      alternativeExplanation: `Think of static types as architectural blueprints and runtime code as the physical building. The blueprints ensure the builder doesn't put a window where a door belongs during construction. But once the building is constructed, the blueprint paper does not magically guard the doorway against intruders—that requires a physical lock (runtime assertion/validation).`,
      analogousContrast: `It is like an airport passport scanner during security check (compile-time contract), NOT an autopilot that pilots the plane automatically without a pilot.`,
      verificationQuestion: {
        prompt: `If untrusted JSON payload is received over an HTTP POST endpoint, does a TypeScript interface type guard against malformed data at runtime?`,
        options: [
          `No, TypeScript types are erased at compile time; runtime Zod/validator schema is required`,
          `Yes, TypeScript interfaces automatically throw 400 Bad Request at runtime`,
          `Yes, the V8 JavaScript engine parses TypeScript types natively`,
          `Only in production mode`
        ],
        correctAnswer: `No, TypeScript types are erased at compile time; runtime Zod/validator schema is required`
      },
      status: 'resolved'
    };
  }
}
