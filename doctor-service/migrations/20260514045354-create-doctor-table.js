'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // Delete old table if exists
    await queryInterface.dropTable('doctor').catch(() => {});

    // Create fresh table
    await queryInterface.createTable('doctor', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      hospitalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      displayName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      department: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      specialist: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      qualification: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      regNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      autoDecline: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      appoimentCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },

      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      password: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      experience: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fees: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true,
      },

      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      knowLanguages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },

      address: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      consultingTwo: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      consultingOne: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      outDoorConsulting: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      bookingOpen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      joiningDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      todayBookingAcceptCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      roleId: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      isDelete: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      otpExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },

    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('doctor');
  },
};
