"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("service_orders", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("service_orders", "customerId");
  },
};
