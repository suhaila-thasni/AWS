'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Remove old columns
    const oldColumns = [
      'userId', 'hospitalId', 'labId', 'staffId', 'pharmacyId', 'doctorId', 'superAdminId', 'adminId',
      'userIsRead', 'hospitalIsRead', 'labIsRead', 'staffIsRead', 'pharmacyIsRead', 'doctorIsRead', 'superAdminIsRead', 'adminIsRead'
    ];

    for (const col of oldColumns) {
      await queryInterface.removeColumn('notification', col).catch(err => console.log(`Skipping column ${col} (might not exist)`));
    }

    // 2. Add new JSONB Array columns
    const newColumns = [
      'userIds', 'hospitalIds', 'labIds', 'staffIds', 'pharmacyIds', 'doctorIds', 'adminIds', 'superAdminIds'
    ];

    for (const col of newColumns) {
      await queryInterface.addColumn('notification', col, {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Revert changes
    const newColumns = [
      'userIds', 'hospitalIds', 'labIds', 'staffIds', 'pharmacyIds', 'doctorIds', 'adminIds', 'superAdminIds'
    ];

    for (const col of newColumns) {
      await queryInterface.removeColumn('notification', col);
    }

    // Note: We don't restore the old columns here to keep it simple, 
    // as restoring them would require their previous types and constraints.
  }
};
