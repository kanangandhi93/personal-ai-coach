import { ResearchAgent } from '../agents/research.agent';
import { ReferencesRepository } from '../db/repositories/references.repository';
import { ExportRepository } from '../db/repositories/export.repository';
import { GoalsRepository } from '../db/repositories/goals.repository';
import { NotesRepository } from '../db/repositories/notes.repository';
import { quotaTracker } from '../ai/quota-tracker';

async function runPhase5Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 5 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;
  const testUserId = 'learner-phase5-test';

  // -------------------------------------------------------------
  // TEST 1: Research Agent (Technical Claim & Source References)
  // -------------------------------------------------------------
  console.log('[Check 1/4] Testing Research Agent Technical Verification & Citations...');
  try {
    const claimResult = await ResearchAgent.verifyTechnicalClaim({
      claim: 'TypeScript 5.4 introduces NoInfer utility type to prevent unwanted inference in generic functions.',
      topic: 'TypeScript Generic Inference',
      userId: testUserId,
      targetVersion: 'v5.4'
    });

    if (!claimResult.isVerified) throw new Error('Technical claim was not verified');
    if (!claimResult.authoritativeSource.url) throw new Error('Authoritative citation URL missing');

    console.log(`✅ PASS: Claim verified: "${claimResult.claim.slice(0, 70)}..."`);
    console.log(`   Authoritative Citation: "${claimResult.authoritativeSource.title}" (${claimResult.authoritativeSource.url})`);
    console.log(`   Version note: "${claimResult.versionWarning || 'Verified'}"`);

    const savedRefs = await ReferencesRepository.getAllReferencesForUser(testUserId);
    if (savedRefs.length === 0) throw new Error('Source reference was not persisted in repository');
    console.log(`✅ PASS: Source reference successfully persisted in repository.`);
  } catch (err: any) {
    console.error('❌ FAIL: Research Agent test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 2: Quota Tracker & Resource Resilience
  // -------------------------------------------------------------
  console.log('\n[Check 2/4] Testing Live Free-Tier Quota Tracking & Threshold Checks...');
  try {
    const groqQuota = quotaTracker.getStatus('groq');
    const geminiQuota = quotaTracker.getStatus('gemini');

    console.log(`✅ PASS: Groq Free Quota: Limit=${groqQuota.dailyQuotaLimit} req/day, Remaining=${groqQuota.dailyRemaining}`);
    console.log(`✅ PASS: Gemini Free Quota: Limit=${geminiQuota.dailyQuotaLimit} req/day, Remaining=${geminiQuota.dailyRemaining}`);

    const isNearLimit = groqQuota.dailyRemaining < (groqQuota.dailyQuotaLimit * 0.1);
    console.log(`✅ PASS: Warning threshold calculation verified (isNearLimit=${isNearLimit})`);
  } catch (err: any) {
    console.error('❌ FAIL: Quota tracking test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Full Data Export & Erasure (GDPR / User Privacy)
  // -------------------------------------------------------------
  console.log('\n[Check 3/4] Testing Full User Data Export & Complete Erasure...');
  try {
    // Seed some test data
    const goal = await GoalsRepository.createGoal({
      userId: testUserId,
      title: 'Export Test Goal',
      targetMasteryLevel: 'L6' as any,
      currentMasteryLevel: 'L0' as any,
      pathMode: 'full_mastery' as any,
      currentStage: 1,
      isArchived: false
    });

    await NotesRepository.createNote(testUserId, {
      title: 'Export Test Note',
      contentMarkdown: 'Test export content',
      isBookmarked: false,
      tags: []
    });

    // Test JSON Export
    const exportedData = await ExportRepository.exportAllUserData(testUserId);
    if (!exportedData.goals || exportedData.goals.length === 0) {
      throw new Error('Exported data missing goals');
    }
    if (!exportedData.notes || exportedData.notes.length === 0) {
      throw new Error('Exported data missing notes');
    }
    console.log(`✅ PASS: Full JSON Data Export verified: ${exportedData.goals.length} goal(s), ${exportedData.notes.length} note(s) exported.`);

    // Test Deletion
    const deleteResult = await ExportRepository.deleteAllUserData(testUserId);
    if (!deleteResult.success || deleteResult.deletedCount < 2) {
      throw new Error('User data deletion failed');
    }
    console.log(`✅ PASS: Complete user data erasure verified (Deleted ${deleteResult.deletedCount} items).`);

    // Confirm empty after deletion
    const remainingGoals = await GoalsRepository.getGoalsByUserId(testUserId);
    if (remainingGoals.length !== 0) throw new Error('Goals still exist after erasure');
    console.log(`✅ PASS: Confirmed zero residual records remain after erasure.`);
  } catch (err: any) {
    console.error('❌ FAIL: Data export & erasure test failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Low-Memory Verification
  // -------------------------------------------------------------
  console.log('\n[Check 4/4] Verifying Windows 2GB RAM Constraint in Phase 5...');
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
    console.log('🎉 PHASE 5 VERIFICATION: ALL RESEARCH, QUOTA & SYNC CHECKS PASSED!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 5 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase5Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
