import { 
  CurriculumRoadmap, 
  CurriculumRoadmapSchema, 
  LearningGoal, 
  LearningPathMode,
  MasteryLevel
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { CurriculumRepository } from '../db/repositories/curriculum.repository';

export class CurriculumAgent {
  public static async generateRoadmap(goal: LearningGoal, userId: string): Promise<CurriculumRoadmap> {
    const systemPrompt = `You are the Principal Curriculum Agent of the Personal AI Learning Coach.
Build a structured, pedagogical roadmap for the learner's goal.
Output strictly valid JSON matching this schema:
{
  "goalId": "${goal.id}",
  "versionNumber": 1,
  "overview": "Comprehensive curriculum overview",
  "modules": [
    {
      "id": "mod-1",
      "title": "Module Title",
      "description": "Module summary",
      "orderIndex": 0,
      "estimatedMinutes": 60,
      "lessons": [
        {
          "id": "les-1",
          "moduleId": "mod-1",
          "title": "Lesson Title",
          "summary": "Lesson overview",
          "stageNumber": 2,
          "orderIndex": 0,
          "contentMarkdown": "Initial syllabus points"
        }
      ]
    }
  ],
  "concepts": [
    {
      "id": "c-1",
      "name": "Concept Name",
      "slug": "concept-slug",
      "description": "Concept description",
      "prerequisiteConceptIds": []
    }
  ],
  "diagnosticTest": [
    {
      "id": "diag-1",
      "prompt": "Diagnostic question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "difficulty": 1,
      "conceptTested": "c-1"
    }
  ]
}`;

    const userPrompt = `Learning Goal: "${goal.title}"
Description: "${goal.description || 'N/A'}"
Target Mastery Level: ${goal.targetMasteryLevel}
Path Mode: ${goal.pathMode}
Generate a multi-module syllabus covering foundations to advanced mastery with prerequisite diagnostic checks.`;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.2,
        maxTokens: 2048
      }, userId);

      const parsedJson = response.parsedJson ?? JSON.parse(response.text);
      parsedJson.goalId = goal.id;
      parsedJson.versionNumber = 1;

      const validated = CurriculumRoadmapSchema.parse(parsedJson);
      await CurriculumRepository.saveRoadmap(validated);
      return validated;
    } catch {
      // Deterministic pedagogical fallback for reliability & offline safety
      const fallbackRoadmap = this.generateDeterministicRoadmap(goal);
      await CurriculumRepository.saveRoadmap(fallbackRoadmap);
      return fallbackRoadmap;
    }
  }

  public static async adaptRoadmapForWeakConcept(goalId: string, weakConceptName: string, userId: string): Promise<CurriculumRoadmap> {
    const existing = await CurriculumRepository.getRoadmapByGoalId(goalId);
    if (!existing) {
      throw new Error(`Curriculum roadmap not found for goal ${goalId}`);
    }

    // Insert remedial reinforcement module
    const remedialModuleId = `mod-remedial-${Date.now()}`;
    const remedialModule = {
      id: remedialModuleId,
      title: `Remedial Deep Dive: ${weakConceptName}`,
      description: `Targeted diagnostic reinforcement to eliminate misconceptions in ${weakConceptName}.`,
      orderIndex: existing.modules.length,
      estimatedMinutes: 45,
      lessons: [
        {
          id: `les-remedial-1`,
          moduleId: remedialModuleId,
          title: `First Principles & Common Misconceptions: ${weakConceptName}`,
          summary: `Deconstructing why misconceptions occur in ${weakConceptName} with guided step-by-step diagnostics.`,
          stageNumber: 4, // Core Understanding reinforcement
          orderIndex: 0,
          contentMarkdown: `Reinforcement lesson targeting ${weakConceptName}.`
        }
      ]
    };

    existing.modules.push(remedialModule);
    existing.versionNumber += 1;
    await CurriculumRepository.saveRoadmap(existing);
    return existing;
  }

  private static generateDeterministicRoadmap(goal: LearningGoal): CurriculumRoadmap {
    const topic = goal.title;
    return {
      goalId: goal.id,
      versionNumber: 1,
      overview: `Mastery curriculum for "${topic}", structured from prerequisite foundations through independent problem-solving and demonstrated mastery.`,
      modules: [
        {
          id: `mod-${goal.id}-1`,
          title: `Foundations & Core Principles of ${topic}`,
          description: `Master basic terminology, underlying mental models, and environmental setup for ${topic}.`,
          orderIndex: 0,
          estimatedMinutes: 75,
          lessons: [
            {
              id: `les-${goal.id}-101`,
              moduleId: `mod-${goal.id}-1`,
              title: `Prerequisites, Context & "Why" ${topic} Exists`,
              summary: `High-level historical context, why this exists, and mental model overview.`,
              stageNumber: 1,
              orderIndex: 0,
              contentMarkdown: `# Context & Foundations\nUnderstand the problem space that ${topic} solves.`
            },
            {
              id: `les-${goal.id}-102`,
              moduleId: `mod-${goal.id}-1`,
              title: `Core Syntax & Essential Vocabulary`,
              summary: `Fundamental building blocks and rules of engagement.`,
              stageNumber: 2,
              orderIndex: 1,
              contentMarkdown: `# Core Syntax\nDetailed definitions and primary conventions.`
            }
          ]
        },
        {
          id: `mod-${goal.id}-2`,
          title: `Internal Mechanisms & Architecture`,
          description: `Deep-dive into how ${topic} operates under the hood, memory models, and execution flow.`,
          orderIndex: 1,
          estimatedMinutes: 90,
          lessons: [
            {
              id: `les-${goal.id}-201`,
              moduleId: `mod-${goal.id}-2`,
              title: `Execution Flow & Internal Mechanisms`,
              summary: `Under-the-hood engine architecture and life-cycle behaviors.`,
              stageNumber: 6,
              orderIndex: 0,
              contentMarkdown: `# Internal Architecture\nStep-by-step execution diagrams and state transitions.`
            },
            {
              id: `les-${goal.id}-202`,
              moduleId: `mod-${goal.id}-2`,
              title: `Edge Cases, Antipatterns & Performance Limits`,
              summary: `Critical pitfalls, corner cases, and anti-patterns to avoid.`,
              stageNumber: 7,
              orderIndex: 1,
              contentMarkdown: `# Edge Cases\nBoundary conditions and failure modes.`
            }
          ]
        },
        {
          id: `mod-${goal.id}-3`,
          title: `Practical Application & Demonstrated Mastery`,
          description: `Guided scenario practice, real-world hands-on project, and mock evaluation.`,
          orderIndex: 2,
          estimatedMinutes: 120,
          lessons: [
            {
              id: `les-${goal.id}-301`,
              moduleId: `mod-${goal.id}-3`,
              title: `Hands-on Project & Guided Practice`,
              summary: `Construct an end-to-end practical solution demonstrating concepts.`,
              stageNumber: 10,
              orderIndex: 0,
              contentMarkdown: `# Practical Hands-On\nProject specification and acceptance tests.`
            },
            {
              id: `les-${goal.id}-302`,
              moduleId: `mod-${goal.id}-3`,
              title: `Mastery Verification & Viva Simulation`,
              summary: `Comprehensive evaluation of recall, application, and teaching ability.`,
              stageNumber: 14,
              orderIndex: 1,
              contentMarkdown: `# Mastery Verification\nFinal evaluation rubric.`
            }
          ]
        }
      ],
      concepts: [
        {
          id: `c-${goal.id}-1`,
          name: `${topic} Prerequisites`,
          slug: 'prerequisites',
          description: 'Basic environment, syntax, and foundational mental model.',
          prerequisiteConceptIds: []
        },
        {
          id: `c-${goal.id}-2`,
          name: `${topic} Core Concepts`,
          slug: 'core-concepts',
          description: 'Primary idioms, patterns, and working structures.',
          prerequisiteConceptIds: [`c-${goal.id}-1`]
        },
        {
          id: `c-${goal.id}-3`,
          name: `${topic} Internal Architecture`,
          slug: 'internal-architecture',
          description: 'Under-the-hood mechanics, memory, and performance boundaries.',
          prerequisiteConceptIds: [`c-${goal.id}-2`]
        }
      ],
      diagnosticTest: [
        {
          id: `diag-${goal.id}-1`,
          prompt: `What is the primary motivation or foundational benefit of ${topic}?`,
          options: [
            `To provide structured abstractions and solve scalability/maintainability bottlenecks`,
            `To add arbitrary complexity without performance benefits`,
            `To replace all existing programming languages unconditionally`,
            `None of the above`
          ],
          correctAnswer: `To provide structured abstractions and solve scalability/maintainability bottlenecks`,
          difficulty: 1,
          conceptTested: `c-${goal.id}-1`
        },
        {
          id: `diag-${goal.id}-2`,
          prompt: `When encountering an unexpected edge-case or failure mode in ${topic}, what is the best first step?`,
          options: [
            `Trace the execution flow and verify internal state invariants against specifications`,
            `Restart the machine and ignore the issue`,
            `Delete the codebase and switch frameworks`,
            `Randomly add print statements without hypothesis testing`
          ],
          correctAnswer: `Trace the execution flow and verify internal state invariants against specifications`,
          difficulty: 2,
          conceptTested: `c-${goal.id}-3`
        }
      ]
    };
  }
}
