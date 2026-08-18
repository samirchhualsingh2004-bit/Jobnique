const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("Job Seeker", "Employer"),
      allowNull: false,
      defaultValue: "Job Seeker",
    },
    resumeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resumePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resumeText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    savedJobs: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("savedJobs");
        if (!rawValue) return [];
        if (Array.isArray(rawValue)) return rawValue;
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return rawValue.split(",").map((s) => s.trim());
        }
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue("savedJobs", JSON.stringify(value));
        } else if (typeof value === "string") {
          this.setDataValue("savedJobs", value);
        } else {
          this.setDataValue("savedJobs", "[]");
        }
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    // Safely manages unique constraints without causing duplicate key limit crashes on restart
    indexes: [
      {
        unique: true,
        fields: ["email"],
      },
      {
        unique: true,
        fields: ["googleId"],
      },
    ],
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password") && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getJWTToken = function () {
  return jwt.sign({ id: this.id, role: this.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = User;