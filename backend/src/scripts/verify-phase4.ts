import { MasteryLevel, ConceptMasterySchema } from '@coach/shared';
import { EvaluatorAgent } from '../agents/evaluator.agent';
import { SpacedRepetitionEngine } from '../engines/spaced-repetition.engine';
import { AdaptiveLifecycleEngine } from '../engines/adaptive-lifecycle.engine';
import { MasteryRepository } from '../db/repositories/mastery.repository';
import { GoalsRepository } from '../db/repositories/goals.repository';

async function runPhase4Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 4 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;
  const testUserId = 'learner-phase4-test';

  // -------------------------------------------------------------
  // TEST 1: Evaluator Agent (Multi-Evidence L0-L6 & Justification)
  // -------------------------------------------------------------
  console.log('[Check 1/4] Testing Evaluator Agent Multi-Evidence Scoring & Reasoning...');
  try {
    const concept1 = await EvaluatorAgent.evaluateMastery({
      conceptId: 'c-distributed-consensus',
      conceptName: 'Distributed Consensus & Quorum Math',
      userId: testUserId,
      evidence: {
        recall: 95,
        application: 92,
        practical: 90,
        viva: 94,
        transfer: 91,
        retention: 92
      }
    });

    ConceptMasterySchema.parse(concept1);
    if (concept1.currentLevel !== MasteryLevel.L6) {
      throw new Error(`Expected L6 Demonstrated Mastery, got ${concept1.currentLevel}`);
    }
    console.log(`✅ PASS: L6 Demonstrated Mastery verified for "${concept1.conceptName}" (Confidence: ${concept1.confidenceScore}%)`);
    console.log(`   Reasoning: "${concept1.reasoningSummary}"`);

    // Evaluate a weaker concept
    const concept2 = await EvaluatorAgent.evaluateMastery({
      conceptId: 'c-network-partitions',
      conceptName: 'Asynchronous Network Partitions',
      userId: testUserId,
      evidence: {
        recall: 40,
        application: 45,
        practical: 35,
        viva: 30,
        transfer: 25,
        retention: 40
      }
    });

    if (concept2.currentLevel !== MasteryLevel.L1 && concept2.currentLevel !== MasteryLevel.L2) {
      throw new Error(`Expected L1 or L2 for weak evidence, got ${concept2.currentLevel}`);
    }
    console.log(`✅ PASS: Weak concept classified correctly at ${concept2.currentLevel} (Confidence: ${concept2.confidenceScore}%)`);

    const summary = await MasteryRepository.getMasterySummary(testUserId);
    console.log(`✅ PASS: Mastery summary calculated across ${summary.totalConceptsTracked} concepts. Average confidence: ${summary.averageConfidence}%`);
  } catch (err: any) {
    console.error('❌ FAIL: Evaluator Agent test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 2: Spaced Repetition Engine (Interval Transitions)
  // -------------------------------------------------------------
  console.log('\n[Check 2/4] Testing Spaced Repetition Engine Dynamic Intervals...');
  try {
    // Schedule Day 1 initial review
    const initialReview = await SpacedRepetitionEngine.scheduleInitialReview(
      testUserId,
      'c-distributed-consensus',
      'Distributed Consensus & Quorum Math'
    );

    if (initialReview.intervalStage !== 1) throw new Error('Initial review interval should be Day 1');
    console.log(`✅ PASS: Initial review scheduled for Day 1 (Due: ${initialReview.dueDate})`);

    // Simulate high recall score (90%) -> should advance to Day 3
    const advancedReview = await SpacedRepetitionEngine.processReviewResult(initialReview.id, 90);
    if (advancedReview.intervalStage !== 3) {
      throw new Error(`Expected interval advancement to Day 3, got Day ${advancedReview.intervalStage}`);
    }
    console.log(`✅ PASS: High recall (90%) advanced review to Day ${advancedReview.intervalStage} (Due: ${advancedReview.dueDate})`);

    // Schedule second review and simulate poor recall (< 60%) -> should reset to Day 1
    const review2 = await SpacedRepetitionEngine.scheduleInitialReview(testUserId, 'c-network-partitions', 'Network Partitions');
    const resetReview = await SpacedRepetitionEngine.processReviewResult(review2.id, 45);
    if (resetReview.intervalStage !== 1) {
      throw new Error(`Expected interval reset to Day 1, got Day ${resetReview.intervalStage}`);
    }
    console.log(`✅ PASS: Low recall (45%) safely reset interval to Day 1.`);
  } catch (err: any) {
    console.error('❌ FAIL: Spaced Repetition Engine test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Adaptive Lifecycle Engine & Queue Prioritization
  // -------------------------------------------------------------
  console.log('\n[Check 3/4] Testing Adaptive Lifecycle Engine & Next Activity Decision...');
  try {
    const queue = await SpacedRepetitionEngine.getReviewQueue(testUserId);
    console.log(`✅ PASS: Review queues generated: Upcoming=${queue.upcomingRevisions.length}, Overdue=${queue.overdueRevisions.length}, WeakPriorities=${queue.weakConceptPriority.length}`);

    // Create a test goal
    const goal = await GoalsRepository.createGoal({
      userId: testUserId,
      title: 'Advanced Consensus',
      targetMasteryLevel: MasteryLevel.L6,
      currentMasteryLevel: MasteryLevel.L2,
      pathMode: 'full_mastery' as any,
      currentStage: 4,
      isArchived: false
    });

    const nextActivity = await AdaptiveLifecycleEngine.determineNextActivity(goal.id, testUserId);
    console.log(`✅ PASS: Next activity dynamically determined: [${nextActivity.activityType}] "${nextActivity.title}" (Priority: ${nextActivity.priority})`);
    console.log(`   Reason: "${nextActivity.reason}"`);
  } catch (err: any) {
    console.error('❌ FAIL: Adaptive Lifecycle Engine test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Low-Memory Verification
  // -------------------------------------------------------------
  console.log('\n[Check 4/4] Verifying Windows 2GB RAM Constraint in Phase 4...');
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
  console.log(`ℹ️ Node.js Heap Used: ${heapUsedMB} MB`);
  if (heapUsedMB < 150) {
    console.log(`✅ PASS: Low-memory footprint confirmed (${heapUsedMB} MB < 150 MB limit).`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  if (allChecksPassed) {
    console.log('🎉 PHASE 4 VERIFICATION: ALL MASTERY & SPACED REPETITION CHECKS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 4 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase4Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
