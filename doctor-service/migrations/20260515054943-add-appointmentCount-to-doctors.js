'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('doctor');

    if (!table.appointmentCount) {
      await queryInterface.addColumn('doctor', 'appointmentCount', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('doctors');

    if (table.appointmentCount) {
      await queryInterface.removeColumn('doctor', 'appointmentCount');
    }
  },
};
