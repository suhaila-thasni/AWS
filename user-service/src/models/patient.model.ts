import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db";
import User from "./user.model";


interface ILocation {
  country?: string;
  state?: string;
  district?: string;
  place: string;
  pincode: number;
}

interface IPatient {
  id: number;
  patientId?: string; // Virtual ID
  
  userId?: number;
  hospitalId: number;

  firstName: string;
  lastName: string;

  bloodGroup: string;
  gender: string;
  maritalStatus?: string;
  patientType: string;

  age?: number;
  dob?: Date;


  mobileNumber: string;
  emergencyNumber?: string;
  guardianName?: string;

  addressLine1?: string;
  addressLine2?: string;


  referredBy?: number;
  department?: number;
  referredOn?: Date;

  location: ILocation;

  notes?: string;

  email?: string;
  password?: string;

  vitals?: any[]; // Array of PatientVitals
}


class Patient extends Model<IPatient> implements IPatient {
  public id!: number;
  public readonly patientId!: string;
  public userId!: number;
  public hospitalId: number;

  public firstName!: string;
  public lastName!: string;

  public bloodGroup!: string;
  public gender!: string;
  public maritalStatus!: string;
  public patientType!: string;

  public age!: number;
  public dob!: Date;

  

  public mobileNumber!: string;
  public emergencyNumber!: string;
  public guardianName!: string;

  public addressLine1!: string;
  public addressLine2!: string;


  public referredBy!: number;
  public department!: number;
  public referredOn!: Date;

  public notes!: string;

  public email!: string;
  public password!: string;
  public location: ILocation;

  public readonly vitals?: any[];
}


Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.VIRTUAL,
      get() {
        const id = this.getDataValue("id");
        return `#PAT${String(id).padStart(5, "0")}`;
      },
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,

      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

      hospitalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },


    // Basic Info
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ENUMS
    bloodGroup: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"),
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },

    maritalStatus: {
      type: DataTypes.ENUM("Single", "Married", "Divorced", "Widowed"),
    },

    patientType: {
      type: DataTypes.ENUM("Inpatient", "Outpatient"),
      allowNull: false,
    },

    age: {
      type:  DataTypes.INTEGER, 
      allowNull: false
    }, 
    
    dob: {
      type: DataTypes.DATE,
      allowNull: false
    }, 


    // Contact
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    emergencyNumber: DataTypes.STRING,
    guardianName: DataTypes.STRING,

    addressLine1: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    addressLine2: DataTypes.STRING,


    location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    // 🔥 Foreign Keys
    referredBy: {
      type: DataTypes.INTEGER, // Doctor ID
    },

    department: {
      type: DataTypes.INTEGER, // Department ID 
      allowNull: false
    },

    referredOn: DataTypes.DATE,

    notes: DataTypes.TEXT,

    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    }, 
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: true,
    paranoid: true,

      indexes: [
      {
        unique: true,
        fields: ["userId", "hospitalId"],
      },
    ],
  }

  
);

// 🔗 Associations: One User → Many Patients
User.hasMany(Patient, {
  foreignKey: "userId",
  as: "patients",
});

Patient.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Patient;
