'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('doctor').catch(() => null);
    if (tableInfo) {
      if (!tableInfo.otp) {
        await queryInterface.addColumn('doctor', 'otp', {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
      if (!tableInfo.otpExpiry) {
        await queryInterface.addColumn('doctor', 'otpExpiry', {
          type: Sequelize.DATE,
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('doctor', 'otp');
    await queryInterface.removeColumn('doctor', 'otpExpiry');
  }
};
