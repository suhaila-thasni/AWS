"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("doctor", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

      hospitalName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      department: Sequelize.STRING,
      specialist: Sequelize.STRING,
      qualification: Sequelize.STRING,

      regNo: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      autoDecline: Sequelize.INTEGER,
      appointmentCount: Sequelize.INTEGER,

      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fcmToken: Sequelize.STRING,
      imageUrl: Sequelize.STRING,
      password: Sequelize.STRING,
      experience: Sequelize.STRING,

      fees: Sequelize.DECIMAL(10, 2),
      gender: Sequelize.STRING,
      dob: Sequelize.DATE,

      knowLanguages: {
        type: Sequelize.ARRAY(Sequelize.STRING),
      },

      address: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      consultingTwo: Sequelize.JSONB,
      consultingOne: Sequelize.JSONB,
      outDoorConsulting: Sequelize.JSON,

      bookingOpen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      joiningDate: Sequelize.DATE,

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

      deleteDate: Sequelize.DATE,
      otp: Sequelize.STRING,
      otpExpiry: Sequelize.DATE,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // ✅ ONLY ONE UNIQUE RULE (CORRECT ONE)
    await queryInterface.addIndex("doctor", ["hospitalId", "phone"], {
      unique: true,
      name: "doctor_hospital_phone_unique",
    });

    // optional (only if you really want email unique per hospital)
    await queryInterface.addIndex("doctor", ["hospitalId", "email"], {
      unique: true,
      name: "doctor_hospital_email_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("doctor");
  },
};
