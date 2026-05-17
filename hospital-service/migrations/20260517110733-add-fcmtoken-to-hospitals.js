"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("hospitals");

    if (!table.fcmToken) {
      await queryInterface.addColumn("hospitals", "fcmToken", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("hospitals");

    if (table.fcmToken) {
      await queryInterface.removeColumn("hospitals", "fcmToken");
    }
  },
};
