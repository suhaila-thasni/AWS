// import { Request, Response } from "express";
// import asyncHandler from "express-async-handler";
// import Patient from "../models/patient.model";
// import Prescription from "../models/prescription.model";
// import User from "../models/user.model";
// import { publishEvent } from "../events/publisher";
// import { httpClient } from "../utils/httpClient";
// import dotenv from "dotenv";
// import { Op, Sequelize } from "sequelize";
// dotenv.config();


// // REGISTER
// export const createPrescription: any = asyncHandler(async (req: Request, res: Response) => {
 
//   const { bookingId, hospitalId, doctorId, patientId, userId, complaint, medications, investigations, advice, next_consultation, empty_stomach  } = req.body;

//   const errors: string[] = [];

//   // 1. Validate / Auto-Create Patient
//   let finalPatientId = patientId;
//   let patientExists = null;

//   if (finalPatientId) {
//     patientExists = await Patient.findOne({ where: { id: finalPatientId, isDelete: false } });
//   }

//   // Auto Create Patient if not found but we have a userId
//   if (!patientExists && userId) {
//     const user = await User.findOne({ where: { id: userId, isDelete: false } });
    
//     if (user) {
//       patientExists = await Patient.create({
//         userId: user.id,
//         hospitalId: hospitalId,
//         name: user.name,
//         gender: "Other",
//         age: 0,
//         dob: new Date(),
//         mobileNumber: user.phone || "N/A",
//         addressLine: "N/A",
//         location: { place: "N/A", pincode: 0 },
//       });
//       finalPatientId = patientExists.id;
//     } else {
//       errors.push(`User with ID ${userId} does not exist. Cannot auto-create patient.`);
//     }
//   } else if (!patientExists) {
//     errors.push(`Patient with ID ${patientId} does not exist and no userId provided to auto-create.`);
//   }

//   // 2. Validate Doctor (Cross-Service: doctor-service)
//   try {
//     await httpClient.get(`${process.env.DOCTOR_SERVICE_URL}/doctor/${doctorId}`, {
//       headers: { Authorization: req.headers.authorization }
//     });
//   } catch (error: any) {
//     console.error("Doctor validation failed:", error.message);
//     errors.push(`Doctor with ID ${doctorId} does not exist or is unreachable.`);
//   }

//   // 3. Validate Hospital (Cross-Service: hospital-service)
//   try {
//     await httpClient.get(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`, {
//       headers: { Authorization: req.headers.authorization }
//     });
//   } catch (error: any) {
//     console.error("Hospital validation failed:", error.message);
//     errors.push(`Hospital with ID ${hospitalId} does not exist or is unreachable.`);
//   }

//   // 4. Return all errors if any
//   if (errors.length > 0) {
//     res.status(404).json({
//       success: false,
//       message: "Validation failed",
//       errors: errors
//     });
//     return;
//   }

//   const finalUserId = patientExists ? patientExists.userId : userId;

//   // 5. Create Prescription
//   const prescription = await Prescription.create({
//     bookingId, hospitalId, doctorId, patientId: finalPatientId, userId: finalUserId, complaint, medications, investigations, advice, next_consultation, empty_stomach 
//   });

//   await publishEvent(
//     "prescription_events",
//     "PRESCRIPTION_CREATED",
//     {
//       prescriptionId: prescription.id,
//       bookingId,
//       doctorId,
//       patientId: finalPatientId,
//       userId: finalUserId,
//       hospitalId: prescription.hospitalId,
//     }
//   );



//   res.status(201).json({
//     success: true,
//     message: "Prescription created successfully",
//     data: prescription,
//   });
// });



// // GET ALL USERS Prescription
// export const getPrescription: any = asyncHandler(async (req: Request, res: Response) => {
//   const prescription = await Prescription.findAll({
//     where: { isDelete: false }
//   });

//   res.status(200).json({
//     success: true,
//     data: prescription,
//   });
// });


// export const getHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {

//    const normalizeQuery = (value: any) =>
//       Array.isArray(value) ? value[0] : value;

//     let {
      
//    bookingId,
//    userId,
//    patientId,
//    doctorId,
//    date,
//       hospitalId, 
//       page = 1,
//       limit = 10,
//     }: any = req.query;

