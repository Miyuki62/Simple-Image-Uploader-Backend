import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";
import { Image } from "./image";
import multer from "multer";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../service/cloudinary";

export const imageRouter = express.Router();
imageRouter.use(express.json());

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET all images
imageRouter.get("/", async (_req, res) => {
  try {
    const images = await collections?.images?.find({}).toArray();
    res.status(200).send(images);
  } catch (error) {
    res
      .status(500)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

// GET a single image by ID
imageRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const image = await collections?.images?.findOne(query);

    if (image) {
      res.status(200).send(image);
    } else {
      res.status(404).send(`Failed to find an image: ID ${id}`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find an image: ID ${req.params.id}`);
  }
});

// POST to upload a new image
imageRouter.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload to Cloudinary using file buffer
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    // Construct the image data according to the Image interface
    const imageData: Image = {
      name: req.file.originalname, // File name
      image: {
        publicId: cloudinaryResult.publicId, // Public ID from Cloudinary
        url: cloudinaryResult.url, // URL from Cloudinary
      },
    };

    // Insert the image data into the MongoDB collection
    const result = await collections?.images?.insertOne(imageData);

    res.status(201).json({
      message: "File uploaded and saved to database successfully",
      imageId: result?.insertedId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to upload file to Cloudinary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// PUT to update an image by ID
imageRouter.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const image = req.body;
    const query = { _id: new ObjectId(id) };
    const result = await collections?.images?.updateOne(query, { $set: image });

    if (result && result.matchedCount) {
      res.status(200).send(`Updated an image: ID ${id}.`);
    } else if (!result?.matchedCount) {
      res.status(404).send(`Failed to find an image: ID ${id}`);
    } else {
      res.status(304).send(`Failed to update an image: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});

// DELETE an image by ID
imageRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    // First, find the image to get its publicId
    const imageToDelete = await collections?.images?.findOne(query);
    if (!imageToDelete) {
      return res.status(404).send(`Failed to find an image: ID ${id}`);
    }

    // Extract the publicId from the found image
    const publicId = imageToDelete.image.publicId;

    // Now delete from Cloudinary
    await deleteFromCloudinary(publicId);

    // Then delete from the MongoDB collection
    const result = await collections?.images?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Removed an image: ID ${id}`);
    } else {
      res.status(400).send(`Failed to remove an image: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
