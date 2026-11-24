-- =========================================================================
-- Personal AI Learning Coach - Supabase PostgreSQL Schema (23 Core Tables)
-- Free Tier Compatible with Strict Row-Level-Security (RLS) & UUID Keys
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    preferences JSONB DEFAULT '{"theme": "system", "daily_reminder_hour": 18, "learning_path": "full_mastery"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. LEARNING GOALS
CREATE TABLE IF NOT EXISTS public.learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_mastery_level TEXT NOT NULL DEFAULT 'L6',
    current_mastery_level TEXT NOT NULL DEFAULT 'L0',
    path_mode TEXT NOT NULL DEFAULT 'full_mastery',
    current_stage INT NOT NULL DEFAULT 1,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. CURRICULUM VERSIONS
CREATE TABLE IF NOT EXISTS public.curriculum_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active', -- active, deprecated, draft
    overview TEXT,
    dependency_graph JSONB DEFAULT '{}'::jsonb,
    diagnostic_results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. MODULES
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    curriculum_version_id UUID NOT NULL REFERENCES public.curriculum_versions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    estimated_minutes INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. LESSONS
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT,
    order_index INT NOT NULL DEFAULT 0,
    stage_number INT NOT NULL DEFAULT 2, -- Lifecycle stage (1 to 15)
    content_markdown TEXT,
    code_snippets JSONB DEFAULT '[]'::jsonb,
    diagrams JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. CONCEPTS
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    parent_concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    prerequisite_concept_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started', -- not_started, in_progress, completed
    time_spent_seconds INT DEFAULT 0 NOT NULL,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

-- 8. CONCEPT MASTERY
CREATE TABLE IF NOT EXISTS public.concept_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_level TEXT NOT NULL DEFAULT 'L0', -- L0 to L6
    confidence_score NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    evidence_breakdown JSONB DEFAULT '{"recall": 0, "application": 0, "transfer": 0, "viva": 0}'::jsonb,
    reasoning_summary TEXT,
    evaluated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_user_concept UNIQUE (user_id, concept_id)
);

-- 9. LEARNING SESSIONS
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_id UUID NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    current_stage INT NOT NULL DEFAULT 1,
    session_type TEXT NOT NULL DEFAULT 'lesson', -- lesson, doubt, practice, exam, interview, practical
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, finished
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    summary TEXT
);

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.learning_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- learner, orchestrator, teacher, doubt_solver, etc.
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. DOUBTS
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    root_misconception TEXT,
    backtracked_prerequisite_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open', -- open, resolved, escalated
    resolution_summary TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. NOTES
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    is_bookmarked BOOLEAN DEFAULT FALSE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    question_type TEXT NOT NULL, -- mcq, multi_select, true_false, short_answer, long_answer, scenario, coding
    prompt TEXT NOT NULL,
    options JSONB, -- For MCQ/Multi-select
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    hints JSONB DEFAULT '[]'::jsonb,
    difficulty INT DEFAULT 1, -- 1 to 5
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 14. ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assessment_type TEXT NOT NULL, -- theory_exam, mock_interview, viva, diagnostic, topic_test
    time_limit_minutes INT,
    passing_score NUMERIC(5,2) DEFAULT 70.00,
    questions_list JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 15. ASSESSMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score NUMERIC(5,2),
    status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, submitted, graded
    idempotency_key TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    submitted_at TIMESTAMPTZ,
    feedback JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_attempt_idempotency UNIQUE (user_id, idempotency_key)
);

-- 16. RESPONSES
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    learner_answer JSONB,
    is_correct BOOLEAN,
    score_awarded NUMERIC(5,2),
    evaluator_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 17. PRACTICAL TASKS
CREATE TABLE IF NOT EXISTS public.practical_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.learning_goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    domain TEXT NOT NULL, -- coding, angular, dotnet, azure_labs, cybersecurity, math, science, business
    instructions_markdown TEXT NOT NULL,
    starter_template JSONB DEFAULT '{}'::jsonb,
    validation_criteria JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 18. PRACTICAL SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.practical_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.practical_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted', -- submitted, evaluating, passed, needs_revision
    score NUMERIC(5,2),
    evaluation_report JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 19. REVIEW SCHEDULE (Spaced Repetition Engine)
