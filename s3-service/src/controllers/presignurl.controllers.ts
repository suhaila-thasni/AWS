import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { S3 } from "../lib/S3Client";
import axios from "axios";
dotenv.config();

export const createPresignurl: any = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename, contentType, size, role, id } = req.body;
      
      if (!filename || !contentType || !size) {
        res.status(400).json({ error: "Invalid request body" });
      }

      const uniqueKey = `${uuidv4()}-${filename}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: uniqueKey,
        ContentType: contentType,
        ContentLength: size,
      });

      const presignedUrl = await getSignedUrl(S3, command, {
        expiresIn: 360,
      });

      if (role == "hospital") {
        await axios.put(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${id}`, { imageUrl: uniqueKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "user") {
        
        await axios.put(`${process.env.USER_SERVICE_URL}/users/${id}`, { imageUrl: uniqueKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "doctor") {
        await axios.put(`${process.env.DOCTOR_SERVICE_URL}/doctor/${id}`, { imageUrl: uniqueKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "staff") {
        await axios.put(`${process.env.STAFF_SERVICE_URL}/staff/${id}`, { imageUrl: uniqueKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "ad") {
        await axios.put(`${process.env.AD_SERVICE_URL}/ad/${id}`, { imageUrl: uniqueKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }
      

      res.json({
        presignedUrl,
        key: uniqueKey,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  },
);

export const editAPresignurl: any = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      // ✅ Express way
      const { filename, contentType, key, role, id } = req.body;
      

      if (!filename || !contentType) {
        res.status(400).json({
          error: "Missing filename or contentType",
        });
      }

      // reuse key OR create new
      const objectKey = key || `${Date.now()}-${filename.replace(/\s/g, "-")}`;

      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: objectKey,
        ContentType: contentType,
      });

      

      const presignedUrl = await getSignedUrl(S3, command, {
        expiresIn: 60 * 5,
      });



      if (role == "hospital") {
        await axios.put(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${id}`, { imageUrl: objectKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "user") {
        await axios.put(`${process.env.USER_SERVICE_URL}/users/${id}`, { imageUrl: objectKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "doctor") {
        await axios.put(`${process.env.DOCTOR_SERVICE_URL}/doctor/${id}`, { imageUrl: objectKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "staff") {
        await axios.put(`${process.env.STAFF_SERVICE_URL}/staff/${id}`, { imageUrl: objectKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      

      if (role == "ad") {
        await axios.put(`${process.env.AD_SERVICE_URL}/ad/${id}`, { imageUrl: objectKey }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      res.json({
        presignedUrl,
        key: objectKey,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to create edit URL",
      });
    }
  },
);

export const deleteAPresignurl: any = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      // ✅ Express way
      const { key, role, id } = req.body;

      if (!key || typeof key !== "string") {
        res.status(400).json({
          error: "Missing or invalid object key.",
        });
      }

      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
      });

      await S3.send(command);



      if (role == "hospital") {
        await axios.put(`${process.env.HOSPITAL_SERVICE_URL}/hospital/${id}`, { imageUrl: null }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "user") {
        await axios.put(`${process.env.USER_SERVICE_URL}/users/${id}`, { imageUrl: null }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "doctor") {
        await axios.put(`${process.env.DOCTOR_SERVICE_URL}/doctor/${id}`, { imageUrl: null }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "staff") {
        await axios.put(`${process.env.STAFF_SERVICE_URL}/staff/${id}`, { imageUrl: null }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }

      if (role == "ad") {
        await axios.put(`${process.env.AD_SERVICE_URL}/ad/${id}`, { imageUrl: null }, {
          headers: {
            Authorization: req.headers.authorization,
          },
        });
      }


      res.status(200).json({
        message: "File deleted successfully",
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Failed to delete file.",
      });
    }
  },
);
