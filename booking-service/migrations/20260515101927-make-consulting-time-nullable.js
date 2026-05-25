'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'bookings', // 👈 table name
      'consulting_time',
      {
        type: Sequelize.STRING,
        allowNull: true, // ✅ changed to true
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn(
      'bookings',
      'consulting_time',
      {
        type: Sequelize.STRING,
        allowNull: false, // 🔙 revert back
      }
    );
  },
};
