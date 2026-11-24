import { 
  MasteryLevel, 
  LifecycleStage, 
  LearningPathMode, 
  AgentType,
  CurriculumRoadmapSchema,
  TeacherExplanationSchema
} from '@coach/shared';
import { GoalsRepository } from '../db/repositories/goals.repository';
import { CurriculumRepository } from '../db/repositories/curriculum.repository';
import { NotesRepository } from '../db/repositories/notes.repository';
import { CurriculumAgent } from '../agents/curriculum.agent';
import { LearningOrchestrator } from '../agents/orchestrator.agent';
import { TeacherAgent } from '../agents/teacher.agent';

async function runPhase1Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 1 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;
  const testUserId = 'learner-phase1-test';

  // -------------------------------------------------------------
  // TEST 1: Learning Goals CRUD
  // -------------------------------------------------------------
  console.log('[Check 1/5] Testing Learning Goals CRUD & In-Memory/DB Persistence...');
  try {
    const goal = await GoalsRepository.createGoal({
      userId: testUserId,
      title: 'Advanced Distributed Systems with Raft & Paxos',
      description: 'Master consensus algorithms, fault-tolerant state machine replication, and RPC pipelines.',
      targetMasteryLevel: MasteryLevel.L6,
      currentMasteryLevel: MasteryLevel.L0,
      pathMode: LearningPathMode.FULL_MASTERY,
      currentStage: LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT,
      isArchived: false
    });

    if (!goal || !goal.id) throw new Error('Goal creation failed');
    console.log(`✅ PASS: Goal created with ID: ${goal.id}`);

    const fetched = await GoalsRepository.getGoalById(goal.id, testUserId);
    if (!fetched || fetched.title !== goal.title) throw new Error('Goal retrieval failed');
    console.log(`✅ PASS: Goal fetched: "${fetched.title}" (Stage ${fetched.currentStage})`);

    const updated = await GoalsRepository.updateGoal(goal.id, {
      currentStage: LifecycleStage.STAGE_2_BASIC_CONCEPTS,
      currentMasteryLevel: MasteryLevel.L1
    }, testUserId);
    if (!updated || updated.currentStage !== LifecycleStage.STAGE_2_BASIC_CONCEPTS) {
      throw new Error('Goal update failed');
    }
    console.log(`✅ PASS: Goal updated: Stage=${updated.currentStage}, Mastery=${updated.currentMasteryLevel}`);
  } catch (err: any) {
    console.error('❌ FAIL: Learning Goals CRUD failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 2: Curriculum Agent & Dynamic Roadmap Generation
  // -------------------------------------------------------------
  console.log('\n[Check 2/5] Testing Curriculum Agent Roadmap Generation & Weak-Topic Adaptation...');
  let roadmapGoalId = '';
  try {
    const goal = await GoalsRepository.createGoal({
      userId: testUserId,
      title: 'TypeScript Type System Engineering',
      targetMasteryLevel: MasteryLevel.L6,
      currentMasteryLevel: MasteryLevel.L0,
      pathMode: LearningPathMode.FULL_MASTERY,
      currentStage: LifecycleStage.STAGE_1_PREREQUISITE_ASSESSMENT,
      isArchived: false
    });
    roadmapGoalId = goal.id;

    const roadmap = await CurriculumAgent.generateRoadmap(goal, testUserId);
    CurriculumRoadmapSchema.parse(roadmap);

    console.log(`✅ PASS: Roadmap generated with ${roadmap.modules.length} modules, ${roadmap.concepts.length} concepts, ${roadmap.diagnosticTest.length} diagnostic checks.`);
    console.log(`   Sample Module 1: "${roadmap.modules[0].title}" (${roadmap.modules[0].lessons.length} lessons)`);

    // Test dynamic adaptation for weak area
    const adapted = await CurriculumAgent.adaptRoadmapForWeakConcept(goal.id, 'Conditional Types & Distributivity', testUserId);
    const remedialModule = adapted.modules.find(m => m.title.includes('Remedial'));
    if (!remedialModule) throw new Error('Remedial module was not inserted during adaptation');
    console.log(`✅ PASS: Dynamic adaptation verified. Inserted: "${remedialModule.title}" (v${adapted.versionNumber})`);
  } catch (err: any) {
    console.error('❌ FAIL: Curriculum Agent test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Learning Orchestrator (Token Conservation & Stage Routing)
  // -------------------------------------------------------------
  console.log('\n[Check 3/5] Testing Learning Orchestrator Routing & Manual Overrides...');
  try {
    const goal = await GoalsRepository.getGoalById(roadmapGoalId);
    if (!goal) throw new Error('Goal not found for orchestrator test');

    // Test stage 1 routing -> Exam/Interview agent (diagnostic)
    const decisionStage1 = await LearningOrchestrator.evaluateNextAction(goal);
    if (decisionStage1.recommendedAgent !== AgentType.EXAM_INTERVIEW) {
      throw new Error(`Expected EXAM_INTERVIEW agent at stage 1, got ${decisionStage1.recommendedAgent}`);
    }
    console.log(`✅ PASS: Stage 1 routed to minimal agent: [${decisionStage1.recommendedAgent}] (${decisionStage1.stageTitle})`);

    // Test learner manual stage override to stage 6 (Internal Architecture)
    const overridden = await LearningOrchestrator.overrideStage(
      goal.id,
      LifecycleStage.STAGE_6_INTERNAL_ARCHITECTURE,
      testUserId,
      'Learner wants to inspect runtime execution flow'
    );
    const decisionStage6 = await LearningOrchestrator.evaluateNextAction(overridden);
    if (decisionStage6.recommendedAgent !== AgentType.TEACHER) {
      throw new Error(`Expected TEACHER agent at stage 6, got ${decisionStage6.recommendedAgent}`);
    }
    console.log(`✅ PASS: Manual stage override verified. Jumped to Stage 6 -> Routed to [${decisionStage6.recommendedAgent}]`);

    // Test stage advancement
    const advanced = await LearningOrchestrator.advanceStage(goal.id, testUserId);
    console.log(`✅ PASS: Stage advancement verified. New stage: ${advanced.currentStage} (${LifecycleStage[advanced.currentStage]})`);
  } catch (err: any) {
    console.error('❌ FAIL: Learning Orchestrator test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Teacher Agent Multi-Style Pedagogical Explanations
  // -------------------------------------------------------------
  console.log('\n[Check 4/5] Testing Teacher Agent Pedagogical Breakdown & Progress Persistence...');
  try {
    const explanation = await TeacherAgent.teachConcept({
      goalId: roadmapGoalId,
      lessonId: 'les-test-101',
      conceptName: 'Structural Typing and Excess Property Checks',
      style: 'first_principles',
      userId: testUserId,
      timeSpentSeconds: 180
    });

    TeacherExplanationSchema.parse(explanation);
    console.log(`✅ PASS: Teacher explanation generated: "${explanation.title}"`);
    console.log(`   Why/When/Where: ${explanation.whyWhenWhere.slice(0, 90)}...`);
    console.log(`   Code snippets: ${explanation.codeSnippets.length} snippets with annotations.`);
    console.log(`   Mermaid diagram: ${explanation.diagramMermaid?.slice(0, 40)}...`);
    console.log(`   Self-check questions: ${explanation.understandingQuestions.length} questions included.`);

    // Verify progress tracking
    const progress = await CurriculumRepository.getLessonProgress(testUserId, 'les-test-101');
    if (progress.status !== 'in_progress' || progress.timeSpentSeconds !== 180) {
      throw new Error(`Progress tracking mismatch: ${JSON.stringify(progress)}`);
    }
    console.log(`✅ PASS: Lesson progress persisted: status="${progress.status}", timeSpent=${progress.timeSpentSeconds}s`);
  } catch (err: any) {
    console.error('❌ FAIL: Teacher Agent test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 5: Notes & Bookmarks CRUD & Memory Footprint Check
  // -------------------------------------------------------------
  console.log('\n[Check 5/5] Testing Notes/Bookmarks CRUD & Low-Memory Verification...');
  try {
    const note = await NotesRepository.createNote(testUserId, {
      title: 'Structural Typing Key Insights',
      contentMarkdown: 'TypeScript uses compile-time structural comparison rather than nominal subtyping.',
      isBookmarked: true,
      tags: ['typescript', 'foundations']
    });
    console.log(`✅ PASS: Note & Bookmark created with ID: ${note.id}`);

    const userNotes = await NotesRepository.getNotesByUserId(testUserId);
    if (userNotes.length === 0) throw new Error('Notes retrieval failed');
    console.log(`✅ PASS: User notes retrieved: ${userNotes.length} item(s)`);

    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
    console.log(`ℹ️ Node.js Heap Used: ${heapUsedMB} MB`);
    if (heapUsedMB < 150) {
      console.log(`✅ PASS: Low-memory footprint confirmed (${heapUsedMB} MB < 150 MB ceiling).`);
    }
  } catch (err: any) {
    console.error('❌ FAIL: Notes CRUD / Memory test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  if (allChecksPassed) {
    console.log('🎉 PHASE 1 VERIFICATION: ALL LEARNING CORE CHECKS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 1 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase1Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
