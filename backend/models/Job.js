const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Job = sequelize.define(
  "Job",
  {
    // ==========================================
    // Primary Key
    // ==========================================
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ==========================================
    // Basic Job Information
    // ==========================================
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    jobSummary: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    requirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    preferredQualifications: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ==========================================
    // Employment Information
    // ==========================================
    employmentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    workMode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ==========================================
    // Location
    // ==========================================
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ==========================================
    // Salary Information
    // ==========================================
    salaryCurrency: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "INR",
    },

    salaryPeriod: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Per Year",
    },

    fixedSalary: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    salaryFrom: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    salaryTo: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    // ==========================================
    // Experience
    // ==========================================
    experienceLevel: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    minExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    maxExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },

    // ==========================================
    // Education
    // ==========================================
    education: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ==========================================
    // Hiring Information
    // ==========================================
    numberOfOpenings: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },

    applicationDeadline: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    expectedStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    applicationInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ==========================================
    // Job Status
    // ==========================================
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Active",
    },

    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },

    expired: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },

    // ==========================================
    // Employer
    // ==========================================
    postedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

module.exports = Job;