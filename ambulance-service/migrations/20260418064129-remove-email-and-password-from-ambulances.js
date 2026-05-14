"use strict";

module.exports = {
  async up(queryInterface) {

    const table = await queryInterface.describeTable("ambulances");

    if (table.email) {
      await queryInterface.removeColumn("ambulances", "email");
    }

    if (table.password) {
      await queryInterface.removeColumn("ambulances", "password");
    }

  },

  async down(queryInterface, Sequelize) {

    const table = await queryInterface.describeTable("ambulances");

    if (!table.email) {
      await queryInterface.addColumn("ambulances", "email", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.password) {
      await queryInterface.addColumn("ambulances", "password", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

  },
};
