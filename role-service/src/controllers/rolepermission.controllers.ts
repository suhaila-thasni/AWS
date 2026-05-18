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
        hospitalId,
        labId,
        pharmacyId,
      } = req.body;

      // ✅ Validation
      if (!roleId || !Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          message: "roleId and permissionIds required",
        });
        return; 
      }

      // ✅ Base condition
      const whereClause: any = {
        roleId,
      };

      if (hospitalId) {
        whereClause.hospitalId = hospitalId;
      }

      if (labId) {
        whereClause.labId = labId;
      }

      if (pharmacyId) {
        whereClause.pharmacyId = pharmacyId;
      }

      // ✅ Get existing permissions
      const existingPermissions = await Rolepermission.findAll({
        where: whereClause,
      });

      const existingIds = existingPermissions.map(
        (item: any) => item.permissionId
      );

      // ✅ ADD new permissions
      const newPermissions = permissionIds.filter(
        (id: number) => !existingIds.includes(id)
      );

      if (newPermissions.length > 0) {

        const createData = newPermissions.map((pid: number) => ({
          roleId,
          permissionId: pid,
          hospitalId: hospitalId || null,
          labId: labId || null,
          pharmacyId: pharmacyId || null,
        }));

        await Rolepermission.bulkCreate(createData);
      }

      // ✅ REMOVE missing permissions
      const removePermissions = existingIds.filter(
        (id: number) => !permissionIds.includes(id)
      );

      if (removePermissions.length > 0) {

        await Rolepermission.destroy({
          where: {
            ...whereClause,
            permissionId: removePermissions,
          },
        });
      }

      // ✅ Final updated permissions
      const updatedPermissions = await Rolepermission.findAll({
        where: whereClause,
      });

      res.status(200).json({
        success: true,
        message: "Role permissions synced successfully",
        data: updatedPermissions,
      });

      return;

    } catch (error: any) {

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



