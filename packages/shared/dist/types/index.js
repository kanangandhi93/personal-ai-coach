"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningPathMode = exports.AssessmentType = exports.AgentType = exports.LifecycleStage = exports.MasteryLevel = void 0;
var MasteryLevel;
(function (MasteryLevel) {
    MasteryLevel["L0"] = "L0";
    MasteryLevel["L1"] = "L1";
    MasteryLevel["L2"] = "L2";
    MasteryLevel["L3"] = "L3";
    MasteryLevel["L4"] = "L4";
    MasteryLevel["L5"] = "L5";
    MasteryLevel["L6"] = "L6"; // Demonstrated Mastery & Teach Others
})(MasteryLevel || (exports.MasteryLevel = MasteryLevel = {}));
var LifecycleStage;
(function (LifecycleStage) {
    LifecycleStage[LifecycleStage["STAGE_1_PREREQUISITE_ASSESSMENT"] = 1] = "STAGE_1_PREREQUISITE_ASSESSMENT";
    LifecycleStage[LifecycleStage["STAGE_2_BASIC_CONCEPTS"] = 2] = "STAGE_2_BASIC_CONCEPTS";
    LifecycleStage[LifecycleStage["STAGE_3_FUNDAMENTALS"] = 3] = "STAGE_3_FUNDAMENTALS";
    LifecycleStage[LifecycleStage["STAGE_4_CORE_UNDERSTANDING"] = 4] = "STAGE_4_CORE_UNDERSTANDING";
    LifecycleStage[LifecycleStage["STAGE_5_ADVANCED_CONCEPTS"] = 5] = "STAGE_5_ADVANCED_CONCEPTS";
    LifecycleStage[LifecycleStage["STAGE_6_INTERNAL_ARCHITECTURE"] = 6] = "STAGE_6_INTERNAL_ARCHITECTURE";
    LifecycleStage[LifecycleStage["STAGE_7_EDGE_CASES_LIMITATIONS"] = 7] = "STAGE_7_EDGE_CASES_LIMITATIONS";
    LifecycleStage[LifecycleStage["STAGE_8_GUIDED_PRACTICE"] = 8] = "STAGE_8_GUIDED_PRACTICE";
    LifecycleStage[LifecycleStage["STAGE_9_INDEPENDENT_PRACTICE"] = 9] = "STAGE_9_INDEPENDENT_PRACTICE";
    LifecycleStage[LifecycleStage["STAGE_10_PRACTICAL_APPLICATION"] = 10] = "STAGE_10_PRACTICAL_APPLICATION";
    LifecycleStage[LifecycleStage["STAGE_11_THEORY_EXAM"] = 11] = "STAGE_11_THEORY_EXAM";
    LifecycleStage[LifecycleStage["STAGE_12_INTERVIEW_VIVA"] = 12] = "STAGE_12_INTERVIEW_VIVA";
    LifecycleStage[LifecycleStage["STAGE_13_PRACTICAL_EXAM"] = 13] = "STAGE_13_PRACTICAL_EXAM";
    LifecycleStage[LifecycleStage["STAGE_14_FINAL_EVALUATION"] = 14] = "STAGE_14_FINAL_EVALUATION";
    LifecycleStage[LifecycleStage["STAGE_15_REVISION_MASTERY_VERIFICATION"] = 15] = "STAGE_15_REVISION_MASTERY_VERIFICATION";
})(LifecycleStage || (exports.LifecycleStage = LifecycleStage = {}));
var AgentType;
(function (AgentType) {
    AgentType["ORCHESTRATOR"] = "orchestrator";
    AgentType["CURRICULUM"] = "curriculum";
    AgentType["TEACHER"] = "teacher";
    AgentType["DOUBT_SOLVER"] = "doubt_solver";
    AgentType["PRACTICE"] = "practice";
    AgentType["EXAM_INTERVIEW"] = "exam_interview";
    AgentType["PRACTICAL"] = "practical";
    AgentType["EVALUATOR"] = "evaluator";
    AgentType["RESEARCH"] = "research";
})(AgentType || (exports.AgentType = AgentType = {}));
var AssessmentType;
(function (AssessmentType) {
    AssessmentType["MCQ"] = "mcq";
    AssessmentType["MULTI_SELECT"] = "multi_select";
    AssessmentType["TRUE_FALSE"] = "true_false";
    AssessmentType["SHORT_ANSWER"] = "short_answer";
    AssessmentType["LONG_ANSWER"] = "long_answer";
    AssessmentType["SCENARIO"] = "scenario";
    AssessmentType["CODING"] = "coding";
    AssessmentType["INTERVIEW_VIVA"] = "interview_viva";
})(AssessmentType || (exports.AssessmentType = AssessmentType = {}));
var LearningPathMode;
(function (LearningPathMode) {
    LearningPathMode["FULL_MASTERY"] = "full_mastery";
    LearningPathMode["COMPACT_REVISION"] = "compact_revision";
    LearningPathMode["EXAM_CRAM"] = "exam_cram";
    LearningPathMode["PRACTICAL_LAB"] = "practical_lab"; // Hands-on heavy
})(LearningPathMode || (exports.LearningPathMode = LearningPathMode = {}));
