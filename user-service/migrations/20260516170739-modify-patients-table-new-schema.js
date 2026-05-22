"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1️⃣ Add columns safely
      await queryInterface.addColumn(
        "patients",
        "hospitalId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "location",
        {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        { transaction }
      );

      // 2️⃣ Migrate old data into JSONB safely
      await queryInterface.sequelize.query(
        `
        UPDATE patients
        SET location = jsonb_build_object(
          'country', country,
          'state', state,
          'district', city,
          'place', city,
          'pincode', pinCode
        )
        WHERE location IS NULL;
        `,
        { transaction }
      );

      // 3️⃣ Remove old columns AFTER migration
      const dropColumns = [
        "country",
        "city",
        "state",
        "pinCode",
        "middleName",
        "company",
        "profileImage",
      ];

      for (const col of dropColumns) {
        await queryInterface.removeColumn("patients", col, { transaction });
      }

      // 4️⃣ Make constraints AFTER data is safe
      await queryInterface.changeColumn(
        "patients",
        "userId",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "patients",
        "hospitalId",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "patients",
        "location",
        {
          type: Sequelize.JSONB,
          allowNull: false,
        },
        { transaction }
      );

      // 5️⃣ Add UNIQUE constraint LAST (safe)
      await queryInterface.addConstraint("patients", {
        fields: ["userId", "hospitalId"],
        type: "unique",
        name: "unique_user_hospital_patient",
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // 1️⃣ Remove constraint first
      await queryInterface.removeConstraint(
        "patients",
        "unique_user_hospital_patient",
        { transaction }
      );

      // 2️⃣ Add columns back
      await queryInterface.addColumn(
        "patients",
        "country",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "city",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "state",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "pinCode",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "middleName",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "company",
        { type: Sequelize.STRING },
        { transaction }
      );

      await queryInterface.addColumn(
        "patients",
        "profileImage",
        { type: Sequelize.JSONB },
        { transaction }
      );

      // 3️⃣ Drop new columns
      await queryInterface.removeColumn("patients", "hospitalId", {
        transaction,
      });

      await queryInterface.removeColumn("patients", "location", {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
