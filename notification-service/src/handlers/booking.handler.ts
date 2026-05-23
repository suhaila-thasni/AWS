import Notification from "../models/notification.model";
import { socketEmitter } from "../utils/socket.emitter";

export const handleBookingEvent = async (routingKey: string, content: any) => {
  if (routingKey === "BOOKING_REGISTERED" || routingKey === "BOOKING_CANCELLED") {
    const msgText = routingKey === "BOOKING_REGISTERED"
      ? `New booking for Dr. ${content.doctorName || "Doctor"} at ${content.hospitalName || "Hospital"} on ${content.booking_date || "the requested date"}`
      : `Booking cancelled for Dr. ${content.doctorName || "Doctor"} at ${content.hospitalName || "Hospital"} on ${content.booking_date || "the requested date"} (ID: ${content.bookingId})`;

    await Notification.create({
      userIds: content.userId ? [content.userId] : [],
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      doctorIds: content.doctorId ? [content.doctorId] : [],
      message: msgText,
    }).catch((err) => console.error(`Failed to save ${routingKey} notification`, err));

    if (content.userId) {
      socketEmitter.to(`user_${content.userId}`).emit("booking_event", { event: routingKey, message: msgText, data: content });
    }
    if (content.hospitalId) {
      socketEmitter.to(`hospital_${content.hospitalId}`).emit("booking_event", { event: routingKey, message: msgText, data: content });
    }

    // Additional target alert triggers
    if (routingKey === "BOOKING_REGISTERED") {
      if (content.doctorId) {
        socketEmitter.to(`user_${content.doctorId}`).emit("booking_alert", {
          message: `New booking registered: ${content.patient_name || "Patient"} (ID: ${content.bookingId})`,
          data: content,
        });
      }
      if (content.hospitalId) {
        socketEmitter.to(`user_${content.hospitalId}`).emit("booking_alert", {
          message: `New booking registered: ${content.patient_name || "Patient"} (ID: ${content.bookingId})`,
          data: content,
        });
      }
    } else {
      // BOOKING_CANCELLED
      if (content.doctorId) {
        socketEmitter.to(`user_${content.doctorId}`).emit("booking_alert", {
          message: `Booking cancelled: ${content.patient_name || "Patient"} (ID: ${content.bookingId})`,
          data: content,
        });
      }
      if (content.hospitalId) {
        socketEmitter.to(`user_${content.hospitalId}`).emit("booking_alert", {
          message: `Booking cancelled: ${content.patient_name || "Patient"} (ID: ${content.bookingId})`,
          data: content,
        });
      }
    }
  }

  if (routingKey === "BOOKING_UPDATED") {
    let msg = "";
    if (content.status === "accepted" || content.status === "declined") {
      msg = `Your booking (ID: ${content.bookingId}) has been ${content.status} by the staff.`;
    } else if (content.status === "completed") {
      msg = `Your booking (ID: ${content.bookingId}) has been marked as completed.`;
    } else {
      msg = `Your booking (ID: ${content.bookingId}) status has been updated to ${content.status || "updated"}.`;
    }

    await Notification.create({
      userIds: content.userId ? [content.userId] : [],
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      message: msg,
    }).catch((err) => console.error("Failed to save booking update notification", err));

    if (content.userId) {
      socketEmitter.to(`user_${content.userId}`).emit("booking_event", { event: routingKey, message: msg, data: content });
    }
    if (content.hospitalId) {
      socketEmitter.to(`hospital_${content.hospitalId}`).emit("booking_event", { event: routingKey, message: msg, data: content });
    }

    // Additional targeted handlers
    if (content.userId) {
      let notifyMsg = "";
      if (content.status === "accepted" || content.status === "declined") {
        notifyMsg = `Your booking (ID: ${content.bookingId}) has been ${content.status}.`;
      } else if (content.status === "completed") {
        notifyMsg = `Your booking (ID: ${content.bookingId}) is completed.`;
      } else {
        notifyMsg = `Your booking (ID: ${content.bookingId}) status is ${content.status || "updated"}.`;
      }

      socketEmitter.to(`user_${content.userId}`).emit("booking_created", {
        message: notifyMsg,
        bookingId: content.bookingId,
        status: content.status,
      });
    }
  }
};
