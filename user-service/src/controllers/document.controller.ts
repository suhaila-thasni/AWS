import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Document from "../models/document.model";

export const createDocument: any = asyncHandler(async (req: Request, res: Response) => {
  const { patientId, name, date } = req.body;

  const document = await Document.create({
    patientId,
    name,
    date,
  });

  res.status(201).json({
    success: true,
    message: "Document created successfully",
    data: document,
  });
});

export const getDocuments = asyncHandler(
  async (req: Request, res: Response) : Promise<void> => {
    const normalizeQuery = (value: any) =>
      Array.isArray(value) ? value[0] : value;

    let { patientId } = req.query;

    patientId = normalizeQuery(patientId);

    const whereClause: any = {};

    if (patientId && !isNaN(Number(patientId))) {
      whereClause.patientId = Number(patientId);
    }

    const documents = await Document.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

     res.status(200).json({
      success: true,
      data: documents,
    });
    return;
  }
);

export const getDocument: any = asyncHandler(async (req: Request, res: Response) => {
  const document = await Document.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!document) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: document,
  });
});

export const updateDocument: any = asyncHandler(async (req: Request, res: Response) => {
  const document = await Document.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!document) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
    return;
  }

  await document.update(req.body);

  res.status(200).json({
    success: true,
    message: "Document updated successfully",
    data: document,
  });
});

export const deleteDocument: any = asyncHandler(async (req: Request, res: Response) => {
  const document = await Document.findOne({
    where: { id: req.params.id, isActive: true },
  });

  if (!document) {
    res.status(404).json({
      success: false,
      message: "Document not found",
    });
    return;
  }

  await document.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});
