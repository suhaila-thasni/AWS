import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Rolepermission from "../models/rolepermission.model";
import { publishEvent } from "../events/publisher";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// REGISTER - POST /Rolepermission

export const createRolepermission = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { roleId, permissionIds, pharmacyId, hospitalId, labId } = req.body;

      if (!roleId || !Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          message: "roleId and permissionIds array required",
        });
        return;
      }

      // 1️⃣ Get existing permissions
      const existing = await Rolepermission.findAll({
        where: { roleId },
      });

      const existingIds = existing.map((p: any) => p.permissionId);

      // 2️⃣ Find what to delete
      const toDelete = existingIds.filter(
        (id: number) => !permissionIds.includes(id)
      );

      // 3️⃣ Find what to add
      const toAdd = permissionIds.filter(
        (id: number) => !existingIds.includes(id)
      );

      // 4️⃣ DELETE removed permissions
      if (toDelete.length > 0) {
        await Rolepermission.destroy({
          where: {
            roleId,
            permissionId: toDelete,
          },
        });
      }

      // 5️⃣ INSERT new permissions only
      const newRecords = toAdd.map((pid: number) => ({
        roleId,
        permissionId: pid,
        pharmacyId: pharmacyId || null,
        hospitalId: hospitalId || null,
        labId: labId || null,
      }));

      if (newRecords.length > 0) {
        await Rolepermission.bulkCreate(newRecords);
      }

      res.status(200).json({
        success: true,
        message: "Role permissions synced successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
);


// GET ONE - GET /Rolepermission/:id
export const getanRolepermission : any = asyncHandler(async (req: Request, res: Response) => {
  const rolepermission = await Rolepermission.findByPk(req.params.id);
  if (!rolepermission) {
    res.status(404).json({
      success: false,
      message: "Rolepermission not found",
      data: null,
      error: { code: "ROLEPERMISSION_NOT_FOUND", details: null },
    });
    return;
  }

  res.status(200).json({
    success: true,
    status: "Success",
    data: rolepermission,
    error: null,
  });
});

// UPDATE - PUT /Rolepermission/:id
export const updateData: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatePayload = req.body;

  const rolepermission = await Rolepermission.update(updatePayload, {
    where: { id: id },
    returning: true,
  });


  if (!rolepermission[1] || rolepermission[1].length === 0) {
    res.status(404).json({
      success: false,
      message: "Rolepermission not found",
      status: 200,
      data: null,
      error: { code: "ROLEPERMISSION_NOT_FOUND", details: null },
    });
    return;
  }

  // ✅ Get updated booking object
  const updatedRolepermission = Rolepermission[1][0];

  await publishEvent("rolepermission_events", "ROLEPERMISSION_UPDATED", {
    RolepermissionId: updatedRolepermission.id,
  });



  res.status(200).json({
    success: true,
    message: "successfully updated",
    data: updatedRolepermission,
    error: null,
  });
});

// DELETE - DELETE /Rolepermission/:id
export const rolepermissionDelete: any = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const rolepermission = await Rolepermission.findByPk(id);
  if (!rolepermission) {
    res.status(404).json({
      success: false,
      message: "Rolepermission not found",
      data: null,
      error: { code: "ROLEPERMISSION_NOT_FOUND", details: null },
    });
    return;
  }


  await Rolepermission.destroy({
    where: { id: id }
  });


  res.status(200).json({
    success: true,
    message: "Your account deleted successfully",
    status: 200,
    data: null,
    error: null,
  });
});

// GET ALL - GET /Rolepermission
export const getRolepermission: any = asyncHandler(
  async (req: Request, res: Response) : Promise<void> => {

    let { hospitalId, labId, pharmacyId, roleId }: any = req.query;

    // Handle array query params
    hospitalId = Array.isArray(hospitalId) ? hospitalId[0] : hospitalId;
    labId = Array.isArray(labId) ? labId[0] : labId;
    pharmacyId = Array.isArray(pharmacyId) ? pharmacyId[0] : pharmacyId;
    roleId = Array.isArray(roleId) ? roleId[0] : roleId;

    const whereClause: any = {};

    // Dynamic filters
    if (hospitalId) {
      whereClause.hospitalId = Number(hospitalId);
    }

    if (labId) {
      whereClause.labId = Number(labId);
    }

    if (pharmacyId) {
      whereClause.pharmacyId = Number(pharmacyId);
    }

    if (roleId) {
      whereClause.roleId = Number(roleId);
    }

    const rolepermission = await Rolepermission.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
    });

    if (rolepermission.length === 0) {
      res.status(404).json({
        success: false,
        message: "No data found",
        data: [],
        error: {
          code: "NO_DATA_FOUND",
          details: null,
        },
      });
       return;
    }

   res.status(200).json({
      success: true,
      status: "Success",
      data: rolepermission,
      error: null,
    });
     return;
  }
);



export const rolepermissionAssgin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      hospitalId,
      roleId,
      userType,
      doctorIds = [],
      staffIds = [],
    }: any = req.body; // Prefer body instead of query

    if (!hospitalId || !roleId || !userType) {
      res.status(400).json({
        success: false,
        message: "hospitalId, roleId and userType are required",
      });
      return;
    }

    // Check hospital exists
    const hospital = await axios.get(
      `${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`
    );

    if (!hospital?.data) {
      res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
      return;
    }

    // =========================
    // DOCTOR ROLE ASSIGNMENT
    // =========================
    if (userType.toLowerCase() === "doctor") {
  const selectedDoctorIds = Array.isArray(doctorIds)
    ? doctorIds
    : String(doctorIds).split(",");

  for (const doctorId of selectedDoctorIds) {
    try {
      const doctorResponse = await axios.get(
        `${process.env.DOCTOR_SERVICE_URL}/doctor?hospitalId=${hospitalId}&doctorId=${doctorId}`
      );

      const doctor = doctorResponse?.data?.data;

      if (doctor) {
        await axios.put(
          `${process.env.DOCTOR_SERVICE_URL}/doctor/${doctorId}`,
          {
            roleId,
          }
        );
      }
    } catch (error) {
      console.error(`Failed to update doctor ${doctorId}`, error);
    }
  }
}

    // =========================
    // STAFF ROLE ASSIGNMENT
    // =========================

        if (userType.toLowerCase() === "staff") {
  const selectedStaffIds = Array.isArray(staffIds)
    ? staffIds
    : String(staffIds).split(",");

  for (const staffId of selectedStaffIds) {
    try {
      const staffsResponse = await axios.get(
        `${process.env.STAFF_SERVICE_URL}/staff?hospitalId=${hospitalId}&staffId=${staffId}`
      );

      const staff = staffsResponse?.data?.data;

      if (staff) {
        await axios.put(
          `${process.env.STAFF_SERVICE_URL}/staff/${staffId}`,
          {
            roleId,
          }
        );
      }
    } catch (error) {
      console.error(`Failed to update staff ${staffId}`, error);
    }
  }
}


    res.status(200).json({
      success: true,
      message: "Role assignment updated successfully",
    });
  }
);



