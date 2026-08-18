const express = require("express");
const router = express.Router();

const {
  postJob,
  getAllJobs,
  getSingleJob,
  getEmployerJobs,
  updateJob,
  deleteJob,
  toggleSaveJob,
  downloadJobPDF,
} = require("../controllers/jobController");

const { isAuthenticated } = require("../middlewares/auth");

// ==========================================
// Public Routes
// ==========================================
router.get("/", getAllJobs);
router.get("/getall", getAllJobs);

router.get("/single/:id", getSingleJob);
router.get("/getsingle/:id", getSingleJob);

// ==========================================
// Employer Routes
// ==========================================
router.get("/employer/my-jobs", isAuthenticated, getEmployerJobs);
router.get("/getmyjobs", isAuthenticated, getEmployerJobs);

router.post("/post", isAuthenticated, postJob);
router.post("/", isAuthenticated, postJob);

// ==========================================
// Save / Unsave Job Routes
// ==========================================
router.post("/save/:id", isAuthenticated, toggleSaveJob);
router.put("/save/:id", isAuthenticated, toggleSaveJob);
router.delete("/save/:id", isAuthenticated, toggleSaveJob);

router.post("/unsave/:id", isAuthenticated, toggleSaveJob);
router.delete("/unsave/:id", isAuthenticated, toggleSaveJob);

router.post("/toggle-save/:id", isAuthenticated, toggleSaveJob);

// ==========================================
// Update & Delete Routes
// ==========================================
// Status update endpoint for frontend toggle
router.put("/status/:id", isAuthenticated, updateJob);
router.put("/update/:id", isAuthenticated, updateJob);
router.put("/:id", isAuthenticated, updateJob);

router.delete("/delete/:id", isAuthenticated, deleteJob);
router.delete("/:id", isAuthenticated, deleteJob);

// ==========================================
// Job Description PDF
// Keep this BEFORE the dynamic /:id route.
// ==========================================
router.get("/:id/pdf", downloadJobPDF);

// ==========================================
// Dynamic Single Job Route (Keep LAST)
// ==========================================
router.get("/:id", getSingleJob);

module.exports = router;