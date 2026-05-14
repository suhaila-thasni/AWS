"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    const table = await queryInterface.describeTable("ambulances");

    if (!table.otp) {
      await queryInterface.addColumn("ambulances", "otp", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.otpExpiry) {
      await queryInterface.addColumn("ambulances", "otpExpiry", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

  },

  async down(queryInterface) {

    const table = await queryInterface.describeTable("ambulances");

    if (table.otp) {
      await queryInterface.removeColumn("ambulances", "otp");
    }

    if (table.otpExpiry) {
      await queryInterface.removeColumn("ambulances", "otpExpiry");
    }

  },
};
