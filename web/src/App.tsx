import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  Compass, 
  Cpu, 
  GraduationCap, 
  HelpCircle, 
  Layers, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Zap,
  Bookmark,
  Code,
  FileQuestion,
  Award,
  RefreshCw,
  Clock,
  ArrowRight,
  Wifi,
  WifiOff,
  Settings
} from 'lucide-react';
import { 
  LearningGoal, 
  CurriculumRoadmap, 
  TeacherExplanation, 
  OrchestratorDecision, 
  ExplanationStyle,
  LearningPathMode,
  MasteryLevel,
  DoubtRecord,
  PracticeExercise,
  PracticeEvaluation
} from '@coach/shared';

const getInitialApiBase = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('COACH_API_BASE');
    if (saved) return saved;
  }
  return 'https://personal-ai-coach-tnul.onrender.com';
};

type ActiveTab = 'roadmap' | 'teacher' | 'doubts' | 'practice' | 'mastery';

export default function App() {
  // Navigation & Active State
  const [activeTab, setActiveTab] = useState<ActiveTab>('roadmap');
  const [apiBase, setApiBase] = useState<string>(getInitialApiBase);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [serverUrlInput, setServerUrlInput] = useState<string>(getInitialApiBase);
  const [isServerConnected, setIsServerConnected] = useState<boolean | null>(null);
  const [serverCheckMessage, setServerCheckMessage] = useState<string>('');
  const [isCheckingServer, setIsCheckingServer] = useState<boolean>(false);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [roadmap, setRoadmap] = useState<CurriculumRoadmap | null>(null);
  const [orchestrator, setOrchestrator] = useState<OrchestratorDecision | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [explanation, setExplanation] = useState<TeacherExplanation | null>(null);
  const [explanationStyle, setExplanationStyle] = useState<ExplanationStyle>('first_principles');
  
  // Loading & Action States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCreatingGoal, setIsCreatingGoal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [newGoalTitle, setNewGoalTitle] = useState<string>('');
  const [newGoalMode, setNewGoalMode] = useState<LearningPathMode>(LearningPathMode.FULL_MASTERY);

  // Doubt Solver State
  const [doubtQuestion, setDoubtQuestion] = useState<string>('');
  const [isSolvingDoubt, setIsSolvingDoubt] = useState<boolean>(false);
  const [activeDoubt, setActiveDoubt] = useState<DoubtRecord | null>(null);
  const [doubtHistory, setDoubtHistory] = useState<DoubtRecord[]>([]);

  // Practice State
  const [practiceExercise, setPracticeExercise] = useState<PracticeExercise | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [userCode, setUserCode] = useState<string>('');
  const [practiceEvaluation, setPracticeEvaluation] = useState<PracticeEvaluation | null>(null);
  const [isEvaluatingPractice, setIsEvaluatingPractice] = useState<boolean>(false);

  // Mastery & Review State
  const [masterySummary, setMasterySummary] = useState<any>(null);
  const [reviewQueue, setReviewQueue] = useState<any>(null);

  // Load initial goals on mount
  useEffect(() => {
    fetchGoals();
    fetchDoubtHistory();
    fetchMasteryAndReviews();
  }, [apiBase]);

  const fetchGoals = async (overrideUrl?: string) => {
    const target = overrideUrl || apiBase;
    try {
      const res = await fetch(`${target}/api/goals`, {
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setIsServerConnected(true);
        // Deduplicate in state by id
        const uniqueGoals = Array.from(new Map(data.map((item: LearningGoal) => [item.id, item])).values());
        setGoals(uniqueGoals);
        if (uniqueGoals.length > 0 && !selectedGoal) {
          selectGoal(uniqueGoals[0], target);
        }
      } else {
        setIsServerConnected(false);
      }
    } catch {
      setIsServerConnected(false);
    }
  };

  const fetchDoubtHistory = async () => {
    try {
      const res = await fetch(`${apiBase}/api/doubts`, {
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      const data = await res.json();
      if (Array.isArray(data)) setDoubtHistory(data);
    } catch {}
  };

  const fetchMasteryAndReviews = async () => {
    try {
      const [mRes, rRes] = await Promise.all([
        fetch(`${apiBase}/api/mastery/summary`, { headers: { 'Authorization': 'Bearer dev-token' } }),
        fetch(`${apiBase}/api/review/queue`, { headers: { 'Authorization': 'Bearer dev-token' } })
      ]);
      const mData = await mRes.json();
      const rData = await rRes.json();
      setMasterySummary(mData);
      setReviewQueue(rData);
    } catch {}
  };

  const selectGoal = async (goal: LearningGoal, overrideUrl?: string) => {
    const target = overrideUrl || apiBase;
    setSelectedGoal(goal);
    setIsLoading(true);
    try {
      const [roadRes, orchRes] = await Promise.all([
        fetch(`${target}/api/goals/${goal.id}/roadmap`, { headers: { 'Authorization': 'Bearer dev-token' } }),
        fetch(`${target}/api/goals/${goal.id}/orchestrator`, { headers: { 'Authorization': 'Bearer dev-token' } })
      ]);
      const roadData = await roadRes.json();
      const orchData = await orchRes.json();
      setRoadmap(roadData);
      setOrchestrator(orchData);

      if (roadData?.modules?.[0]?.lessons?.[0]) {
        const firstLesson = roadData.modules[0].lessons[0];
        setSelectedLessonId(firstLesson.id);
        fetchLessonExplanation(firstLesson.id, firstLesson.title, goal.id, undefined, target);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || isCreatingGoal) return;

    setIsCreatingGoal(true);
    try {
      const res = await fetch(`${apiBase}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          title: newGoalTitle.trim(),
          pathMode: newGoalMode,
          targetMasteryLevel: MasteryLevel.L6
        })
      });
      const data = await res.json();
      if (data.goal) {
        setIsServerConnected(true);
        setGoals(prev => {
          // Prevent duplicate in UI state
          if (prev.some(g => g.id === data.goal.id)) return prev;
          return [data.goal, ...prev];
        });
        selectGoal(data.goal);
        setNewGoalTitle('');
        setShowGoalModal(false);
      } else if (data.error) {
        alert(`Server Error: ${data.error}`);
      }
    } catch (err: any) {
      setIsServerConnected(false);
      alert(`Could not reach backend server at ${apiBase}.\n\nPlease ensure your mobile phone is connected to the same Wi-Fi network as your PC (192.168.1.13) and tap "Connect Server" in the top bar to verify.`);
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const deleteGoal = async (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this learning goal?')) return;

    try {
      await fetch(`${apiBase}/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer dev-token' }
      });
      const remaining = goals.filter(g => g.id !== goalId);
      setGoals(remaining);
      if (selectedGoal?.id === goalId) {
        if (remaining.length > 0) {
          selectGoal(remaining[0]);
        } else {
          setSelectedGoal(null);
          setRoadmap(null);
          setExplanation(null);
        }
      }
    } catch {}
  };

  const fetchLessonExplanation = async (lessonId: string, conceptName: string, goalId: string, style = explanationStyle, overrideUrl?: string) => {
    const target = overrideUrl || apiBase;
    setIsLoading(true);
    try {
      const res = await fetch(`${target}/api/lessons/${lessonId}/teach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          goalId,
          conceptName,
          style,
          timeSpentSeconds: 120
        })
      });
      const data = await res.json();
      setExplanation(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtQuestion.trim() || isSolvingDoubt) return;

    setIsSolvingDoubt(true);
    try {
      const res = await fetch(`${apiBase}/api/doubts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          goalId: selectedGoal?.id,
          lessonId: selectedLessonId,
          question: doubtQuestion.trim()
        })
      });
      const doubt = await res.json();
      setActiveDoubt(doubt);
      setDoubtHistory(prev => [doubt, ...prev]);
      setDoubtQuestion('');
    } finally {
      setIsSolvingDoubt(false);
    }
  };

  const generatePracticeProblem = async () => {
    if (!selectedGoal) return;
    setIsLoading(true);
    setPracticeEvaluation(null);
    setRevealedHints(0);
    setUserCode('');
    try {
      const res = await fetch(`${apiBase}/api/practice/exercise`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          goalId: selectedGoal.id,
          topic: selectedGoal.title,
          difficulty: 3
        })
      });
      const exercise = await res.json();
      setPracticeExercise(exercise);
      setUserCode(exercise.contextCode || '// Write your solution here\n');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluatePractice = async () => {
    if (!practiceExercise) return;
    setIsEvaluatingPractice(true);
    try {
      const res = await fetch(`${apiBase}/api/practice/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token'
        },
        body: JSON.stringify({
          exerciseId: practiceExercise.id,
          userCodeOrAnswer: userCode,
          hintsUsedCount: revealedHints
        })
      });
      const evaluation = await res.json();
      setPracticeEvaluation(evaluation);
      fetchMasteryAndReviews();
    } finally {
      setIsEvaluatingPractice(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-sky-500/20">
            AG
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
              Personal AI Learning Coach
            </h1>
            <p className="text-[11px] text-slate-400">Autonomous Multi-Agent Teaching Institution</p>
          </div>
        </div>

        {/* Goal Selector & Quick Switcher */}
        <div className="flex items-center gap-3">
          {goals.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Goal:</span>
              <select
                value={selectedGoal?.id || ''}
                onChange={e => {
                  const g = goals.find(item => item.id === e.target.value);
                  if (g) selectGoal(g);
                }}
                className="bg-transparent text-xs text-sky-300 font-semibold focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-slate-200">
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>

          <button
            onClick={() => {
              setServerUrlInput(apiBase);
              setServerCheckMessage('');
              setShowServerModal(true);
            }}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium border transition ${
              isServerConnected === true
                ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                : isServerConnected === false
                ? 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                : 'text-amber-400 bg-amber-950/60 border-amber-500/30'
            }`}
            title="Backend Server Connection"
          >
            {isServerConnected === true ? (
              <Wifi className="w-3 h-3 text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-rose-400 animate-pulse" />
            )}
            <span>{isServerConnected === true ? 'Server Online' : 'Connect Server'}</span>
          </button>

          <span className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            ₹0 Free AI
          </span>
        </div>
      </header>

      {/* Main Tab Bar */}
      <div className="bg-slate-900/40 border-b border-slate-800/80 px-6 flex items-center gap-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition ${
            activeTab === 'roadmap'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Curriculum Roadmap</span>
        </button>

        <button
          onClick={() => setActiveTab('teacher')}
          className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition ${
            activeTab === 'teacher'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Teacher Classroom</span>
        </button>

        <button
          onClick={() => setActiveTab('doubts')}
          className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition ${
            activeTab === 'doubts'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Doubt Solver</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('practice');
            if (!practiceExercise) generatePracticeProblem();
          }}
          className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition ${
            activeTab === 'practice'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Practice Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('mastery')}
          className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium transition ${
            activeTab === 'mastery'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Mastery & Retention</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Active Goal Quick Status Bar */}
        {selectedGoal && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">{selectedGoal.title}</h2>
                <span className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  {selectedGoal.currentMasteryLevel} → {selectedGoal.targetMasteryLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Stage {selectedGoal.currentStage} of 15 • {selectedGoal.pathMode === LearningPathMode.FULL_MASTERY ? 'Full Mastery Track' : 'Compact Revision Track'}
              </p>
            </div>

            {orchestrator && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Current Agent</span>
                  <span className="text-xs text-indigo-400 font-semibold">{orchestrator.recommendedAgent.toUpperCase()}</span>
                </div>
                <button
                  onClick={async () => {
                    const res = await fetch(`${apiBase}/api/goals/${selectedGoal.id}/orchestrator/advance`, {
                      method: 'POST',
                      headers: { 'Authorization': 'Bearer dev-token' }
                    });
                    const updated = await res.json();
                    selectGoal(updated);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: CURRICULUM ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Left: Goals Manager */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Goals ({goals.length})</span>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[500px]">
                {goals.map(g => (
                  <div
                    key={g.id}
                    onClick={() => selectGoal(g)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                      selectedGoal?.id === g.id
                        ? 'bg-sky-950/40 border-sky-500/50 text-sky-100 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{g.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">Stage {g.currentStage} / 15</div>
                    </div>
                    <button
                      onClick={e => deleteGoal(g.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Modules & Lessons */}
            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Structured Curriculum Roadmap
              </h3>

              {roadmap?.modules ? (
                <div className="space-y-4">
                  {roadmap.modules.map(mod => (
                    <div key={mod.id} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-sky-300">{mod.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{mod.estimatedMinutes} mins</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{mod.description}</p>

                      <div className="space-y-1.5">
                        {mod.lessons.map(les => (
                          <div
                            key={les.id}
                            onClick={() => {
                              setSelectedLessonId(les.id);
                              if (selectedGoal) {
                                fetchLessonExplanation(les.id, les.title, selectedGoal.id);
                                setActiveTab('teacher');
                              }
                            }}
                            className={`p-2.5 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                              selectedLessonId === les.id
                                ? 'bg-sky-900/30 border-sky-500/40 text-sky-200'
                                : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="font-medium truncate">{les.title}</span>
                            <span className="text-indigo-400 text-[10px] font-semibold flex items-center gap-1">
                              <span>Learn</span>
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-12">No curriculum generated yet. Select a goal above.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TEACHER CLASSROOM */}
        {activeTab === 'teacher' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">{explanation?.title || 'Teacher Classroom'}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive, First-Principles Pedagogical Explanation</p>
              </div>

              {/* Style Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Teaching Style:</span>
                <select
                  value={explanationStyle}
                  onChange={e => {
                    const newStyle = e.target.value as ExplanationStyle;
                    setExplanationStyle(newStyle);
                    if (selectedLessonId && selectedGoal) {
                      const lesson = roadmap?.modules.flatMap(m => m.lessons).find(l => l.id === selectedLessonId);
                      fetchLessonExplanation(selectedLessonId, lesson?.title || 'Concept', selectedGoal.id, newStyle);
                    }
                  }}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none"
                >
                  <option value="first_principles">First Principles</option>
                  <option value="analogy">Analogy Based</option>
                  <option value="code_first">Code-First</option>
                  <option value="deep_architecture">Deep Architecture</option>
                  <option value="socratic">Socratic Inquiry</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="text-xs text-slate-500 text-center py-16">Teacher Agent is generating explanation...</div>
            ) : explanation ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <h4 className="font-bold text-sky-400 mb-1">1. Intuition & Mental Model</h4>
                  <p className="text-slate-300 leading-relaxed">{explanation.overview}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <h4 className="font-bold text-amber-400 mb-1">2. Why, When & Where</h4>
                  <p className="text-slate-300 leading-relaxed">{explanation.whyWhenWhere}</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <h4 className="font-bold text-indigo-400 mb-1">3. Internal Architecture & Mechanics</h4>
                  <p className="text-slate-300 leading-relaxed mb-3">{explanation.internalMechanisms}</p>
                  {explanation.diagramMermaid && (
                    <div className="bg-slate-900 border border-slate-800 rounded p-3 font-mono text-[11px] text-slate-300">
                      {explanation.diagramMermaid}
                    </div>
                  )}
                </div>

                {explanation.codeSnippets?.map((cs, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <Code className="w-4 h-4" />
                      4. Annotated Code Snippet
                    </h4>
                    <pre className="bg-slate-900 p-3 rounded text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                      {cs.code}
                    </pre>
                    <p className="text-slate-400 mt-2">{cs.explanation}</p>
                  </div>
                ))}

                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <h4 className="font-bold text-rose-400 mb-2">5. Critical Edge Cases & Limitations</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {explanation.edgeCasesAndLimitations?.map((ec, i) => (
                      <li key={i}>{ec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-16">Select a lesson from the Roadmap to begin learning.</div>
            )}
          </div>
        )}

        {/* TAB 3: DOUBT SOLVER */}
        {activeTab === 'doubts' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                Doubt Solver & Misconception Backtracker
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Stuck on a concept? The Doubt Solver diagnoses your root misconception without repeating the same explanation.
              </p>
            </div>

            <form onSubmit={handleAskDoubt} className="flex gap-3">
              <input
                type="text"
                placeholder="Ask any question or explain where you are stuck..."
                value={doubtQuestion}
                onChange={e => setDoubtQuestion(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isSolvingDoubt || !doubtQuestion.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs px-5 py-2.5 rounded-lg font-medium transition"
              >
                {isSolvingDoubt ? 'Diagnosing...' : 'Resolve Doubt'}
              </button>
            </form>

            {activeDoubt && (
              <div className="bg-slate-950/80 border border-indigo-900/40 rounded-xl p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-slate-200">Doubt: "{activeDoubt.question}"</span>
                  <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px] font-semibold">Resolved</span>
                </div>

                <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                  <span className="text-rose-400 font-bold block mb-1">🔍 Diagnosed Root Misconception:</span>
                  <p className="text-slate-300 leading-relaxed">{activeDoubt.rootMisconception}</p>
                </div>

                {activeDoubt.backtrackedPrerequisite?.needed && (
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <span className="text-sky-400 font-bold block mb-1">
                      ⏮️ Missing Prerequisite Backtracked ({activeDoubt.backtrackedPrerequisite.conceptName}):
                    </span>
                    <p className="text-slate-300 leading-relaxed">{activeDoubt.backtrackedPrerequisite.explanation}</p>
                  </div>
                )}

                <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                  <span className="text-emerald-400 font-bold block mb-1">💡 Fresh Alternative Explanation:</span>
                  <p className="text-slate-300 leading-relaxed">{activeDoubt.alternativeExplanation}</p>
                </div>

                {activeDoubt.analogousContrast && (
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">⚖️ Contrasting Analogy (What it is vs What it is not):</span>
                    <p className="text-slate-300 leading-relaxed">{activeDoubt.analogousContrast}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRACTICE LAB */}
        {activeTab === 'practice' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Code className="w-5 h-5 text-emerald-400" />
                  Tiered Practice & Code Evaluation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Solve hands-on problems with progressive hints.</p>
              </div>

              <button
                onClick={generatePracticeProblem}
                disabled={isLoading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg font-medium transition"
              >
                New Problem
              </button>
            </div>

            {practiceExercise ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-300">Topic: {practiceExercise.topic}</span>
                    <span className="bg-amber-950/60 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
                      Difficulty: {practiceExercise.difficulty} / 5
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{practiceExercise.prompt}</p>
                </div>

                {/* Progressive Hints Accordion */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-400">Progressive Hints ({revealedHints} of {practiceExercise.progressiveHints.length} used)</span>
                    {revealedHints < practiceExercise.progressiveHints.length && (
                      <button
                        onClick={() => setRevealedHints(prev => prev + 1)}
                        className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-[11px] font-semibold"
                      >
                        Reveal Hint {revealedHints + 1}
                      </button>
                    )}
                  </div>
                  {revealedHints > 0 && (
                    <div className="space-y-2 mt-3">
                      {practiceExercise.progressiveHints.slice(0, revealedHints).map((h, i) => (
                        <div key={i} className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 text-[11px]">
                          <span className="text-amber-400 font-bold">Hint {h.hintLevel}:</span> {h.hint}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Code Input */}
                <div className="space-y-2">
                  <span className="font-semibold text-slate-300 block">Your Solution:</span>
                  <textarea
                    rows={8}
                    value={userCode}
                    onChange={e => setUserCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                  <button
                    onClick={handleEvaluatePractice}
                    disabled={isEvaluatingPractice}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs px-5 py-2.5 rounded-lg font-bold transition shadow-sm"
                  >
                    {isEvaluatingPractice ? 'Evaluating...' : 'Submit & Grade Solution'}
                  </button>
                </div>

                {/* Evaluation Feedback */}
                {practiceEvaluation && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">Evaluation Result:</span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        Score: {practiceEvaluation.score} / 100
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{practiceEvaluation.feedback}</p>
                    <p className="text-indigo-400 text-[11px]">Recommended Next Step: {practiceEvaluation.recommendedNextStep}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 text-center py-16">Click "New Problem" above to generate a practice challenge.</div>
            )}
          </div>
        )}

        {/* TAB 5: MASTERY & RETENTION */}
        {activeTab === 'mastery' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                L0 to L6 Mastery & Spaced Repetition Center
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Track multi-evidence mastery and retention intervals.</p>
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
              {['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'].map(lvl => (
                <div key={lvl} className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] text-slate-500 font-mono block">{lvl}</span>
                  <span className="text-base font-bold text-amber-400 mt-1 block">
                    {masterySummary?.distribution?.[lvl] || 0}
                  </span>
                </div>
              ))}
            </div>

            {/* Spaced Repetition Queues */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-2">Upcoming Revisions</span>
                <div className="space-y-1.5 text-xs">
                  {reviewQueue?.upcomingRevisions?.length > 0 ? (
                    reviewQueue.upcomingRevisions.map((r: any) => (
                      <div key={r.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                        <span>{r.conceptName}</span>
                        <span className="text-slate-400 font-mono">{r.dueDate}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500">No revisions scheduled yet.</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">Weak Concept Priorities</span>
                <div className="space-y-1.5 text-xs">
                  {reviewQueue?.weakConceptPriority?.length > 0 ? (
                    reviewQueue.weakConceptPriority.map((w: any) => (
                      <div key={w.conceptId} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                        <span>{w.conceptName}</span>
                        <span className="text-rose-400 font-mono">{w.confidenceScore}%</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500">All concepts currently at solid retention.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-1">Create Learning Goal</h3>
            <p className="text-xs text-slate-400 mb-4">Set your subject, certification, or skill target.</p>

            <form onSubmit={createGoal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. AZ-400 Azure DevOps Engineer"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Path Mode</label>
                <select
                  value={newGoalMode}
                  onChange={e => setNewGoalMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value={LearningPathMode.FULL_MASTERY}>Full Mastery (All 15 Stages)</option>
                  <option value={LearningPathMode.COMPACT_REVISION}>Compact Revision (Fast Track)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingGoal || !newGoalTitle.trim()}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs px-5 py-2 rounded-lg font-medium transition shadow-sm"
                >
                  {isCreatingGoal ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVER SETTINGS MODAL */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" />
                Backend Server Connection
              </h3>
              <button onClick={() => setShowServerModal(false)} className="text-slate-400 hover:text-slate-200 text-sm font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              On mobile, the app connects to your PC over local Wi-Fi or a server URL to access AI agents and Supabase.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Backend Server URL</label>
                <input
                  type="text"
                  value={serverUrlInput}
                  onChange={e => setServerUrlInput(e.target.value.trim())}
                  placeholder="http://192.168.1.13:4000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => setServerUrlInput('http://192.168.1.13:4000')}
                  className="text-sky-400 hover:text-sky-300 bg-slate-800 px-2 py-0.5 rounded font-mono"
                >
                  Wi-Fi (192.168.1.13)
                </button>
                <button
                  type="button"
                  onClick={() => setServerUrlInput('http://localhost:4000')}
                  className="text-sky-400 hover:text-sky-300 bg-slate-800 px-2 py-0.5 rounded font-mono"
                >
                  Localhost
                </button>
              </div>

              {serverCheckMessage && (
                <div className={`p-2.5 rounded-lg text-xs ${serverCheckMessage.startsWith('✅') ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'}`}>
                  {serverCheckMessage}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    setIsCheckingServer(true);
                    setServerCheckMessage('Testing connection...');
                    try {
                      const res = await fetch(`${serverUrlInput}/api/goals`, {
                        headers: { 'Authorization': 'Bearer dev-token' }
                      });
                      if (res.ok) {
                        setServerCheckMessage('✅ Connected successfully to backend & Supabase!');
                        setApiBase(serverUrlInput);
                        localStorage.setItem('COACH_API_BASE', serverUrlInput);
                        setIsServerConnected(true);
                        fetchGoals(serverUrlInput);
                      } else {
                        setServerCheckMessage(`❌ Server returned HTTP ${res.status}`);
                        setIsServerConnected(false);
                      }
                    } catch (err: any) {
                      setServerCheckMessage(`❌ Could not connect: ${err.message}. Ensure your phone is on the same Wi-Fi.`);
                      setIsServerConnected(false);
                    } finally {
                      setIsCheckingServer(false);
                    }
                  }}
                  disabled={isCheckingServer}
                  className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
                >
                  {isCheckingServer ? 'Testing...' : 'Test & Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
