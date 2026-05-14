import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Ambulance from "../models/ambulance.model";
import { publishEvent } from "../events/publisher";
import { generateToken } from "../services/jwt.service";
import twilio from "twilio";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const APPLE_TEST_NUMBER = "9999999999";
const APPLE_TEST_OTP = "123456";

// Helper for Twilio Client
const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  return twilio(sid, token);
};

import { httpClient } from "../utils/httpClient";

// REGISTER - POST /ambulance/register
export const Registeration: any = asyncHandler(async (req: any, res: Response): Promise<void> => {
  const { serviceName, address, phone, vehicleType, userId, hospitalId } = req.body;
  

  // Validate user only if provided
  if (userId) {
    try {
      await httpClient.get(
        `${process.env.USER_SERVICE_URL}/users/${userId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
       res.status(404).json({
        success: false,
        message: `User not found with ID ${userId}`,
        error: { code: "USER_NOT_FOUND" }
      });
      return;
    }
  }

  // Validate hospital only if provided
  if (hospitalId) {
    try {
  
      
   await httpClient.get(
        `${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`,
        { headers: { Authorization: req.headers.authorization } }
      );

  
    } catch (err) {
       res.status(404).json({
        success: false,
        message: `Hospital not found with ID ${hospitalId}`,
        error: { code: "HOSPITAL_NOT_FOUND" }
      });
      return;
    }
  }

  const exist = await Ambulance.findOne({ where: { phone } });

  
  if (exist) {
     res.status(400).json({
      success: false,
      message: "Ambulance already exists",
      error: { code: "AMBULANCE_ALREADY_EXISTS" },
    });
    return;
  }

  
  const newAmbulance = await Ambulance.create({
    serviceName,
    address,
    phone,
    vehicleType,
    userId: userId || null,
    hospitalId: hospitalId || null,
  });


  
  await publishEvent("ambulance_events", "AMBULANCE_REGISTERED", {
    ambulanceId: newAmbulance?.id,
    phone: newAmbulance?.phone,
  });

  
   res.status(201).json({
    success: true,
    message: "Registration completed successfully",
    data: newAmbulance.toJSON(),
    error: null,
  });
  return;
});

// LOGIN WITH PHONE (OTP REQUEST) - POST /ambulance/login/phone
export const loginWithPhone: any = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  let numericPhone = phone.replace(/\D/g, "").slice(-10);

  if (!numericPhone) {
    res.status(400).json({ success: false, message: "Invalid phone number" });
    return;
  }

  const ambulance = await Ambulance.scope("withPassword").findOne({ where: { phone: numericPhone } });
  if (!ambulance) {
    res.status(404).json({
      success: false,
      message: "Ambulance not found with this phone number",
    });
    return;
  }

  // Generate 6-digit OTP
  const otp = numericPhone === APPLE_TEST_NUMBER 
    ? APPLE_TEST_OTP 
    : Math.floor(100000 + Math.random() * 900000).toString();
  
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

  await ambulance.update({ otp, otpExpiry });

  // Send OTP via Twilio
  if (numericPhone !== APPLE_TEST_NUMBER) {
    try {
        const client = getTwilioClient();
        const twilioNumber = process.env.TWILIO_NUMBER;

        if (client && twilioNumber) {
            const targetNumber = phone.startsWith("+") ? phone : `+91${numericPhone}`;
            await client.messages.create({
                body: `Your Hosta Ambulance verification code is: ${otp}. Valid for 10 minutes.`,
                from: twilioNumber,
                to: targetNumber,
            });
        }
    } catch (err: any) {
        console.error("Twilio Error:", err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: numericPhone === APPLE_TEST_NUMBER ? "OTP sent (TEST ACCOUNT)" : "OTP sent successfully",
    data: (process.env.NODE_ENV === "development" || numericPhone === APPLE_TEST_NUMBER) ? { otp } : null,
  });
});

// VERIFY OTP - POST /ambulance/otp
export const verifyOtp: any = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  let numericPhone = phone.replace(/\D/g, "").slice(-10);

  const ambulance = await Ambulance.scope("withPassword").findOne({ where: { phone: numericPhone } });

  if (!ambulance || ambulance.otp !== otp || (ambulance.otpExpiry && new Date() > ambulance.otpExpiry)) {
    res.status(400).json({
      success: false,
      message: "Invalid or expired OTP",
    });
    return;
  }

  // Clear OTP fields after verification
  await ambulance.update({ otp: null as any, otpExpiry: null as any });

  const jwtKey = process.env.JWT_SECRET || "supersecretjwtkey";
  const token = jwt.sign({ id: ambulance.id, name: ambulance.serviceName, role: "ambulance" }, jwtKey, {
    expiresIn: "15m"
  });

  const ambulanceJson = ambulance.toJSON();
  
  delete (ambulanceJson as any).otp;
  delete (ambulanceJson as any).otpExpiry;

  res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    token,
    data: ambulanceJson,
  });
});

// GET ONE - GET /ambulance/:id
export const getanAmbulace: any = asyncHandler(async (req: Request, res: Response) => {
  const user = await Ambulance.findByPk(req.params.id);
  if (!user) {
    res.status(404).json({
      success: false,
      message: "Ambulance not found",
      data: null,
      error: { code: "AMBULANCE_NOT_FOUND", details: null },
    });
    return;
  }

  const safeUser = user.toJSON();

  res.status(200).json({
    success: true,
    status: "Success",
    data: safeUser,
    error: null,
  });
});

// UPDATE - PUT /ambulance/:id
export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Whitelist fields to prevent Mass Assignment
  const { serviceName, address, phone, vehicleType } = req.body;
  const updatePayload = { serviceName, address, phone, vehicleType };

  const [affectedCount, affectedRows] = await Ambulance.update(updatePayload, {
    where: { id: id },
    returning: true,
  });

  if (affectedCount === 0) {
    res.status(404).json({
      success: false,
      message: "Ambulance not found",
      data: null,
      error: { code: "AMBULANCE_NOT_FOUND", details: null },
    });
    return;
  }

  const updatedAmbulance = affectedRows[0].toJSON();

  await publishEvent("ambulance_events", "AMBULANCE_UPDATED", {
    ambulanceId: updatedAmbulance.id,
  });

  res.status(200).json({
    success: true,
    message: "successfully updated",
    data: updatedAmbulance,
    error: null,
  });
});

// DELETE - DELETE /ambulance/:id
export const ambulanceDelete: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const ambulance = await Ambulance.findByPk(id);
  if (!ambulance) {
    res.status(404).json({
      success: false,
      message: "Ambulance not found",
      data: null,
      error: { code: "AMBULANCE_NOT_FOUND", details: null },
    });
    return;
  }

  await Ambulance.destroy({
    where: { id: id }
  });

  await publishEvent("ambulance_events", "AMBULANCE_DELETED", {
    ambulanceId: id,
  });

  res.status(200).json({
    success: true,
    message: "Your account deleted successfully",
    data: null,
    error: null,
  });
});

// GET ALL - GET /ambulance

export const getAmbulaces = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let { userId, hospitalId }: any = req.query;

  if (Array.isArray(userId)) userId = userId[0];
  if (Array.isArray(hospitalId)) hospitalId = hospitalId[0];

  const whereClause: any = {};

  if (userId !== undefined) {
    whereClause.userId = Number(userId);
  }

  if (hospitalId !== undefined) {
    whereClause.hospitalId = Number(hospitalId);
  }

  const ambulance = await Ambulance.findAll({
    where: whereClause,
  });

  if (!ambulance.length) {
    res.status(404).json({
      success: false,
      message: "No data found",
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: ambulance,
  });
});



