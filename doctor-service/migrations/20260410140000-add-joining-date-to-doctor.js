'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('doctor').catch(() => null);
    
    if (tableInfo) {
      if (!tableInfo.joiningDate) {
        await queryInterface.addColumn('doctor', 'joiningDate', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }
      if (!tableInfo.todayBookingAcceptCount) {
        await queryInterface.addColumn('doctor', 'todayBookingAcceptCount', {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        });
      }
      if (!tableInfo.isActive) {
        await queryInterface.addColumn('doctor', 'isActive', {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        });
      }
      if (!tableInfo.isDelete) {
        await queryInterface.addColumn('doctor', 'isDelete', {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('doctor', 'joiningDate');
    await queryInterface.removeColumn('doctor', 'todayBookingAcceptCount');
    await queryInterface.removeColumn('doctor', 'isActive');
    await queryInterface.removeColumn('doctor', 'isDelete');
  }

};
