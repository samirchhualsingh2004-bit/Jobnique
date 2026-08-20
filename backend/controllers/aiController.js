const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { Job } = require("../models");
const { groqChat } = require("../utils/groqClient");

// ==========================================
// 1. Skill Gap Analysis Controller
// ==========================================
exports.analyzeSkillGap = async (req, res, next) => {
  try {
    const { targetRole, resumeUrl } = req.body;

    const activeResumePath = resumeUrl || (req.user && req.user.resumeUrl);

    if (!activeResumePath) {
      return res.status(400).json({
        success: false,
        message: "No resume found. Please upload a PDF resume first.",
      });
    }

    // Resolve relative path to local server path
    const cleanRelativePath = activeResumePath.startsWith("/")
      ? activeResumePath.slice(1)
      : activeResumePath;
    const absolutePath = path.join(__dirname, "../", cleanRelativePath);

    let extractedText = "";

    if (fs.existsSync(absolutePath)) {
      const dataBuffer = fs.readFileSync(absolutePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text.toLowerCase();
    } else if (req.user && req.user.resumeText) {
      extractedText = req.user.resumeText.toLowerCase();
    } else {
      return res.status(404).json({
        success: false,
        message:
          "Resume PDF file not found on server disk. Please re-upload your resume.",
      });
    }

    // Role-specific competency mapping
    const roleSkillDatabase = {
      "full stack developer": [
        "javascript",
        "react",
        "node.js",
        "express",
        "mongodb",
        "sql",
        "git",
        "rest api",
        "tailwind",
        "docker",
        "redis",
        "graphql",
        "typescript",
      ],
      "frontend engineer": [
        "javascript",
        "typescript",
        "react",
        "next.js",
        "vue",
        "html5",
        "css3",
        "tailwind",
        "redux",
        "webpack",
        "jest",
      ],
      "backend developer": [
        "node.js",
        "express",
        "python",
        "postgresql",
        "mysql",
        "mongodb",
        "docker",
        "redis",
        "rest api",
        "microservices",
        "graphql",
      ],
      "devops specialist": [
        "docker",
        "kubernetes",
        "aws",
        "linux",
        "ci/cd",
        "terraform",
        "bash",
        "python",
        "git",
        "ansible",
      ],
    };

    const targetKey = (targetRole || "full stack developer").toLowerCase();
    const expectedSkills =
      roleSkillDatabase[targetKey] || roleSkillDatabase["full stack developer"];

    const foundSkills = [];
    const missingSkills = [];

    expectedSkills.forEach((skill) => {
      if (extractedText.includes(skill)) {
        foundSkills.push(skill.toUpperCase());
      } else {
        missingSkills.push({
          skill: skill.toUpperCase(),
          level: "High Priority Gap",
          course: `Mastering ${skill.toUpperCase()} for ${targetRole || "the role"}`,
        });
      }
    });

    const matchScore = Math.round(
      (foundSkills.length / expectedSkills.length) * 100
    );

    return res.status(200).json({
      success: true,
      matchScore: Math.max(matchScore, 35),
      foundSkills:
        foundSkills.length > 0
          ? foundSkills
          : ["JAVASCRIPT", "REACT", "HTML/CSS"],
      missingSkills: missingSkills.slice(0, 4),
    });
  } catch (error) {
    console.error("Skill Gap Analysis Controller Error:", error);
    return res.status(500).json({
      success: false,
      message:
        "Failed to parse resume text. Please ensure your PDF file is valid.",
    });
  }
};

// ==========================================
// 2. Assistant Chat Controller
// ==========================================
exports.chatAssistant = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });
    }

    const systemPrompt = {
      role: "system",
      content:
        "You are the Jobnique AI Assistant, a helpful career and recruitment assistant embedded in a job portal called Jobnique. " +
        "Help users with career advice, interview prep, resume tips, and questions about using the platform. " +
        "Keep answers concise, actionable, and formatted clearly.",
    };

    const priorMessages = Array.isArray(history)
      ? history.slice(-10).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content || "").slice(0, 2000),
        }))
      : [];

    const messages = [
      systemPrompt,
      ...priorMessages,
      { role: "user", content: message },
    ];

    const reply = await groqChat(messages, {
      temperature: 0.7,
      max_tokens: 1024,
    });

    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("Chat Assistant Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to process chat message",
    });
  }
};

// ==========================================
// 3. Analyze Resume Controller
// ==========================================
exports.analyzeResume = async (req, res, next) => {
  try {
    const resumeText =
      req.body.resumeText || (req.user && req.user.resumeText);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No resume text found. Upload a resume first or paste your resume text.",
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are an expert resume reviewer. Given a resume's text, provide constructive feedback in this exact structure:\n" +
          "1. **Strengths** (2-4 bullet points)\n" +
          "2. **Areas to Improve** (2-4 bullet points)\n" +
          "3. **Suggested Keywords/Skills to Add** (short list, if relevant)\n" +
          "4. **Overall Score** (out of 10, with a one-line justification)\n" +
          "Be specific and actionable, not generic.",
      },
      { role: "user", content: resumeText.slice(0, 8000) },
    ];

    const feedback = await groqChat(messages, {
      temperature: 0.4,
      max_tokens: 1000,
    });

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to analyze resume",
    });
  }
};

// ==========================================
// 4. Job Recommendations Controller
// ==========================================
exports.recommendJobs = async (req, res, next) => {
  try {
    const resumeText =
      req.body.resumeText || (req.user && req.user.resumeText);

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "No resume text found. Upload a resume first to get recommendations.",
      });
    }

    const jobs = await Job.findAll({
      where: { expired: false },
      attributes: [
        "id",
        "title",
        "description",
        "category",
        "city",
        "country",
      ],
      limit: 30,
      order: [["createdAt", "DESC"]],
    });

    if (jobs.length === 0) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const jobList = jobs
      .map(
        (j) =>
          `ID:${j.id} | ${j.title} | ${j.category} | ${j.city}, ${j.country}\n${j.description.slice(0, 300)}`
      )
      .join("\n---\n");

    const messages = [
      {
        role: "system",
        content:
          "You are a job-matching engine. Given a candidate's resume and a list of open jobs, " +
          "return ONLY a valid JSON array of the top matches, max 5 items, in this exact format:\n" +
          '[{"id": <job id as number>, "reason": "<one short sentence why it fits>"}]',
      },
      {
        role: "user",
        content: `RESUME:\n${resumeText.slice(0, 4000)}\n\nOPEN JOBS:\n${jobList}`,
      },
    ];

    const raw = await groqChat(messages, {
      temperature: 0.3,
      max_tokens: 700,
    });

    let parsed = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      return res.status(200).json({ success: true, recommendations: [], raw });
    }

    const jobsById = Object.fromEntries(jobs.map((j) => [j.id, j]));
    const recommendations = parsed
      .filter((r) => jobsById[r.id])
      .map((r) => ({ job: jobsById[r.id], reason: r.reason }));

    return res.status(200).json({ success: true, recommendations });
  } catch (error) {
    console.error("Job Recommendation Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to recommend jobs",
    });
  }
};

// ==========================================
// 5. Generate Questions Controller
// ==========================================
exports.generateQuestions = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !role.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Role is required" });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. Generate 3 realistic, high-quality interview questions for the given target role.\n" +
          "Return ONLY a valid JSON array adhering strictly to this format with no additional commentary or markdown wrappers outside the array:\n" +
          '[\n  {\n    "id": 1,\n    "category": "Technical",\n    "question": "string",\n    "difficulty": "Medium",\n    "answerGuide": "short actionable tip",\n    "standardAnswer": "comprehensive model answer explaining the concept clearly",\n    "completed": false\n  }\n]',
      },
      { role: "user", content: `Target Role: ${role}` },
    ];

    const raw = await groqChat(messages, {
      temperature: 0.5,
      max_tokens: 1400,
    });

    let questions = [];
    try {
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (parseError) {
      console.error("Question JSON Parsing Failed. Raw output:", raw);
      // Clean fallback if LLM response formatting failed
      questions = [
        {
          id: 1,
          category: "Technical",
          question: `Can you explain the core architecture and fundamental principles of working as a ${role}?`,
          difficulty: "Medium",
          answerGuide: "Highlight fundamental principles, tools, and best practices.",
          standardAnswer:
            "A well-rounded answer will describe the key technical ecosystem, design decisions, and common design patterns.",
          completed: false,
        },
        {
          id: 2,
          category: "Behavioral",
          question: `Describe a challenging problem you faced while working in a ${role} position and how you solved it.`,
          difficulty: "Medium",
          answerGuide: "Use the STAR method (Situation, Task, Action, Result).",
          standardAnswer:
            "Focus on clear communication, identifying root causes, and delivering measurable impact.",
          completed: false,
        },
        {
          id: 3,
          category: "System Design",
          question: `How would you optimize performance, scalability, and security in a project related to ${role}?`,
          difficulty: "Hard",
          answerGuide: "Mention caching, database indexing, latency reduction, and authentication.",
          standardAnswer:
            "Explain horizontal scaling, caching strategies, rate limiting, and defensive coding practices.",
          completed: false,
        },
      ];
    }

    return res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Generate Questions Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to generate interview questions",
    });
  }
};

// ==========================================
// 6. Evaluate Answer Controller
// ==========================================
exports.evaluateAnswer = async (req, res, next) => {
  try {
    const { question, userAnswer } = req.body;

    if (!question || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: "Both question and userAnswer are required",
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "Act as an expert technical recruiter evaluating an interview answer.\n" +
          "Provide concise, constructive feedback under 120 words detailing strengths, missing details, and a rating out of 10.",
      },
      {
        role: "user",
        content: `Interview Question: "${question}"\nCandidate Answer: "${userAnswer}"`,
      },
    ];

    const feedback = await groqChat(messages, {
      temperature: 0.4,
      max_tokens: 400,
    });

    return res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Evaluate Answer Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to evaluate answer",
    });
  }
};