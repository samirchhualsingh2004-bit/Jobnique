const express = require("express");
const router = express.Router();

const {
  getUserNotifications,
  markAsRead,
  clearNotifications, // 1. Import clearNotifications
} = require("../controllers/notificationController");

const { isAuthenticated } = require("../middlewares/auth");

router.get("/", isAuthenticated, getUserNotifications);
router.put("/:id/read", isAuthenticated, markAsRead);
router.delete("/", isAuthenticated, clearNotifications); // 2. Add the DELETE route

module.exports = router;