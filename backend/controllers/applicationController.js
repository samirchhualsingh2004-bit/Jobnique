const fs = require("fs");
const path = require("path");

// ✅ Import models from the central file where associations are defined
const { Application, Job, User } = require("../models");
const Notification = require("../models/notification");

// ==========================================
// Apply to a Job (Job Seekers only)
// ==========================================
exports.applyToJob = async (req, res, next) => {
  try {
    const userRole = req.user.role ? req.user.role.toLowerCase().replace(/\s+/g, "") : "";

    if (userRole === "employer") {
      return res.status(403).json({
        success: false,
        message: "Employers are not allowed to apply for jobs",
      });
    }

    const { jobId } = req.params;
    const { coverLetter } = req.body;

    let resumeUrl = req.body.resumeUrl || null;

    if (req.files && req.files.resume) {
      const file = req.files.resume;

      const isPdf =
        file.mimetype === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        return res.status(400).json({
          success: false,
          message: "Please upload a valid PDF document (.pdf)",
        });
      }

      const uploadDir = path.join(__dirname, "../uploads/resumes");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      const savePath = path.join(uploadDir, uniqueFileName);

      await file.mv(savePath);
      resumeUrl = `/uploads/resumes/${uniqueFileName}`;
    }

    if (!resumeUrl && req.user.resumeUrl) {
      resumeUrl = req.user.resumeUrl;
    }

    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume or attach one to your profile before applying.",
      });
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const existing = await Application.findOne({
      where: { jobId, applicantId: req.user.id },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied to this job",
      });
    }

    const application = await Application.create({
      jobId,
      applicantId: req.user.id,
      resumeUrl,
      coverLetter: coverLetter || "",
      status: "Applied",
    });

    // ==========================================
    // NOTIFICATION: Notify the Employer
    // ==========================================
    const employerId =
      job.postedBy || job.employerId || job.userId || job.createdBy || job.employer || job.ownerId;

    if (employerId) {
      try {
        await Notification.create({
          userId: employerId,
          title: "New Job Application",
          message: `${req.user.name} applied for your posted position: "${job.title || "Job"}"`,
          type: "JOB_APPLICATION",
        });
      } catch (notifErr) {
        console.error("Notification creation failed:", notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Get Logged-in User's Applications
// ==========================================
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { applicantId: req.user.id },
      include: [{ model: Job, as: "job" }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error in getMyApplications:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch applications",
    });
  }
};

// ==========================================
// Get All Applications for a Specific Job
// ==========================================
exports.getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const jobOwnerId = job.postedBy || job.employerId || job.userId;
    if (String(jobOwnerId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view applications for this job",
      });
    }

    const applications = await Application.findAll({
      where: { jobId },
      include: [
        {
          model: User,
          as: "applicant",
          attributes: ["id", "name", "email", "phone", "resumeUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// Update Application Status (Accept / Reject / Interview / Hire)
// ==========================================
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, interviewDetails, date, time, type, meetLink } = req.body;
    const appId = req.params.id || req.params.applicationId;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status parameter is required",
      });
    }

    const statusMap = {
      pending: "Pending",
      applied: "Applied",
      screened: "Interviewing",
      interviewing: "Interviewing",
      "interview invited": "Interviewing",
      accepted: "Accepted",
      hired: "Hired",
      rejected: "Rejected",
    };

    const normalizedKey = String(status).trim().toLowerCase();
    const mappedStatus = statusMap[normalizedKey] || "Pending";

    let application = null;
    try {
      application = await Application.findByPk(appId, {
        include: [{ model: Job, as: "job" }],
      });
    } catch (err) {
      application = await Application.findByPk(appId);
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    let jobData = application.job;
    if (!jobData && application.jobId) {
      jobData = await Job.findByPk(application.jobId);
    }

    const jobOwnerId = jobData?.postedBy || jobData?.employerId || jobData?.userId;

    if (jobOwnerId && String(jobOwnerId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this application",
      });
    }

    application.status = mappedStatus;

    const modelAttributes = Object.keys(Application.rawAttributes || {});

    if (mappedStatus === "Interviewing") {
      if (modelAttributes.includes("interviewDate")) {
        application.interviewDate = date || interviewDetails?.date || null;
      }
      if (modelAttributes.includes("interviewTime")) {
        application.interviewTime = time || interviewDetails?.time || null;
      }
      if (modelAttributes.includes("interviewType")) {
        application.interviewType = type || interviewDetails?.type || null;
      }
      if (modelAttributes.includes("meetLink")) {
        application.meetLink = meetLink || interviewDetails?.meetLink || null;
      }
    }

    await application.save();

    // ==========================================
    // NOTIFICATION: Notify the Job Seeker
    // ==========================================
    if (application.applicantId) {
      const jobTitle = jobData?.title || "position";
      let notifTitle = "Application Status Update";
      let notifMessage = `Your application status for "${jobTitle}" has been updated to: ${mappedStatus}`;

      if (mappedStatus === "Interviewing") {
        notifTitle = "Interview Invitation Received!";
        notifMessage = `You have received an interview call for "${jobTitle}". Check your application details for schedule info.`;
      } else if (mappedStatus === "Hired" || mappedStatus === "Accepted") {
        notifTitle = "Congratulations! Offer Received 🎉";
        notifMessage = `You have been accepted/hired for the position: "${jobTitle}"!`;
      }

      try {
        await Notification.create({
          userId: application.applicantId,
          title: notifTitle,
          message: notifMessage,
          type: mappedStatus === "Interviewing" ? "INTERVIEW_CALL" : "APPLICATION_STATUS",
        });
      } catch (notifErr) {
        console.error("Notification creation failed:", notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${mappedStatus}`,
      application,
    });
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update application status",
    });
  }
};