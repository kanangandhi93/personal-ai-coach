import { 
  ConceptMasteryRecord, 
  MasteryLevel, 
  ConceptMasterySchema 
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { MasteryRepository } from '../db/repositories/mastery.repository';

export class EvaluatorAgent {
  public static async evaluateMastery(params: {
    conceptId: string;
    conceptName: string;
    userId: string;
    evidence: {
      recall: number;
      application: number;
      practical: number;
      viva: number;
      transfer: number;
      retention: number;
    };
  }): Promise<ConceptMasteryRecord> {
    const avgScore = Math.round(
      (params.evidence.recall +
       params.evidence.application +
       params.evidence.practical +
       params.evidence.viva +
       params.evidence.transfer +
       params.evidence.retention) / 6
    );

    let assignedLevel: MasteryLevel;
    if (avgScore >= 90 && params.evidence.transfer >= 85 && params.evidence.viva >= 85) {
      assignedLevel = MasteryLevel.L6; // Demonstrated Mastery
    } else if (avgScore >= 80 && params.evidence.transfer >= 75) {
      assignedLevel = MasteryLevel.L5; // Deep Transfer & Edge Cases
    } else if (avgScore >= 70 && params.evidence.application >= 70) {
      assignedLevel = MasteryLevel.L4; // Independent Problem Solving
    } else if (avgScore >= 60) {
      assignedLevel = MasteryLevel.L3; // Guided Application
    } else if (avgScore >= 40) {
      assignedLevel = MasteryLevel.L2; // Core Recall
    } else if (avgScore >= 20) {
      assignedLevel = MasteryLevel.L1; // Intuitive
    } else {
      assignedLevel = MasteryLevel.L0; // Not Started
    }

    const systemPrompt = `You are the Evaluator Agent of the Personal AI Learning Coach.
Provide a transparent, human-readable justification explaining exactly "Why this level was assigned".
Concept: "${params.conceptName}".
Calculated Level: ${assignedLevel}.
Average Evidence Score: ${avgScore}%.
Output strictly valid JSON matching this schema:
{
  "reasoningSummary": "Clear 2-sentence explanation specifying strengths and exact gaps holding back the next level"
}`;

    const userPrompt = `Evidence breakdown for ${params.conceptName}:
- Recall: ${params.evidence.recall}%
- Application: ${params.evidence.application}%
- Practical: ${params.evidence.practical}%
- Viva / Explanation: ${params.evidence.viva}%
- Transfer: ${params.evidence.transfer}%
- Retention: ${params.evidence.retention}%
Justify assignment of ${assignedLevel}.`;

    let reasoningSummary = `Level ${assignedLevel} assigned based on consistent multi-evidence performance averaging ${avgScore}%. Solid foundation across practical applications with clear path to demonstrated mastery.`;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.1,
        maxTokens: 500
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      if (parsed.reasoningSummary) {
        reasoningSummary = parsed.reasoningSummary;
      }
    } catch {
      // Deterministic reasoning fallback
    }

    const record: ConceptMasteryRecord = {
      conceptId: params.conceptId,
      conceptName: params.conceptName,
      userId: params.userId,
      currentLevel: assignedLevel,
      confidenceScore: avgScore,
      evidenceBreakdown: params.evidence,
      reasoningSummary,
      evaluatedAt: new Date().toISOString()
    };

    await MasteryRepository.saveMastery(record);
    return record;
  }
}
