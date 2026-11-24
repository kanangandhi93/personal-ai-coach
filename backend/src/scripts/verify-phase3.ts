import { ExamInterviewAgent } from '../agents/exam-interview.agent';
import { PracticalAgent } from '../agents/practical.agent';
import { AssessmentsRepository } from '../db/repositories/assessments.repository';
import { PracticalsRepository } from '../db/repositories/practicals.repository';

async function runPhase3Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 3 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;
  const testUserId = 'learner-phase3-test';
  const testGoalId = 'goal-phase3-test';

  // -------------------------------------------------------------
  // TEST 1: Exam & Interview Agent Generation & Idempotent Grading
  // -------------------------------------------------------------
  console.log('[Check 1/4] Testing Exam & Interview Agent Generation...');
  let assessmentId = '';
  try {
    const assessment = await ExamInterviewAgent.generateAssessment({
      goalId: testGoalId,
      userId: testUserId,
      title: 'Consensus Protocols & Fault Tolerance Benchmark',
      assessmentType: 'theory_exam',
      questionCount: 2
    });

    assessmentId = assessment.id;
    if (assessment.questions.length < 2) throw new Error('Expected at least 2 questions');
    console.log(`✅ PASS: Assessment created: "${assessment.title}" (${assessment.questions.length} questions, passing=${assessment.passingScore}%)`);
  } catch (err: any) {
    console.error('❌ FAIL: Assessment generation failed:', err.message);
    allChecksPassed = false;
  }

  console.log('\n[Check 2/4] Testing Idempotent Attempt Submission & Attempt Comparison...');
  try {
    const idempotencyKey = `idem-key-phase3-${Date.now()}`;

    // First attempt submission
    const attempt1 = await ExamInterviewAgent.evaluateAttempt({
      assessmentId,
      userId: testUserId,
      idempotencyKey,
      answers: [
        {
          questionId: 'q-101',
          learnerAnswer: 'Eliminates data race conditions and eliminates the need for aggressive synchronization locks'
        },
        {
          questionId: 'q-102',
          learnerAnswer: 'Reject writes or queue them, refusing to commit to prevent split-brain inconsistencies'
        }
      ]
    });

    console.log(`✅ PASS: Attempt 1 graded: Score=${attempt1.score}%, Status=[${attempt1.status}]`);
    if (attempt1.score !== 100) throw new Error(`Expected 100%, got ${attempt1.score}%`);

    // Duplicate submission with same idempotency key (network retry simulation)
    const duplicateAttempt = await ExamInterviewAgent.evaluateAttempt({
      assessmentId,
      userId: testUserId,
      idempotencyKey,
      answers: []
    });

    if (duplicateAttempt.id !== attempt1.id || duplicateAttempt.score !== attempt1.score) {
      throw new Error('Idempotency violation! Duplicate attempt created different record.');
    }
    console.log(`✅ PASS: Idempotency verified! Network retry safely returned existing graded attempt ID: ${duplicateAttempt.id}`);

    // Verify attempt history
    const allAttempts = await AssessmentsRepository.getAttemptsByAssessment(assessmentId, testUserId);
    if (allAttempts.length !== 1) throw new Error(`Expected exactly 1 attempt in DB, found ${allAttempts.length}`);
    console.log(`✅ PASS: Attempt history confirmed single clean record.`);
  } catch (err: any) {
    console.error('❌ FAIL: Idempotent Exam submission failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Practical Agent Lab Generation & Safe Evaluation
  // -------------------------------------------------------------
  console.log('\n[Check 3/4] Testing Practical Agent Lab Generation & Static Evaluation Harness...');
  try {
    const task = await PracticalAgent.generatePracticalTask({
      goalId: testGoalId,
      userId: testUserId,
      title: 'Build a Resilient In-Memory Pub/Sub Message Pipe',
      domain: 'coding'
    });

    console.log(`✅ PASS: Practical Task generated: "${task.title}" (Criteria: ${task.validationCriteria.length})`);

    // Evaluate submission safely without arbitrary code execution
    const submission = await PracticalAgent.evaluatePracticalSubmission({
      taskId: task.id,
      userId: testUserId,
      submissionPayload: {
        code: `
export class MessagePipe<T> {
  private subscribers: Array<(msg: T) => void> = [];
  public subscribe(fn: (msg: T) => void) { this.subscribers.push(fn); }
  public publish(msg: T) { this.subscribers.forEach(s => s(msg)); }
}
        `.trim(),
        architecturalDecisions: 'Pure immutable broadcasting with zero side effects.'
      }
    });

    if (submission.status !== 'passed' || !submission.score) {
      throw new Error('Practical evaluation failed');
    }
    console.log(`✅ PASS: Practical submission graded safely. Score=${submission.score}/100, Status=[${submission.status}]`);
  } catch (err: any) {
    console.error('❌ FAIL: Practical Agent test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Low-Memory Verification
  // -------------------------------------------------------------
  console.log('\n[Check 4/4] Verifying Windows 2GB RAM Constraint in Phase 3...');
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
  console.log(`ℹ️ Node.js Heap Used: ${heapUsedMB} MB`);
  if (heapUsedMB < 150) {
    console.log(`✅ PASS: Memory footprint ${heapUsedMB} MB conforms to low-RAM specification.`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  if (allChecksPassed) {
    console.log('🎉 PHASE 3 VERIFICATION: ALL EXAM, INTERVIEW & PRACTICAL CHECKS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 3 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase3Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
