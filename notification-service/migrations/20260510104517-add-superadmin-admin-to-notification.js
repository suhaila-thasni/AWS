'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('notification', 'superAdminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('notification', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('notification', 'superAdminIsRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn('notification', 'adminIsRead', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('notification', 'superAdminId');
    await queryInterface.removeColumn('notification', 'adminId');
    await queryInterface.removeColumn('notification', 'superAdminIsRead');
    await queryInterface.removeColumn('notification', 'adminIsRead');
  }
};
