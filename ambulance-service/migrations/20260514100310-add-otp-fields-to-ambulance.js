'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("ambulances");

    if (!table.otp) {
      await queryInterface.addColumn("ambulances", "otp", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("ambulances");

    if (table.otp) {
      await queryInterface.removeColumn("ambulances", "otp");
    }
  },
};
