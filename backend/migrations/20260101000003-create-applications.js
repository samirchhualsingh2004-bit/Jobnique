"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("applications", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      jobId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "jobs", key: "id" },
        onDelete: "CASCADE",
      },
      applicantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      resumeUrl: { type: Sequelize.STRING, allowNull: true },
      coverLetter: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM("Pending", "Reviewed", "Accepted", "Rejected"),
        defaultValue: "Pending",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("applications");
  },
};
