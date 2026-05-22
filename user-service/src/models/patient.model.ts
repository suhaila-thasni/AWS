// import { DataTypes, Model } from "sequelize";
// import sequelize from "../config/db";
// import User from "./user.model";


// interface ILocation {
//   country?: string;
//   state?: string;
//   district?: string;
//   place: string;
//   pincode: number;
// }

// interface IPatient {
//   id: number;
//   patientId?: string; // Virtual ID
  
//   userId?: number;
//   hospitalId: number;

//   firstName: string;
//   lastName: string;

//   bloodGroup: string;
//   gender: string;
//   maritalStatus?: string;
//   patientType: string;

//   age?: number;
//   dob?: Date;


//   mobileNumber: string;
//   emergencyNumber?: string;
//   guardianName?: string;

//   addressLine: string;


//   location: ILocation;

//   email?: string;


//   vitals?: any[]; // Array of PatientVitals
// }


// class Patient extends Model<IPatient> implements IPatient {
//   public id!: number;
//   public readonly patientId!: string;
//   public userId!: number;
//   public hospitalId: number;

//   public firstName!: string;
//   public lastName!: string;

//   public bloodGroup!: string;
//   public gender!: string;
//   public maritalStatus!: string;
//   public patientType!: string;

//   public age!: number;
//   public dob!: Date;

  

//   public mobileNumber!: string;
//   public emergencyNumber!: string;
//   public guardianName!: string;

//   public addressLine!: string;


//   public email!: string;
//   public location: ILocation;

//   public readonly vitals?: any[];
// }


// Patient.init(
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     patientId: {
//       type: DataTypes.VIRTUAL,
//       get() {
//         const id = this.getDataValue("id");
//         return `#PAT${String(id).padStart(5, "0")}`;
//       },
//     },

//     userId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,

//       references: {
//         model: "users",
//         key: "id",
//       },
//       onDelete: "CASCADE",
//     },

//       hospitalId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },


//     // Basic Info
//     firstName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     lastName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     // ENUMS
//     bloodGroup: {
//       type: DataTypes.ENUM("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"),
//       allowNull: false,
//     },

//     gender: {
//       type: DataTypes.ENUM("Male", "Female", "Other"),
//       allowNull: false,
//     },

//     maritalStatus: {
//       type: DataTypes.ENUM("Single", "Married", "Divorced", "Widowed"),
//     },

//     patientType: {
//       type: DataTypes.ENUM("Inpatient", "Outpatient"),
//       allowNull: false,
//     },

//     age: {
//       type:  DataTypes.INTEGER, 
//       allowNull: false
//     }, 
    
//     dob: {
//       type: DataTypes.DATE,
//       allowNull: false
//     }, 


//     // Contact
//     mobileNumber: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },

//     emergencyNumber: DataTypes.STRING,
//     guardianName: DataTypes.STRING,

//     addressLine: {
//       type: DataTypes.STRING,
//       allowNull: false
//     }, 
   


//     location: {
//       type: DataTypes.JSONB,
//       allowNull: false,
//     },

  

//     email: {
//       type: DataTypes.STRING,
//       allowNull: true,
//       validate: {
//         isEmail: true,
//       },
//     },

//   },
//   {
//     sequelize,
//     modelName: "Patient",
//     tableName: "patients",
//     timestamps: true,
//     paranoid: true,

//   }

  
// );

// // 🔗 Associations: One User → Many Patients
// User.hasMany(Patient, {
//   foreignKey: "userId",
//   as: "patients",
// });

// Patient.belongsTo(User, {
//   foreignKey: "userId",
//   as: "user",
// });

// export default Patient;


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
  patientId?: string;

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

  addressLine: string;

  location: ILocation;

  email?: string;
  password?: string;

  vitals?: any[];

  // ✅ Added Soft Delete Fields
  deleteDate?: Date;
  isActive?: boolean;
  isDelete?: boolean;
}

class Patient extends Model<IPatient> implements IPatient {
  public id!: number;
  public readonly patientId!: string;

  public userId!: number;
  public hospitalId!: number;

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

  public addressLine!: string;

  public email!: string;
  public password!: string;

  public location!: ILocation;

  public readonly vitals?: any[];

  // ✅ Added Soft Delete Fields
  public deleteDate?: Date;
  public isActive?: boolean;
  public isDelete?: boolean;
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
      type: DataTypes.ENUM(
        "A+",
        "A-",
        "B+",
        "B-",
        "O+",
        "O-",
        "AB+",
        "AB-"
      ),
      allowNull: false,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },

    maritalStatus: {
      type: DataTypes.ENUM(
        "Single",
        "Married",
        "Divorced",
        "Widowed"
      ),
      allowNull: true,
    },

    patientType: {
      type: DataTypes.ENUM("Inpatient", "Outpatient"),
      allowNull: false,
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    dob: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Contact
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    emergencyNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    guardianName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    addressLine: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Location JSON
    location: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,

      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ✅ Soft Delete Fields
    deleteDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: true,
    paranoid: true,
  }
);

// 🔗 Associations
User.hasMany(Patient, {
  foreignKey: "userId",
  as: "patients",
});

Patient.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default Patient;
