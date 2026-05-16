import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Rolepermission from "../models/rolepermission.model";
import { publishEvent } from "../events/publisher";

// REGISTER - POST /Rolepermission

export const createRolepermission: any = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {

    try {

      const {
        roleId,
        permissionIds,
        pharmacyId,
        hospitalId,
        labId,
      } = req.body;

      // ✅ Validation
      if (!roleId || !permissionIds) {
        res.status(400).json({
          success: false,
          message: "roleId and permissionIds required",
        });
        return;
      }

      // ✅ permissionIds must array
      if (!Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          message: "permissionIds must be array",
        });
        return;
      }

      // ✅ Create array data
      const rolePermissions = permissionIds.map((pid: number) => ({
        roleId,
        permissionId: pid,
        pharmacyId: pharmacyId || null,
        hospitalId: hospitalId || null,
        labId: labId || null,
      }));

      // ✅ Insert data
      const result = await Rolepermission.bulkCreate(rolePermissions);

      res.status(201).json({
        success: true,
        message: "Role permissions assigned successfully",
        data: result,
      });

      return;

    } catch (error: any) {

      console.log("ERROR =>", error);

      // ✅ Duplicate unique error
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.name === "SequelizeBulkRecordError" ||
        error?.parent?.code === "23505"
      ) {
        res.status(400).json({
          success: false,
          message: "This role already has this permission",
        });
        return;
      }

      // ✅ Foreign key error
      if (error?.parent?.code === "23503") {
        res.status(400).json({
          success: false,
          message: "Invalid roleId or permissionId",
        });
        return;
      }

      // ✅ Generic error
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });

      return;
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
export const getRolepermission: any = asyncHandler(async (req: Request, res: Response) => {


   let { hospitalId, labId, pharmacyId }: any = req.query;

    if (Array.isArray(hospitalId)) hospitalId = hospitalId[0];
        if (Array.isArray(labId)) labId = labId[0];
    if (Array.isArray(pharmacyId)) pharmacyId = pharmacyId[0];


      const whereClause: any = {};


  if (hospitalId !== undefined) {
    whereClause.hospitalId = Number(hospitalId);
  }

    if (labId !== undefined) {
    whereClause.labId = Number(labId);
  }

    if (pharmacyId !== undefined) {
    whereClause.pharmacyId = Number(pharmacyId);
  }

  const rolepermission = await Rolepermission.findAll({
    where: whereClause,
  });



  if (rolepermission.length === 0) {
    res.status(404).json({
      success: false,
      message: "No data found",
      data: null,
      error: { code: "NO_DATA_FOUND", details: null },
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



