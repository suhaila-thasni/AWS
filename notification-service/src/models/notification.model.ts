// import { DataTypes, Model, Optional } from "sequelize";
// import sequelize from "../config/db";

// /* =======================
//    INTERFACE
// ======================= */

// interface INotification {

//   id: number;

//   userId?: number;
//   hospitalId?: number;
//   labId?: number;
//   staffId?: number;
//   pharmacyId?: number;
//   doctorId?: number;

//   message: string;

//   userIsRead: boolean;
//   hospitalIsRead: boolean;
//   labIsRead: boolean;
//   staffIsRead: boolean;
//   pharmacyIsRead: boolean;
//   doctorIsRead: boolean;
// }

// /* =======================
//    OPTIONAL FIELDS
// ======================= */

// type NotificationCreationAttributes =
//   Optional<
//     INotification,
//     | "id"
//     | "userIsRead"
//     | "hospitalIsRead"
//     | "doctorIsRead"
//     | "labIsRead"
//     | "pharmacyIsRead"
//     | "staffIsRead"
//   >;

// /* =======================
//    MODEL CLASS
// ======================= */

// class Notification
//   extends Model<
//     INotification,
//     NotificationCreationAttributes
//   >
//   implements INotification
// {

//   public id!: number;

//   public userId?: number;
//   public hospitalId?: number;
//   public labId?: number;
//   public staffId?: number;
//   public pharmacyId?: number;
//   public doctorId?: number;

//   public message!: string;

//   public userIsRead!: boolean;
//   public hospitalIsRead!: boolean;
//   public labIsRead!: boolean;
//   public staffIsRead!: boolean;
//   public pharmacyIsRead!: boolean;
//   public doctorIsRead!: boolean;
// }

// /* =======================
//    INIT
// ======================= */

// Notification.init(

//   {

//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },

//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     labId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     staffId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     pharmacyId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     doctorId: {
//       type: DataTypes.INTEGER,
//       allowNull: true,
//     },

//     message: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     /* READ STATUS */

//     userIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     hospitalIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     labIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     staffIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     pharmacyIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//     doctorIsRead: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },

//   },

//   {
//     sequelize,
//     modelName: "Notification",
//     tableName: "notification",
//     timestamps: true,
//   }

// );

// export default Notification;




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
