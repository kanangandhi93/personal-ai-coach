# Architecture & Technical Design

## 1. System Vision
The **Personal AI Learning Coach** is a ₹0 monthly budget, multi-agent AI teaching institution built to take a learner from absolute beginner (`L0`) to demonstrated mastery (`L6`) across any subject, skill, or exam.

---

## 2. Hardware Constraint & Low-RAM Optimizations (Windows 2GB RAM Target)
To run comfortably on a Windows PC with 2GB of RAM:
1. **Zero Local AI Models**: No heavy Ollama/LLaMA/Docker background containers. All inference is offloaded to cloud free tiers (Gemini, Groq, OpenRouter, Cerebras).
2. **Zero Heavy Local Databases**: Offloaded to cloud Supabase Free Tier (PostgreSQL + Auth + Storage).
3. **Ultra-lightweight Node.js REST API**: Uses native `fetch` (Node 18+), Express, and Zod. Memory footprint kept under 100MB RAM.

---

## 3. Database Schema (23 Core Tables + Strict RLS)
All tables use UUID primary keys, foreign key constraints, UTC timestamps, and Supabase Row Level Security (`auth.uid() = user_id`):

| # | Table Name | Purpose |
|---|------------|---------|
| 1 | `profiles` | Learner profile and preferences |
| 2 | `learning_goals` | Learning topics/skills with target mastery level |
| 3 | `curriculum_versions` | Versioned roadmaps with concept dependency graphs |
| 4 | `modules` | Major units in the curriculum |
| 5 | `lessons` | Granular lessons mapped to stages 1 to 15 |
| 6 | `concepts` | Atomic knowledge concepts and dependencies |
| 7 | `lesson_progress` | Time spent and completion tracking |
| 8 | `concept_mastery` | Multi-evidence mastery tracking (L0 to L6) |
| 9 | `learning_sessions` | Active and historical study sessions |
| 10 | `messages` | Chat messages between learner and specialized agents |
| 11 | `doubts` | Logged doubts with root misconception analysis |
| 12 | `notes` | Learner notes, takeaways, and bookmarks |
| 13 | `questions` | Question bank (MCQ, scenario, coding, interview) |
| 14 | `assessments` | Tests, mock exams, and diagnostic quizzes |
| 15 | `assessment_attempts` | Idempotent exam attempt tracking |
| 16 | `responses` | Individual answer evaluations and marks |
| 17 | `practical_tasks` | Hands-on coding/lab assignments |
| 18 | `practical_submissions` | Submissions and automated grading reports |
| 19 | `review_schedule` | Spaced repetition intervals (Day 1, 3, 7, 30) |
| 20 | `agent_runs` | Idempotent agent execution history |
| 21 | `ai_usage` | Quota & token usage tracker for ₹0 cost safety |
| 22 | `source_references` | Authoritative source references and citations |
| 23 | `attachments` | File metadata linked to Supabase Storage |

---

## 4. Multi-Agent System (9 Specialized Agents + Orchestrator)
1. **Learning Orchestrator**: Entry controller; determines optimal agent routing to minimize tokens.
2. **Curriculum Agent**: Builds structured roadmaps and prerequisite trees.
3. **Teacher Agent**: Progressive explanations (why, when, how, mechanisms, edge cases).
4. **Doubt Solver Agent**: Misconception diagnosis and prerequisite backtracking.
5. **Practice Agent**: Generates exercises with progressive hints.
6. **Exam & Interview Agent**: Conducts mock exams, vivas, and interviews.
7. **Practical Agent**: Real-world lab exercises and static evaluation.
8. **Evaluator Agent**: Computes L0-L6 mastery with transparent evidence breakdown.
9. **Research Agent**: Validates technical versions and attaches source references.

---

## 5. 15-Stage Adaptive Lifecycle
1. Prerequisite Assessment
2. Basic Concepts
3. Fundamentals
4. Core Understanding
5. Advanced Concepts
6. Internal Architecture & Mechanisms
7. Edge Cases & Limitations
8. Guided Practice
9. Independent Practice
10. Practical Application
11. Theory Exam
12. Interview & Viva
13. Practical Exam
14. Final Evaluation
15. Revision & Mastery Verification
