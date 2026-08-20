const express = require("express");
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  uploadResume,
  deleteResume,
  forgotPassword,
  resetPassword,
  googleLogin, // 👈 Added Google login controller
} = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

// Public Authentication Routes
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin); // 👈 Added route for Google authentication
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected Routes (Require Authentication)
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getCurrentUser);
router.put("/profile", isAuthenticated, updateProfile);
router.post("/upload-resume", isAuthenticated, uploadResume);
router.delete("/delete-resume", isAuthenticated, deleteResume);

module.exports = router;
