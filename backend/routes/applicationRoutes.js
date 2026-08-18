const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");

const router = express.Router();

// Job Seeker Routes
router.post("/:jobId/apply", isAuthenticated, authorizeRoles("Job Seeker"), applyToJob);
router.post("/apply/:jobId", isAuthenticated, authorizeRoles("Job Seeker"), applyToJob);
router.get("/my-applications", isAuthenticated, authorizeRoles("Job Seeker"), getMyApplications);

// Employer Routes
router.get("/job/:jobId", isAuthenticated, authorizeRoles("Employer"), getJobApplications);

// Supports both URL formats (/status/:id and /:id/status) used across frontend components
router.put("/status/:id", isAuthenticated, authorizeRoles("Employer"), updateApplicationStatus);
router.put("/:id/status", isAuthenticated, authorizeRoles("Employer"), updateApplicationStatus);

module.exports = router;