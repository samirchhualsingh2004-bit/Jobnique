"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("jobs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.STRING, allowNull: false },
      country: { type: Sequelize.STRING, allowNull: false },
      city: { type: Sequelize.STRING, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: true },
      fixedSalary: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      salaryFrom: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      salaryTo: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      expired: { type: Sequelize.BOOLEAN, defaultValue: false },
      postedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("jobs");
  },
};
