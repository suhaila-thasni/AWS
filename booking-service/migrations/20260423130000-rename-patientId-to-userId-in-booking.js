"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("bookings");

    if (tableInfo.patientId && !tableInfo.userId) {
      await queryInterface.renameColumn("bookings", "patientId", "userId");
    } else if (!tableInfo.userId) {
      // If patientId doesn't exist either, create userId from scratch
      await queryInterface.addColumn("bookings", "userId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("bookings", "userId", "patientId");
  },
};
