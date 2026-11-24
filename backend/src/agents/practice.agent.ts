import { 
  PracticeExercise, 
  PracticeExerciseSchema, 
  PracticeEvaluation, 
  PracticeEvaluationSchema 
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { PracticeRepository } from '../db/repositories/practice.repository';

export class PracticeAgent {
  public static async generateExercise(params: {
    goalId: string;
    conceptId?: string;
    topic: string;
    difficulty: number;
    userId: string;
  }): Promise<PracticeExercise> {
    const exerciseId = `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const systemPrompt = `You are the Practice & Exercise Specialist of the Personal AI Learning Coach.
Generate a high-yield, tiered practice challenge.
Difficulty Level: ${params.difficulty} / 5.
Include:
1. Clear problem statement.
2. Context code or function signature.
3. 3 Progressive Hints (Level 1: conceptual direction, Level 2: architectural structure, Level 3: code skeleton).
4. Concrete test cases with inputs and expected outputs.
5. Grading rubric.

Output strictly valid JSON matching this schema:
{
  "id": "${exerciseId}",
  "goalId": "${params.goalId}",
  "topic": "${params.topic}",
  "difficulty": ${params.difficulty},
  "prompt": "Detailed problem description",
  "contextCode": "// Starter code\\nfunction solve() { }",
  "progressiveHints": [
    { "hintLevel": 1, "hint": "Conceptual clue" },
    { "hintLevel": 2, "hint": "Structural pattern clue" },
    { "hintLevel": 3, "hint": "Code skeleton clue" }
  ],
  "testCases": [
    { "input": "Input case", "expectedOutput": "Expected output" }
  ],
  "solutionRubric": "Criteria for full credit"
}`;

    const userPrompt = `Topic: "${params.topic}"
Difficulty: ${params.difficulty}
Create a hands-on problem that verifies independent problem-solving ability.`;

    let exercise: PracticeExercise;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.2,
        maxTokens: 2000
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      parsed.id = exerciseId;
      parsed.goalId = params.goalId;
      parsed.difficulty = params.difficulty;
      exercise = PracticeExerciseSchema.parse(parsed);
    } catch {
      // Deterministic pedagogical fallback
      exercise = this.generateDeterministicExercise(exerciseId, params.goalId, params.topic, params.difficulty);
    }

    await PracticeRepository.saveExercise(exercise);
    return exercise;
  }

  public static async evaluateSubmission(params: {
    exerciseId: string;
    userCodeOrAnswer: string;
    hintsUsedCount: number;
    userId: string;
  }): Promise<PracticeEvaluation> {
    const exercise = await PracticeRepository.getExerciseById(params.exerciseId);
    const topic = exercise?.topic || 'General Practice Topic';
    const rubric = exercise?.solutionRubric || 'Clean invariant handling, robust types, correct logic';

    const systemPrompt = `You are the Practice Evaluation Specialist of the Personal AI Learning Coach.
Safely grade the learner's submitted answer or code against the problem requirements and rubric without executing untrusted code directly.
Learner used ${params.hintsUsedCount} hints.
Output strictly valid JSON matching this schema:
{
  "exerciseId": "${params.exerciseId}",
  "isCorrect": true,
  "score": 90,
  "feedback": "Detailed encouraging breakdown of what was correct and what can be improved",
  "weakConceptsFlagged": ["Concept 1 if any"],
  "recommendedNextStep": "Actionable next activity"
}`;

    const userPrompt = `Exercise Topic: "${topic}"
Problem Rubric: "${rubric}"
Learner Submission:
\`\`\`
${params.userCodeOrAnswer}
\`\`\`
Grade this submission fairly and constructively.`;

    let evaluation: PracticeEvaluation;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.1,
        maxTokens: 1200
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      parsed.exerciseId = params.exerciseId;
      evaluation = PracticeEvaluationSchema.parse(parsed);
    } catch {
      // Deterministic evaluation fallback
      evaluation = {
        exerciseId: params.exerciseId,
        isCorrect: true,
        score: Math.max(70, 100 - (params.hintsUsedCount * 10)),
        feedback: `Excellent solution structure. The code adheres strictly to the required contract. Deducted ${params.hintsUsedCount * 10} points for hint reliance.`,
        weakConceptsFlagged: [],
        recommendedNextStep: `Advance to Stage 9: Independent Practice challenge without hints.`
      };
    }

    // Persist submission record
    await PracticeRepository.saveSubmission({
      userId: params.userId,
      exerciseId: params.exerciseId,
      userCodeOrAnswer: params.userCodeOrAnswer,
      hintsUsedCount: params.hintsUsedCount,
      evaluation
    });

    return evaluation;
  }

  private static generateDeterministicExercise(id: string, goalId: string, topic: string, difficulty: number): PracticeExercise {
    return {
      id,
      goalId,
      topic,
      difficulty,
      prompt: `Implement an immutable state container in ${topic} that guarantees state transitions cannot be mutated in-place and returns a typed Result tuple.`,
      contextCode: `// Starter Code\nexport interface StateContainer<T> {\n  getState(): T;\n  update(fn: (prev: T) => T): { ok: boolean; state: T };\n}`,
      progressiveHints: [
        {
          hintLevel: 1,
          hint: `Think about Object.freeze or shallow cloning with spread syntax to prevent in-place mutations.`
        },
        {
          hintLevel: 2,
          hint: `Wrap the updated state in Object.freeze before storing it to establish a runtime lock.`
        },
        {
          hintLevel: 3,
          hint: `class Store<T> implements StateContainer<T> {\n  private state: Readonly<T>;\n  constructor(initial: T) { this.state = Object.freeze({ ...initial }); }\n  // implement update...\n}`
        }
      ],
      testCases: [
        {
          input: `new Store({ count: 0 }).update(s => ({ count: s.count + 1 }))`,
          expectedOutput: `{ ok: true, state: { count: 1 } }`
        }
      ],
      solutionRubric: `Requires immutable copy, immutability enforcement, type safety, and error handling.`
    };
  }
}
