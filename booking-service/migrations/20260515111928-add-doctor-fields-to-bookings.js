'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'booking', // 👈 your table name
      'doctor_name',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }
    );

    await queryInterface.addColumn(
      'booking',
      'doctor_department',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('booking', 'doctor_name');

    await queryInterface.removeColumn('booking', 'doctor_department');
  },
};
