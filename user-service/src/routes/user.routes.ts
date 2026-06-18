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
  getBlacklistedPatients,
  refreshUserToken,
  logout,
  getBlacklistedUsers,
  sendEnquiry
} from "../controllers/user.controller";

import {
  createPrescription,
  getPrescription,
  getAPrescription,
  deletePrescription,
  updateData
} from "../controllers/prescription.controller";

import {
  createLabResult,
  getLabResults,
  getLabResult,
  updateLabResult,
  deleteLabResult,
} from "../controllers/labResult.controller";

import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller";
import
{
addVitals,
deleteVitals,
getLatestVitals,
getVitalsById,
getVitalsByPatient,
updateVitals
} from "../controllers/patientVitals.controller";


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
router.post("/users/auth/reset-password",authenticate, validate(resetPasswordEmailSchema), resetPasswordEmail);
router.put("/users/auth/change-password", authenticate, validate(changePasswordSchema), changePassword);

// Refresh and Logout
router.post("/users/refresh", refreshUserToken);
router.post("/users/logout", authenticate,logout);

router.get("/users",   getUsers);
router.get("/users/blacklist", authenticate, checkPermission("users", "view"), getBlacklistedUsers);
router.get("/users/:id",  validateParams(idParamSchema),  getUser);
router.put("/users/:id", authenticate, validateParams(idParamSchema), validate(updateUserSchema), checkPermission("users", "edit"), updateUser);
router.delete("/users/:id", authenticate, validateParams(idParamSchema), checkPermission("users", "delete"), deleteUser);


// router.post("/users/:id/token", validateParams(idParamSchema), saveExpoToken);
// router.post("/users/test/:id", validateParams(idParamSchema), testPushNotification);


// Patient Routes
router.post("/patients", createPatient);
router.get("/patients", getPatients);
router.get("/patients/blacklist", authenticate, checkPermission("patient", "view"), getBlacklistedPatients);
router.get("/patients/:id",  validateParams(idParamSchema), getPatient);
router.put("/patients/:id", authenticate, checkPermission("patient", "edit"), validateParams(idParamSchema), updatePatient);
router.delete("/patients/:id", authenticate, checkPermission("patient", "delete"), validateParams(idParamSchema), deletePatient);



// Prescription

router.post("/prescription",  createPrescription);
router.get("/prescription", authenticate, checkPermission("prescription", "view"), getPrescription);
router.get("/prescription/:id", authenticate, checkPermission("prescription", "view"), getAPrescription);
router.put("/prescription/:id", authenticate, checkPermission("prescription", "edit"), updateData);
router.delete("/prescription/:id", authenticate, checkPermission("prescription", "delete"), deletePrescription);


// Lab Result
router.post("/lab-results", authenticate,  createLabResult);
router.get("/lab-results", authenticate,  getLabResults);
router.get("/lab-results/:id", authenticate, validateParams(idParamSchema), getLabResult);
router.put("/lab-results/:id", authenticate, validateParams(idParamSchema),  updateLabResult);
router.delete("/lab-results/:id", authenticate, validateParams(idParamSchema),  deleteLabResult);

// Document
router.post("/documents",  createDocument);
router.get("/documents", authenticate,  getDocuments);
router.get("/documents/:id", authenticate, validateParams(idParamSchema),  getDocument);
router.put("/documents/:id", authenticate, validateParams(idParamSchema), updateDocument);
router.delete("/documents/:id", authenticate, validateParams(idParamSchema),  deleteDocument);

router.post("/vitals",  addVitals);
router.get("/vitals", authenticate, getLatestVitals);
router.get("/vitals/:id", authenticate,  getVitalsById);
router.put("/vitals/:id", authenticate,  updateVitals);
router.get("/vitals/patient/:patientId",  getVitalsByPatient);
router.delete("/vitals/:id", authenticate,  deleteVitals);

router.post("/email-enquiry",   sendEnquiry);




export default router;








