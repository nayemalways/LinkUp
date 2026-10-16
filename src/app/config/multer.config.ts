import multer from 'multer';
import { Request } from 'express';
import { cloudinaryUpload } from './cloudinary.config';

// Supports both multer-storage-cloudinary v2 (function) and v4 (class)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cloudinaryStorageLib = require('multer-storage-cloudinary');
const createCloudinaryStorage = cloudinaryStorageLib.CloudinaryStorage
  ? (opts: any) => new cloudinaryStorageLib.CloudinaryStorage(opts)
  : (opts: any) => cloudinaryStorageLib(opts);

const storage = createCloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req: Request, file: Express.Multer.File) => {
      const fileName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, '-') // empty space remove replace with dash
        .replace(/\./g, '-')
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-\.]/g, ''); // non alpha numeric - !@#$

      const uniqueFileName =
        Math.random().toString(15).substring(2) +
        '-' +
        Date.now() +
        '-' +
        fileName;

      return uniqueFileName;
    },
  },
});

export const multerUpload = multer({ storage: storage });
