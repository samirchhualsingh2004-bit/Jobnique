const express = require("express");
const {
  chatAssistant,
  analyzeResume,
  recommendJobs,
  generateQuestions,
  evaluateAnswer,
  analyzeSkillGap,
} = require("../controllers/aiController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// ==========================================
// AI Assistant Chat Route
// ==========================================
// Open to all authenticated users (Job Seekers and Employers)
router.post("/chat", isAuthenticated, chatAssistant);

// ==========================================
// Resume Management & Analysis Routes
// ==========================================
// Analyzes ATS formatting, scores, and provides structured feedback
router.post("/analyze-resume", isAuthenticated, analyzeResume);

// Extracts resume text from disk and cross-references against target role competencies
router.post("/skill-gap-analysis", isAuthenticated, analyzeSkillGap);

// Recommends top matching open jobs based on candidate resume content
router.post("/recommend-jobs", isAuthenticated, recommendJobs);

// ==========================================
// Interview Preparation Kit Routes
// ==========================================
// Generates role-specific behavioral and technical interview questions
router.post("/generate-questions", isAuthenticated, generateQuestions);

// Evaluates candidate answer submissions and returns rating out of 10
router.post("/evaluate-answer", isAuthenticated, evaluateAnswer);

module.exports = router;