//     hospitalId = normalizeQuery(hospitalId);

//     bookingId = normalizeQuery(bookingId);
//     userId = normalizeQuery(userId);
//    patientId = normalizeQuery(patientId);
//    doctorId = normalizeQuery(doctorId);
//       date = normalizeQuery(date);    


//     const whereClause: any = {};

//     const pageNum = Math.max(Number(page) || 1, 1);
//     const limitNum = Math.max(Number(limit) || 10, 1);

//     // Hospital filter
    

//     if (hospitalId && !isNaN(Number(hospitalId))) {
//       whereClause.hospitalId = Number(hospitalId);
//     }

//        if (userId && !isNaN(Number(userId))) {
//       whereClause.userId = Number(userId);
//     }

//        if (doctorId && !isNaN(Number(doctorId))) {
//       whereClause.doctorId = Number(doctorId);
//     }

//        if (patientId && !isNaN(Number(patientId))) {
//       whereClause.patientId = Number(patientId);
//     }

//     // Status filter
//     if (date !== undefined) {
//       whereClause.date = date
//     }
 
 

//     const prescription = await Prescription.findAndCountAll({
//       where: whereClause,
//       limit: limitNum,
//       offset: (pageNum - 1) * limitNum,
//       order: [["createdAt", "DESC"]],
//     });

//     const totalPages = Math.ceil(prescription.count / limitNum);

//     res.status(200).json({
//       success: true,
//       data: prescription.rows,
//       pagination: {
//         totalItems: prescription.count,
//         totalPages,
//         currentPage: pageNum,
//         limit: limitNum,
//         hasNextPage: pageNum < totalPages,
//         hasPreviousPage: pageNum > 1,
//       },
//       error: null,
//     });
  


// });

// // GET ONE USER prescription
// export const getAPrescription: any = asyncHandler(async (req: Request, res: Response) => {
//   const prescription = await Prescription.findOne({ where: { id: req.params.id, isDelete: false } });

//   if (!prescription) {
//     res.status(404).json({
//       success: false,
//       message: "Prescription not found",
//     });
//     return;
//   }

//   res.status(200).json({
//     success: true,
//     data: prescription,
//   });
// });

// // UPDATE - PUT /prescription/:id
// export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const updatePayload = req.body;

//   const prescription = await Prescription.update(updatePayload, {
//     where: { id: id, isDelete: false },
//     returning: true,
//   });

//   if (!prescription[1] || prescription[1].length === 0) {
//     res.status(404).json({
//       success: false,
//       message: "Prescription not found",
//       status: 200,
//       data: null,
//       error: { code: "PRESCRIPTION_NOT_FOUND", details: null },
//     });
//     return;
//   }

//   const patient = await Patient.findOne({ where: { id: prescription[1][0].patientId, isDelete: false } });
//   await publishEvent("prescription_events", "PRESCRIPTION_UPDATED", {
//     prescriptionId: prescription[1][0].id,
//     userId: patient ? patient.userId : null,
//     hospitalId: prescription[1][0].hospitalId,
//   });

//   res.status(200).json({
//     success: true,
//     message: "successfully updated",
//     data: prescription[1][0],
//     error: null,
//   });
// });

// // DELETE USER prescription
// export const deletePrescription: any = asyncHandler(async (req: Request, res: Response) => {
//   const user = await Prescription.findOne({ where: { id: req.params.id, isDelete: false } });

//   if (!user) {
//     res.status(404).json({
//       success: false,
//       message: "Prescription not found",
//     });
//     return;
//   }

//   // 🔥 Move to blacklist (soft delete)
//   await user.update({
//     isActive: false,
//     isDelete: true,
//     deleteDate: new Date(),
//   });

  

//   const patient = await Patient.findOne({ where: { id: user.patientId, isDelete: false } });
//   await publishEvent(
//     "prescription_events",
//     "PRESCRIPTION_DELETED",
//     {
//       prescriptionId: Number(req.params.id),
//       userId: patient ? patient.userId : null,
//       hospitalId: user.hospitalId,
//     }
//   );


//   res.status(200).json({
//     success: true,
//     message: "Prescription deleted successfully",
//   });
// });


