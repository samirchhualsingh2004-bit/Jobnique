const { Job, User } = require("../models");

// Helper function to safely parse and populate saved jobs
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

const sendToken = async (user, statusCode, res, message) => {
  const token = user.getJWTToken();

  const options = {
    expires: new Date(
      Date.now() + (Number(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  // Populate saved jobs array before sending to frontend
  const populatedSavedJobs = await getPopulatedSavedJobs(user.savedJobs);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    companyName: user.companyName,
    designation: user.designation,
    resumeUrl: user.resumeUrl,
    resumeText: user.resumeText,
    savedJobs: populatedSavedJobs,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user: safeUser,
    token,
  });
};

module.exports = sendToken;