'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('doctor', 'experience', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '0 years',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('doctor', 'experience');
  },
};
