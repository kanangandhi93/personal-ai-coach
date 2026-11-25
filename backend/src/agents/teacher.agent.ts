import { 
  TeacherExplanation, 
  TeacherExplanationSchema, 
  ExplanationStyle 
} from '@coach/shared';
import { llmAdapter } from '../ai/llm-adapter';
import { CurriculumRepository } from '../db/repositories/curriculum.repository';

export class TeacherAgent {
  public static async teachConcept(params: {
    goalId: string;
    lessonId: string;
    conceptName: string;
    style?: ExplanationStyle;
    userId: string;
    timeSpentSeconds?: number;
  }): Promise<TeacherExplanation> {
    const style = params.style || 'first_principles';

    const systemPrompt = `You are the Master Teacher of the Personal AI Learning Coach, dedicated to world-class pedagogical excellence.
Your goal is to make the topic CRYSTAL CLEAR, practical, and intuitive (following the Feynman Technique).
Never output dry, vague academic abstractions. Teach like a world-class mentor.

Teaching Guidelines:
1. "overview" (Intuition & Mental Model):
   - 2-3 engaging paragraphs.
   - Start with an everyday, relatable real-world analogy.
   - Contrast "The Amateur / Naive Approach" vs "The Professional / Engineered Approach".
   - Clearly explain what the concept is and why it transforms how you build systems.
2. "whyWhenWhere":
   - WHY: The exact problems and failures this solves.
   - WHEN: Clear triggers for when to use it (and when simple alternatives suffice).
   - WHERE: Concrete real-world production examples (e.g. OpenAI, GitHub Copilot, modern AI apps).
3. "internalMechanisms":
   - Step-by-step breakdown (Step 1, Step 2, Step 3) of how the engine/system processes data under the hood.
4. "codeSnippets":
   - 1-2 realistic, practical code or prompt template snippets directly demonstrating the concept.
   - Include realistic inputs and expected outputs.
5. "diagramMermaid":
   - A clean Mermaid.js flowchart or graph LR visualizing the flow.
6. "edgeCasesAndLimitations":
   - 3-5 real pitfalls, gotchas, and how to avoid them.
7. "understandingQuestions":
   - 2 scenario-based questions with options and answer keys.

Output strictly valid JSON matching this schema:
{
  "lessonId": "${params.lessonId}",
  "title": "Clear Topic Title",
  "overview": "Engaging, deep Feynman-style intuition with real-world analogy...",
  "whyWhenWhere": "**WHY**: ...\\n\\n**WHEN**: ...\\n\\n**WHERE**: ...",
  "internalMechanisms": "**Step 1:** ...\\n\\n**Step 2:** ...\\n\\n**Step 3:** ...",
  "codeSnippets": [
    {
      "language": "python",
      "code": "# Practical example\\n...",
      "explanation": "Line-by-line explanation of the snippet"
    }
  ],
  "diagramMermaid": "graph LR\\n  A[Input] --> B[Process]\\n  B --> C[Output]",
  "edgeCasesAndLimitations": [
    "Gotcha 1 and how to avoid it",
    "Gotcha 2 and how to avoid it"
  ],
  "understandingQuestions": [
    {
      "question": "Scenario question?",
      "options": ["A: ...", "B: ...", "C: ...", "D: ..."],
      "answer": "B"
    }
  ]
}`;

    const userPrompt = `Teach the concept: "${params.conceptName}"
Goal Context: "${params.goalId}"
Pedagogical Style: ${style}

Explain this concept thoroughly, practically, and compellingly. Teach with depth, clarity, and real code/prompt examples.`;

    let explanation: TeacherExplanation;

    try {
      const response = await llmAdapter.execute({
        systemPrompt,
        userPrompt,
        responseFormat: 'json',
        temperature: 0.3,
        maxTokens: 3000
      }, params.userId);

      const parsed = response.parsedJson ?? JSON.parse(response.text);
      parsed.lessonId = params.lessonId;

      // Normalization helpers
      if (typeof parsed.whyWhenWhere === 'object' && parsed.whyWhenWhere !== null) {
        parsed.whyWhenWhere = Object.entries(parsed.whyWhenWhere)
          .map(([k, v]) => `**${k}**: ${typeof v === 'string' ? v : JSON.stringify(v)}`)
          .join('\n\n');
      }
      if (Array.isArray(parsed.internalMechanisms)) {
        parsed.internalMechanisms = parsed.internalMechanisms
          .map((item: any) => typeof item === 'string' ? item : `**Step ${item.step || ''}:** ${item.description || item.text || JSON.stringify(item)}`)
          .join('\n\n');
      }
      if (Array.isArray(parsed.codeSnippets)) {
        parsed.codeSnippets = parsed.codeSnippets.map((cs: any) => ({
          language: cs.language || 'text',
          code: cs.code || '',
          explanation: cs.explanation || 'Practical code implementation'
        }));
      }
      if (Array.isArray(parsed.understandingQuestions)) {
        parsed.understandingQuestions = parsed.understandingQuestions.map((q: any) => ({
          question: q.question || '',
          options: Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: String(q.answer || 'A')
        }));
      }

      explanation = TeacherExplanationSchema.parse(parsed);
    } catch (err: any) {
      console.error('[TeacherAgent] LLM generation error, falling back:', err.message);
      explanation = this.generateDeterministicExplanation(params.lessonId, params.conceptName, style);
    }

    // Automatically record lesson progress
    const timeSpent = params.timeSpentSeconds || 120;
    await CurriculumRepository.updateLessonProgress(params.userId, params.lessonId, 'in_progress', timeSpent);

    return explanation;
  }

