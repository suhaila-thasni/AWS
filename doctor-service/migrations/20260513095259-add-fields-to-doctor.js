'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('doctor', 'regNo', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('doctor', 'autoDecline', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('doctor', 'appoimentCount', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('doctor', 'regNo');

    await queryInterface.removeColumn('doctor', 'autoDecline');

    await queryInterface.removeColumn('doctor', 'appoimentCount');

  },
};

