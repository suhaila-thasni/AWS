'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'bookings', // 👈 your table name
      'doctor_name',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }
    );

    await queryInterface.addColumn(
      'bookings',
      'doctor_department',
      {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'doctor_name');

    await queryInterface.removeColumn('bookings', 'doctor_department');
  },
};
