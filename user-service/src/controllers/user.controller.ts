import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { userService } from "../services/user.service";
import Patient from "../models/patient.model";
import PatientVitals from "../models/patientVitals.model";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../services/jwt.service";
import { publishEvent } from "../events/publisher";
import { Op } from "sequelize";

// Helper to set refresh token cookie
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production"
    // ,
    secure:false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 14 * 24 * 60 * 60 * 1000, // 2 weeks
    path: "/",
  });
};


// --- USER CONTROLLERS ---

export const registerUser: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const data = await userService.register(req.body);
    res.status(201).json({ success: true, message: "User registered successfully", data });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Server Error" });
  }
});

export const loginUser: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token, refreshToken, user } = await userService.login(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ success: true, message: "Login success", token, data: user });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Server Error" });
  }
});

export const loginWithPhone: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.loginWithPhone(req.body.phone || "");
    res.status(200).json({ ...result, success: true, status: 200 });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Failed to send OTP" });
  }
});

export const verifyOtp: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token, refreshToken, user } = await userService.verifyOtp(req.body);
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      userDetails: user,
      status: 200,
    });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Server error" });
  }
 
});

export const getUsers: any = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ success: true, data: users });
});

export const getBlacklistedUsers: any = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getBlacklistedUsers();
  if (!users || users.length === 0) {
    res.status(404).json({ success: false, message: "No blacklisted users found" });
    return;
  }
  res.status(200).json({ success: true, data: users });
});

export const getUser: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const updateUser: any = asyncHandler(async (req: Request, res: Response) => {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.status(200).json({ success: true, message: "User updated successfully", data: user });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, message: error.message });
    }
});

export const deleteUser: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const resetPassword: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    await userService.resetPassword(req.body);
    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const sendOtpEmail: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.sendOtpByEmail(req.body.email);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const verifyOtpEmail: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.verifyOtpEmail(req.body);
    if (result.refreshToken) setRefreshTokenCookie(res, result.refreshToken);
    res.status(200).json({ success: true, message: "OTP verified", ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const resetPasswordEmail: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.resetPasswordWithEmail(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const changePassword: any = asyncHandler(async (req: any, res: Response) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

export const saveExpoToken: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = await userService.saveExpoToken(req.params.id, req.body.expoPushToken);
    res.status(200).json({ success: true, message: "Expo token updated", user });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});


export const testPushNotification: any = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await userService.testPushNotification(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});


// --- PATIENT CONTROLLERS ---

// CREATE PATIENT
export const createPatient: any = asyncHandler(async (req: Request, res: Response) => {
  const t = await Patient.sequelize!.transaction();

  try {
    // 1. Extract Patient Info
    const {
      name, bloodGroup, gender, maritalStatus,
      patientType, age, dob, mobileNumber, emergencyNumber,
      guardianName, addressLine, location, email, password, userId, hospitalId
    } = req.body;

    // 2. Extract Vitals Info (if any)
    const {
      temperature, pulse, respiratoryRate, spo2, height, weight, waist
    } = req.body;

    // 3. Handle User association conditions
    let finalUserId = userId;

    if (finalUserId) {
      // Condition 1: userId is provided in body
      const userExists = await User.findOne({ where: { id: finalUserId, isDelete: false } });
      if (!userExists) {
        res.status(400).json({ success: false, message: `User with ID ${finalUserId} does not exist.` });
        return;
      }
    } else {
      // Condition 3: Search existing user by phone (mobileNumber)
      const existingUser = await User.findOne({ where: { phone: mobileNumber } });
      if (existingUser) {
        finalUserId = existingUser.id;
      } else {
        // Condition 2: Create new User automatically
        const userEmail = email || null;
        
        let existingUserByEmail = null;
        if (userEmail) {
          existingUserByEmail = await User.findOne({ where: { email: userEmail } });
        }

        if (existingUserByEmail) {
          finalUserId = existingUserByEmail.id;
        } else {
          const newUser = await User.create({
            name: name || mobileNumber,
            email: userEmail,
            phone: mobileNumber,
            roleId: 3 // Default patient role
          }, { transaction: t });
          
          finalUserId = newUser.id;

          // Publish USER_REGISTERED event
          try {
            await publishEvent("user_events", "USER_REGISTERED", {
              userId: newUser.id,
              email: newUser.email,
              roleId: newUser.roleId,
              name,
            });
          } catch (err) {
            console.error("Failed to publish USER_REGISTERED event for auto-created user:", err);
          }
        }
      }
    }

    // 4. Create Patient
    const patient = await Patient.create({
      name, bloodGroup, gender, maritalStatus,
      patientType, age, dob, mobileNumber, emergencyNumber,
      guardianName, addressLine, location, email, password, userId: finalUserId, hospitalId
    }, { transaction: t });

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
        patientId: patient.id,
        temperature, pulse, respiratoryRate, spo2,
        height, weight, waist, bmi, bsa
      }, { transaction: t });
    }

    await t.commit();

    // Fetch the stored patient with vitals + user to return
    const result = await Patient.findByPk(patient.id, {
      include: [
        { model: PatientVitals, as: "vitals" },
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
      ],
    });

    try {
      await publishEvent("patient_events", "PATIENT_REGISTERED", {
        patientId: result?.id,
        userId: finalUserId,
        hospitalId: hospitalId,
        patientName: name,
        phone: mobileNumber
      });
    } catch (err) {
      console.error("Failed to publish PATIENT_REGISTERED event:", err);
    }

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  } catch (error: any) {
    await t.rollback();
    console.error("🔥 Error in createPatient controller:", error);
    
    if (error.name === "SequelizeValidationError") {
      const messages = error.errors?.map((e: any) => `${e.path}: ${e.message}`) || [error.message];
      res.status(400).json({
        success: false,
        message: "Validation failed: " + messages.join(", "),
        error: { code: "VALIDATION_ERROR", details: error.errors },
      });
      return;
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors?.[0]?.path || "field";
      res.status(409).json({
        success: false,
        message: `Duplicate entry: ${field} already exists`,
        error: { code: "DUPLICATE_ENTRY", details: field },
      });
      return;
    }

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to create patient",
      error: error.stack || null,
    });
  }
});


