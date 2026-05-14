"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    const table = await queryInterface.describeTable("ambulances");

    if (!table.userId) {
      await queryInterface.addColumn("ambulances", "userId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

  },

  async down(queryInterface) {

    const table = await queryInterface.describeTable("ambulances");

    if (table.userId) {
      await queryInterface.removeColumn("ambulances", "userId");
    }

  },
};
