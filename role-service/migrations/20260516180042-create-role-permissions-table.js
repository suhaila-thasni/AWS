"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("role_permissions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      permissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      hospitalId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      labId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      pharmacyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // 🔒 UNIQUE constraint (same as model index)
    await queryInterface.addConstraint("role_permissions", {
      fields: ["roleId", "permissionId"],
      type: "unique",
      name: "unique_role_permission",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("role_permissions");
  },
};
