import { Router } from "express";
import {
  registerUser,
  loginUser,
  loginWithPhone,
  verifyOtp,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  resetPassword,
  sendOtpEmail,
  verifyOtpEmail,
  resetPasswordEmail,
  changePassword,
  saveExpoToken,
  testPushNotification,
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  refreshUserToken,
  logout
} from "../controllers/user.controller";

import {
  createPrescription,
  getPrescription,
  getAPrescription,
  deletePrescription,
  updateData
} from "../controllers/prescription.controller";


import { validate, validateParams } from "../middleware/validate.middleware";
import { registerSchema, loginSchema, idParamSchema, loginWithPhoneSchema, verifyOtpSchema, updateUserSchema, sendOtpEmailSchema, verifyOtpEmailSchema, resetPasswordEmailSchema, changePasswordSchema } from "../validators/user.validator";
import { authenticate, restrictTo } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";

const router = Router();                              

// User Routes
router.post("/users", validate(registerSchema), registerUser);
router.post("/users/login", validate(loginSchema), loginUser);
router.post("/users/login/phone", validate(loginWithPhoneSchema), loginWithPhone);
router.post("/users/otp", validate(verifyOtpSchema), verifyOtp);
// router.post("/users/password", resetPassword);

// Email Password Reset Flow
router.post("/users/auth/send-otp", validate(sendOtpEmailSchema), sendOtpEmail);
router.post("/users/auth/verify-otp", validate(verifyOtpEmailSchema), verifyOtpEmail);
router.post("/users/auth/reset-password", validate(resetPasswordEmailSchema), resetPasswordEmail);
router.put("/users/auth/change-password",  validate(changePasswordSchema), changePassword);

// Refresh and Logout
router.post("/users/refresh", refreshUserToken);
router.post("/users/logout", authenticate,logout);

router.get("/users",   getUsers);
router.get("/users/:id", validateParams(idParamSchema), getUser);
router.put("/users/:id",  validateParams(idParamSchema), validate(updateUserSchema),  updateUser);
router.delete("/users/:id",  validateParams(idParamSchema),  deleteUser);


// router.post("/users/:id/token", validateParams(idParamSchema), saveExpoToken);
// router.post("/users/test/:id", validateParams(idParamSchema), testPushNotification);


// Patient Routes
router.post("/patients",  createPatient);
router.get("/patients",  getPatients);
router.get("/patients/:id",  validateParams(idParamSchema), getPatient);
router.put("/patients/:id", validateParams(idParamSchema), updatePatient);
router.delete("/patients/:id",  validateParams(idParamSchema), deletePatient);



// Prescription

router.post("/prescription",  createPrescription);
router.get("/prescription",  getPrescription);
router.get("/prescription/:id",  getAPrescription);
router.put("/prescription/:id",  updateData);
router.delete("/prescription/:id",  deletePrescription);


export default router;








