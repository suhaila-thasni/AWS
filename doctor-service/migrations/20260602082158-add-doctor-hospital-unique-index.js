"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ❌ REMOVE OLD UNIQUE CONSTRAINTS (IMPORTANT)
    await queryInterface.sequelize.query(`
      ALTER TABLE doctor DROP CONSTRAINT IF EXISTS doctor_phone_key;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE doctor DROP CONSTRAINT IF EXISTS doctor_email_key;
    `);

    // Also try index fallback (safe)
    await queryInterface.removeIndex("doctor", "doctor_phone").catch(() => {});
    await queryInterface.removeIndex("doctor", "doctor_email").catch(() => {});

    // ✅ ADD NEW COMPOSITE UNIQUE INDEX
    await queryInterface.addIndex("doctor", ["hospitalId", "phone"], {
      unique: true,
      name: "doctor_hospital_phone_unique",
    });

    await queryInterface.addIndex("doctor", ["hospitalId", "email"], {
      unique: true,
      name: "doctor_hospital_email_unique",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "doctor",
      "doctor_hospital_phone_unique"
    );

    await queryInterface.removeIndex(
      "doctor",
      "doctor_hospital_email_unique"
    );
  },
};
