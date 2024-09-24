import * as mongodb from "mongodb";

export interface Image {
  name: string; // The name of the image
  image: {
    publicId: string; // Cloudinary public ID (required)
    url: string; // Cloudinary URL (required)
  };
  _id?: mongodb.ObjectId; // Optional MongoDB ObjectId
}
