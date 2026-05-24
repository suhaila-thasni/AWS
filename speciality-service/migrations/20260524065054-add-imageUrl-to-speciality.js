'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('specialitys', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('specialitys', 'isDelete', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('specialitys', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('specialitys', 'imageUrl');
    await queryInterface.removeColumn('specialitys', 'isDelete');
    await queryInterface.removeColumn('specialitys', 'isActive');
  }
};