import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Patient from "../models/patient.model";
import Prescription from "../models/prescription.model";
import User from "../models/user.model";
import { publishEvent } from "../events/publisher";
import { httpClient } from "../utils/httpClient";
import dotenv from "dotenv";
import PatientVitals from "../models/patientVitals.model";
dotenv.config();


// REGISTER
export const createPrescription: any = asyncHandler(async (req: Request, res: Response) => {
 
  const { bookingId, hospitalId, doctorId, patientId, userId, complaint, medications, investigations, advice, next_consultation, empty_stomach  } = req.body;

      const {
      temperature, pulse, respiratoryRate, spo2, height, weight, waist
    } = req.body;

  const errors: string[] = [];

  // 1. Validate / Auto-Create Patient
  let finalPatientId = patientId;
  let patientExists = null;

  if (finalPatientId) {
    patientExists = await Patient.findOne({ where: { id: finalPatientId, isDelete: false } });
  }

  // Auto Create Patient if not found but we have a userId
  if (!patientExists && userId) {
    const user = await User.findOne({ where: { id: userId, isDelete: false } });
    
    if (user) {
      patientExists = await Patient.create({
        userId: user.id,
        hospitalId: hospitalId,
        name: user.name,
        gender: "Other",
        age: 0,
        dob: new Date(),
        mobileNumber: user.phone || "N/A",
        addressLine: "N/A",
        location: { place: "N/A", pincode: 0 },
      });
      finalPatientId = patientExists.id;
    } else {
      errors.push(`User with ID ${userId} does not exist. Cannot auto-create patient.`);
    }
  } else if (!patientExists) {
    errors.push(`Patient with ID ${patientId} does not exist and no userId provided to auto-create.`);
  }

  // 2. Validate Doctor (Cross-Service: doctor-service)
  try {
    await httpClient.get(`${process.env.DOCTOR_SERVICE_URL}/doctor/${doctorId}`, {
      headers: { Authorization: req.headers.authorization }
    });
  } catch (error: any) {
    console.error("Doctor validation failed:", error.message);
    errors.push(`Doctor with ID ${doctorId} does not exist or is unreachable.`);
  }

  // 3. Validate Hospital (Cross-Service: hospital-service)
  try {
    await httpClient.get(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`, {
      headers: { Authorization: req.headers.authorization }
    });
  } catch (error: any) {
    console.error("Hospital validation failed:", error.message);
    errors.push(`Hospital with ID ${hospitalId} does not exist or is unreachable.`);
  }

  // 4. Return all errors if any
  if (errors.length > 0) {
    res.status(404).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
    return;
  }

  const finalUserId = patientExists ? patientExists.userId : userId;

  // 5. Create Prescription
  const prescription = await Prescription.create({
    bookingId, hospitalId, doctorId, patientId: finalPatientId, userId: finalUserId, complaint, medications, investigations, advice, next_consultation, empty_stomach 
  });


     // 4. If any vitals field is provided, create a vitals record
    if (temperature || pulse || respiratoryRate || spo2 || height || weight || waist) {
      // We'll calculate BMI/BSA here or let the service handle it.
      // Since addVitals in patientVitalsService handles calculation, let's use a helper or just do it here to keep things in one transaction.
      
      let bmi, bsa;
      if (height && weight) {
        const hInM = height / 100;
        bmi = parseFloat((weight / (hInM * hInM)).toFixed(2));
        bsa = parseFloat((0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425)).toFixed(4));
      }

      await PatientVitals.create({
        prescriptionId: prescription.id,
        patientId: patientId,
        temperature, pulse, respiratoryRate, spo2,
        height, weight, waist, bmi, bsa
      });
    }


  await publishEvent(
    "prescription_events",
    "PRESCRIPTION_CREATED",
    {
      prescriptionId: prescription.id,
      bookingId,
      doctorId,
      patientId: finalPatientId,
      userId: finalUserId,
      hospitalId: prescription.hospitalId,
    }
  );


  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    data: prescription,
  });
});



// GET ALL USERS Prescription
export const getPrescription: any = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await Prescription.findAll({
    where: { isDelete: false }
  });

  res.status(200).json({
    success: true,
    data: prescription,
  });
});


export const getHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {

   const normalizeQuery = (value: any) =>
      Array.isArray(value) ? value[0] : value;

    let {
      
   bookingId,
   userId,
   patientId,
   doctorId,
   date,
      hospitalId, 
      page = 1,
      limit = 10,
    }: any = req.query;

    hospitalId = normalizeQuery(hospitalId);

    bookingId = normalizeQuery(bookingId);
    userId = normalizeQuery(userId);
   patientId = normalizeQuery(patientId);
   doctorId = normalizeQuery(doctorId);
      date = normalizeQuery(date);    


    const whereClause: any = {};

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);

    // Hospital filter
    

    if (hospitalId && !isNaN(Number(hospitalId))) {
      whereClause.hospitalId = Number(hospitalId);
    }

       if (userId && !isNaN(Number(userId))) {
      whereClause.userId = Number(userId);
    }

       if (doctorId && !isNaN(Number(doctorId))) {
      whereClause.doctorId = Number(doctorId);
    }

       if (patientId && !isNaN(Number(patientId))) {
      whereClause.patientId = Number(patientId);
    }

    // Status filter
    if (date !== undefined) {
      whereClause.date = date
    }
 
 

    const prescription = await Prescription.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(prescription.count / limitNum);

    res.status(200).json({
      success: true,
      data: prescription.rows,
      pagination: {
        totalItems: prescription.count,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      error: null,
    });
  


});

// GET ONE USER prescription
export const getAPrescription: any = asyncHandler(async (req: Request, res: Response) => {
  const prescription = await Prescription.findOne({ where: { id: req.params.id, isDelete: false } });

  if (!prescription) {
    res.status(404).json({
      success: false,
      message: "Prescription not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: prescription,
  });
});

// UPDATE - PUT /prescription/:id
export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const prescription : any = await Prescription.update(updatePayload, {
    where: { id: id, isDelete: false },
    returning: true,
  });

   // 2. Check for NEW Vitals in the same request
    const {
      temperature, pulse, respiratoryRate, spo2, height, weight, waist, patientId
    } = req.body;

    if (temperature || pulse || respiratoryRate || spo2 || height || weight || waist) {
      let bmi, bsa;
      if (height && weight) {
        const hInM = height / 100;
        bmi = parseFloat((weight / (hInM * hInM)).toFixed(2));
        bsa = parseFloat((0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425)).toFixed(4));
      }

      await PatientVitals.create({
        prescriptionId: prescription.id,
        patientId,
        temperature, pulse, respiratoryRate, spo2,
        height, weight, waist, bmi, bsa
      });
    }


  if (!prescription[1] || prescription[1].length === 0) {
    res.status(404).json({
      success: false,
      message: "Prescription not found",
      status: 200,
      data: null,
      error: { code: "PRESCRIPTION_NOT_FOUND", details: null },
    });
    return;
  }

  const patient = await Patient.findOne({ where: { id: prescription[1][0].patientId, isDelete: false } });
  await publishEvent("prescription_events", "PRESCRIPTION_UPDATED", {
    prescriptionId: prescription[1][0].id,
    userId: patient ? patient.userId : null,
    hospitalId: prescription[1][0].hospitalId,
  });

  res.status(200).json({
    success: true,
    message: "successfully updated",
    data: prescription[1][0],
    error: null,
  });
});

// DELETE USER prescription
export const deletePrescription: any = asyncHandler(async (req: Request, res: Response) => {
  const user = await Prescription.findOne({ where: { id: req.params.id, isDelete: false } });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "Prescription not found",
    });
    return;
  }

  // 🔥 Move to blacklist (soft delete)
  await user.update({
    isActive: false,
    isDelete: true,
    deleteDate: new Date(),
  });

  

  const patient = await Patient.findOne({ where: { id: user.patientId, isDelete: false } });
  await publishEvent(
    "prescription_events",
    "PRESCRIPTION_DELETED",
    {
      prescriptionId: Number(req.params.id),
      userId: patient ? patient.userId : null,
      hospitalId: user.hospitalId,
    }
  );


  res.status(200).json({
    success: true,
    message: "Prescription deleted successfully",
  });
});














