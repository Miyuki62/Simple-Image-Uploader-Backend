import * as mongodb from "mongodb";

export interface Image {
  name: string;
  url: string;
  _id?: mongodb.ObjectId;
}
