import { admin } from "../config/firebase-admin";

interface SendNotificationParams {
  token: string;
  title: string;
  body: string;
}

export const sendPushNotification = async ({
  token,
  title,
  body,
}: SendNotificationParams) => {
  try {
    const message: admin.messaging.Message = {
      token,

      notification: {
        title,
        body,
      },

      android: {
        notification: {
          sound: 'default',
          icon: 'ic_notification',
          channelId: 'default-channel',
        },
      },

      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },

      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    };

    const response = await admin.messaging().send(message);

    console.log('✅ Notification sent:', response);

    return response;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};
