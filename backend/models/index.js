const { sequelize, DataTypes } = require("../config/database");

// 1. Import Model Definitions
const RawUser = require("./User");
const RawJob = require("./Job");
const RawApplication = require("./Application");

// 2. Initialize Models safely (handles both factory functions and direct class exports)
const User = typeof RawUser === "function" && !RawUser.prototype?.sequelize 
  ? RawUser(sequelize, DataTypes) 
  : RawUser;

const Job = typeof RawJob === "function" && !RawJob.prototype?.sequelize 
  ? RawJob(sequelize, DataTypes) 
  : RawJob;

const Application = typeof RawApplication === "function" && !RawApplication.prototype?.sequelize 
  ? RawApplication(sequelize, DataTypes) 
  : RawApplication;

// 3. Define Associations
User.hasMany(Job, { foreignKey: "postedBy", as: "jobs" });
Job.belongsTo(User, { foreignKey: "postedBy", as: "employer" });

User.hasMany(Application, { foreignKey: "applicantId", as: "applications" });
Application.belongsTo(User, { foreignKey: "applicantId", as: "applicant" });

Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

module.exports = { sequelize, User, Job, Application };