  private static generateDeterministicExplanation(lessonId: string, conceptName: string, style: ExplanationStyle): TeacherExplanation {
    return {
      lessonId,
      title: `${conceptName}`,
      overview: `In this lesson, we explore "${conceptName}". Rather than relying on guesswork, we approach this systematically by understanding the underlying problem, how inputs shape outcomes, and how to structure your workflow for reliable results.\n\nWhether you are writing instructions for an AI model or designing modular software, clarity of intent and well-defined constraints are the key factors separating amateur attempts from production-ready engineering.`,
      whyWhenWhere: `**WHY**: Without structured engineering, systems produce inconsistent, unrepeatable results.\n\n**WHEN**: Use this whenever you require predictable, high-quality outputs across multiple runs.\n\n**WHERE**: Widely used across production AI pipelines, automation workflows, and modern development stacks.`,
      internalMechanisms: `**Step 1:** The user provides high-level intent.\n\n**Step 2:** The system structures intent into clear context, instructions, and constraints.\n\n**Step 3:** The runtime executes the instructions and validates the output against expected criteria.`,
      codeSnippets: [
        {
          language: 'python',
          code: `# Practical Template for ${conceptName}\n\ndef execute_task(context: str, instruction: str) -> dict:\n    # 1. Provide role and constraints\n    prompt = f"Context: {context}\\nTask: {instruction}\\nFormat: JSON"\n    \n    # 2. Return structured execution\n    return {\n        "status": "success",\n        "prompt": prompt\n    }\n\n# Example invocation\nresult = execute_task("Production system", "Process inputs reliably")\nprint(result)`,
          explanation: `Demonstrates structuring context and clear instructions before execution.`
        }
      ],
      diagramMermaid: `graph LR\n  A[Clear Context] --> B[Structured Instruction]\n  B --> C[Execution & Validation]\n  C --> D[Reliable Output]`,
      edgeCasesAndLimitations: [
        `Ambiguous instructions lead to unpredictable outputs. Always be explicit.`,
        `Failing to validate inputs before processing causes cascading errors downstream.`,
        `Exceeding context windows or resource limits causes silent truncation.`
      ],
      understandingQuestions: [
        {
          question: `What is the most critical factor when applying ${conceptName}?`,
          options: [
            `Providing explicit context and clear constraints`,
            `Using as few words as possible without context`,
            `Ignoring output formatting`,
            `Relying entirely on default model assumptions`
          ],
          answer: `Providing explicit context and clear constraints`
        },
        {
          question: `Why is validation essential after generating an output?`,
          options: [
            `To verify that the result adheres to expected schemas and constraints`,
            `Because models never make mistakes`,
            `To increase processing latency`,
            `Validation is never needed in modern pipelines`
          ],
          answer: `To verify that the result adheres to expected schemas and constraints`
        }
      ]
    };
  }
}
