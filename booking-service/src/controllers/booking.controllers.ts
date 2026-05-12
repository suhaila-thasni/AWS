import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Booking from "../models/booking.model";
import { publishEvent } from "../events/publisher";
import { httpClient } from "../utils/httpClient";
import axios from "axios";

// REGISTER - POST /boooking/register
export const Registeration: any = asyncHandler(async (req: any, res: Response) => {
  console.log("DEBUG: Incoming Booking Body:", req.body);
  const {
    patient_dob, patient_name, patient_place, patient_phone,
    userId: bodyUserId, hospitalId, doctorId,
    booking_date, consulting_time, status
  } = req.body;

  // 0. Validation: Ensure required fields are present
  if (!patient_name || !patient_phone || !doctorId || !hospitalId || !booking_date || !consulting_time) {
    res.status(400).json({
      success: false,
      message: "Missing required fields.",
      receivedBody: req.body, // This will show us what the server actually got
      missing: {
        patient_name: !patient_name,
        patient_phone: !patient_phone,
        doctorId: !doctorId,
        hospitalId: !hospitalId,
        booking_date: !booking_date,
        consulting_time: !consulting_time
      }
    });
    return;
  }

  const tokenUserId = req.user.id;
  const authHeader = req.headers.authorization;

  // 1. Security Check: userId in body must match token ID
  if (bodyUserId && Number(bodyUserId) !== Number(tokenUserId)) {
    res.status(403).json({
      success: false,
      message: "Security violation: The provided userId does not match your authenticated account.",
      error: { code: "USER_ID_MISMATCH" }
    });
    return;
  }

  const userId = tokenUserId; // Source of truth
  const errors: string[] = [];

  // 2. Cross-Service Validation
  try {
    // 👤 Validate User
    try {
      await httpClient.get(`http://user-service:3002/users/${userId}`, {
        headers: { Authorization: authHeader }
      });
    } catch (err) {
      errors.push(`User ${userId} not found.`);
    }

    // 👨‍⚕️ Validate Doctor
    try {
      await httpClient.get(`http://doctor-service:3007/doctor/${doctorId}`, {
        headers: { Authorization: authHeader }
      });
    } catch (err) {
      errors.push(`Doctor ${doctorId} not found.`);
    }

    // 🏥 Validate Hospital
    try {
      await httpClient.get(`http://hospital-service:3009/hospital/${hospitalId}`, {
        headers: { Authorization: authHeader }
      });
    } catch (err) {
      errors.push(`Hospital ${hospitalId} not found.`);
    }

    if (errors.length > 0) {
      res.status(404).json({
        success: false,
        message: "Validation failed for one or more entities.",
        errors,
        error: { code: "ENTITY_NOT_FOUND" }
      });
      return;
    }

  } catch (globalErr: any) {
    console.error("Booking validation error:", globalErr.message);
  }

  const newbooking = await Booking.create({
    patient_dob, patient_name, patient_place, patient_phone,
    userId, hospitalId, doctorId,
    booking_date, consulting_time, status
  });

  try {
    await publishEvent("booking_events", "BOOKING_REGISTERED", {
      bookingId: newbooking.id,
      patient_name: newbooking.patient_name,
      userId: newbooking.userId,
      hospitalId: newbooking.hospitalId,
      doctorId: newbooking.doctorId
    });
    console.log("✅ Published BOOKING_REGISTERED event for userId:", newbooking.userId);
  } catch (err) {
    console.error("Failed to publish booking event:", err);
    // We don't return 500 here because the booking is already saved in DB
  }

  res.status(201).json({
    success: true,
    message: "Registeration completed successfully",
    data: newbooking,
    error: null,
  });
});

// GET ONE - GET /booking/:id
export const getanBooking: any = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findByPk(req.params.id);
  if (!booking) {
    res.status(404).json({
      success: false,
      message: "booking not found",
      data: null,
      error: { code: "BOOKING_NOT_FOUND", details: null },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "Success",
    data: booking,
    error: null,
  });
});

// UPDATE - PUT /booking/:id
export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const booking = await Booking.update(updatePayload, {
    where: { id: id },
    returning: true,
  });


  if (!booking[1] || booking[1].length === 0) {
    res.status(404).json({
      success: false,
      message: "booking not found",
      status: 200,
      data: null,
      error: { code: "BOOKING_NOT_FOUND", details: null },
    });
    return;
  }

  // ✅ Get updated booking object
  const updatedBooking = booking[1][0];

  try {
    await publishEvent("booking_events", "BOOKING_UPDATED", {
      bookingId: updatedBooking.id,
    });
  } catch (err) {
    console.error("Failed to publish update event:", err);
  }

  // ✅ Use correct values (Service name instead of localhost)
  try {
    await axios.post('http://speciality-service:3008/booking-task', {
      patient_phone: updatedBooking.patient_phone,
      doctorId: updatedBooking.doctorId,
      status: updatedBooking.status,
      consulting_time: updatedBooking.consulting_time,
      message: `Booking ${updatedBooking.status}`
    });
  } catch (err) {
    console.error("Failed to call speciality-service:", err);
  }

  res.status(200).json({
    success: true,
    message: "successfully updated",
    data: updatedBooking,
    error: null,
  });
});

// DELETE - DELETE /booking/:id
export const bookingDelete: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const staff = await Booking.findByPk(id);
  if (!staff) {
    res.status(404).json({
      success: false,
      message: "booking not found",
      data: null,
      error: { code: "BOOKING_NOT_FOUND", details: null },
    });
    return;
  }


  await Booking.destroy({
    where: { id: id }
  });

  await publishEvent("booking_events", "BOOKING_CANCELLED", {
    bookingId: id,
  });



  res.status(200).json({
    success: true,
    message: "Your account deleted successfully",
    status: 200,
    data: null,
    error: null,
  });
});

// GET ALL - GET /booking
export const getBooking: any = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findAll();

  if (booking.length === 0) {
    res.status(404).json({
      success: false,
      message: "No data found",
      data: null,
      error: { code: "NO_DATA_FOUND", details: null },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "Success",
    data: booking,
    error: null,
  });
});