CREATE TABLE IF NOT EXISTS public.review_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interval_stage INT NOT NULL DEFAULT 1, -- Day 1, Day 3, Day 7, Day 30
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, overdue
    last_reviewed_at TIMESTAMPTZ,
    retention_score NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 20. AGENT RUNS
CREATE TABLE IF NOT EXISTS public.agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    trigger_source TEXT NOT NULL, -- user_request, orchestrator, scheduled_revision
    idempotency_key TEXT,
    status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed, paused_quota
    input_payload JSONB,
    output_payload JSONB,
    execution_time_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_agent_run_idempotency UNIQUE (user_id, idempotency_key)
);

-- 21. AI USAGE (Quota & Zero Paid Tracker)
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- gemini, groq, openrouter, cerebras
    model TEXT NOT NULL,
    prompt_tokens INT DEFAULT 0 NOT NULL,
    completion_tokens INT DEFAULT 0 NOT NULL,
    total_tokens INT DEFAULT 0 NOT NULL,
    duration_ms INT DEFAULT 0 NOT NULL,
    success BOOLEAN DEFAULT TRUE NOT NULL,
    error_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 22. SOURCE REFERENCES (Research Agent & Verification)
CREATE TABLE IF NOT EXISTS public.source_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concept_id UUID REFERENCES public.concepts(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    author_or_org TEXT,
    version_tag TEXT,
    is_verified BOOLEAN DEFAULT TRUE NOT NULL,
    snippet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 23. ATTACHMENTS (Supabase Storage metadata)
CREATE TABLE IF NOT EXISTS public.attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    bucket_name TEXT NOT NULL DEFAULT 'coach-attachments',
    associated_table TEXT,
    associated_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- INDEXES FOR LOW-LATENCY QUERIES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_learning_goals_user ON public.learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_curriculum ON public.modules(curriculum_version_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_concepts_goal ON public.concepts(goal_id);
CREATE INDEX IF NOT EXISTS idx_concept_mastery_user ON public.concept_mastery(user_id, current_level);
CREATE INDEX IF NOT EXISTS idx_review_schedule_due ON public.review_schedule(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_provider ON public.ai_usage(user_id, provider, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session ON public.messages(session_id, created_at);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR ALL 23 TABLES
-- =========================================================================

DO $$
DECLARE
    t text;
    tbls text[] := ARRAY[
        'profiles', 'learning_goals', 'curriculum_versions', 'modules', 'lessons',
        'concepts', 'lesson_progress', 'concept_mastery', 'learning_sessions',
        'messages', 'doubts', 'notes', 'questions', 'assessments',
        'assessment_attempts', 'responses', 'practical_tasks', 'practical_submissions',
        'review_schedule', 'agent_runs', 'ai_usage', 'source_references', 'attachments'
    ];
BEGIN
    FOREACH t IN ARRAY tbls LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop existing policies if any
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_isolation_select', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_isolation_insert', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_isolation_update', t);
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', 'user_isolation_delete', t);

        IF t = 'profiles' THEN
            -- Profiles uses id as user reference
            EXECUTE format('CREATE POLICY user_isolation_select ON public.%I FOR SELECT USING (auth.uid() = id);', t);
            EXECUTE format('CREATE POLICY user_isolation_insert ON public.%I FOR INSERT WITH CHECK (auth.uid() = id);', t);
            EXECUTE format('CREATE POLICY user_isolation_update ON public.%I FOR UPDATE USING (auth.uid() = id);', t);
            EXECUTE format('CREATE POLICY user_isolation_delete ON public.%I FOR DELETE USING (auth.uid() = id);', t);
        ELSE
            -- All other tables use user_id column
            EXECUTE format('CREATE POLICY user_isolation_select ON public.%I FOR SELECT USING (auth.uid() = user_id);', t);
            EXECUTE format('CREATE POLICY user_isolation_insert ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', t);
            EXECUTE format('CREATE POLICY user_isolation_update ON public.%I FOR UPDATE USING (auth.uid() = user_id);', t);
            EXECUTE format('CREATE POLICY user_isolation_delete ON public.%I FOR DELETE USING (auth.uid() = user_id);', t);
        END IF;
    END LOOP;
END $$;
