import { 
  AssessmentRecord, 
  AssessmentAttemptRecord, 
  AssessmentType,
  ExamQuestion 
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { AssessmentsRepository } from '../db/repositories/assessments.repository';

export class ExamInterviewAgent {
  public static async generateAssessment(params: {
    goalId: string;
    userId: string;
    title: string;
    assessmentType: AssessmentRecord['assessmentType'];
    questionCount?: number;
    timeLimitMinutes?: number;
  }): Promise<AssessmentRecord> {
    const id = `asm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const count = params.questionCount || 4;

    const systemPrompt = `You are the Examination, Interview & Viva Specialist of the Personal AI Learning Coach.
Build an authentic assessment for "${params.title}".
Mode: "${params.assessmentType}".
Generate exactly ${count} mixed questions (MCQ, Multi-select, True/False, Short Answer, Scenario, Coding/Viva).
Output strictly valid JSON matching this schema:
{
  "id": "${id}",
  "goalId": "${params.goalId}",
  "userId": "${params.userId}",
  "title": "${params.title}",
  "assessmentType": "${params.assessmentType}",
  "timeLimitMinutes": ${params.timeLimitMinutes || 30},
  "passingScore": 70,
  "questions": [
    {
      "id": "q-1",
      "questionType": "mcq",
      "prompt": "Question prompt",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why A is correct",
      "marks": 25
    }
  ]
}`;

    const userPrompt = `Topic: "${params.title}"
Type: ${params.assessmentType}
Construct ${count} comprehensive questions testing deep recall, edge cases, and transfer.`;

    let assessment: AssessmentRecord;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.2,
        maxTokens: 2500
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        throw new Error('Questions array missing in model output');
      }
      parsed.id = id;
      parsed.goalId = params.goalId;
      parsed.userId = params.userId;
      parsed.assessmentType = params.assessmentType;
      parsed.passingScore = 70;
      assessment = parsed as AssessmentRecord;
    } catch {
      assessment = this.generateDeterministicAssessment(id, params.goalId, params.userId, params.title, params.assessmentType);
    }

    await AssessmentsRepository.saveAssessment(assessment);
    return assessment;
  }

  public static async evaluateAttempt(params: {
    assessmentId: string;
    userId: string;
    idempotencyKey: string;
    answers: Array<{ questionId: string; learnerAnswer?: any }>;
  }): Promise<AssessmentAttemptRecord> {
    const assessment = await AssessmentsRepository.getAssessmentById(params.assessmentId);
    if (!assessment) throw new Error(`Assessment ${params.assessmentId} not found`);

    // Create or retrieve idempotent attempt
    const attempt = await AssessmentsRepository.createAttempt({
      assessmentId: params.assessmentId,
      userId: params.userId,
      status: 'in_progress',
      idempotencyKey: params.idempotencyKey
    });

    // If already graded, return existing attempt (Idempotency guarantee)
    if (attempt.status === 'graded') {
      return attempt;
    }

    // Grade each response against question rubrics
    let totalScore = 0;
    let maxScore = 0;
    const gradedResponses: NonNullable<AssessmentAttemptRecord['responses']> = [];

    for (const q of assessment.questions) {
      maxScore += q.marks;
      const given = params.answers.find(a => a.questionId === q.id);
      const learnerAns = given?.learnerAnswer;

      const isMatch = String(learnerAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      const scoreAwarded = isMatch ? q.marks : 0;
      totalScore += scoreAwarded;

      gradedResponses.push({
        questionId: q.id,
        learnerAnswer: learnerAns,
        isCorrect: isMatch,
        scoreAwarded,
        remarks: isMatch ? 'Accurate answer' : `Incorrect. Expected: ${q.correctAnswer}. ${q.explanation}`
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    const feedback = {
      totalScore,
      maxScore,
      percentage,
      passed,
      summary: passed 
        ? `Passed with ${percentage}%! Demonstrated solid understanding across questions.`
        : `Score: ${percentage}% (Passing threshold: ${assessment.passingScore}%). Focus on missed concepts.`
    };

    const gradedAttempt = await AssessmentsRepository.gradeAttempt(
      attempt.id,
      percentage,
      feedback,
      gradedResponses
    );

    return gradedAttempt!;
  }

  private static generateDeterministicAssessment(
    id: string, 
    goalId: string, 
    userId: string, 
    title: string, 
    assessmentType: AssessmentRecord['assessmentType']
  ): AssessmentRecord {
    return {
      id,
      goalId,
      userId,
      title,
      assessmentType,
      timeLimitMinutes: 30,
      passingScore: 70,
      questions: [
        {
          id: 'q-101',
          questionType: AssessmentType.MCQ,
          prompt: `What is the primary rationale for preferring immutable data structures in concurrent applications?`,
          options: [
            `Eliminates data race conditions and eliminates the need for aggressive synchronization locks`,
            `Reduces memory consumption to zero`,
            `Speeds up V8 compilation times`,
            `Disables Garbage Collection entirely`
          ],
          correctAnswer: `Eliminates data race conditions and eliminates the need for aggressive synchronization locks`,
          explanation: `When state cannot be mutated in place, multiple threads/actors can safely read concurrently without locking.`,
          marks: 50
        },
        {
          id: 'q-102',
          questionType: AssessmentType.SCENARIO,
          prompt: `During a network partition in a consensus cluster, how should nodes handle incoming client write requests if quorum cannot be achieved?`,
          options: [
            `Reject writes or queue them, refusing to commit to prevent split-brain inconsistencies`,
            `Commit writes anyway and overwrite changes later`,
            `Crash the cluster immediately`,
            `Switch from Paxos to HTTP polling`
          ],
          correctAnswer: `Reject writes or queue them, refusing to commit to prevent split-brain inconsistencies`,
          explanation: `Consistent distributed systems must trade availability to prevent split-brain partition divergence.`,
          marks: 50
        }
      ],
      createdAt: new Date().toISOString()
    };
  }
}
