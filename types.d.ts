// types.d.ts
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File; // Single file upload
      files?: Multer.File[]; // For multiple file uploads
    }
  }
}