// GET ALL PATIENTS


export const getPatients = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let {
    name,
    phone,
    patientId,
    addressLine,
    hospitalId,
    email,
    guardianName,
    page = 1,
    limit = 10,
    search_query,
  }: any = req.query;

  // Normalize arrays
  const extract = (val: any) => (Array.isArray(val) ? val[0] : val);

  name = extract(name);
  phone = extract(phone);
  patientId = extract(patientId);
  addressLine = extract(addressLine);
  hospitalId = extract(hospitalId);
  email = extract(email);
  guardianName = extract(guardianName);
  page = extract(page);
  limit = extract(limit);
  search_query = extract(search_query);

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const whereCondition: any = {
    isDelete: false,
  };

  // Field filters
  if (name) {
    whereCondition.name = {
      [Op.iLike]: `%${name}%`,
    };
  }

  if (hospitalId !== undefined) {
    whereCondition.hospitalId = Number(hospitalId);
  }

  if (phone) {
    whereCondition.phone = {
      [Op.iLike]: `%${phone}%`,
    };
  }

  if (patientId) {
    whereCondition.patientId = {
      [Op.iLike]: `%${patientId}%`,
    };
  }

  if (addressLine) {
    whereCondition.addressLine = {
      [Op.iLike]: `%${addressLine}%`,
    };
  }

  if (email) {
    whereCondition.email = {
      [Op.iLike]: `%${email}%`,
    };
  }

  if (guardianName) {
    whereCondition.guardianName = {
      [Op.iLike]: `%${guardianName}%`,
    };
  }

  // Global search (kept separate)
  if (search_query) {
    whereCondition[Op.or] = [
      { name: { [Op.iLike]: `%${search_query}%` } },
      { phone: { [Op.iLike]: `%${search_query}%` } },
      { patientId: { [Op.iLike]: `%${search_query}%` } },
      { addressLine: { [Op.iLike]: `%${search_query}%` } },
      { email: { [Op.iLike]: `%${search_query}%` } },
      { guardianName: { [Op.iLike]: `%${search_query}%` } },
    ];
  }

  const patients = await Patient.findAndCountAll({
    where: whereCondition,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    order: [["createdAt", "DESC"]],
  });

  const totalPages = Math.ceil(patients.count / limitNum);

  res.status(200).json({
    success: true,
    data: patients.rows,
    pagination: {
      totalItems: patients.count,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
    error: null,
  });
   return;
});


