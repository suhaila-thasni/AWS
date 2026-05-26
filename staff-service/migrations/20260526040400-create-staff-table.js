import { DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("staff", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      staffId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      designation: DataTypes.STRING,
      joiningDate: DataTypes.DATE,
      staffType: DataTypes.STRING,
      jobType: DataTypes.STRING,

      imageUrl: DataTypes.STRING,

      qualification: DataTypes.STRING,

      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      password: DataTypes.STRING,
      gender: DataTypes.STRING,
      dob: DataTypes.DATE,

      knowLanguages: DataTypes.JSONB,

      roleId: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      address: {
        type: DataTypes.JSONB,
        allowNull: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      isDelete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      deleteDate: DataTypes.DATE,
      otp: DataTypes.STRING,
      otpExpiry: DataTypes.DATE,

      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("staff");
  },
};
