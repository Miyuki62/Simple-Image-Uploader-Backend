import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const imageRouter = express.Router();
imageRouter.use(express.json());

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

imageRouter.get("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const image = await collections?.images?.findOne(query);

    if (image) {
      res.status(200).send(image);
    } else {
      res.status(404).send(`Failed to find an image: ID ${id}`);
    }
  } catch (error) {
    res.status(404).send(`Failed to find an image: ID ${req?.params?.id}`);
  }
});

imageRouter.post("/", async (req, res) => {
  try {
    const image = req.body;
    const result = await collections?.images?.insertOne(image);

    if (result?.acknowledged) {
      res.status(201).send(`Created a new image: ID ${result.insertedId}.`);
    } else {
      res.status(500).send("Failed to create a new image.");
    }
  } catch (error) {
    console.error(error);
    res
      .status(400)
      .send(error instanceof Error ? error.message : "Unknown error");
  }
});

imageRouter.put("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
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

imageRouter.delete("/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const query = { _id: new ObjectId(id) };
    const result = await collections?.images?.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Removed an image: ID ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove an image: ID ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Failed to find an image: ID ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    res.status(400).send(message);
  }
});
