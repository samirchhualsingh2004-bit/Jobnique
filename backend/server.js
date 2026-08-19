const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
require("dotenv").config();

const { sequelize, connectDB } = require("./config/database");
require("./models"); // Registers associations

// Route Imports
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ==========================================
// CORS Configuration
// ==========================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://jobnique-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ==========================================
// Body Parsers & Middleware
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==========================================
// File Upload
// ==========================================
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ==========================================
// Static Files
// ==========================================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// Health Check
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Jobnique API is running",
  });
});

// ==========================================
// API Routes
// ==========================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/notifications", notificationRoutes);

// ==========================================
// Global Error Handler
// ==========================================
app.use(errorHandler);

// ==========================================
// Server Initialization
// ==========================================
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();
    console.log("Database connection established.");

    // 2. Synchronize Schema with TiDB Cloud
    try {
      await sequelize.sync({ alter: true });
      console.log("Database synchronized & updated schema successfully.");
    } catch (syncError) {
      console.error("Database schema synchronization failed:", syncError);
    }

    // 3. Start Listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Jobnique server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();