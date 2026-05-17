import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Booking from "../models/booking.model";
import { publishEvent } from "../events/publisher";
import { httpClient } from "../utils/httpClient";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// REGISTER - POST /boooking/register

export const Registeration: any = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    const {
      patient_dob,
      patient_name,
      patient_place,
      patient_phone,
      userId,
      hospitalId,
      doctorId,
      department,
      displayName,
      booking_date,
      consulting_time
    } = req.body;

    
    
    const errors: string[] = [];

    // ==============================
    // 2. VALIDATE USER
    // ==============================
    try {
      await httpClient.get(
        `${process.env.USER_SERVICE_URL}/users/${userId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch {
      errors.push("User not found");
    }

    // ==============================
    // 3. VALIDATE HOSPITAL
    // ==============================
    try {
      await httpClient.get(
        `${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`,
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch {
      errors.push("Hospital not found");
    }

    // ==============================
    // 4. VALIDATE DOCTOR (FIXED)
    // ==============================
    let doctor: any;

    try {
      const doctorRes = await httpClient.get(
        `${process.env.DOCTOR_SERVICE_URL}/doctor/${doctorId}`,
        { headers: { Authorization: req.headers.authorization } }
      );

      // IMPORTANT FIX: correct axios structure
      doctor = doctorRes.data;
    } catch {
      res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
      return;
    }

    // ==============================
    // 5. STOP IF ERRORS EXIST
    // ==============================
    if (errors.length > 0) {
      res.status(404).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    // ==============================
    // 6. CREATE BOOKING
    // ==============================
    const newbooking = await Booking.create({
      patient_dob,
      patient_name,
      patient_place,
      patient_phone,
      userId,
      hospitalId,
      doctorId,
      booking_date,
      doctor_name: displayName,
    doctor_department: department,
      consulting_time
    });

    // ==============================
    // 7. SAFE EXTERNAL CALLS
    // ==============================

    const doctorName =
      doctor?.data?.displayName; 
      

    await Promise.allSettled([
      // Notification Service
      httpClient.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/notification`,
        {
          hospitalId,
          doctorId,
          message: `New booking for Dr. ${doctorName} on ${booking_date}`,
        },
        { headers: { Authorization: req.headers.authorization} }
      ),

      // BullMQ Service
      axios.post(
        `${process.env.BULMQ_SERVICE_URL}/booking-task/hospital`,
        {
          doctorId,
          hospitalId,
          message: `New booking for Dr. ${doctorName} on ${booking_date}`,
        },
        { headers: { Authorization: req.headers.authorization }}
      ),
    ]);

    // ==============================
    // 8. EVENT PUBLISH
    // ==============================
    await publishEvent("booking_events", "BOOKING_REGISTERED", {
      bookingId: newbooking.id,
    });

    // ==============================
    // 9. RESPONSE
    // ==============================
    res.status(201).json({
      success: true,
      message: "Registration completed",
      data: newbooking,
    });

    return;
  }
);

// GET ONE - GET /booking/:id
export const getanBooking: any = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);

// UPDATE - PUT /booking/:id
export const updateData: any = asyncHandler(
  async (req: Request, res: Response) => {
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

    await publishEvent("booking_events", "BOOKING_UPDATED", {
      bookingId: updatedBooking.id,
    });

    // if (updatedBooking.status !== "cancel") {
    //   // ✅ Use correct values
    //   await axios.post(
    //     `${process.env.BULMQ_SERVICE_URL}/booking-task/users`,
    //     {
    //       patient_phone: updatedBooking?.patient_phone,
    //       doctorId: updatedBooking?.doctorId,
    //       status: updatedBooking?.status,
    //       consulting_time: updatedBooking?.consulting_time,
    //       message: `Booking ${updatedBooking?.status}`,
    //     },
    //      {
    //       headers: { Authorization: req.headers.authorization },
    //     },
    //   );

      // const doctor: any = await httpClient.get(
      //   `${process.env.DOCTOR_SERVICE_URL}/doctor/${updatedBooking.doctorId}`,
      //   {
      //     headers: { Authorization: req.headers.authorization },
      //   },
      // );

      // send notification userId

   // await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notification`, {
   //      userId: updatedBooking.userId,
   //      message: `Your booking with Dr. ${doctor.data.displayName} has been ${updatedBooking.status}.`,
   //    },
   //    {
   //      headers: { Authorization: req.headers.authorization }
   //    }
   //  );

   //  }


    res.status(200).json({
      success: true,
      message: "successfully updated",
      data: updatedBooking,
      error: null,
    });
  },
);

// DELETE - DELETE /booking/:id
export const bookingDelete: any = asyncHandler(
  async (req: Request, res: Response) => {
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
      where: { id: id },
    });

    res.status(200).json({
      success: true,
      message: "Your account deleted successfully",
      status: 200,
      data: null,
      error: null,
    });
  },
);

// GET ALL - GET /booking

export const getBookings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let { userId, hospitalId, doctorId }: any = req.query;

  if (Array.isArray(userId)) userId = userId[0];
  if (Array.isArray(hospitalId)) hospitalId = hospitalId[0];
    if (Array.isArray(doctorId)) doctorId = doctorId[0];


  const whereClause: any = {};

  if (userId !== undefined) {
    whereClause.userId = Number(userId);
  }

  if (hospitalId !== undefined) {
    whereClause.hospitalId = Number(hospitalId);
  }

    if (doctorId !== undefined) {
    whereClause.doctorId = Number(doctorId);
  }

  const booking = await Booking.findAll({
    where: whereClause,
    order: [["createdAt", "DESC"]],
  });

  if (!booking.length) {
    res.status(404).json({
      success: false,
      message: "No data found",
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});
