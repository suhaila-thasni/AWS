import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";

/* =======================
   MEDICATION INTERFACE
======================= */

interface IMedication {
  medicine_name: string;
  dosage: string;
  duration: string;
  frequency: string;
  timing: string;
  instructions?: string;
}

/* =======================
   PRESCRIPTION INTERFACE
======================= */

interface IPrescription {

  id: number;

  bookingId: number; // 🔥 important
  userId: number;
  patientId?: number;
  doctorId: number;
  hospitalId: number;

  complaint: string;

  medications: IMedication[];

  investigations?: string[];

  advice?: string;

  next_consultation?: Date;

  empty_stomach?: boolean;
  date?: Date; 
  prescribedBy: string;

  deleteDate?: Date;
  isActive?: boolean;
  isDelete?: boolean;

}

/* =======================
   OPTIONAL FIELDS
======================= */

type PrescriptionCreationAttributes =
  Optional<
    IPrescription,
    | "id"
    | "patientId"
    | "investigations"
    | "advice"
    | "next_consultation"
    | "empty_stomach"
    | "deleteDate"
    | "isActive"
    | "isDelete"
    
  >;

/* =======================
   MODEL CLASS
======================= */

class Prescription
  extends Model<
    IPrescription,
    PrescriptionCreationAttributes
  >
  implements IPrescription
{

  public id!: number;

  public bookingId!: number;
  public userId!: number;
  public patientId?: number;
  public doctorId!: number;
  public hospitalId!: number;

  public complaint!: string;

  public medications!: IMedication[];

  public investigations?: string[];

  public advice?: string;

  public next_consultation?: Date;

  public empty_stomach?: boolean;
  public date?: Date;

  public deleteDate?: Date;
  public isActive?: boolean;
  public isDelete?: boolean;
  public prescribedBy: string;

} 

/* =======================
   INIT
======================= */

Prescription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    prescribedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    patientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    complaint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    medications: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    investigations: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    advice: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    next_consultation: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    empty_stomach: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

      date: {
      type: DataTypes.DATE,
    },
    
    deleteDate: {
      type: DataTypes.DATE,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }

  },

  {
    sequelize,
    modelName: "Prescription",
    tableName: "prescriptions",
    timestamps: true,
  }
);

export default Prescription;
