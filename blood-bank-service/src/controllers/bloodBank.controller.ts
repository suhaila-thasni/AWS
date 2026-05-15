import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import BloodBank from "../models/bloodBank.model";
import { httpClient } from "../utils/httpClient";
import dotenv from "dotenv";
dotenv.config();

const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

// 🧩 Create or Update Stock (scoped by hospitalId)
export const createOrUpdateStock = asyncHandler(async (req: any, res: Response) => {
  const { hospitalId, bloodGroup, count } = req.body;
  

  // 🏥 Validate Hospital (Cross-Service: hospital-service)
  try {
    await httpClient.get(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${hospitalId}`, {
      headers: { Authorization: req.headers.authorization }
    });
  } catch (error: any) {
    console.error("Hospital validation failed:", error.message);
    res.status(404).json({
      success: false,
      message: `Hospital with ID ${hospitalId} does not exist in the hospital service.`,
      error: { code: "HOSPITAL_NOT_FOUND" }
    });
    return;
  }

  if (!VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    res.status(400).json({ 
      success: false, 
      message: `Invalid blood group. Must be one of: ${VALID_BLOOD_GROUPS.join(", ")}` 
    });
    return;
  }

  // Smart Upsert Logic — scoped by hospitalId + bloodGroup
  let stock = await BloodBank.findOne({ where: { hospitalId, bloodGroup } });

  if (stock) {
    // ⚔️ Add to existing count
    const newCount = Number(stock.count) + Number(count || 0);
    await stock.update({ count: newCount });
    res.status(200).json({ 
      success: true, 
      message: `Added ${count} units. New total for ${bloodGroup} is ${newCount} units for hospital ${hospitalId}`, 
      data: stock 
    });
  } else {
    // ⚔️ Create new record
    stock = await BloodBank.create({ hospitalId, bloodGroup, count: count || 0 });
    res.status(201).json({ 
      success: true, 
      message: `Blood group ${bloodGroup} record created with ${count} units for hospital ${hospitalId}`, 
      data: stock 
    });
  }
});

// 🔍 Get All Inventory


export const getAllStock = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  let { hospitalId }: any = req.query;

  // convert array → single value
  if (Array.isArray(hospitalId)) {
    hospitalId = hospitalId[0];
  }

  const whereClause: any = {};

  if (hospitalId) {
    whereClause.hospitalId = Number(hospitalId); // ✅ ensure integer match
  }

  const bloodBank = await BloodBank.findAll({
    where: whereClause,
  });

  if (bloodBank.length === 0) {
    res.status(404).json({
      success: false,
      message: "No data found",
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: bloodBank,
  });
});


// 🔍 Get All Stocks by Hospital ID
export const getStocksByHospitalId = asyncHandler(async (req: Request, res: Response) => {
  const { hospitalId } = req.params;

  const stocks = await BloodBank.findAll({
    where: { hospitalId },
    order: [['bloodGroup', 'ASC']]
  });

  if (stocks.length === 0) {
    res.status(404).json({ 
      success: false, 
      message: `No blood bank inventory found for hospital ${hospitalId}`,
      data: null,
      error: { code: "NO_DATA_FOUND", details: null }
    });
    return;
  }

  res.status(200).json({ success: true, count: stocks.length, data: stocks });
});

// 🔍 Get One Stock by ID
export const getStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const stock = await BloodBank.findByPk(id);
  if (!stock) {
    res.status(404).json({ success: false, message: `No inventory record found with ID ${id}` });
    return;
  }
  res.status(200).json({ success: true, data: stock });
});

// ✏️ Update Stock by ID
export const updateStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { count } = req.body;

  const stock = await BloodBank.findByPk(id);
  if (!stock) {
    res.status(404).json({ success: false, message: `No inventory record found with ID ${id}` });
    return;
  }
  
  await stock.update({ count });
  res.status(200).json({ success: true, message: "Inventory updated successfully", data: stock });
});

// ❌ Delete Stock by ID (Soft Delete)
export const deleteStockById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const stock = await BloodBank.findByPk(id);
  if (!stock) {
    res.status(404).json({ success: false, message: `No inventory record found with ID ${id}` });
    return;
  }

  // Soft Delete (paranoid mode)
  await stock.destroy();

  res.status(200).json({ success: true, message: "Inventory record soft-deleted successfully" });
});
