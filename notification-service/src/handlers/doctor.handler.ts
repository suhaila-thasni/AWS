import Notification from "../models/notification.model";
import { socketEmitter } from "../utils/socket.emitter";

export const handleDoctorEvent = async (routingKey: string, content: any) => {
  if (routingKey === "DOCTOR_REGISTERED") {
    await Notification.create({
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      message: `New Doctor registered: Dr. ${content.doctorName || "Doctor"}. Welcome to the platform!`,
    }).catch((err) => console.error("Failed to save consolidated doctor notification", err));

    if (content.hospitalId) {
      const msg = `New Doctor registered: Dr. ${content.doctorName || "Doctor"}`;
      socketEmitter.to(`user_${content.hospitalId}`).emit("hospital_event", {
        event: routingKey,
        message: msg,
        data: content,
      });
      socketEmitter.to(`user_${content.hospitalId}`).emit("emergency_alert", {
        event: routingKey,
        message: msg,
        data: content,
      });
    }
  }

  if (routingKey === "DOCTOR_PASSWORD_RESET" || routingKey === "DOCTOR_PASSWORD_CHANGED") {
    let msgText = "";
    if (routingKey === "DOCTOR_PASSWORD_RESET") {
      msgText = `Security Alert: Dr. ${content.doctorName || "Doctor"} has successfully reset their password.`;
    } else {
      msgText = `Security Update: Dr. ${content.doctorName || "Doctor"} has changed their password.`;
    }

    await Notification.create({
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      message: msgText,
    }).catch((err) => console.error(`Failed to save doctor ${routingKey.toLowerCase().replace("_", " ")} notification`, err));

    // 1. Notify the specific Hospital (Multiple channels for visibility)
    if (content.hospitalId) {
      const targetRoom = `user_${content.hospitalId}`;
      socketEmitter.to(targetRoom).emit("hospital_event", { event: routingKey, message: msgText, data: content });
      socketEmitter.to(targetRoom).emit("emergency_alert", { event: routingKey, message: msgText, data: content });
    }

    // 2. Also Notify SuperAdmin for security oversight
    socketEmitter.to("role_1").emit("hospital_event", { event: routingKey, message: msgText, data: content });
  }
};
