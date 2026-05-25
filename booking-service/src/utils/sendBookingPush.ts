import { sendPushNotification } from "../events/pushnotification";

interface PushPayload {
  hospitalToken?: string;
  doctorToken?: string;
  userToken?: string;

  patient_name: string;
  doctorName: string;

  booking_date?: string;

  type:
    | "BOOKING_REGISTERED"
    | "BOOKING_UPDATED"
    | "BOOKING_CANCELLED"
    | "BOOKING_ACCEPTED"
    | "BOOKING_COMPLETED";
}

export const sendBookingPushNotifications = async ({
  hospitalToken,
  doctorToken,
  userToken,
  patient_name,
  doctorName,
  booking_date,
  type,
}: PushPayload) => {

  const notifications: Promise<any>[] = [];

  // =========================
  // BOOKING REGISTERED
  // =========================

  if (type === "BOOKING_REGISTERED") {

    if (hospitalToken) {
      notifications.push(
        sendPushNotification({
          token: hospitalToken,
          title: "New Booking",
          body: `${patient_name} booked with Dr. ${doctorName}`,
        })
      );
    }

    if (doctorToken) {
      notifications.push(
        sendPushNotification({
          token: doctorToken,
          title: "New Appointment",
          body: `New booking on ${booking_date}`,
        })
      );
    }

    if (userToken) {
      notifications.push(
        sendPushNotification({
          token: userToken,
          title: "Booking Confirmed",
          body: `Appointment with Dr. ${doctorName} confirmed`,
        })
      );
    }
  }

  // =========================
  // BOOKING UPDATED
  // =========================

  if (type === "BOOKING_UPDATED") {

    if (userToken) {
      notifications.push(
        sendPushNotification({
          token: userToken,
          title: "Booking Updated",
          body: `Your booking has been updated`,
        })
      );
    }
  }

  // =========================
  // BOOKING CANCELLED
  // =========================

  if (type === "BOOKING_CANCELLED") {

    if (userToken) {
      notifications.push(
        sendPushNotification({
          token: userToken,
          title: "Booking Cancelled",
          body: `Your appointment has been cancelled`,
        })
      );
    }

    if (doctorToken) {
      notifications.push(
        sendPushNotification({
          token: doctorToken,
          title: "Appointment Cancelled",
          body: `Patient cancelled appointment`,
        })
      );
    }
  }

  await Promise.allSettled(notifications);

};
