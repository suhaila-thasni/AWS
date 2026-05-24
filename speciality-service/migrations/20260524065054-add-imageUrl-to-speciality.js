'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('specialitys', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },


    async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('specialitys', 'isDelete', {
      type: Sequelize.BOOLEAN,
         defaultValue: false,
    });
  },



  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('specialitys', 'imageUrl');
  },
    async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('specialitys', 'isDelete');
  }
};
