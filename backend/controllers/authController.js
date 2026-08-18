const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const pdfParse = require("pdf-parse");
const { OAuth2Client } = require("google-auth-library");
const { User, Job } = require("../models");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/sendEmail");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getPopulatedSavedJobs = async (userSavedJobs) => {
  let savedJobIds = userSavedJobs || [];

  if (typeof savedJobIds === "string") {
    try {
      savedJobIds = JSON.parse(savedJobIds);
    } catch (e) {
      savedJobIds = savedJobIds.split(",");
    }
  }

  if (!Array.isArray(savedJobIds) || savedJobIds.length === 0) {
    return [];
  }

  const cleanIds = savedJobIds
    .map((item) => {
      let strId = typeof item === "object" && item !== null ? item.id || item._id : item;
      return String(strId).replace(/^["']|["']$/g, "").trim();
    })
    .filter(Boolean);

  if (cleanIds.length === 0) return [];

  return await Job.findAll({
    where: { id: cleanIds },
    include: [{ model: User, as: "employer", attributes: ["name", "email"] }],
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, companyName, designation } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Please fill all required fields" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      companyName: companyName || null,
      designation: designation || null,
    });

    await sendToken(user, 201, res, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Please provide email, password, and role" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.role.toLowerCase() !== role.toLowerCase()) {
      return res.status(401).json({ success: false, message: `No ${role} account found with this email` });
    }

    await sendToken(user, 200, res, "Login successful");
  } catch (error) {
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { token, role } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Google token is missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    if (!email) {
      return res.status(400).json({ success: false, message: "Google authentication failed: No email returned" });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: crypto.randomBytes(32).toString("hex"),
        role: role || "Job Seeker",
      });
    } else {
      if (role && user.role.toLowerCase() !== role.toLowerCase()) {
        user.role = role;
        await user.save();
      }
    }

    await sendToken(user, 200, res, "Google authentication successful");
  } catch (error) {
    console.error("Google Auth Error:", error.message);
    return res.status(400).json({ success: false, message: "Google token verification failed" });
  }
};

exports.logout = async (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("token", "", { expires: new Date(Date.now()), httpOnly: true })
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please enter your email address" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account registered with this email address" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Jobnique - Password Reset Request",
        resetUrl: resetUrl,
        message: `You requested a password reset for your Jobnique account. Please visit this URL to complete the reset: ${resetUrl}`,
      });

      res.status(200).json({
        success: true,
        message: `Password reset link has been generated and sent to ${user.email}`,
      });
    } catch (err) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();

      console.error("Email Sending Error:", err);
      return res.status(500).json({ success: false, message: "Email could not be sent. Please try again later." });
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a new password" });
    }

    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ where: { resetPasswordToken } });

    if (!user || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Password reset token is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    await sendToken(user, 200, res, "Password reset successful! You are now logged in.");
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = user.toJSON();
    userData.savedJobs = await getPopulatedSavedJobs(user.savedJobs);

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, companyName, designation } = req.body;

    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (companyName !== undefined) req.user.companyName = companyName;
    if (designation !== undefined) req.user.designation = designation;

    await req.user.save();

    const userData = req.user.toJSON();
    userData.savedJobs = await getPopulatedSavedJobs(req.user.savedJobs);

    res.status(200).json({ success: true, message: "Profile updated successfully", user: userData });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ success: false, message: "Please attach a resume file" });
    }

    const file = req.files.resume;
    const allowedExt = [".pdf", ".txt"];
    const ext = path.extname(file.name).toLowerCase();

    if (!allowedExt.includes(ext)) {
      return res.status(400).json({ success: false, message: "Only PDF or TXT resumes are supported" });
    }

    const uploadsDir = path.join(__dirname, "..", "uploads", "resumes");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${req.user.id}-${Date.now()}${ext}`;
    const destPath = path.join(uploadsDir, fileName);

    await file.mv(destPath);

    let resumeText = "";
    try {
      if (ext === ".pdf") {
        const dataBuffer = fs.readFileSync(destPath);
        const parsed = await pdfParse(dataBuffer);
        resumeText = parsed.text;
      } else {
        resumeText = fs.readFileSync(destPath, "utf-8");
      }
    } catch (parseErr) {
      console.error("Resume text extraction failed:", parseErr.message);
    }

    req.user.resumeUrl = `/uploads/resumes/${fileName}`;
    req.user.resumeText = resumeText.slice(0, 20000);
    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: req.user.resumeUrl,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.resumeUrl) {
      return res.status(404).json({ success: false, message: "No active resume found to delete" });
    }

    if (user.resumeUrl.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "..", user.resumeUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error("Failed to delete local resume file:", fileErr.message);
        }
      }
    }

    user.resumeUrl = null;
    user.resumePublicId = null;
    user.resumeText = null;

    await user.save();

    res.status(200).json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = user.toJSON();
    userData.savedJobs = await getPopulatedSavedJobs(user.savedJobs);

    res.status(200).json({ success: true, user: userData });
  } catch (error) {
    next(error);
  }
};