import React, { useState } from "react";
import api from "../../api/axios";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Send,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Lightbulb,
  XCircle,
  Award,
} from "lucide-react";

const CATEGORIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "AI / Machine Learning",
  "DevOps",
  "Product Design",
  "Data Science",
  "Cybersecurity",
  "Product Management",
];

const InterviewPrepPanel = () => {
  const [roleInput, setRoleInput] = useState("Frontend");
  const [questions, setQuestions] = useState([
    {
      id: 1,
      category: "Technical",
      question: "Explain the Virtual DOM and how React handles state updates under the hood.",
      difficulty: "Medium",
      answerGuide: "Mention reconciliation, fiber architecture, and batching state updates.",
      standardAnswer:
        "The Virtual DOM (VDOM) is an in-memory lightweight copy of the real DOM. When state changes occur in React, a new VDOM tree is generated. React compares it with the previous VDOM tree using a diffing algorithm (Reconciliation). React Fiber breaks work into chunks to prioritize urgent updates. Finally, React batches real DOM operations in a single render phase for optimal rendering performance.",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
    {
      id: 2,
      category: "Behavioral",
      question: "Describe a time when you had an architectural disagreement with a teammate. How did you handle it?",
      difficulty: "Hard",
      answerGuide: "Use the STAR method: Situation, Task, Action, and quantifiable Outcome.",
      standardAnswer:
        "Situation: During a backend migration, a peer preferred REST while I advocated GraphQL for microservices.\nTask: Reach an architectural consensus without delaying project velocity.\nAction: I scheduled a quick benchmarking spike comparing payload size, response latency, and developer DX. We presented both metrics objectively.\nOutcome: We adopted GraphQL for high-frequency mobile endpoints and kept REST for simple CRUD routes, finishing two days ahead of schedule.",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
    {
      id: 3,
      category: "Technical",
      question: "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
      difficulty: "Medium",
      answerGuide: "Discuss initial load times, SEO impact, server burden, and hydration.",
      standardAnswer:
        "CSR loads a minimal HTML file and renders UI in the browser using JavaScript (faster subsequent routing, but slower initial page load and poorer SEO). SSR renders full HTML on the server per request (faster Time To First Byte and SEO friendly), but increases server load and requires dynamic client-side hydration.",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
    {
      id: 4,
      category: "System Design",
      question: "How would you design an asset pipeline to optimize image and font loading on a high-traffic web application?",
      difficulty: "Hard",
      answerGuide: "Address WebP/AVIF formats, lazy loading, CDN caching strategies, and font subsetting.",
      standardAnswer:
        "1. Modern Formats & Compression: Serve AVIF/WebP formats using dynamic image optimization proxies.\n2. Lazy Loading & Srcset: Use native loading='lazy' and responsive srcset attributes.\n3. CDN Caching: Store static assets on edge nodes with long-term Cache-Control headers.\n4. Font Optimization: Use font-display: swap, preload critical subsets, and self-host variable WOFF2 fonts.",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
    {
      id: 5,
      category: "Technical",
      question: "Explain JavaScript closures and provide a practical real-world use case.",
      difficulty: "Medium",
      answerGuide: "Define lexical scoping, private variables, and memory retention risks.",
      standardAnswer:
        "A closure is a function bundled together with references to its surrounding lexical environment. It allows an inner function to access an outer function's scope even after the outer function has returned. A practical use case includes data privacy / encapsulating state (e.g., creating stateful factory functions or custom event listener hooks).",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
    {
      id: 6,
      category: "Behavioral",
      question: "Tell me about a time you missed a project deadline or made a critical bug in production.",
      difficulty: "Hard",
      answerGuide: "Focus on accountability, immediate mitigation steps, and preventive measures implemented after.",
      standardAnswer:
        "I once pushed an unchecked database query that led to high CPU usage in production. I took immediate ownership, notified on-call engineering, and initiated a hotfix rollback within 10 minutes. Afterwards, I authored a blameless post-mortem and introduced automated load test gates in our CI/CD pipeline to prevent future performance regressions.",
      completed: false,
      userAnswer: "",
      aiFeedback: "",
      showAnswer: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluatingId, setEvaluatingId] = useState(null);
  const [error, setError] = useState("");

  const handleToggleExpand = (id) => {
    setSelectedQuestionId((prevId) => (prevId === id ? null : id));
  };

  const generateQuestionsWithGrok = async () => {
    if (!roleInput.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/ai/generate-questions", { role: roleInput });
      if (res.data.success && res.data.questions) {
        const formatted = res.data.questions.map((q, idx) => ({
          ...q,
          id: q.id || idx + 1,
          standardAnswer: q.standardAnswer || "Model answer not provided for this AI-generated question.",
          userAnswer: "",
          aiFeedback: "",
          showAnswer: false,
          completed: false,
        }));
        setQuestions(formatted);
        setSelectedQuestionId(null);
      }
    } catch (err) {
      console.error("Error generating questions:", err);
      setError(err.response?.data?.message || "Failed to generate interview questions.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateAnswerWithGrok = async (q) => {
    if (!q.userAnswer.trim()) return;

    setEvaluatingId(q.id);
    setError("");

    try {
      const res = await api.post("/ai/evaluate-answer", {
        question: q.question,
        userAnswer: q.userAnswer,
      });

      if (res.data.success) {
        setQuestions((prev) =>
          prev.map((item) => (item.id === q.id ? { ...item, aiFeedback: res.data.feedback } : item))
        );
      }
    } catch (err) {
      console.error("Error evaluating answer:", err);
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === q.id ? { ...item, aiFeedback: "Unable to evaluate answer right now. Please try again." } : item
        )
      );
    } finally {
      setEvaluatingId(null);
    }
  };

  const updateQuestionField = (id, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const toggleComplete = (id, e) => {
    e.stopPropagation();
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, completed: !q.completed } : q)));
  };

  const getParsedScore = (feedback) => {
    if (!feedback) return null;
    const match =
      feedback.match(/(?:Rating|Score):\s*\*?(\d+(?:\.\d+)?)\s*\/\s*(\d+)/i) ||
      feedback.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);

    if (match) {
      return parseFloat(match[1]);
    }

    const lower = feedback.toLowerCase();
    if (lower.includes("incomplete") || lower.includes("incorrect") || lower.includes("misunderstood")) {
      return 0;
    }
    return null;
  };

  const filteredQuestions =
    activeTab === "all"
      ? questions
      : questions.filter((q) => q.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-2xl transition-colors duration-200 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
              AI Interview Prep
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              AI-generated questions, instant feedback, and model solutions tailored to your role.
            </p>
          </div>
        </div>

        {/* Dynamic Role Search Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="relative">
            <select
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              className="appearance-none pr-8 pl-3.5 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none text-slate-800 dark:text-slate-200 cursor-pointer focus:border-indigo-500 transition-colors"
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                >
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={generateQuestionsWithGrok}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-3 overflow-x-auto">
        {["all", "technical", "behavioral", "system design"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isOpen = selectedQuestionId === q.id;
          const extractedScore = getParsedScore(q.aiFeedback);
          const isBelowFive = extractedScore !== null && extractedScore < 5;
          const isEvaluating = evaluatingId === q.id;

          return (
            <div
              key={q.id ? `q-${q.id}` : `q-idx-${idx}`}
              onClick={() => handleToggleExpand(q.id)}
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 space-y-3 cursor-pointer ${
                isOpen
                  ? "border-indigo-500 dark:border-indigo-500 bg-slate-50/80 dark:bg-slate-950 shadow-sm"
                  : "bg-slate-50/60 dark:bg-slate-950/60 hover:bg-slate-100/80 dark:hover:bg-slate-950 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => toggleComplete(q.id, e)}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0 mt-0.5"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        q.completed ? "fill-emerald-500 text-white dark:text-slate-950" : ""
                      }`}
                    />
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                        {q.category}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border ${
                          q.difficulty === "Hard"
                            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 shrink-0">
                  <span>{isOpen ? "Close" : "Practice"}</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* Opened State Details */}
              {isOpen && (
                <div
                  className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  {q.answerGuide && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      <strong className="font-semibold text-slate-700 dark:text-slate-300 not-italic">Tip: </strong>
                      {q.answerGuide}
                    </p>
                  )}

                  <textarea
                    value={q.userAnswer}
                    onChange={(e) => updateQuestionField(q.id, "userAnswer", e.target.value)}
                    placeholder="Type your practice response..."
                    rows={3}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-colors"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => updateQuestionField(q.id, "showAnswer", !q.showAnswer)}
                      className="px-3.5 py-1.5 bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {q.showAnswer ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          <span>Hide Standard Answer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Standard Answer</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => evaluateAnswerWithGrok(q)}
                      disabled={isEvaluating || !q.userAnswer.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Submit Answer</span>
                    </button>
                  </div>

                  {/* Dynamic AI Feedback Card */}
                  {q.aiFeedback && (
                    <div
                      className={`p-4 rounded-xl text-xs transition-all duration-300 space-y-2 border ${
                        isBelowFive
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200"
                          : "bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-bold flex items-center gap-1.5 ${
                            isBelowFive ? "text-rose-700 dark:text-rose-400" : "text-indigo-700 dark:text-indigo-400"
                          }`}
                        >
                          {isBelowFive ? (
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          ) : (
                            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                          AI Evaluation & Feedback:
                        </span>

                        {extractedScore !== null && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                              isBelowFive
                                ? "bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200"
                                : "bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200"
                            }`}
                          >
                            Score: {extractedScore}/10
                          </span>
                        )}
                      </div>

                      <p className="leading-relaxed">{q.aiFeedback}</p>

                      {isBelowFive && !q.showAnswer && (
                        <div className="mt-3 pt-2 border-t border-rose-200/80 dark:border-rose-800/50 flex items-center justify-between gap-2">
                          <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span>Your score was below 5/10. Review the model answer to improve your submission.</span>
                          </p>
                          <button
                            onClick={() => updateQuestionField(q.id, "showAnswer", true)}
                            className="text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:underline shrink-0"
                          >
                            Show Solution →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Model Solution Box */}
                  {q.showAnswer && (
                    <div className="p-4 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-slate-800 dark:text-slate-200 space-y-1.5">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Standard Model Answer:
                      </span>
                      <p className="leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
                        {q.standardAnswer || "No model answer available for this question."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewPrepPanel;