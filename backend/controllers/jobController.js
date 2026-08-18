const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const { Job, User, Application } = require("../models");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const parseSavedJobIds = (rawInput) => {
  if (!rawInput) return [];

  let input = rawInput;

  while (typeof input === "string") {
    const trimmed = input.trim();

    if (!trimmed) return [];

    try {
      input = JSON.parse(trimmed);
    } catch (error) {
      input = trimmed.split(",");
      break;
    }
  }

  if (!Array.isArray(input)) {
    input = [input];
  }

  return input
    .map((item) => {
      let strId = "";

      if (typeof item === "object" && item !== null) {
        strId = String(item.id || item._id || "").trim();
      } else {
        strId = String(item).trim();
      }

      return strId.replace(/^["']|["']$/g, "").trim();
    })
    .filter(
      (id) =>
        id &&
        id !== "null" &&
        id !== "undefined"
    );
};

// ============================================================
// FETCH POPULATED SAVED JOBS
// ============================================================

const getPopulatedSavedJobs = async (userSavedJobs) => {
  const cleanIds = parseSavedJobIds(userSavedJobs);

  if (cleanIds.length === 0) return [];

  return await Job.findAll({
    where: {
      id: cleanIds,
    },
    include: [
      {
        model: User,
        as: "employer",
        attributes: [
          "id",
          "name",
          "email",
          "companyName",
          "designation",
        ],
      },
    ],
  });
};

// ============================================================
// POST JOB
// ============================================================

exports.postJob = async (req, res, next) => {
  try {
    if (req.user.role !== "Employer") {
      return res.status(403).json({
        success: false,
        message: "Only employers can post jobs",
      });
    }

    const {
      title,
      jobSummary,
      description,
      responsibilities,
      requirements,
      preferredQualifications,
      skills,
      category,
      employmentType,
      workMode,
      country,
      city,
      location,
      salaryCurrency,
      salaryPeriod,
      fixedSalary,
      salaryFrom,
      salaryTo,
      experienceLevel,
      minExperience,
      maxExperience,
      education,
      numberOfOpenings,
      applicationDeadline,
      expectedStartDate,
      applicationInstructions,
    } = req.body;

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    const requiredFields = {
      title,
      jobSummary,
      description,
      responsibilities,
      requirements,
      skills,
      category,
      employmentType,
      workMode,
      country,
      city,
      salaryCurrency,
      salaryPeriod,
      experienceLevel,
      education,
      numberOfOpenings,
      applicationDeadline,
    };

    const missingField = Object.entries(requiredFields).find(
      ([, value]) =>
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    );

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missingField[0]}`,
      });
    }

    // ========================================================
    // OPENINGS
    // ========================================================

    const openings = Number(numberOfOpenings);

    if (!Number.isInteger(openings) || openings < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of openings must be at least 1",
      });
    }

    // ========================================================
    // EXPERIENCE
    // ========================================================

    const minExp = Number(minExperience ?? 0);
    const maxExp = Number(maxExperience ?? 0);

    if (
      !Number.isInteger(minExp) ||
      !Number.isInteger(maxExp) ||
      minExp < 0 ||
      maxExp < minExp
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid experience range",
      });
    }

    // ========================================================
    // SALARY
    // ========================================================

    const hasFixed =
      fixedSalary !== undefined &&
      fixedSalary !== null &&
      String(fixedSalary).trim() !== "";

    const hasFrom =
      salaryFrom !== undefined &&
      salaryFrom !== null &&
      String(salaryFrom).trim() !== "";

    const hasTo =
      salaryTo !== undefined &&
      salaryTo !== null &&
      String(salaryTo).trim() !== "";

    const hasRange = hasFrom || hasTo;

    if ((!hasFixed && !hasRange) || (hasFixed && hasRange)) {
      return res.status(400).json({
        success: false,
        message:
          "Provide either a fixed salary or a salary range, not both",
      });
    }

    if (hasFixed && Number(fixedSalary) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Fixed salary must be greater than 0",
      });
    }

    if (
      hasRange &&
      (!hasFrom ||
        !hasTo ||
        Number(salaryFrom) <= 0 ||
        Number(salaryTo) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both minimum and maximum salary",
      });
    }

    if (
      hasRange &&
      Number(salaryFrom) > Number(salaryTo)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum salary cannot be greater than maximum salary",
      });
    }

    // ========================================================
    // APPLICATION DEADLINE
    // ========================================================

    const deadline = new Date(
      `${applicationDeadline}T00:00:00`
    );

    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid application deadline",
      });
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (deadline < today) {
      return res.status(400).json({
        success: false,
        message:
          "Application deadline cannot be in the past",
      });
    }

    // ========================================================
    // EXPECTED START DATE
    // ========================================================

    if (expectedStartDate) {
      const startDate = new Date(
        `${expectedStartDate}T00:00:00`
      );

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid expected start date",
        });
      }

      if (startDate < deadline) {
        return res.status(400).json({
          success: false,
          message:
            "Expected start date should be on or after the application deadline",
        });
      }
    }

    // ========================================================
    // SKILLS
    // ========================================================

    const normalizedSkills = Array.isArray(skills)
      ? skills
          .filter(Boolean)
          .map((skill) => String(skill).trim())
          .filter(Boolean)
      : String(skills)
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    if (normalizedSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide at least one required skill",
      });
    }

    // ========================================================
    // CREATE JOB
    // ========================================================

    const job = await Job.create({
      title: String(title).trim(),

      jobSummary:
        String(jobSummary).trim(),

      description:
        String(description).trim(),

      responsibilities:
        String(responsibilities).trim(),

      requirements:
        String(requirements).trim(),

      preferredQualifications:
        preferredQualifications
          ? String(preferredQualifications).trim()
          : null,

      skills:
        JSON.stringify(normalizedSkills),

      category:
        String(category).trim(),

      employmentType:
        String(employmentType).trim(),

      workMode:
        String(workMode).trim(),

      country:
        String(country).trim(),

      city:
        String(city).trim(),

      location:
        location
          ? String(location).trim()
          : null,

      salaryCurrency:
        String(salaryCurrency).trim(),

      salaryPeriod:
        String(salaryPeriod).trim(),

      fixedSalary:
        hasFixed
          ? Number(fixedSalary)
          : null,

      salaryFrom:
        hasRange
          ? Number(salaryFrom)
          : null,

      salaryTo:
        hasRange
          ? Number(salaryTo)
          : null,

      experienceLevel:
        String(experienceLevel).trim(),

      minExperience:
        minExp,

      maxExperience:
        maxExp,

      education:
        String(education).trim(),

      numberOfOpenings:
        openings,

      applicationDeadline,

      expectedStartDate:
        expectedStartDate || null,

      applicationInstructions:
        applicationInstructions
          ? String(applicationInstructions).trim()
          : null,

      postedBy:
        req.user.id,

      status:
        "Active",

      isOpen:
        true,

      expired:
        false,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET ALL ACTIVE JOBS
// ============================================================

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.findAll({
      where: {
        expired: false,
      },

      include: [
        {
          model: User,
          as: "employer",
          attributes: [
            "id",
            "name",
            "email",
            "companyName",
            "designation",
          ],
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE JOB
// ============================================================

exports.getSingleJob = async (req, res, next) => {
  try {
    const job = await Job.findByPk(
      req.params.id,
      {
        include: [
          {
            model: User,
            as: "employer",
            attributes: [
              "id",
              "name",
              "email",
              "companyName",
              "designation",
            ],
          },
        ],
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      job,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET EMPLOYER JOBS
// ============================================================

exports.getEmployerJobs = async (
  req,
  res,
  next
) => {
  try {
    const jobs = await Job.findAll({
      where: {
        postedBy: req.user.id,
      },

      include: [
        {
          model: User,
          as: "employer",
          attributes: [
            "id",
            "name",
            "email",
            "companyName",
            "designation",
          ],
        },

        {
          model: Application,
          as: "applications",

          include: [
            {
              model: User,
              as: "applicant",
              attributes: [
                "id",
                "name",
                "email",
                "phone",
                "resumeUrl",
              ],
            },
          ],
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });

    const formattedJobs = jobs.map(
      (job) => {
        const jobJson = job.toJSON();

        return {
          ...jobJson,

          companyName:
            jobJson.companyName ||
            jobJson.employer?.companyName ||
            req.user.companyName ||
            "Your Company",
        };
      }
    );

    res.status(200).json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// DOWNLOAD ONE-PAGE PROFESSIONAL JOB PDF
// ============================================================

exports.downloadJobPDF = async (
  req,
  res,
  next
) => {
  try {

    // ========================================================
    // FETCH JOB
    // ========================================================

    const job = await Job.findByPk(
      req.params.id,
      {
        include: [
          {
            model: User,
            as: "employer",
            attributes: [
              "id",
              "name",
              "email",
              "companyName",
              "designation",
            ],
          },
        ],
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const jobData =
      typeof job.toJSON === "function"
        ? job.toJSON()
        : job;

    const employer =
      jobData.employer || {};

    const companyName =
      employer.companyName ||
      employer.name ||
      "Company";

    // ========================================================
    // PARSE SKILLS
    // ========================================================

    let skills = [];

    try {
      if (Array.isArray(jobData.skills)) {
        skills = jobData.skills;
      } else {
        skills = JSON.parse(
          jobData.skills || "[]"
        );
      }
    } catch (error) {
      skills = String(
        jobData.skills || ""
      )
        .split(",")
        .map((skill) =>
          skill.trim()
        )
        .filter(Boolean);
    }

    // ========================================================
    // CLEAN TEXT
    // ========================================================

    const cleanText = (value) => {
      if (
        value === null ||
        value === undefined
      ) {
        return "";
      }

      return String(value)
        .replace(
          /<br\s*\/?>/gi,
          "\n"
        )
        .replace(
          /<\/p>/gi,
          "\n"
        )
        .replace(
          /<[^>]*>/g,
          ""
        )
        .replace(
          /&nbsp;/gi,
          " "
        )
        .replace(
          /&amp;/gi,
          "&"
        )
        .replace(
          /&lt;/gi,
          "<"
        )
        .replace(
          /&gt;/gi,
          ">"
        )
        .replace(
          /\n{3,}/g,
          "\n\n"
        )
        .trim();
    };

    // ========================================================
    // DATE
    // ========================================================

    const formatDate = (value) => {
      if (!value) {
        return "Not specified";
      }

      const raw = String(value)
        .substring(0, 10);

      const parts =
        raw.split("-");

      if (parts.length !== 3) {
        return String(value);
      }

      const year =
        Number(parts[0]);

      const month =
        Number(parts[1]);

      const day =
        Number(parts[2]);

      const date =
        new Date(
          year,
          month - 1,
          day
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return String(value);
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

    // ========================================================
    // SALARY
    // ========================================================

    const currencySymbols = {
      INR: "Rs.",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };

    const currencyCode =
      jobData.salaryCurrency ||
      "INR";

    const currencySymbol =
      currencySymbols[
        currencyCode
      ] || currencyCode;

    const formatMoney = (
      value
    ) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        return "";
      }

      const number =
        Number(value);

      if (
        Number.isNaN(number)
      ) {
        return String(value);
      }

      return number.toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      );
    };

    let salary =
      "Not specified";

    if (
      jobData.fixedSalary !==
        null &&
      jobData.fixedSalary !==
        undefined
    ) {
      salary =
        `${currencySymbol} ${formatMoney(
          jobData.fixedSalary
        )}`;
    } else if (
      jobData.salaryFrom !==
        null &&
      jobData.salaryFrom !==
        undefined &&
      jobData.salaryTo !==
        null &&
      jobData.salaryTo !==
        undefined
    ) {
      salary =
        `${currencySymbol} ${formatMoney(
          jobData.salaryFrom
        )} - ${currencySymbol} ${formatMoney(
          jobData.salaryTo
        )}`;
    }

    if (
      salary !==
        "Not specified" &&
      jobData.salaryPeriod
    ) {
      salary +=
        ` / ${jobData.salaryPeriod}`;
    }

    // ========================================================
    // EXPERIENCE
    // ========================================================

    const experience =
      jobData.minExperience !==
        null &&
      jobData.minExperience !==
        undefined &&
      jobData.maxExperience !==
        null &&
      jobData.maxExperience !==
        undefined
        ? `${jobData.minExperience} - ${jobData.maxExperience} years`
        : "Not specified";

    // ========================================================
    // LOCATION
    // ========================================================

    const jobLocation =
      [
        jobData.city,
        jobData.country,
      ]
        .filter(Boolean)
        .join(", ") ||
      "Not specified";

    // ========================================================
    // FILE NAME
    // ========================================================

    const safeTitle =
      String(
        jobData.title ||
          "Job"
      )
        .replace(
          /[<>:"/\\|?*\x00-\x1F]/g,
          ""
        )
        .trim()
        .replace(
          /\s+/g,
          "_"
        )
        .slice(0, 80);

    const filename =
      `${safeTitle || "Job"}_Jobnique.pdf`;

    // ========================================================
    // RESPONSE
    // ========================================================

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    // ========================================================
    // PDF
    // ========================================================

    const doc =
      new PDFDocument({
        size: "A4",

        margin: 0,

        info: {
          Title:
            `${jobData.title || "Job"} - Jobnique`,

          Author:
            companyName,

          Subject:
            "Professional Job Description",

          Creator:
            "Jobnique",
        },
      });

    doc.on(
      "error",
      next
    );

    doc.pipe(res);

    // ========================================================
    // PAGE SIZE
    // ========================================================

    const pageWidth =
      doc.page.width;

    const pageHeight =
      doc.page.height;

    const left = 38;

    const right =
      pageWidth - 38;

    const contentWidth =
      right - left;

    // ========================================================
    // COLORS
    // ========================================================

    const COLORS = {
      primary: "#2563EB",
      primaryDark: "#1D4ED8",
      navy: "#0F172A",
      text: "#334155",
      muted: "#64748B",
      lightText: "#94A3B8",
      border: "#DCE4EF",
      background: "#F8FAFC",
      blueLight: "#EFF6FF",
      white: "#FFFFFF",
    };

    // ========================================================
    // LOGO
    // ========================================================

    const logoPath =
      path.join(
        __dirname,
        "../assets/jobnique-logo-horizontal-transparent.png"
      );

    // ========================================================
    // HELPER: FIT TEXT
    // ========================================================

    const fitText = ({
      text,
      x,
      y,
      width,
      maxHeight,
      font = "Helvetica",
      fontSize = 9,
      minFontSize = 6.5,
      color = COLORS.text,
      align = "left",
      lineGap = 1.5,
    }) => {

      let value =
        cleanText(text) ||
        "Not specified.";

      let size =
        fontSize;

      doc.font(font);

      // Reduce font until it fits
      while (
        size > minFontSize &&
        doc.heightOfString(
          value,
          {
            width,
            fontSize: size,
            lineGap,
          }
        ) > maxHeight
      ) {
        size -= 0.5;
      }

      // If still too large, trim text
      if (
        doc.heightOfString(
          value,
          {
            width,
            fontSize: size,
            lineGap,
          }
        ) > maxHeight
      ) {
        let words =
          value.split(/\s+/);

        while (
          words.length > 5
        ) {
          const shortened =
            words
              .slice(
                0,
                -1
              )
              .join(" ") +
            "...";

          if (
            doc.heightOfString(
              shortened,
              {
                width,
                fontSize:
                  size,
                lineGap,
              }
            ) <=
            maxHeight
          ) {
            value =
              shortened;
            break;
          }

          words.pop();
        }
      }

      doc
        .font(font)
        .fontSize(size)
        .fillColor(color)
        .text(
          value,
          x,
          y,
          {
            width,
            height:
              maxHeight,
            lineGap,
            align,
          }
        );

      return size;
    };

    // ========================================================
    // HEADER
    // ========================================================

    // Top line
    doc
      .strokeColor(
        COLORS.navy
      )
      .lineWidth(1)
      .moveTo(
        0,
        1
      )
      .lineTo(
        pageWidth,
        1
      )
      .stroke();

    // Logo
    if (
      fs.existsSync(
        logoPath
      )
    ) {
      doc.image(
        logoPath,
        left,
        20,
        {
          width: 145,
        }
      );
    } else {
      doc
        .font(
          "Helvetica-Bold"
        )
        .fontSize(20)
        .fillColor(
          COLORS.primary
        )
        .text(
          "Jobnique",
          left,
          34
        );
    }

    // Header right text
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(
        COLORS.muted
      )
      .text(
        "PROFESSIONAL JOB DESCRIPTION",
        right - 180,
        35,
        {
          width: 180,
          align: "right",
        }
      );

    // Header divider
    doc
      .strokeColor(
        COLORS.border
      )
      .lineWidth(0.8)
      .moveTo(
        left,
        88
      )
      .lineTo(
        right,
        88
      )
      .stroke();

    // ========================================================
    // JOB TITLE
    // ========================================================

    fitText({
      text:
        jobData.title ||
        "Job Opportunity",

      x: left,
      y: 101,

      width:
        contentWidth,

      maxHeight: 32,

      font:
        "Helvetica-Bold",

      fontSize: 23,

      minFontSize: 17,

      color:
        COLORS.navy,

      align:
        "center",

      lineGap: 1,
    });

    // ========================================================
    // COMPANY
    // ========================================================

    fitText({
      text:
        companyName,

      x: left,
      y: 135,

      width:
        contentWidth,

      maxHeight: 18,

      font:
        "Helvetica-Bold",

      fontSize: 11,

      minFontSize: 8,

      color:
        COLORS.primary,

      align:
        "center",
    });

    if (
      employer.designation
    ) {
      fitText({
        text:
          employer.designation,

        x: left,
        y: 153,

        width:
          contentWidth,

        maxHeight: 15,

        font:
          "Helvetica",

        fontSize: 8,

        minFontSize: 7,

        color:
          COLORS.muted,

        align:
          "center",
      });
    }

    // ========================================================
    // INFORMATION CARDS
    // ========================================================

    const cardsY =
      178;

    const gap = 8;

    const cardWidth =
      (contentWidth -
        gap * 2) /
      3;

    const cardHeight =
      51;

    const drawCard = (
      x,
      y,
      label,
      value
    ) => {

      doc
        .roundedRect(
          x,
          y,
          cardWidth,
          cardHeight,
          7
        )
        .fillAndStroke(
          COLORS.background,
          COLORS.border
        );

      doc
        .font("Helvetica")
        .fontSize(7)
        .fillColor(
          COLORS.muted
        )
        .text(
          label.toUpperCase(),
          x + 10,
          y + 9,
          {
            width:
              cardWidth - 20,
          }
        );

      fitText({
        text:
          value,

        x:
          x + 10,

        y:
          y + 25,

        width:
          cardWidth - 20,

        maxHeight:
          20,

        font:
          "Helvetica-Bold",

        fontSize:
          9,

        minFontSize:
          7,

        color:
          COLORS.navy,

        lineGap:
          1,
      });
    };

    drawCard(
      left,
      cardsY,
      "Category",
      jobData.category ||
        "Not specified"
    );

    drawCard(
      left +
        cardWidth +
        gap,
      cardsY,
      "Employment",
      jobData.employmentType ||
        "Not specified"
    );

    drawCard(
      left +
        (cardWidth +
          gap) *
          2,
      cardsY,
      "Work Mode",
      jobData.workMode ||
        "Not specified"
    );

    drawCard(
      left,
      cardsY + 59,
      "Location",
      jobLocation
    );

    drawCard(
      left +
        cardWidth +
        gap,
      cardsY + 59,
      "Salary",
      salary
    );

    drawCard(
      left +
        (cardWidth +
          gap) *
          2,
      cardsY + 59,
      "Experience",
      jobData.experienceLevel
        ? jobData.experienceLevel
        : experience
    );

    // ========================================================
    // DATE BOX
    // ========================================================

    const dateY =
      297;

    doc
      .roundedRect(
        left,
        dateY,
        contentWidth,
        50,
        7
      )
      .fill(
        COLORS.blueLight
      );

    // Deadline
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(
        COLORS.primary
      )
      .text(
        "APPLICATION DEADLINE",
        left + 14,
        dateY + 10
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(
        COLORS.navy
      )
      .text(
        formatDate(
          jobData.applicationDeadline
        ),
        left + 14,
        dateY + 26
      );

    // Expected start
    const half =
      contentWidth / 2;

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(
        COLORS.primary
      )
      .text(
        "EXPECTED START",
        left +
          half +
          14,
        dateY + 10
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor(
        COLORS.navy
      )
      .text(
        formatDate(
          jobData.expectedStartDate
        ),
        left +
          half +
          14,
        dateY + 26
      );

    // ========================================================
    // TWO COLUMN CONTENT
    // ========================================================

    const columnGap =
      24;

    const columnWidth =
      (contentWidth -
        columnGap) /
      2;

    const leftColumnX =
      left;

    const rightColumnX =
      left +
      columnWidth +
      columnGap;

    const contentTop =
      362;

    // ========================================================
    // SECTION DRAWER
    // ========================================================

    const drawSection = ({
      x,
      y,
      width,
      title,
      text,
      height,
      bullets = false,
    }) => {

      // Section title
      doc
        .font(
          "Helvetica-Bold"
        )
        .fontSize(10.5)
        .fillColor(
          COLORS.navy
        )
        .text(
          title.toUpperCase(),
          x,
          y,
          {
            width,
          }
        );

      // Blue underline
      doc
        .strokeColor(
          COLORS.primary
        )
        .lineWidth(1.2)
        .moveTo(
          x,
          y + 18
        )
        .lineTo(
          x + 52,
          y + 18
        )
        .stroke();

      const bodyY =
        y + 24;

      if (
        bullets
      ) {

        const raw =
          cleanText(text);

        const items =
          raw
            .split(/\r?\n/)
            .map(
              (item) =>
                item
                  .replace(
                    /^[\s•●▪*-]+/,
                    ""
                  )
                  .trim()
            )
            .filter(Boolean);

        if (
          items.length === 0
        ) {
          fitText({
            text:
              "Not specified.",

            x,
            y: bodyY,

            width,

            maxHeight:
              height,

            font:
              "Helvetica",

            fontSize:
              8.2,

            minFontSize:
              6.5,

            color:
              COLORS.text,
          });
        } else {

          // Make a compact bullet string
          const bulletText =
            items
              .map(
                (item) =>
                  `• ${item}`
              )
              .join("\n");

          fitText({
            text:
              bulletText,

            x,
            y: bodyY,

            width,

            maxHeight:
              height,

            font:
              "Helvetica",

            fontSize:
              8,

            minFontSize:
              6.3,

            color:
              COLORS.text,

            lineGap:
              2,
          });
        }

      } else {

        fitText({
          text,

          x,
          y: bodyY,

          width,

          maxHeight:
            height,

          font:
            "Helvetica",

          fontSize:
            8.3,

          minFontSize:
            6.5,

          color:
            COLORS.text,

          lineGap:
            2,
        });
      }
    };

    // ========================================================
    // LEFT COLUMN
    // ========================================================

    drawSection({
      x:
        leftColumnX,

      y:
        contentTop,

      width:
        columnWidth,

      title:
        "Job Summary",

      text:
        jobData.jobSummary,

      height:
        43,
    });

    drawSection({
      x:
        leftColumnX,

      y:
        contentTop + 76,

      width:
        columnWidth,

      title:
        "Key Responsibilities",

      text:
        jobData.responsibilities,

      height:
        65,

      bullets:
        true,
    });

    drawSection({
      x:
        leftColumnX,

      y:
        contentTop + 168,

      width:
        columnWidth,

      title:
        "Education",

      text:
        jobData.education,

      height:
        30,
    });

    // ========================================================
    // SKILLS
    // ========================================================

    const skillsTitleY =
      contentTop + 225;

    doc
      .font(
        "Helvetica-Bold"
      )
      .fontSize(10.5)
      .fillColor(
        COLORS.navy
      )
      .text(
        "REQUIRED SKILLS",
        leftColumnX,
        skillsTitleY
      );

    doc
      .strokeColor(
        COLORS.primary
      )
      .lineWidth(1.2)
      .moveTo(
        leftColumnX,
        skillsTitleY + 18
      )
      .lineTo(
        leftColumnX + 52,
        skillsTitleY + 18
      )
      .stroke();

    let skillX =
      leftColumnX;

    let skillY =
      skillsTitleY + 28;

    const pillHeight =
      22;

    const maxSkillY =
      skillsTitleY + 78;

    const visibleSkills =
      skills.slice(
        0,
        8
      );

    visibleSkills.forEach(
      (skill) => {

        const text =
          cleanText(skill);

        if (!text) {
          return;
        }

        doc
          .font(
            "Helvetica-Bold"
          )
          .fontSize(7.5);

        const textWidth =
          doc.widthOfString(
            text
          );

        let pillWidth =
          textWidth + 20;

        // Keep pill inside column
        if (
          pillWidth >
          columnWidth
        ) {
          pillWidth =
            columnWidth;
        }

        if (
          skillX +
            pillWidth >
          leftColumnX +
            columnWidth
        ) {
          skillX =
            leftColumnX;

          skillY +=
            28;
        }

        if (
          skillY +
            pillHeight >
          maxSkillY
        ) {
          return;
        }

        doc
          .roundedRect(
            skillX,
            skillY,
            pillWidth,
            pillHeight,
            10
          )
          .fill(
            COLORS.blueLight
          );

        fitText({
          text,

          x:
            skillX + 10,

          y:
            skillY + 6,

          width:
            pillWidth - 20,

          maxHeight:
            12,

          font:
            "Helvetica-Bold",

          fontSize:
            7.5,

          minFontSize:
            6.5,

          color:
            COLORS.primary,
        });

        skillX +=
          pillWidth + 6;
      }
    );

    // ========================================================
    // RIGHT COLUMN
    // ========================================================

    drawSection({
      x:
        rightColumnX,

      y:
        contentTop,

      width:
        columnWidth,

      title:
        "About the Role",

      text:
        jobData.description,

      height:
        43,
    });

    drawSection({
      x:
        rightColumnX,

      y:
        contentTop + 76,

      width:
        columnWidth,

      title:
        "Required Qualifications",

      text:
        jobData.requirements,

      height:
        65,

      bullets:
        true,
    });

    drawSection({
      x:
        rightColumnX,

      y:
        contentTop + 168,

      width:
        columnWidth,

      title:
        "Preferred Qualifications",

      text:
        jobData.preferredQualifications ||
        "Not specified.",

      height:
        48,

      bullets:
        true,
    });

    drawSection({
      x:
        rightColumnX,

      y:
        contentTop + 237,

      width:
        columnWidth,

      title:
        "Application Instructions",

      text:
        jobData.applicationInstructions ||
        "Submit your application through the Jobnique platform.",

      height:
        45,
    });

    // ========================================================
    // APPLY BOX
    // ========================================================

    const applyY =
      685;

    const applyHeight =
      72;

    doc
      .roundedRect(
        left,
        applyY,
        contentWidth,
        applyHeight,
        8
      )
      .fill(
        COLORS.navy
      );

    // Small logo inside apply box
    if (
      fs.existsSync(
        logoPath
      )
    ) {
      doc.image(
        logoPath,
        left + 14,
        applyY + 17,
        {
          width: 105,
        }
      );
    }

    // Apply title
    doc
      .font(
        "Helvetica-Bold"
      )
      .fontSize(11)
      .fillColor(
        COLORS.white
      )
      .text(
        "APPLY THROUGH JOBNIQUE",
        left + 145,
        applyY + 14,
        {
          width:
            contentWidth - 160,
        }
      );

    // Apply description
    doc
      .font(
        "Helvetica"
      )
      .fontSize(7.8)
      .fillColor(
        "#CBD5E1"
      )
      .text(
        "Connect with employers and apply for opportunities through the Jobnique platform.",
        left + 145,
        applyY + 33,
        {
          width:
            contentWidth - 160,
          height: 18,
        }
      );

    // Apply bottom text
    doc
      .font(
        "Helvetica-Bold"
      )
      .fontSize(7)
      .fillColor(
        "#60A5FA"
      )
      .text(
        "JOBNIQUE • CONNECTING TALENT WITH OPPORTUNITY",
        left + 145,
        applyY + 52,
        {
          width:
            contentWidth - 160,
        }
      );

    // ========================================================
    // FOOTER
    // ========================================================

    doc
      .strokeColor(
        COLORS.border
      )
      .lineWidth(0.7)
      .moveTo(
        left,
        775
      )
      .lineTo(
        right,
        775
      )
      .stroke();

    doc
      .font(
        "Helvetica"
      )
      .fontSize(6.5)
      .fillColor(
        COLORS.lightText
      )
      .text(
        "This job description was generated from information published by the employer on Jobnique.",
        left,
        783,
        {
          width:
            contentWidth,
        }
      );

    doc
      .font(
        "Helvetica"
      )
      .fontSize(6.5)
      .fillColor(
        COLORS.lightText
      )
      .text(
        `Generated on ${new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        )}`,
        left,
        797,
        {
          width:
            contentWidth,
          align:
            "right",
        }
      );

    // ========================================================
    // IMPORTANT:
    // NO doc.addPage() HERE
    // This PDF is intentionally one-page.
    // ========================================================

    doc.end();

  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE JOB
// ============================================================

exports.updateJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await Job.findByPk(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      String(job.postedBy) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to update this job",
      });
    }

    const updatePayload = {
      ...req.body,
    };

    if (
      req.body.status ===
        "Inactive" ||
      req.body.isOpen === false
    ) {
      updatePayload.status =
        "Inactive";

      updatePayload.isOpen =
        false;

      updatePayload.expired =
        true;

    } else if (
      req.body.status ===
        "Active" ||
      req.body.isOpen === true
    ) {
      updatePayload.status =
        "Active";

      updatePayload.isOpen =
        true;

      updatePayload.expired =
        false;
    }

    await job.update(
      updatePayload
    );

    res.status(200).json({
      success: true,
      message:
        "Job updated successfully",
      job,
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE JOB
// ============================================================

exports.deleteJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await Job.findByPk(
        req.params.id
      );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (
      String(job.postedBy) !==
      String(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Not authorized to delete this job",
      });
    }

    await job.destroy();

    res.status(200).json({
      success: true,
      message:
        "Job deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// TOGGLE SAVE / UNSAVE JOB
// ============================================================

exports.toggleSaveJob = async (
  req,
  res,
  next
) => {
  try {
    const user =
      await User.findByPk(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found",
      });
    }

    const targetJobId =
      String(
        req.params.id
      )
        .replace(
          /^["']|["']$/g,
          ""
        )
        .trim();

    if (!targetJobId) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid job ID",
      });
    }

    const existingIds =
      parseSavedJobIds(
        user.savedJobs
      );

    const isAlreadySaved =
      existingIds.some(
        (id) =>
          String(id) ===
          targetJobId
      );

    let updatedSavedIds = [];

    if (
      isAlreadySaved
    ) {
      updatedSavedIds =
        existingIds.filter(
          (id) =>
            String(id) !==
            targetJobId
        );
    } else {
      updatedSavedIds =
        Array.from(
          new Set([
            ...existingIds,
            targetJobId,
          ])
        );
    }

    const isJsonColumn =
      Array.isArray(
        user.savedJobs
      ) ||
      (
        typeof user.savedJobs ===
          "object" &&
        user.savedJobs !== null
      );

    const valueToSave =
      isJsonColumn
        ? updatedSavedIds
        : JSON.stringify(
            updatedSavedIds
          );

    await User.update(
      {
        savedJobs:
          valueToSave,
      },
      {
        where: {
          id:
            req.user.id,
        },
      }
    );

    const populatedSavedJobs =
      await getPopulatedSavedJobs(
        updatedSavedIds
      );

    return res.status(200).json({
      success: true,

      message:
        isAlreadySaved
          ? "Job removed from saved items"
          : "Job saved successfully",

      savedJobs:
        populatedSavedJobs,
    });

  } catch (error) {
    next(error);
  }
};