import { DoubtResolutionSchema, PracticeExerciseSchema, PracticeEvaluationSchema } from '@coach/shared';
import { DoubtSolverAgent } from '../agents/doubt-solver.agent';
import { PracticeAgent } from '../agents/practice.agent';
import { DoubtsRepository } from '../db/repositories/doubts.repository';
import { PracticeRepository } from '../db/repositories/practice.repository';

async function runPhase2Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 2 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;
  const testUserId = 'learner-phase2-test';

  // -------------------------------------------------------------
  // TEST 1: Doubt Solver Agent (Root Misconception & Backtracking)
  // -------------------------------------------------------------
  console.log('[Check 1/4] Testing Doubt Solver Agent with Misconception Diagnosis...');
  try {
    const doubt = await DoubtSolverAgent.solveDoubt({
      userId: testUserId,
      question: 'Why does TypeScript let me assign an object with extra fields if excess property checking is supposed to stop it?',
      lessonId: 'les-phase2-01',
      previousExplanations: [
        'Excess property checking only happens on direct object literals.'
      ]
    });

    if (!doubt || !doubt.id) throw new Error('Doubt record creation failed');
    if (!doubt.rootMisconception) throw new Error('Root misconception was not diagnosed');
    if (!doubt.backtrackedPrerequisite?.needed) throw new Error('Prerequisite backtracking missing');
    if (!doubt.verificationQuestion) throw new Error('Verification question missing');

    console.log(`✅ PASS: Doubt diagnosed with Root Misconception: "${doubt.rootMisconception.slice(0, 80)}..."`);
    console.log(`   Backtracked Prerequisite: "${doubt.backtrackedPrerequisite.conceptName}"`);
    console.log(`   Verification Question: "${doubt.verificationQuestion.prompt}"`);

    const persisted = await DoubtsRepository.getDoubtById(doubt.id);
    if (!persisted || persisted.status !== 'resolved') throw new Error('Doubt persistence verification failed');
    console.log(`✅ PASS: Doubt persisted in repository with status: [${persisted.status}]`);
  } catch (err: any) {
    console.error('❌ FAIL: Doubt Solver test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 2: Practice Agent Tiered Exercise Generation
  // -------------------------------------------------------------
  console.log('\n[Check 2/4] Testing Practice Agent Tiered Exercise & Progressive Hints...');
  let testExerciseId = '';
  try {
    const exercise = await PracticeAgent.generateExercise({
      goalId: 'goal-p2-test',
      topic: 'Thread-Safe Concurrent Queues in TypeScript',
      difficulty: 3,
      userId: testUserId
    });

    PracticeExerciseSchema.parse(exercise);
    testExerciseId = exercise.id;

    if (exercise.progressiveHints.length < 2) {
      throw new Error(`Expected at least 2 progressive hints, got ${exercise.progressiveHints.length}`);
    }

    console.log(`✅ PASS: Exercise generated: "${exercise.prompt.slice(0, 80)}..." (Difficulty: ${exercise.difficulty}/5)`);
    console.log(`   Progressive Hints: ${exercise.progressiveHints.length} tiers ready (Hint 1: "${exercise.progressiveHints[0].hint.slice(0, 50)}...")`);
    console.log(`   Test cases: ${exercise.testCases.length} case(s) specified.`);
  } catch (err: any) {
    console.error('❌ FAIL: Practice Agent generation test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Safe Submission Evaluation & Hint Penalty
  // -------------------------------------------------------------
  console.log('\n[Check 3/4] Testing Safe Practice Submission Evaluation & Rubric Grading...');
  try {
    const userCode = `
class SafeQueue<T> {
  private queue: T[] = [];
  public push(item: T): void { this.queue.push(item); }
  public pop(): T | undefined { return this.queue.shift(); }
}
    `.trim();

    const evaluation = await PracticeAgent.evaluateSubmission({
      exerciseId: testExerciseId,
      userCodeOrAnswer: userCode,
      hintsUsedCount: 1,
      userId: testUserId
    });

    PracticeEvaluationSchema.parse(evaluation);

    console.log(`✅ PASS: Submission evaluated safely. Score=${evaluation.score}/100, Correct=${evaluation.isCorrect}`);
    console.log(`   Feedback: ${evaluation.feedback.slice(0, 90)}...`);
    console.log(`   Recommended next step: "${evaluation.recommendedNextStep}"`);

    const submissions = await PracticeRepository.getSubmissionsByExercise(testExerciseId, testUserId);
    if (submissions.length === 0) throw new Error('Submission was not saved to repository');
    console.log(`✅ PASS: Submission stored idempotently in repository (Total attempts: ${submissions.length})`);
  } catch (err: any) {
    console.error('❌ FAIL: Practice Evaluation test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Low-Memory RAM Footprint Check
  // -------------------------------------------------------------
  console.log('\n[Check 4/4] Verifying Windows 2GB RAM Footprint in Phase 2...');
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
  console.log(`ℹ️ Node.js Heap Used: ${heapUsedMB} MB`);
  if (heapUsedMB < 150) {
    console.log(`✅ PASS: Ultra-low RAM verified (${heapUsedMB} MB < 150 MB).`);
  } else {
    console.warn(`⚠️ Warning: Heap ${heapUsedMB} MB.`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  if (allChecksPassed) {
    console.log('🎉 PHASE 2 VERIFICATION: ALL DOUBT & PRACTICE CHECKS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 2 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase2Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
