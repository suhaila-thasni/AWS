import Notification from "../models/notification.model";
import { socketEmitter } from "../utils/socket.emitter";

export const handleStaffEvent = async (routingKey: string, content: any) => {
  if (routingKey === "STAFF_REGISTERED") {
    await Notification.create({
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      message: `New Staff registered: ${content.staffName || "Staff"}. Welcome to the team!`,
    }).catch((err) => console.error("Failed to save consolidated staff notification", err));

    if (content.hospitalId) {
      const msg = `New Staff registered: ${content.staffName || "Staff"}`;
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

  if (routingKey === "STAFF_PASSWORD_RESET" || routingKey === "STAFF_PASSWORD_CHANGED") {
    let msgText = "";
    if (routingKey === "STAFF_PASSWORD_RESET") {
      msgText = `Security Alert: Staff member ${content.staffName || "Staff"} has successfully reset their password.`;
    } else {
      msgText = `Security Update: Staff member ${content.staffName || "Staff"} has changed their password.`;
    }

    await Notification.create({
      hospitalIds: content.hospitalId ? [content.hospitalId] : [],
      message: msgText,
    }).catch((err) => console.error(`Failed to save staff ${routingKey.toLowerCase().replace("_", " ")} notification`, err));

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
