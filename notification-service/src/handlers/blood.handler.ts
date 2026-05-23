import Notification from "../models/notification.model";
import { socketEmitter } from "../utils/socket.emitter";

export const handleBloodEvent = async (routingKey: string, content: any) => {
  if (routingKey === "DONOR_REGISTERED" || routingKey === "DONOR_UPDATED" || routingKey === "DONOR_DELETED") {
    let msg = "";
    if (routingKey === "DONOR_REGISTERED") {
      msg = `New blood donor registered: (ID: ${content.donorId}, Blood Group: ${content.bloodGroup || "Unknown"})`;
    } else if (routingKey === "DONOR_UPDATED") {
      msg = `Blood donor profile updated: (ID: ${content.donorId})`;
    } else if (routingKey === "DONOR_DELETED") {
      msg = `Blood donor profile deleted: (ID: ${content.donorId})`;
    }

    await Notification.create({
      superAdminIds: [1],
      message: msg,
    }).catch((err) => console.error(`Failed to save ${routingKey} notification`, err));

    socketEmitter.to("role_1").emit("blood_donor_event", { event: routingKey, message: msg, data: content });
  }

  if (routingKey === "STOCK_UPDATED" || routingKey === "STOCK_CREATED") {
    if (content.hospitalId) {
      socketEmitter.to(`user_${content.hospitalId}`).emit("emergency_alert", {
        message: `Blood Stock Alert: ${content.bloodGroup} inventory is now ${content.count} units.`,
        data: content,
      });
    }
  }
};
