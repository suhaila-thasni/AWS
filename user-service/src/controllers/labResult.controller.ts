import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import LabResult from "../models/labResult.model";

export const createLabResult: any = asyncHandler(async (req: Request, res: Response) => {
  const { labId, hospitalId, patientId, doctorId, department, testName,  status } = req.body;

  const labResult = await LabResult.create({
    labId,
    hospitalId,
    patientId,
    doctorId,
    department,
    testName,
    status,
  });

  res.status(201).json({
    success: true,
    message: "Lab result created successfully",
    data: labResult,
  });
});



export const getLabResults: any = asyncHandler(async (req: Request, res: Response) => {

    const normalizeQuery = (value: any) =>
      Array.isArray(value) ? value[0] : value;

    let { patientId } = req.query;

    patientId = normalizeQuery(patientId);

    const whereClause: any = {};

    if (patientId && !isNaN(Number(patientId))) {
      whereClause.patientId = Number(patientId);
    }


  const labResults = await LabResult.findAll({
      where: whereClause,
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    data: labResults,
  });
});

export const getLabResult: any = asyncHandler(async (req: Request, res: Response) => {
  const labResult = await LabResult.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!labResult) {
    res.status(404).json({
      success: false,
      message: "Lab result not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: labResult,
  });
});

export const updateLabResult: any = asyncHandler(async (req: Request, res: Response) => {
  const labResult = await LabResult.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!labResult) {
    res.status(404).json({
      success: false,
      message: "Lab result not found",
    });
    return;
  }

  await labResult.update(req.body);

  res.status(200).json({
    success: true,
    message: "Lab result updated successfully",
    data: labResult,
  });
});

export const deleteLabResult: any = asyncHandler(async (req: Request, res: Response) => {
  const labResult = await LabResult.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!labResult) {
    res.status(404).json({
      success: false,
      message: "Lab result not found",
    });
    return;
  }

  await labResult.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: "Lab result deleted successfully",
  });
});
