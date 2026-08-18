const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "jobs", key: "id" },
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Applied",
      allowNull: false,
    },
    // Added Interview Fields
    interviewDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interviewTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interviewType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    meetLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
  }
);

module.exports = Application;