// GET BLACKLISTED PATIENTS
export const getBlacklistedPatients: any = asyncHandler(async (req: Request, res: Response) => {
  const patients = await Patient.findAll({
    where: { isDelete: true },
    include: [
      { model: PatientVitals, as: "vitals", limit: 1, order: [["createdAt", "DESC"]] },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
    ],
  });

  if (patients.length === 0) {
    res.status(404).json({
      success: false,
      message: "No blacklisted patients found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: patients,
  });
});

// GET ONE PATIENT (with all vitals history)
export const getPatient: any = asyncHandler(async (req: Request, res: Response) => {
  const patient = await Patient.findOne({
    where: { id: req.params.id, isDelete: false },
    include: [
      { model: PatientVitals, as: "vitals", order: [["createdAt", "DESC"]] },
      { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
    ],
  });

  if (!patient) {
    res.status(404).json({
      success: false,
      message: "Patient not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: patient,
  });
});

// UPDATE PATIENT (Allows updating profile + recording new vitals)
export const updatePatient: any = asyncHandler(async (req: Request, res: Response) => {
  const t = await Patient.sequelize!.transaction();
  
  try {
    const patient = await Patient.findOne({ where: { id: req.params.id, isDelete: false } });

    if (!patient) {
      res.status(404).json({ success: false, message: "Patient not found" });
      return;
    }

    // 1. Update Patient Profile Fields
    const {
      name, bloodGroup, gender, maritalStatus,
      patientType, age, dob, mobileNumber, emergencyNumber,
      guardianName, addressLine, location, email, password, userId, hospitalId
    } = req.body;

    // 1.5 Validate userId (if provided)
    if (userId) {
      const userExists = await User.findOne({ where: { id: userId, isDelete: false } });
      if (!userExists) {
        res.status(400).json({ success: false, message: `User with ID ${userId} does not exist.` });
        return;
      }
    }

    await patient.update({
      name, bloodGroup, gender, maritalStatus,
      patientType, age, dob, mobileNumber, emergencyNumber,
      guardianName, addressLine, location, email, password, userId, hospitalId
    }, { transaction: t });

    // 2. Check for NEW Vitals in the same request
    const {
      temperature, pulse, respiratoryRate, spo2, height, weight, waist
    } = req.body;

    if (temperature || pulse || respiratoryRate || spo2 || height || weight || waist) {
      let bmi, bsa;
      if (height && weight) {
        const hInM = height / 100;
        bmi = parseFloat((weight / (hInM * hInM)).toFixed(2));
        bsa = parseFloat((0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425)).toFixed(4));
      }

      await PatientVitals.create({
        patientId: patient.id,
        temperature, pulse, respiratoryRate, spo2,
        height, weight, waist, bmi, bsa
      }, { transaction: t });
    }

    await t.commit();

    // 3. Return updated patient with fresh vitals + user
    const result = await Patient.findByPk(patient.id, {
      include: [
        { model: PatientVitals, as: "vitals", limit: 1, order: [["createdAt", "DESC"]] },
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Patient record updated successfully",
      data: result,
    });

    try {
      await publishEvent("patient_events", "PATIENT_UPDATED", {
        patientId: patient.id,
        userId: patient.userId || null,
        hospitalId: patient.hospitalId,
        patientName: `${name || patient.name} `,
      });
    } catch (err) {
      console.error("Failed to publish PATIENT_UPDATED event:", err);
    }
  } catch (error: any) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message || "Failed to update patient" });
  }
});


// DELETE PATIENT
export const deletePatient: any = asyncHandler(async (req: Request, res: Response) => {
  const patient = await Patient.findOne({ where: { id: req.params.id, isDelete: false } });

  if (!patient) {
    res.status(404).json({ success: false, message: "Patient not found" });
    return;
  }

  // 🔥 Move to blacklist (soft delete)
  await patient.update({
    isActive: false,
    isDelete: true,
    deleteDate: new Date(),
  });

  res.status(200).json({
    success: true,
    message: "Patient moved to blacklist",
  });

  try {
    await publishEvent("patient_events", "PATIENT_DELETED", {
      patientId: patient.id,
      userId: patient.userId || null,
      hospitalId: patient.hospitalId,
    });
  } catch (err) {
    console.error("Failed to publish PATIENT_DELETED event:", err);
  }
});

// REFRESH TOKEN - POST /users/refresh
export const refreshUserToken: any = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "Refresh token missing" });
    return;
  }

  const jwtKey = process.env.JWT_SECRET || "supersecretjwtkey";

  try {
    const decoded: any = jwt.verify(refreshToken, jwtKey);
    const user = await User.findOne({ where: { id: decoded.id, isDelete: false } });

    if (!user) {
      res.status(401).json({ success: false, message: "Invalid refresh token" });
      return;
    }

    const newToken = generateToken({ id: user.id, email: user.email, role: "user", roleId: user.roleId });

    res.status(200).json({
      success: true,
      token: newToken,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
});

// LOGOUT - POST /users/logout
export const logout: any = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

