module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("doctor").catch(() => null);
    if (!tableInfo) {
      await queryInterface.createTable("doctor", {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        firstName: { type: Sequelize.STRING, allowNull: false },
        lastName: { type: Sequelize.STRING, allowNull: false },
        phone: { type: Sequelize.STRING, allowNull: false, unique: true },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        fees: { type: Sequelize.STRING },
        department: { type: Sequelize.STRING },
        specialist: { type: Sequelize.STRING },
        dob: { type: Sequelize.DATE },
        gender: { type: Sequelize.STRING },
        knowLanguages: { type: Sequelize.JSON },
        consultingTwo: { type: Sequelize.STRING },
        consultingOne: { type: Sequelize.STRING },
        bookingOpen: { type: Sequelize.BOOLEAN, defaultValue: true },
        qualification: { type: Sequelize.STRING },
        address: { type: Sequelize.TEXT },
        displayName: { type: Sequelize.STRING },
        experience: { type: Sequelize.STRING },
        joiningDate: { type: Sequelize.DATE },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      });
    }
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("doctor");
  },
};
















