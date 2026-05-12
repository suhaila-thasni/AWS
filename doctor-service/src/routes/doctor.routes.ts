import { Router } from "express";
import {
  Registeration,
  login,
  loginWithPhone,
  verifyOtp,
  getanDoctor,
  updateData,
  doctorDelete,
  getDoctors,
  changepassword,
  sendDoctorOtp,
  verifyDoctorOtp,
  resetDoctorPassword,
  changeDoctorPassword,
  refreshDoctorToken,
  logout,
} from "../controllers/doctor.controllers";
import { validate } from "../middleware/validate.middleware";
import { 
  registerDoctorSchema, 
  loginDoctorSchema, 
  loginWithPhoneSchema, 
  loginWithEmailSchema,
  verifyOtpSchema, 
  resetPasswordSchema,
  changePasswordSchema 
} from "../validators/doctor.validator";
import { authenticate } from "../middleware/authenticate";
import { checkPermission } from "../middleware/role.middleware";
import { check } from "zod";


const router = Router();



// Auth
router.post("/doctor",  validate(registerDoctorSchema), Registeration);
router.post("/doctor/login", validate(loginDoctorSchema), login);
router.post("/doctor/login/phone", validate(loginWithPhoneSchema), loginWithPhone);
router.post("/doctor/otp", validate(verifyOtpSchema), verifyOtp);
                  
// Production Auth Pattern
router.post("/doctor/auth/send-otp", validate(loginWithEmailSchema), sendDoctorOtp);
router.post("/doctor/auth/verify-otp", validate(verifyOtpSchema), verifyDoctorOtp);
router.post("/doctor/auth/reset-password", validate(resetPasswordSchema), resetDoctorPassword);
router.put("/doctor/auth/change-password",  validate(changePasswordSchema), changeDoctorPassword);
router.post("/doctor/refresh", refreshDoctorToken);
router.post("/doctor/logout", logout);

// Legacy/Alternative (Keeping for compatibility but securing)
// router.put("/doctor/change-password", authenticate, validate(changePasswordSchema), changeDoctorPassword);


// CRUD

router.get("/doctor", getDoctors);
router.get("/doctor/:id",getanDoctor);
router.put("/doctor/:id",  updateData);
router.delete("/doctor/:id", doctorDelete);


export default router;``
