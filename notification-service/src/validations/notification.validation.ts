import { z } from "zod";

export const createNotificationSchema = z.object({
  userIds: z.array(z.number()).optional(),
  hospitalIds: z.array(z.number()).optional(),
  labIds: z.array(z.number()).optional(),
  staffIds: z.array(z.number()).optional(),
  pharmacyIds: z.array(z.number()).optional(),
  doctorIds: z.array(z.number()).optional(),
  adminIds: z.array(z.number()).optional(),
  superAdminIds: z.array(z.number()).optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message too long"),
});

export const updateNotificationSchema = z.object({
  message: z.string().optional(),
  // Read tracking is currently handled by removing from the unread list logic 
  // or will be implemented later in a more robust way.
});

export const getByRoleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  role: z.enum(["user", "doctor", "staff", "lab", "pharmacy", "hospital", "superadmin", "admin"]),
});
