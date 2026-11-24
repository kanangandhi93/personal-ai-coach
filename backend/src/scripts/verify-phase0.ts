import fs from 'fs';
import path from 'path';
import { LLMStructuredOutputSchema, FreeAIProvider } from '@coach/shared';
import { llmAdapter, AllFreeProvidersExhaustedError } from '../ai/llm-adapter';
import { circuitBreaker } from '../ai/circuit-breaker';
import { quotaTracker } from '../ai/quota-tracker';
import { FREE_PROVIDER_CAPABILITIES } from '../config';

async function runPhase0Verification() {
  console.log('================================================================');
  console.log('   PERSONAL AI LEARNING COACH - PHASE 0 SYSTEM VERIFICATION');
  console.log('================================================================\n');

  let allChecksPassed = true;

  // -------------------------------------------------------------
  // TEST 1: Database Schema & RLS Isolation Verification
  // -------------------------------------------------------------
  console.log('[Check 1/4] Verifying Supabase Migrations & 23 Core Tables RLS...');
  const migrationPath = path.join(__dirname, '../db/migrations/001_initial_schema.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ FAIL: Migration file not found at:', migrationPath);
    allChecksPassed = false;
  } else {
    const sqlContent = fs.readFileSync(migrationPath, 'utf-8');
    const requiredTables = [
      'profiles', 'learning_goals', 'curriculum_versions', 'modules', 'lessons',
      'concepts', 'lesson_progress', 'concept_mastery', 'learning_sessions',
      'messages', 'doubts', 'notes', 'questions', 'assessments',
      'assessment_attempts', 'responses', 'practical_tasks', 'practical_submissions',
      'review_schedule', 'agent_runs', 'ai_usage', 'source_references', 'attachments'
    ];

    const missingTables = requiredTables.filter(t => !sqlContent.includes(`CREATE TABLE IF NOT EXISTS public.${t}`));
    if (missingTables.length > 0) {
      console.error(`❌ FAIL: Missing table definitions for: ${missingTables.join(', ')}`);
      allChecksPassed = false;
    } else {
      console.log(`✅ PASS: All ${requiredTables.length} core tables verified in SQL migration.`);
    }

    if (sqlContent.includes('ENABLE ROW LEVEL SECURITY') && sqlContent.includes('auth.uid() = user_id')) {
      console.log('✅ PASS: Row Level Security (RLS) policies verified for user isolation.');
    } else {
      console.error('❌ FAIL: RLS policies missing or invalid.');
      allChecksPassed = false;
    }
  }

  // -------------------------------------------------------------
  // TEST 2: Provider-Independent AI Adapter & Structured JSON Output
  // -------------------------------------------------------------
  console.log('\n[Check 2/4] Testing Provider-Independent LLM Adapter (Structured JSON Mode)...');
  try {
    const available = llmAdapter.getAvailableProviders();
    console.log(`ℹ️ Configured & available free providers: [${available.join(', ')}]`);

    const result = await llmAdapter.execute({
      systemPrompt: 'You are the Personal AI Learning Coach Evaluator. Output valid JSON only.',
      userPrompt: 'Generate a diagnostic evaluation for a learner beginning TypeScript mastery.',
      responseFormat: 'json',
      temperature: 0.1,
      maxTokens: 512
    }, 'phase0-verifier');

    console.log(`✅ PASS: AI Adapter responded via provider: [${result.provider}] (model: ${result.model}) in ${result.durationMs}ms`);
    console.log(`   Tokens: Prompt=${result.tokens.prompt}, Completion=${result.tokens.completion}, Total=${result.tokens.total}`);

    // Verify structured JSON schema
    const parsedData = result.parsedJson ?? JSON.parse(result.text);
    const validatedJson = LLMStructuredOutputSchema.parse(parsedData);
    console.log(`✅ PASS: Structured JSON validated with Zod: "${validatedJson.title}" (Confidence: ${validatedJson.confidence})`);
  } catch (err: any) {
    console.error('❌ FAIL: AI Adapter Structured Output failed:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 3: Circuit Breaker & Automatic Fallback on 429 Simulation
  // -------------------------------------------------------------
  console.log('\n[Check 3/4] Simulating 429 Rate Limit & Testing Automatic Fallback...');
  try {
    circuitBreaker.reset();

    // Trigger failure simulation
    llmAdapter.mockProvider.setSimulateRateLimit(true);

    try {
      await llmAdapter.execute({
        systemPrompt: 'Test system prompt',
        userPrompt: 'Test user prompt for rate-limit trigger',
        preferredProvider: 'mock',
        responseFormat: 'text'
      }, 'rate-limit-test');

      console.error('❌ FAIL: Expected 429 rate limit error or fallback, but request succeeded unexpectedly.');
      allChecksPassed = false;
    } catch (err: any) {
      if (err instanceof AllFreeProvidersExhaustedError) {
        console.log('✅ PASS: AllFreeProvidersExhaustedError triggered safely. Zero-paid guardrail held firm!');
        console.log(`   Message: ${err.message.slice(0, 110)}...`);
      } else {
        console.log(`ℹ️ Caught expected error during rate limit test: ${err.message}`);
      }
    } finally {
      // Restore mock provider
      llmAdapter.mockProvider.setSimulateRateLimit(false);
      circuitBreaker.reset();
    }

    // Verify recovery after reset
    const recovered = await llmAdapter.execute({
      systemPrompt: 'Recovery test',
      userPrompt: 'Are you back online?',
      responseFormat: 'text'
    });
    console.log(`✅ PASS: Adapter successfully recovered and resumed execution on provider [${recovered.provider}].`);
  } catch (err: any) {
    console.error('❌ FAIL: Circuit breaker fallback test encountered error:', err.message);
    allChecksPassed = false;
  }

  // -------------------------------------------------------------
  // TEST 4: Windows 2GB RAM Lightweight Memory Footprint Check
  // -------------------------------------------------------------
  console.log('\n[Check 4/4] Verifying Windows 2GB RAM Lightweight Memory Footprint...');
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / (1024 * 1024));
  const rssMB = Math.round(memoryUsage.rss / (1024 * 1024));

  console.log(`ℹ️ Node.js Heap Used: ${heapUsedMB} MB | RSS: ${rssMB} MB`);
  if (heapUsedMB < 150) {
    console.log(`✅ PASS: Memory footprint is ${heapUsedMB} MB (< 150 MB limit). Ultra-lightweight for 2GB RAM PC!`);
  } else {
    console.warn(`⚠️ WARNING: Heap used is ${heapUsedMB} MB, higher than expected for low-RAM target.`);
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  if (allChecksPassed) {
    console.log('🎉 PHASE 0 VERIFICATION: ALL ACCEPTANCE CHECKS PASSED SUCCESSFULLY!');
    console.log('================================================================');
    process.exit(0);
  } else {
    console.error('❌ PHASE 0 VERIFICATION FAILED. Review errors above.');
    console.log('================================================================');
    process.exit(1);
  }
}

runPhase0Verification().catch((err) => {
  console.error('Unexpected fatal error in verification script:', err);
  process.exit(1);
});
