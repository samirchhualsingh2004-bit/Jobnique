const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const { sequelize, connectDB } = require("./config/database");
require("./models"); // registers associations

const path = require("path");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // <-- ADDED: Import notification routes

const errorHandler = require("./middlewares/errorHandler");

const app = express();

// ==========================================
// CORS
// ==========================================
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ==========================================
// Body Parsers
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
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

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
app.use("/api/v1/notifications", notificationRoutes); // <-- ADDED: Mount notification routes under /api/v1/notifications

// ==========================================
// Error Handler
// ==========================================
app.use(errorHandler);

// ==========================================
// Server
// ==========================================
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // --------------------------------------
    // Connect to Database
    // --------------------------------------
    await connectDB();

    console.log("Database connection established.");

    // --------------------------------------
    // Synchronize Database
    // --------------------------------------
    if (process.env.NODE_ENV !== "production") {
      try {
        await sequelize.sync({ alter: true });

        console.log(
          "Database synchronized & updated schema successfully."
        );
      } catch (syncError) {
        console.error("Database schema synchronization failed.");
        console.error(syncError);

        process.exit(1);
      }
    }

    // --------------------------------------
    // Start Express Server
    // --------------------------------------
    app.listen(PORT, () => {
      console.log(`Jobnique server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed.");
    console.error(error);

    process.exit(1);
  }
};

startServer();