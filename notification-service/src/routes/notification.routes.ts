

import { Router } from "express";

import {

  createNotification,
  getanNotification,
  getNotification,
  getRoleNotifications,
  markAsRead,
  updateData,
  notificationDelete,

} from "../controllers/notification.controllers";

import {
  validate,
  validateParams,
} from "../middleware/validate.middleware";

import {

  createNotificationSchema,
  updateNotificationSchema,
  getByRoleParamsSchema,

} from "../validations/notification.validation";

const router = Router();

/* =========================================================
   CREATE NOTIFICATION
========================================================= */

router.post(

  "/notification",

  validate(createNotificationSchema),

  createNotification

);

/* =========================================================
   GET ALL NOTIFICATIONS
========================================================= */

router.get(

  "/notification",

  getNotification

);

/* =========================================================
   GET ONE NOTIFICATION
========================================================= */

router.get(

  "/notification/:id",

  getanNotification

);

/* =========================================================
   GET ROLE NOTIFICATIONS
   EXAMPLE:
   /notification/user/10
   /notification/doctor/5
========================================================= */

router.get(

  "/notification/:role/:id/:date",

  validateParams(getByRoleParamsSchema),

  getRoleNotifications

);

/* =========================================================
   MARK AS READ
   EXAMPLE:
   /notification/read/user/10/1

   role = user
   userId = 10
   notificationId = 1
========================================================= */

router.put(

  "/notification/read/:role/:userId/:notificationId",

  markAsRead

);

/* =========================================================
   UPDATE NOTIFICATION
========================================================= */

router.put(

  "/notification/:id",

  validate(updateNotificationSchema),

  updateData

);

/* =========================================================
   DELETE NOTIFICATION
========================================================= */

router.delete(

  "/notification/:id",

  notificationDelete

);

export default router;

