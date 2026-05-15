'use strict';

module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('doctor');

    if (table.appoimentCount && !table.appointmentCount) {
      await queryInterface.renameColumn(
        'doctor',
        'appoimentCount',
        'appointmentCount'
      );
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('doctor');

    if (table.appointmentCount && !table.appoimentCount) {
      await queryInterface.renameColumn(
        'doctor',
        'appointmentCount',
        'appoimentCount'
      );
    }
  },
};
