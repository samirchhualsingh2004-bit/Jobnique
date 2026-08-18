"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      googleId: { type: Sequelize.STRING, allowNull: true, unique: true },
      phone: { type: Sequelize.STRING, allowNull: true },
      role: {
        type: Sequelize.ENUM("Job Seeker", "Employer"),
        allowNull: false,
        defaultValue: "Job Seeker",
      },
      resumeUrl: { type: Sequelize.STRING, allowNull: true },
      resumePublicId: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
  },
};
