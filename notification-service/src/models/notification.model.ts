import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

/* =======================
   INTERFACE
======================= */

interface INotification {

  id: number;

  userIds?: number[];

  hospitalIds?: number[];

  labIds?: number[];

  staffIds?: number[];

  pharmacyIds?: number[];

  doctorIds?: number[];

  adminIds?: number[];

  superAdminIds?: number[];

  message: string;
}

/* =======================
   OPTIONAL
======================= */

type NotificationCreationAttributes =
  Optional<INotification, "id">;

/* =======================
   MODEL
======================= */

class Notification
  extends Model<
    INotification,
    NotificationCreationAttributes
  >
  implements INotification
{

  public id!: number;

  public userIds?: number[];

  public hospitalIds?: number[];

  public labIds?: number[];

  public staffIds?: number[];

  public pharmacyIds?: number[];

  public doctorIds?: number[];

  public adminIds?: number[];

  public superAdminIds?: number[];

  public message!: string;
}

/* =======================
   INIT
======================= */

Notification.init(

  {

    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    hospitalIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    labIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    staffIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    pharmacyIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    doctorIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    adminIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    superAdminIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },

  },

  {
    sequelize,
    modelName: "Notification",
    tableName: "notification",
    timestamps: true,
  }

);

export default Notification;

