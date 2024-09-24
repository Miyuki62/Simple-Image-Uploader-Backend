import * as mongodb from "mongodb";
import { Image } from "./image";

export const collections: {
  images?: mongodb.Collection<Image>;
} = {};

export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db("SimpleImageUploader");
  await applySchemaValidation(db);

  const imagesCollection = db.collection<Image>("images");
  collections.images = imagesCollection;
}

// Update our existing collection with JSON schema validation so we know our documents will always match the shape of our Employee model, even if added elsewhere.
// For more information about schema validation, see this blog series: https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "image"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
        image: {
          bsonType: "object",
          required: ["publicId", "url"],
          properties: {
            publicId: {
              bsonType: "string",
              description: "'publicId' is required and is a string",
            },
            url: {
              bsonType: "string",
              description: "'url' is required and is a string",
            },
          },
        },
      },
    },
  };

  // Try applying the modification to the collection, if the collection doesn't exist, create it
  await db
    .command({
      collMod: "images",
      validator: jsonSchema,
    })
    .catch(async (error: any) => {
      if (error.codeName === "NamespaceNotFound") {
        await db.createCollection("images", { validator: jsonSchema });
      } else {
        throw error;
      }
    });
}
