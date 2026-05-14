'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('ambulances');

    // ✅ userId
    if (!table.userId) {
      await queryInterface.addColumn('ambulances', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // ✅ hospitalId
    if (!table.hospitalId) {
      await queryInterface.addColumn('ambulances', 'hospitalId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // (optional safety) ensure address is JSONB in Postgres
    if (!table.address) {
      await queryInterface.addColumn('ambulances', 'address', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }

    // (optional) ensure otp fields exist
    if (!table.otp) {
      await queryInterface.addColumn('ambulances', 'otp', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.otpExpiry) {
      await queryInterface.addColumn('ambulances', 'otpExpiry', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('ambulances');

    if (table.userId) {
      await queryInterface.removeColumn('ambulances', 'userId');
    }

    if (table.hospitalId) {
      await queryInterface.removeColumn('ambulances', 'hospitalId');
    }

    if (table.otp) {
      await queryInterface.removeColumn('ambulances', 'otp');
    }

    if (table.otpExpiry) {
      await queryInterface.removeColumn('ambulances', 'otpExpiry');
    }
  }
};
