import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Notification from "../models/notification.model";
import { publishEvent } from "../events/publisher";
import { Op } from "sequelize";

// CREATE - POST /notification/register
export const createNotification: any = asyncHandler(async (req: Request, res: Response) => {
  const { 
    userIds, hospitalIds, labIds, staffIds, pharmacyIds, doctorIds, adminIds, superAdminIds, 
    message 
  } = req.body;

  const newNotification = await Notification.create({
    userIds: userIds || [],
    hospitalIds: hospitalIds || [],
    labIds: labIds || [],
    staffIds: staffIds || [],
    pharmacyIds: pharmacyIds || [],
    doctorIds: doctorIds || [],
    adminIds: adminIds || [],
    superAdminIds: superAdminIds || [],
    message
  });

  await publishEvent("notification_events", "NOTIFICATION_CREATED", {
    notificationId: newNotification.id,
  });

  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: newNotification,
    error: null,
  });
});

// GET ONE - GET /notification/:id
export const getanNotification: any = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findByPk(req.params.id);
  if (!notification) {
    res.status(404).json({
      success: false,
      message: "Notification not found",
      data: null,
      error: { code: "NOTIFICATION_NOT_FOUND", details: null },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "Success",
    data: notification,
    error: null,
  });
});

// GET ALL UNREAD - GET /notification/unread/:id/:role
export const getAllUnreadNotifications: any = asyncHandler(async (req: Request, res: Response) => {
  const { id, role } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const numericId = Number(id);
  let whereCondition: any = {};

  switch (role) {
    case "user": whereCondition = { userIds: { [Op.contains]: [numericId] } }; break;
    case "doctor": whereCondition = { doctorIds: { [Op.contains]: [numericId] } }; break;
    case "staff": whereCondition = { staffIds: { [Op.contains]: [numericId] } }; break;
    case "lab": whereCondition = { labIds: { [Op.contains]: [numericId] } }; break;
    case "pharmacy": whereCondition = { pharmacyIds: { [Op.contains]: [numericId] } }; break;
    case "hospital": whereCondition = { hospitalIds: { [Op.contains]: [numericId] } }; break;
    case "superadmin": whereCondition = { superAdminIds: { [Op.contains]: [numericId] } }; break;

    default:
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    status: "Success",
    data: notifications,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    },
    error: null,
  });
});

// GET ALL READ - GET /notification/read/:id/:role
export const getAllReadNotifications: any = asyncHandler(async (req: Request, res: Response) => {
  const { id, role } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const numericId = Number(id);
  let whereCondition: any = {};

  switch (role) {
    case "user": whereCondition = { userIds: { [Op.contains]: [numericId] } }; break;
    case "doctor": whereCondition = { doctorIds: { [Op.contains]: [numericId] } }; break;
    case "staff": whereCondition = { staffIds: { [Op.contains]: [numericId] } }; break;
    case "lab": whereCondition = { labIds: { [Op.contains]: [numericId] } }; break;
    case "pharmacy": whereCondition = { pharmacyIds: { [Op.contains]: [numericId] } }; break;
    case "hospital": whereCondition = { hospitalIds: { [Op.contains]: [numericId] } }; break;
    case "superadmin": whereCondition = { superAdminIds: { [Op.contains]: [numericId] } }; break;
    default:
      res.status(400).json({ success: false, message: "Invalid role" });
      return;
  }

  const { count, rows: notifications } = await Notification.findAndCountAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  res.status(200).json({
    success: true,
    status: "Success",
    data: notifications,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    },
    error: null,
  });
});

// UPDATE - PUT /notification/:id
export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  // Prevent updating restricted fields
  const restrictedFields = ['userIds', 'hospitalIds', 'doctorIds', 'labIds', 'staffIds', 'pharmacyIds', 'adminIds', 'superAdminIds'];
  restrictedFields.forEach(field => delete updatePayload[field]);

  const [affectedCount, updatedNotifications] = await Notification.update(updatePayload, {
    where: { id: id },
    returning: true,
  });

  if (affectedCount === 0) {
    res.status(404).json({
      success: false,
      message: "Notification not found",
      data: null,
      error: { code: "NOTIFICATION_NOT_FOUND", details: null },
    });
    return;
  }

  await publishEvent("notification_events", "NOTIFICATION_UPDATED", {
    notificationId: updatedNotifications[0].id,
  });

  res.status(200).json({
    success: true,
    message: "Successfully updated",
    data: updatedNotifications[0],
    error: null,
  });
});

// DELETE - DELETE /notification/:id
export const notificationDelete: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await Notification.destroy({
    where: { id: id }
  });

  if (!deleted) {
    res.status(404).json({
      success: false,
      message: "Notification not found",
      data: null,
      error: { code: "NOTIFICATION_NOT_FOUND", details: null },
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
    data: null,
    error: null,
  });
});

// GET ALL - GET /notification
export const getNotification: any = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { count, rows: notifications } = await Notification.findAndCountAll({
    limit,
    offset,
    order: [["createdAt", "DESC"]]
  });

  res.status(200).json({
    success: true,
    status: "Success",
    data: notifications,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    },
    error: null,
  });
});


